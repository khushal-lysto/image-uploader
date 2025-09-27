// Authentication credentials
const AUTH_USERNAME = window.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = window.AUTH_PASSWORD || 'password';

// DOM elements
const authSection = document.getElementById('authSection');
const authForm = document.getElementById('authForm');
const authError = document.getElementById('authError');
const mainContent = document.getElementById('mainContent');
const eventForm = document.getElementById('eventForm');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('resultSection');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const categorySelect = document.getElementById('eventCategory');

// State
let isAuthenticated = false;
let categories = [];

// Authentication state management
const AUTH_STORAGE_KEY = 'imageUploader_authState';

function saveAuthState() {
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
}

function clearAuthState() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function loadAuthState() {
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

// Authentication functions
function showAuthError(message) {
    authError.textContent = message;
    authError.style.display = 'block';
}

function hideAuthError() {
    authError.style.display = 'none';
}

function authenticate(username, password) {
    const expectedUsername = AUTH_USERNAME || 'admin';
    const expectedPassword = AUTH_PASSWORD || 'password';
    return username === expectedUsername && password === expectedPassword;
}

function showMainContent() {
    authSection.style.display = 'none';
    mainContent.style.display = 'block';
    isAuthenticated = true;
    saveAuthState();
    loadCategories();
}

function showAuthForm() {
    authSection.style.display = 'block';
    mainContent.style.display = 'none';
    isAuthenticated = false;
    clearAuthState();
    resetForm();
}

function signOut() {
    showAuthForm();
    hideAuthError();
}

// Utility functions
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    resultSection.style.display = 'none';
    errorMessage.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showResult() {
    hideError();
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    eventForm.reset();
    categorySelect.innerHTML = '<option value="">Loading categories...</option>';
    resultSection.style.display = 'none';
    hideError();
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').style.display = 'inline';
    submitBtn.querySelector('.btn-loading').style.display = 'none';
}

// Category management
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        categories = result.data || [];
        populateCategorySelect();
    } catch (error) {
        console.error('Error loading categories:', error);
        showError(`Failed to load categories: ${error.message}`);
        categorySelect.innerHTML = '<option value="">Error loading categories</option>';
    }
}

function populateCategorySelect() {
    categorySelect.innerHTML = '<option value="">Select a category...</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.style.color = category.color;
        categorySelect.appendChild(option);
    });
}

// Form validation
function validateForm(formData) {
    const errors = [];

    if (!formData.title || formData.title.trim().length === 0) {
        errors.push('Event title is required');
    }

    if (!formData.startTime) {
        errors.push('Start time is required');
    }

    if (!formData.endTime) {
        errors.push('End time is required');
    }

    if (formData.startTime && formData.endTime) {
        const startDate = new Date(formData.startTime);
        const endDate = new Date(formData.endTime);

        if (startDate >= endDate) {
            errors.push('End time must be after start time');
        }
    }

    if (!formData.categoryId) {
        errors.push('Category is required');
    }

    if (formData.link && !isValidUrl(formData.link)) {
        errors.push('Event link must be a valid URL');
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
        errors.push('Image URL must be a valid URL');
    }

    return errors;
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Event creation
async function createEvent(eventData) {
    try {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error);
        }

        return result.data;
    } catch (error) {
        console.error('Error creating event:', error);
        throw new Error(`Failed to create event: ${error.message}`);
    }
}

// Event handlers
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
        showError('Please sign in first');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loading').style.display = 'flex';

    try {
        // Get form data
        const formData = new FormData(eventForm);
        const eventData = {
            title: formData.get('title'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            location: formData.get('location'),
            categoryId: formData.get('categoryId'),
            description: formData.get('description'),
            link: formData.get('link'),
            imageUrl: formData.get('imageUrl')
        };

        // Validate form
        const validationErrors = validateForm(eventData);
        if (validationErrors.length > 0) {
            showError(validationErrors.join(', '));
            return;
        }

        // Create event
        await createEvent(eventData);

        // Show success
        showResult();

    } catch (error) {
        showError(error.message);
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
    }
});

clearBtn.addEventListener('click', () => {
    resetForm();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing authentication state
    if (loadAuthState()) {
        showMainContent();
    }

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

    // API endpoints are handled by the server

    // Set default datetime values to current time
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('startTime').value = localDateTime;

    // Set end time to 1 hour later
    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endDateTime = new Date(endTime.getTime() - endTime.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('endTime').value = endDateTime;
});
