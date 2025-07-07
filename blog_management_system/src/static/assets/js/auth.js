// Authentication and User Management System
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
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

        // Profile update form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'profile-form') {
                e.preventDefault();
                this.handleProfileUpdate(e.target);
            }
        });

        // Password reset form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'reset-password-form') {
                e.preventDefault();
                this.handlePasswordReset(e.target);
            }
        });

        // Auth modal triggers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('login-trigger')) {
                e.preventDefault();
                this.showLoginModal();
            }
            if (e.target.classList.contains('register-trigger')) {
                e.preventDefault();
                this.showRegisterModal();
            }
        });
    }

    loadUserSession() {
        const sessionData = localStorage.getItem('userSession');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                if (this.isValidSession(session)) {
                    this.currentUser = session.user;
                    this.isAuthenticated = true;
                    this.updateLastActivity();
                }
            } catch (error) {
                console.error('Error loading user session:', error);
                this.clearSession();
            }
        }
    }

    isValidSession(session) {
        if (!session || !session.user || !session.expiresAt) {
            return false;
        }

        const now = new Date().getTime();
        const expiresAt = new Date(session.expiresAt).getTime();
        
        return now < expiresAt;
    }

    handleLogin(form) {
        const formData = new FormData(form);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
            rememberMe: formData.get('remember-me') === 'on'
        };

        this.showLoading('Signing in...');

        // Simulate API call
        setTimeout(() => {
            const result = this.authenticateUser(credentials);
            this.hideLoading();

            if (result.success) {
                this.setUserSession(result.user, credentials.rememberMe);
                this.showNotification('Login successful!', 'success');
                this.closeAuthModal();
                this.updateUIBasedOnAuth();
                
                // Redirect if needed
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectUrl;
                }
            } else {
                this.showNotification(result.message, 'error');
            }
        }, 1500);
    }

    handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirm-password')
        };

        // Validate form data
        const validation = this.validateRegistrationData(userData);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        this.showLoading('Creating account...');

        // Simulate API call
        setTimeout(() => {
            const result = this.createUser(userData);
            this.hideLoading();

            if (result.success) {
                this.showNotification('Account created successfully! Please check your email for verification.', 'success');
                this.closeAuthModal();
                
                // Auto-login after registration
                this.setUserSession(result.user, false);
                this.updateUIBasedOnAuth();
            } else {
                this.showNotification(result.message, 'error');
            }
        }, 2000);
    }

    handleLogout() {
        this.showLoading('Signing out...');
        
        setTimeout(() => {
            this.clearSession();
            this.hideLoading();
            this.showNotification('Logged out successfully!', 'success');
            this.updateUIBasedOnAuth();
            
            // Redirect to home page
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = '/';
            }
        }, 1000);
    }

    handleProfileUpdate(form) {
        if (!this.isAuthenticated) {
            this.showNotification('Please log in to update your profile.', 'error');
            return;
        }

        const formData = new FormData(form);
        const updates = {
            name: formData.get('name'),
            email: formData.get('email'),
            bio: formData.get('bio'),
            company: formData.get('company'),
            website: formData.get('website')
        };

        this.showLoading('Updating profile...');

        setTimeout(() => {
            const result = this.updateUserProfile(updates);
            this.hideLoading();

            if (result.success) {
                this.currentUser = { ...this.currentUser, ...updates };
                this.updateUserSession();
                this.showNotification('Profile updated successfully!', 'success');
            } else {
                this.showNotification(result.message, 'error');
            }
        }, 1500);
    }

    handlePasswordReset(form) {
        const formData = new FormData(form);
        const email = formData.get('email');

        if (!this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }

        this.showLoading('Sending reset email...');

        setTimeout(() => {
            // Simulate sending reset email
            this.hideLoading();
            this.showNotification('Password reset email sent! Check your inbox.', 'success');
            this.closeAuthModal();
        }, 2000);
    }

    authenticateUser(credentials) {
        // Simulate authentication logic
        const users = this.getStoredUsers();
        const user = users.find(u => u.email === credentials.email);

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        if (user.password !== this.hashPassword(credentials.password)) {
            return { success: false, message: 'Invalid password.' };
        }

        if (!user.isVerified) {
            return { success: false, message: 'Please verify your email address first.' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
                avatar: user.avatar || null,
                preferences: user.preferences || {}
            }
        };
    }

    createUser(userData) {
        const users = this.getStoredUsers();
        
        // Check if user already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser = {
            id: this.generateUserId(),
            name: userData.name,
            email: userData.email,
            password: this.hashPassword(userData.password),
            role: 'user',
            isVerified: true, // Auto-verify for demo
            createdAt: new Date().toISOString(),
            preferences: {
                newsletter: true,
                notifications: true
            }
        };

        users.push(newUser);
        this.saveUsers(users);

        return {
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                preferences: newUser.preferences
            }
        };
    }

    updateUserProfile(updates) {
        const users = this.getStoredUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        // Update user data
        users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
        this.saveUsers(users);

        return { success: true };
    }

    setUserSession(user, rememberMe = false) {
        this.currentUser = user;
        this.isAuthenticated = true;

        const expirationTime = rememberMe ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days
            new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const sessionData = {
            user: user,
            expiresAt: expirationTime.toISOString(),
            lastActivity: new Date().toISOString()
        };

        localStorage.setItem('userSession', JSON.stringify(sessionData));
    }

    updateUserSession() {
        if (!this.isAuthenticated) return;

        const sessionData = JSON.parse(localStorage.getItem('userSession'));
        sessionData.user = this.currentUser;
        sessionData.lastActivity = new Date().toISOString();
        
        localStorage.setItem('userSession', JSON.stringify(sessionData));
    }

    updateLastActivity() {
        if (!this.isAuthenticated) return;

        const sessionData = JSON.parse(localStorage.getItem('userSession'));
        if (sessionData) {
            sessionData.lastActivity = new Date().toISOString();
            localStorage.setItem('userSession', JSON.stringify(sessionData));
        }
    }

    clearSession() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('userSession');
    }

    updateUIBasedOnAuth() {
        const authElements = document.querySelectorAll('[data-auth]');
        const userElements = document.querySelectorAll('[data-user]');

        authElements.forEach(element => {
            const authType = element.getAttribute('data-auth');
            
            if (authType === 'required' && !this.isAuthenticated) {
                element.style.display = 'none';
            } else if (authType === 'guest' && this.isAuthenticated) {
                element.style.display = 'none';
            } else {
                element.style.display = '';
            }
        });

        // Update user-specific elements
        if (this.isAuthenticated && this.currentUser) {
            userElements.forEach(element => {
                const userField = element.getAttribute('data-user');
                if (this.currentUser[userField]) {
                    element.textContent = this.currentUser[userField];
                }
            });

            // Update user avatar
            const avatarElements = document.querySelectorAll('.user-avatar');
            avatarElements.forEach(avatar => {
                if (this.currentUser.avatar) {
                    avatar.src = this.currentUser.avatar;
                } else {
                    avatar.src = this.generateAvatarUrl(this.currentUser.name);
                }
            });
        }
    }

    validateRegistrationData(userData) {
        if (!userData.name || userData.name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long.' };
        }

        if (!this.isValidEmail(userData.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        if (!userData.password || userData.password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters long.' };
        }

        if (userData.password !== userData.confirmPassword) {
            return { isValid: false, message: 'Passwords do not match.' };
        }

        return { isValid: true };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo purposes - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }

    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    generateAvatarUrl(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0066cc&color=fff&size=40`;
    }

    getStoredUsers() {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
    }

    saveUsers(users) {
        localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    // Modal management
    showLoginModal() {
        this.showAuthModal('login');
    }

    showRegisterModal() {
        this.showAuthModal('register');
    }

    showAuthModal(type) {
        let modal = document.querySelector('.auth-modal');
        
        if (!modal) {
            modal = this.createAuthModal();
        }

        this.updateModalContent(modal, type);
        modal.classList.add('active');
        document.body.classList.add('modal-open');
    }

    createAuthModal() {
        const modal = document.createElement('div');
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-body"></div>
            </div>
        `;

        // Event listeners
        modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeAuthModal());
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeAuthModal());

        document.body.appendChild(modal);
        return modal;
    }

    updateModalContent(modal, type) {
        const modalBody = modal.querySelector('.modal-body');
        
        if (type === 'login') {
            modalBody.innerHTML = this.getLoginFormHTML();
        } else if (type === 'register') {
            modalBody.innerHTML = this.getRegisterFormHTML();
        }
    }

    getLoginFormHTML() {
        return `
            <div class="auth-form-container">
                <h2>Sign In</h2>
                <form id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="login-email">Email</label>
                        <input type="email" id="login-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" name="password" required>
                    </div>
                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" name="remember-me"> Remember me
                        </label>
                    </div>
                    <button type="submit" class="auth-submit-btn">Sign In</button>
                </form>
                <div class="auth-links">
                    <a href="#" class="register-trigger">Don't have an account? Sign up</a>
                    <a href="#" class="forgot-password-trigger">Forgot password?</a>
                </div>
            </div>
        `;
    }

    getRegisterFormHTML() {
        return `
            <div class="auth-form-container">
                <h2>Create Account</h2>
                <form id="register-form" class="auth-form">
                    <div class="form-group">
                        <label for="register-name">Full Name</label>
                        <input type="text" id="register-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="register-email">Email</label>
                        <input type="email" id="register-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="register-password">Password</label>
                        <input type="password" id="register-password" name="password" required>
                    </div>
                    <div class="form-group">
                        <label for="register-confirm-password">Confirm Password</label>
                        <input type="password" id="register-confirm-password" name="confirm-password" required>
                    </div>
                    <button type="submit" class="auth-submit-btn">Create Account</button>
                </form>
                <div class="auth-links">
                    <a href="#" class="login-trigger">Already have an account? Sign in</a>
                </div>
            </div>
        `;
    }

    closeAuthModal() {
        const modal = document.querySelector('.auth-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }

    // Utility methods
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

    // Permission checking
    hasPermission(permission) {
        if (!this.isAuthenticated) return false;
        
        const userRole = this.currentUser.role;
        const permissions = {
            'admin': ['read', 'write', 'delete', 'manage_users'],
            'editor': ['read', 'write'],
            'user': ['read']
        };

        return permissions[userRole]?.includes(permission) || false;
    }

    requireAuth(redirectUrl = null) {
        if (!this.isAuthenticated) {
            if (redirectUrl) {
                sessionStorage.setItem('redirectAfterLogin', redirectUrl);
            }
            this.showLoginModal();
            return false;
        }
        return true;
    }
}

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // Update activity on user interaction
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            if (window.authManager.isAuthenticated) {
                window.authManager.updateLastActivity();
            }
        }, { passive: true, once: false });
    });
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

