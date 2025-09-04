// Supabase configuration
// Load from environment variables or use defaults
const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Authentication credentials
const AUTH_USERNAME = window.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = window.AUTH_PASSWORD || 'password';


// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const authSection = document.getElementById('authSection');
const authForm = document.getElementById('authForm');
const authError = document.getElementById('authError');
const mainContent = document.getElementById('mainContent');
const signOutBtn = document.getElementById('signOutBtn');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const dropText = document.getElementById('dropText');
const clickText = document.getElementById('clickText');
const fileInfo = document.getElementById('fileInfo');
const previewImage = document.getElementById('previewImage');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('resultSection');
const shareLink = document.getElementById('shareLink');
const copyBtn = document.getElementById('copyBtn');
const uploadedImage = document.getElementById('uploadedImage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// State
let selectedFile = null;
let isAuthenticated = false;

// Authentication functions
function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

function hideAuthError() {
    authError.style.display = 'none';
}

function authenticate(username, password) {
    // Fallback credentials for testing
    const fallbackUsername = 'admin';
    const fallbackPassword = 'password';

    // Check environment variables first, then fallback
    const expectedUsername = AUTH_USERNAME || fallbackUsername;
    const expectedPassword = AUTH_PASSWORD || fallbackPassword;

    return username === expectedUsername && password === expectedPassword;
}

function showMainContent() {
    authSection.style.display = 'none';
    mainContent.style.display = 'block';
    signOutBtn.style.display = 'inline-block';
    isAuthenticated = true;
}

function showAuthForm() {
    authSection.style.display = 'block';
    mainContent.style.display = 'none';
    signOutBtn.style.display = 'none';
    isAuthenticated = false;
    resetUpload();
}

function signOut() {
    showAuthForm();
    hideAuthError();
}

// Utility functions
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    resultSection.style.display = 'none';

    // Scroll to error message
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showResult(link, imageUrl) {
    hideError();
    shareLink.value = link;
    uploadedImage.src = imageUrl;
    resultSection.style.display = 'block';

    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadBtn.disabled = true;
    uploadBtn.querySelector('.btn-text').style.display = 'inline';
    uploadBtn.querySelector('.btn-loading').style.display = 'none';
    resultSection.style.display = 'none';
    hideError();
}

// File handling
function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showError('File size must be less than 10MB.');
        return;
    }

    selectedFile = file;

    // Show file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        fileInfo.style.display = 'block';
        uploadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
}

// Upload to Supabase
async function uploadToSupabase(file) {
    // Check authentication
    if (!isAuthenticated) {
        throw new Error('Please sign in to upload images');
    }

    try {
        // Generate unique filename
        const fileName = generateUniqueFileName(file.name);
        const filePath = `Images/${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabaseClient.storage
            .from('Images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Generate signed URL with 1 year expiry
        const expiresIn = 365 * 24 * 60 * 60; // 1 year in seconds
        const { data: signedUrlData, error: signedUrlError } = await supabaseClient.storage
            .from('Images')
            .createSignedUrl(filePath, expiresIn);

        if (signedUrlError) {
            throw signedUrlError;
        }

        return {
            path: filePath,
            signedUrl: signedUrlData.signedUrl,
            publicUrl: `${SUPABASE_URL}/storage/v1/object/public/Images/${filePath}`
        };

    } catch (error) {
        console.error('Upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
    }
}

// Function to trigger file input
function triggerFileInput() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        try {
            // Method 1: Direct click
            fileInput.click();

            // Method 2: If that doesn't work, try creating a new input
            setTimeout(() => {
                if (!fileInput.files || fileInput.files.length === 0) {
                    const newInput = document.createElement('input');
                    newInput.type = 'file';
                    newInput.accept = 'image/*';
                    newInput.style.position = 'absolute';
                    newInput.style.left = '-9999px';
                    newInput.style.opacity = '0';
                    newInput.style.pointerEvents = 'none';

                    newInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            handleFileSelect(file);
                        }
                    });

                    document.body.appendChild(newInput);
                    newInput.click();

                    // Clean up after a delay
                    setTimeout(() => {
                        document.body.removeChild(newInput);
                    }, 1000);
                }
            }, 100);

        } catch (error) {
            showError('Unable to open file browser. Please try refreshing the page.');
        }
    }
}


uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    // Show loading state
    uploadBtn.disabled = true;
    uploadBtn.querySelector('.btn-text').style.display = 'none';
    uploadBtn.querySelector('.btn-loading').style.display = 'flex';

    try {
        // Upload file
        const result = await uploadToSupabase(selectedFile);

        // Show result
        showResult(result.signedUrl, result.publicUrl);

    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        uploadBtn.disabled = false;
        uploadBtn.querySelector('.btn-text').style.display = 'inline';
        uploadBtn.querySelector('.btn-loading').style.display = 'none';
    }
});

clearBtn.addEventListener('click', () => {
    resetUpload();
});

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(shareLink.value);

        // Visual feedback
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);

    } catch (error) {
        // Fallback for older browsers
        shareLink.select();
        document.execCommand('copy');

        // Visual feedback
        copyBtn.classList.add('copied');
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Get elements after DOM is loaded
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const dropText = document.getElementById('dropText');
    const clickText = document.getElementById('clickText');
    const uploadContent = document.querySelector('.upload-content');

    // Authentication event listeners
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            hideAuthError();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (authenticate(username, password)) {
                showMainContent();
            } else {
                showAuthError('Invalid username or password');
            }
        });
    }

    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }

    // Set up event listeners
    if (uploadArea) {
        uploadArea.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerFileInput();
        });
    }


    if (dropText) {
        dropText.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerFileInput();
        });
    }

    if (clickText) {
        clickText.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerFileInput();
        });
    }

    if (uploadContent) {
        uploadContent.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            triggerFileInput();
        });
    }

    // Drag and drop events
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    // File input change event
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFileSelect(file);
        });
    }

    // Check if Supabase credentials are configured
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
        showError('Please configure your Supabase credentials in script.js');
        return;
    }

    // Test Supabase connection
    supabaseClient.storage.listBuckets().then(({ data, error }) => {
        if (error) {
            showError(`Supabase connection failed: ${error.message}`);
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + V to paste image
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        // Note: Clipboard API for images requires additional setup
        // This is a placeholder for future enhancement
    }

    // Escape to clear
    if (e.key === 'Escape') {
        resetUpload();
    }
});
