// Authentication and User Management System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        this.apiBase = 'http://localhost:5000/api/auth';
        this.init();
    }

    init() {
        this.loadUserSession();
        this.setupEventListeners();
        this.updateUIBasedOnAuth();
    }

    setupEventListeners() {
        // Login form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
        });

        // Registration form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'register-form') {
                e.preventDefault();
                this.handleRegistration(e.target);
            }
        });

        // Logout button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                e.preventDefault();
                this.handleLogout();
            }
        });
    }

    loadUserSession() {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            this.token = token;
            this.isAuthenticated = true;
            // You might want to fetch user data from the backend here
            // For now, we'll just set isAuthenticated to true
        }
    }

    async handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            username: formData.get('email'), // The backend expects a username
            password: formData.get('password')
        };

        this.showLoading('Signing in...');

        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok) {
                this.setUserSession(data.access_token);
                this.showNotification('Login successful!', 'success');
                this.updateUIBasedOnAuth();
                location.reload();
            } else {
                this.showNotification(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('An error occurred during login.', 'error');
        }
    }

    async handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            username: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        this.showLoading('Creating account...');

        try {
            const response = await fetch(`${this.apiBase}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            this.hideLoading();

            if (response.ok) {
                this.showNotification('Account created successfully! Please log in.', 'success');
                form.reset();
                showLoginForm();
            } else {
                this.showNotification(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.hideLoading();
            this.showNotification('An error occurred during registration.', 'error');
        }
    }

    handleLogout() {
        this.clearSession();
        this.showNotification('Logged out successfully!', 'success');
        this.updateUIBasedOnAuth();
        location.reload();
    }

    setUserSession(token) {
        this.token = token;
        this.isAuthenticated = true;
        localStorage.setItem('jwt_token', token);
    }

    clearSession() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        localStorage.removeItem('jwt_token');
    }

    updateUIBasedOnAuth() {
        const authContainer = document.getElementById('auth-container');
        const adminPanel = document.getElementById('admin-panel');

        if (this.isAuthenticated) {
            authContainer.style.display = 'none';
            adminPanel.style.display = 'block';
        } else {
            authContainer.style.display = 'flex';
            adminPanel.style.display = 'none';
        }
    }

    showLoading(message = 'Loading...') {
        let loader = document.querySelector('.auth-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'auth-loader';
            document.body.appendChild(loader);
        }
        loader.innerHTML = `<div class="loader-content"><div class="spinner"></div><p>${message}</p></div>`;
        loader.classList.add('active');
    }

    hideLoading() {
        const loader = document.querySelector('.auth-loader');
        if (loader) {
            loader.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
