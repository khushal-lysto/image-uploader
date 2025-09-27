const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Initialize Supabase client with service role key (server-side only)
const eventsSupabaseClient = createClient(
    process.env.EVENTS_SUPABASE_URL || 'YOUR_EVENTS_SUPABASE_URL',
    process.env.EVENTS_SUPABASE_SERVICE_ROLE_KEY || 'YOUR_EVENTS_SERVICE_ROLE_KEY'
);

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Function to inject environment variables into HTML
function injectEnvVars(content) {
    const envVars = {
        SUPABASE_URL: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
        AUTH_USERNAME: process.env.AUTH_USERNAME || 'admin',
        AUTH_PASSWORD: process.env.AUTH_PASSWORD || 'password'
    };

    // Create a script tag with environment variables
    const envScript = `
    <script>
        window.SUPABASE_URL = '${envVars.SUPABASE_URL}';
        window.SUPABASE_ANON_KEY = '${envVars.SUPABASE_ANON_KEY}';
        window.AUTH_USERNAME = '${envVars.AUTH_USERNAME}';
        window.AUTH_PASSWORD = '${envVars.AUTH_PASSWORD}';
    </script>`;

    // Inject before the closing head tag
    return content.replace('</head>', `${envScript}\n</head>`);
}

// API endpoints
async function handleAPIRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        if (path === '/api/categories' && method === 'GET') {
            // Get categories
            const { data, error } = await eventsSupabaseClient
                .from('categories')
                .select('id, name, color')
                .order('name');

            if (error) throw error;

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data }));
            return;
        }

        if (path === '/api/events' && method === 'POST') {
            // Create event
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const eventData = JSON.parse(body);

                    // Validate required fields
                    if (!eventData.title || !eventData.startTime || !eventData.endTime || !eventData.categoryId) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                        return;
                    }

                    // Create event description if provided
                    let descriptionId = null;
                    if (eventData.description || eventData.link || eventData.imageUrl) {
                        const { data: descData, error: descError } = await eventsSupabaseClient
                            .from('event_descriptions')
                            .insert({
                                text: eventData.description || null,
                                link: eventData.link || null,
                                image_url: eventData.imageUrl || null
                            })
                            .select()
                            .single();

                        if (descError) throw descError;
                        descriptionId = descData.id;
                    }

                    // Create event
                    const { data, error } = await eventsSupabaseClient
                        .from('events')
                        .insert({
                            title: eventData.title,
                            start_time: eventData.startTime,
                            end_time: eventData.endTime,
                            location: eventData.location || null,
                            category_id: parseInt(eventData.categoryId),
                            description_id: descriptionId,
                            is_active: true
                        })
                        .select()
                        .single();

                    if (error) throw error;

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, data }));
                } catch (error) {
                    console.error('Error creating event:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: error.message }));
                }
            });
            return;
        }

        // 404 for unknown API endpoints
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));

    } catch (error) {
        console.error('API Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
    }
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Handle API requests
    if (pathname.startsWith('/api/')) {
        handleAPIRequest(req, res);
        return;
    }

    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(__dirname, pathname);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Security check - prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        let content = data;

        // Inject environment variables into HTML files
        if (ext === '.html') {
            content = Buffer.from(injectEnvVars(data.toString()));
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);

    const hasImageSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'YOUR_SUPABASE_URL';
    const hasEventsSupabase = process.env.EVENTS_SUPABASE_URL && process.env.EVENTS_SUPABASE_URL !== 'YOUR_EVENTS_SUPABASE_URL';
    const hasEventsServiceKey = process.env.EVENTS_SUPABASE_SERVICE_ROLE_KEY && process.env.EVENTS_SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_EVENTS_SERVICE_ROLE_KEY';

    if (hasImageSupabase) {
        console.log('✅ Image upload Supabase configuration loaded from environment');
    } else {
        console.log('⚠️  Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
    }

    if (hasEventsSupabase && hasEventsServiceKey) {
        console.log('✅ Events database Supabase configuration loaded from environment');
        console.log('🔐 Service role key is securely stored on server-side only');
    } else {
        console.log('⚠️  Please set EVENTS_SUPABASE_URL and EVENTS_SUPABASE_SERVICE_ROLE_KEY in your .env file');
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
