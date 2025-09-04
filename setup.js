const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Image Upload App...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        // Copy env.example to .env
        fs.copyFileSync(envExamplePath, envPath);
        console.log('✅ Created .env file from env.example');
        console.log('📝 Please edit .env file with your Supabase credentials\n');
    } else {
        // Create .env file
        const envContent = `# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
`;
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file');
        console.log('📝 Please edit .env file with your Supabase credentials\n');
    }
} else {
    console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    console.log('Run: npm install\n');
} else {
    console.log('✅ Dependencies already installed\n');
}

console.log('🎯 Next steps:');
console.log('1. Edit .env file with your Supabase credentials');
console.log('2. Run: npm install');
console.log('3. Run: npm start');
console.log('4. Open your browser to http://localhost:3000\n');

console.log('📚 For detailed setup instructions, see README.md');
