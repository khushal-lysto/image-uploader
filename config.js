// Configuration loader for environment variables
// This file loads environment variables and makes them available to the browser

// Function to load environment variables from .env file
async function loadEnvConfig() {
    try {
        // Try to fetch the .env file (this won't work in browser, but we'll handle it gracefully)
        const response = await fetch('.env');
        if (response.ok) {
            const envText = await response.text();
            const envVars = {};

            // Parse .env file content
            envText.split('\n').forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.startsWith('#')) {
                    const [key, ...valueParts] = trimmedLine.split('=');
                    if (key && valueParts.length > 0) {
                        envVars[key.trim()] = valueParts.join('=').trim();
                    }
                }
            });

            // Make variables available globally
            window.SUPABASE_URL = envVars.SUPABASE_URL;
            window.SUPABASE_ANON_KEY = envVars.SUPABASE_ANON_KEY;

            return envVars;
        }
    } catch (error) {
        console.log('Environment file not accessible in browser. Using fallback method.');
    }

    // Fallback: Check for environment variables in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSupabaseUrl = urlParams.get('supabase_url');
    const urlSupabaseKey = urlParams.get('supabase_key');

    if (urlSupabaseUrl && urlSupabaseKey) {
        window.SUPABASE_URL = urlSupabaseUrl;
        window.SUPABASE_ANON_KEY = urlSupabaseKey;
        return {
            SUPABASE_URL: urlSupabaseUrl,
            SUPABASE_ANON_KEY: urlSupabaseKey
        };
    }

    return null;
}

// Load configuration when the script loads
loadEnvConfig().then(config => {
    if (config) {
        console.log('✅ Environment configuration loaded');
    } else {
        console.log('⚠️ Using default configuration. Please set up your .env file or URL parameters.');
    }
});
