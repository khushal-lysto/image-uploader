# Image Upload to Supabase

A beautiful, responsive web application that allows users to upload images to Supabase Storage and generates shareable links with 1-year expiry.

## Features

- 🖼️ **Drag & Drop Upload**: Intuitive drag-and-drop interface for easy image uploads
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🔗 **Shareable Links**: Generates signed URLs with 1-year expiry for secure sharing
- 📋 **Copy to Clipboard**: One-click copy functionality for easy link sharing
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- ⚡ **Fast Upload**: Optimized for quick image uploads
- 🛡️ **File Validation**: Validates file type and size before upload
- 🔄 **Loading States**: Visual feedback during upload process

## Quick Start

### Option 1: Using npm (Recommended)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   npm run setup
   ```
   This will create a `.env` file for you.

3. **Configure Supabase credentials**:
   Edit the `.env` file with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run the application**:
   ```bash
   npm start
   ```
   The app will open automatically in your browser at `http://localhost:3000`

### Option 2: Manual Setup

1. **Create environment file**:
   Copy `env.example` to `.env` and fill in your credentials

2. **Run with static server**:
   ```bash
   npm run static
   ```

3. **Or open directly**:
   Simply open `index.html` in your browser (environment variables won't work this way)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be fully set up

### 2. Set Up Storage Bucket

1. In your Supabase dashboard, go to **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Name it `images`
4. Make it **Public** (uncheck "Private bucket")
5. Click **Create bucket**

### 3. Configure Storage Policies

1. Go to **Storage** → **Policies**
2. Click **New Policy** for the `images` bucket
3. Create an **INSERT** policy:
   - Policy name: `Allow public uploads`
   - Allowed operation: `INSERT`
   - Target roles: `public`
   - USING expression: `true`
4. Create a **SELECT** policy:
   - Policy name: `Allow public access`
   - Allowed operation: `SELECT`
   - Target roles: `public`
   - USING expression: `true`

### 4. Get Your Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public** key

### 5. Configure the Application

**Using Environment Variables (Recommended)**:
1. Copy `env.example` to `.env`
2. Edit `.env` with your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

**Manual Configuration (Alternative)**:
1. Open `script.js` in your code editor
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
3. Replace with your actual Supabase URL and anon key

### 6. Run the Application

**Using npm (Recommended)**:
```bash
npm install
npm start
```

**Using static server**:
```bash
npm run static
```

**Manual methods**:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

## File Structure

```
upload-images/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── config.js           # Environment configuration loader
├── serve.js            # Custom server with env injection
├── setup.js            # Setup script
├── package.json        # npm configuration
├── env.example         # Environment variables template
├── .env                # Your environment variables (create this)
└── README.md           # This file
```

## Usage

1. **Upload an Image**:
   - Drag and drop an image onto the upload area, or
   - Click the upload area to browse and select a file

2. **View File Info**:
   - Once selected, you'll see a preview and file details

3. **Upload**:
   - Click the "Upload Image" button
   - Wait for the upload to complete

4. **Share**:
   - Copy the generated shareable link
   - The link will be valid for 1 year

## Supported File Types

- JPEG/JPG
- PNG
- GIF
- WebP
- BMP
- SVG

## File Size Limits

- Maximum file size: 10MB
- This can be adjusted in the `script.js` file

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Security Features

- File type validation
- File size limits
- Signed URLs with expiration
- CORS protection through Supabase

## Customization

### Change Upload Directory
In `script.js`, modify the file path:
```javascript
const filePath = `uploads/${fileName}`; // Change 'uploads' to your preferred folder
```

### Adjust Expiry Time
In `script.js`, modify the expiry duration:
```javascript
const expiresIn = 365 * 24 * 60 * 60; // 1 year in seconds
```

### Modify File Size Limit
In `script.js`, change the maximum file size:
```javascript
const maxSize = 10 * 1024 * 1024; // 10MB
```

## Troubleshooting

### Common Issues

1. **"Please configure your Supabase credentials"**
   - Make sure you've created a `.env` file with your credentials
   - Or replace the placeholder values in `script.js`

2. **"Supabase connection failed"**
   - Check your URL and API key in the `.env` file
   - Ensure your Supabase project is active

3. **Upload fails**
   - Check that the `images` bucket exists and is public
   - Verify storage policies are set correctly

4. **File not found after upload**
   - Ensure the bucket name matches in your code and Supabase dashboard

5. **Environment variables not loading**
   - Make sure you're using `npm start` (not opening HTML directly)
   - Check that your `.env` file is in the project root
   - Verify the `.env` file format is correct (no spaces around `=`)

### Getting Help

- Check the browser console for error messages
- Verify your Supabase project settings
- Ensure all storage policies are correctly configured

## License

This project is open source and available under the MIT License.
