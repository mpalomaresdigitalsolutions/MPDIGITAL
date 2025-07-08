// Enhanced Main JavaScript with Performance Optimizations and Mobile Support

class WebsiteManager {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupIntersectionObserver();
        this.setupScrollEffects();
        this.registerServiceWorker();
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                // Only register service worker on HTTPS or localhost
                if (location.protocol === 'https:' || location.hostname === 'localhost') {
                    const registration = await navigator.serviceWorker.register('/sw.js', {
                        scope: '/',
                        updateViaCache: 'none' // Bypass browser cache when checking for updates
                    });

                    // Handle service worker registration
                    if (registration.installing) {
                        console.log('Service Worker installing');
                    } else if (registration.waiting) {
                        console.log('Service Worker installed but waiting');
                    } else if (registration.active) {
                        console.log('Service Worker active');
                    }

                    // Log successful registration
                    console.log('ServiceWorker registered with scope:', registration.scope);

                    // Handle service worker updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showUpdateNotification();
                            }
                        });
                    });

                    // Listen for messages from the service worker
                    navigator.serviceWorker.addEventListener('message', (event) => {
                        if (event.data.type === 'CACHE_UPDATED') {
                            console.log('Cache updated to version:', event.data.version);
                            this.showUpdateNotification();
                        }
                    });

                    // Periodic registration update check
                    setInterval(async () => {
                        try {
                            await registration.update();
                        } catch (error) {
                            console.warn('Service worker update check failed:', error);
                        }
                    }, 60 * 60 * 1000); // Check every hour

                } else {
                    console.log('Service worker registration skipped - requires HTTPS or localhost');
                }
            } catch (error) {
                console.error('Service worker registration failed:', error);
                this.handleServiceWorkerError(error);
            }
        } else {
            console.log('Service workers are not supported in this browser');
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <p>A new version of this site is available!</p>
                <button class="update-button">Update Now</button>
                <button class="dismiss-button">Later</button>
            </div>
        `;

        // Add styles for the notification
        const styles = document.createElement('style');
        styles.textContent = `
            .update-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--bg-secondary, #ffffff);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                transform: translateY(100%);
                animation: slide-up 0.3s forwards;
            }

            .update-content {
                padding: 16px 24px;
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .update-content p {
                margin: 0;
                color: var(--text-primary, #333);
            }

            .update-button {
                background: var(--primary-color, #3498db);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-weight: 500;
                transition: background 0.3s ease;
            }

            .update-button:hover {
                background: var(--primary-dark, #2980b9);
            }

            .dismiss-button {
                background: transparent;
                border: none;
                padding: 8px;
                cursor: pointer;
                color: var(--text-secondary, #666);
                transition: color 0.3s ease;
            }

            .dismiss-button:hover {
                color: var(--text-primary, #333);
            }

            @keyframes slide-up {
                to { transform: translateY(0); }
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(notification);

        // Handle update button click
        notification.querySelector('.update-button').addEventListener('click', () => {
            // Send skip waiting message to service worker
            navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        });

        // Handle dismiss button click
        notification.querySelector('.dismiss-button').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-dismiss after 1 hour
        setTimeout(() => notification.remove(), 60 * 60 * 1000);
    }

    handleServiceWorkerError(error) {
        // Log detailed error information
        console.error('Service Worker Error Details:', {
            message: error.message,
            fileName: error.fileName,
            lineNumber: error.lineNumber,
            columnNumber: error.columnNumber,
            stack: error.stack
        });

        // Check for specific error types and handle accordingly
        if (error.name === 'SecurityError') {
            console.warn('Service Worker registration failed due to security restrictions');
        } else if (error.name === 'NetworkError') {
            console.warn('Service Worker registration failed due to network issues');
        }

        // Send error to analytics or monitoring service if available
        if (typeof gtag === 'function') {
            gtag('event', 'service_worker_error', {
                error_type: error.name,
                error_message: error.message
            });
        }
    }

    init() {
        // Initialize mobile menu
        this.mobileToggle = document.querySelector('.mobile-toggle');
        this.navLinks = document.querySelector('.nav-links');
        this.header = document.querySelector('header');
        
        // Initialize scroll to top button
        this.createScrollToTopButton();
        
        // Initialize reading progress bar
        this.readingProgress = document.querySelector('.reading-progress');
        
        // Throttled scroll handler
        this.throttledScrollHandler = this.throttle(this.handleScroll.bind(this), 16);
        
        // Debounced resize handler
        this.debouncedResizeHandler = this.debounce(this.handleResize.bind(this), 250);
    }

    bindEvents() {
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }

        // Scroll events
        window.addEventListener('scroll', this.throttledScrollHandler, { passive: true });
        
        // Resize events
        window.addEventListener('resize', this.debouncedResizeHandler, { passive: true });

        // Smooth scrolling for anchor links
        document.addEventListener('click', this.handleAnchorClick.bind(this));

        // Close mobile menu when clicking outside
        document.addEventListener('click', this.closeMobileMenuOnOutsideClick.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    setupIntersectionObserver() {
        // Lazy loading for images
        const imageObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            // Create a new image to preload
                            const preloadImg = new Image();
                            preloadImg.onload = () => {
                                img.src = img.dataset.src;
                                img.classList.add('loaded');
                            };
                            preloadImg.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            },
            {
                root: null,
                rootMargin: '50px 0px',
                threshold: 0.1
            }
        );

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Animation on scroll
        const animationObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        animationObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.2
            }
        );

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .slide-in').forEach(el => {
            animationObserver.observe(el);
        });
    }

    setupScrollEffects() {
        // Parallax scrolling for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }, { passive: true });
        }
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    createScrollToTopButton() {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.setAttribute('aria-label', 'Scroll to top');
        button.innerHTML = '↑';
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            .scroll-to-top {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--primary-color, #3498db);
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: none;
                cursor: pointer;
                opacity: 0;
                transform: translateY(100px);
                transition: opacity 0.3s, transform 0.3s;
                z-index: 999;
                font-size: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            
            .scroll-to-top.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .scroll-to-top:hover {
                background: var(--primary-dark, #2980b9);
            }
        `;
        
        document.head.appendChild(styles);
        document.body.appendChild(button);
        
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 200;
            button.classList.toggle('visible', scrolled);
        });
        
        // Smooth scroll to top
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        this.scrollTopButton = button;
    }
}

// Initialize when DOM is ready
window.addEventListener('load', async () => {
    try {
        // Initialize managers
        if (typeof AuthManager !== 'undefined') {
            window.authManager = new AuthManager();
        }
        if (typeof BlogDisplayManager !== 'undefined') {
            window.blogDisplayManager = new BlogDisplayManager();
        }
    } catch (error) {
        console.error('Error initializing managers:', error);
    }
});

