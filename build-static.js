const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🔨 Building static version for GitHub Pages...');

// Read the current index.html file as template
const htmlTemplate = fs.readFileSync('index.html', 'utf8');

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const AUTH_USERNAME = process.env.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'password';

// Inject environment variables into HTML
const envScript = `
    <script>
        window.SUPABASE_URL = '${SUPABASE_URL}';
        window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
        window.AUTH_USERNAME = '${AUTH_USERNAME}';
        window.AUTH_PASSWORD = '${AUTH_PASSWORD}';
    </script>`;

// Replace the comment with actual environment variables
const staticHtml = htmlTemplate.replace(
    '    <!-- Environment variables will be injected by the server -->',
    envScript
);

// Write the static HTML file
fs.writeFileSync('index.html', staticHtml);

console.log('✅ Static version built successfully!');
console.log('📁 Generated: index.html');
console.log('🚀 Ready for GitHub Pages deployment');

// Validate environment variables
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('⚠️  Warning: Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}
