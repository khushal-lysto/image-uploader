const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

console.log('🔨 Building static version for GitHub Pages...');

// Read the original HTML template
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Upload to Supabase</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
        window.SUPABASE_URL = '{{SUPABASE_URL}}';
        window.SUPABASE_ANON_KEY = '{{SUPABASE_ANON_KEY}}';
        window.AUTH_USERNAME = '{{AUTH_USERNAME}}';
        window.AUTH_PASSWORD = '{{AUTH_PASSWORD}}';
    </script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Image Upload</h1>
            <p>Upload your images and get shareable links with 1-year expiry</p>
        </header>

        <!-- Authentication Form -->
        <div class="auth-section" id="authSection">
            <div class="auth-form">
                <h2>Sign In Required</h2>
                <p>Please sign in to upload images</p>
                <form id="authForm">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Sign In</button>
                </form>
                <div class="auth-error" id="authError" style="display: none;"></div>
            </div>
        </div>

        <main id="mainContent" style="display: none;">
            <div class="upload-section">
                <div class="upload-area" id="uploadArea">
                    <div class="upload-content">
                        <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7,10 12,15 17,10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <h3 id="dropText">Drop your image here</h3>
                        <p id="clickText">or click to browse</p>
                        <input type="file" id="fileInput" accept="image/*" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;">
                    </div>
                </div>

                <div class="file-info" id="fileInfo" style="display: none;">
                    <div class="file-preview">
                        <img id="previewImage" alt="Preview">
                        <div class="file-details">
                            <h4 id="fileName"></h4>
                            <p id="fileSize"></p>
                        </div>
                    </div>
                </div>

                <div class="upload-controls">
                    <button id="uploadBtn" class="btn btn-primary" disabled>
                        <span class="btn-text">Upload Image</span>
                        <span class="btn-loading" style="display: none;">
                            <svg class="spinner" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle>
                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"></path>
                            </svg>
                            Uploading...
                        </span>
                    </button>
                    <button id="clearBtn" class="btn btn-secondary">Clear</button>
                </div>
            </div>

            <div class="result-section" id="resultSection" style="display: none;">
                <div class="success-message">
                    <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22,4 12,14.01 9,11.01"></polyline>
                    </svg>
                    <h3>Upload Successful!</h3>
                    <p>Your image has been uploaded and a shareable link has been generated.</p>
                </div>

                <div class="link-container">
                    <label for="shareLink">Shareable Link (1 year expiry):</label>
                    <div class="link-input-group">
                        <input type="text" id="shareLink" readonly>
                        <button id="copyBtn" class="btn btn-copy">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="image-preview">
                    <h4>Preview:</h4>
                    <img id="uploadedImage" alt="Uploaded image">
                </div>
            </div>

            <div class="error-message" id="errorMessage" style="display: none;">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h3>Upload Failed</h3>
                <p id="errorText"></p>
            </div>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>`;

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const AUTH_USERNAME = process.env.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'password';

// Replace placeholders
const staticHtml = htmlTemplate
    .replace('{{SUPABASE_URL}}', SUPABASE_URL)
    .replace('{{SUPABASE_ANON_KEY}}', SUPABASE_ANON_KEY)
    .replace('{{AUTH_USERNAME}}', AUTH_USERNAME)
    .replace('{{AUTH_PASSWORD}}', AUTH_PASSWORD);

// Write the static HTML file
fs.writeFileSync('index.html', staticHtml);

console.log('✅ Static version built successfully!');
console.log('📁 Generated: index.html');
console.log('🚀 Ready for GitHub Pages deployment');

// Validate environment variables
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('⚠️  Warning: Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
}
