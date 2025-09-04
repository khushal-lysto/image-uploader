const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

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

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

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

    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
        console.log('✅ Supabase configuration loaded from environment');
    } else {
        console.log('⚠️  Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
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
