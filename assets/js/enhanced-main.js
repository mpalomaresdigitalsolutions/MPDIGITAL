// Enhanced Main JavaScript with Performance Optimizations and Mobile Support

class WebsiteManager {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupIntersectionObserver();
        this.setupScrollEffects();
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

        // Form submissions
        this.setupFormHandlers();
    }

    toggleMobileMenu() {
        const isOpen = this.navLinks.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        this.navLinks.classList.add('mobile-open');
        this.mobileToggle.classList.add('active');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = 'hidden';
        
        // Add overlay
        this.createMobileOverlay();
        
        // Animate menu items
        this.animateMenuItems();
    }

    closeMobileMenu() {
        this.navLinks.classList.remove('mobile-open');
        this.mobileToggle.classList.remove('active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Remove overlay
        this.removeMobileOverlay();
    }

    createMobileOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        overlay.addEventListener('click', this.closeMobileMenu.bind(this));
        document.body.appendChild(overlay);
        
        // Trigger animation
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    }

    removeMobileOverlay() {
        const overlay = document.querySelector('.mobile-menu-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    animateMenuItems() {
        const menuItems = this.navLinks.querySelectorAll('a');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-in');
        });
    }

    closeMobileMenuOnOutsideClick(event) {
        if (this.navLinks.classList.contains('mobile-open')) {
            if (!this.navLinks.contains(event.target) && !this.mobileToggle.contains(event.target)) {
                this.closeMobileMenu();
            }
        }
    }

    handleScroll() {
        const scrollY = window.scrollY;
        
        // Header scroll effect
        if (scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Reading progress
        if (this.readingProgress) {
            const scrolled = (scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            this.readingProgress.style.width = `${Math.min(scrolled, 100)}%`;
        }

        // Scroll to top button
        const scrollToTopBtn = document.querySelector('.scroll-to-top');
        if (scrollToTopBtn) {
            if (scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && this.navLinks.classList.contains('mobile-open')) {
            this.closeMobileMenu();
        }
    }

    handleAnchorClick(event) {
        const link = event.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#') return;

        event.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            // Close mobile menu if open
            if (this.navLinks.classList.contains('mobile-open')) {
                this.closeMobileMenu();
            }

            // Smooth scroll to target
            const headerHeight = this.header.offsetHeight;
            const targetPosition = target.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update active nav link
            this.updateActiveNavLink(href);
        }
    }

    updateActiveNavLink(href) {
        // Remove active class from all nav links
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => link.classList.remove('active'));

        // Add active class to current link
        const currentLink = document.querySelector(`.nav-links a[href="${href}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }

    handleKeyboardNavigation(event) {
        // Escape key closes mobile menu
        if (event.key === 'Escape' && this.navLinks.classList.contains('mobile-open')) {
            this.closeMobileMenu();
        }

        // Tab navigation improvements
        if (event.key === 'Tab') {
            this.handleTabNavigation(event);
        }
    }

    handleTabNavigation(event) {
        if (this.navLinks.classList.contains('mobile-open')) {
            const focusableElements = this.navLinks.querySelectorAll('a, button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    createScrollToTopButton() {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.setAttribute('aria-label', 'Scroll to top');
        button.addEventListener('click', this.scrollToTop.bind(this));
        document.body.appendChild(button);
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    setupIntersectionObserver() {
        // Lazy loading for images
        const images = document.querySelectorAll('img[loading="lazy"]');
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }

        // Section visibility for navigation
        const sections = document.querySelectorAll('section[id]');
        if (sections.length > 0) {
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        this.updateActiveNavLink(`#${id}`);
                    }
                });
            }, {
                threshold: 0.3,
                rootMargin: '-70px 0px -70px 0px'
            });

            sections.forEach(section => sectionObserver.observe(section));
        }
    }

    setupScrollEffects() {
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', this.throttle(() => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }, 16), { passive: true });
        }
    }

    setupFormHandlers() {
        // ROI Calculator
        const roiForm = document.getElementById('roi-calculator-form');
        if (roiForm) {
            roiForm.addEventListener('submit', this.handleROICalculation.bind(this));
        }

        // Contact Form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }
    }

    handleROICalculation(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        // Validate inputs
        const requiredFields = ['monthly-budget', 'avg-cpc', 'conversion-rate', 'avg-order-value', 'profit-margin'];
        const missingFields = requiredFields.filter(field => !data[field] || parseFloat(data[field]) <= 0);
        
        if (missingFields.length > 0) {
            this.showNotification('Please fill in all required fields with valid values.', 'error');
            return;
        }

        // Calculate ROI
        const budget = parseFloat(data['monthly-budget']);
        const cpc = parseFloat(data['avg-cpc']);
        const conversionRate = parseFloat(data['conversion-rate']) / 100;
        const orderValue = parseFloat(data['avg-order-value']);
        const profitMargin = parseFloat(data['profit-margin']) / 100;

        const clicks = budget / cpc;
        const conversions = clicks * conversionRate;
        const revenue = conversions * orderValue;
        const profit = revenue * profitMargin;
        const roi = ((profit - budget) / budget) * 100;
        const breakEvenDays = budget / (profit / 30);

        // Display results
        this.displayROIResults({
            revenue: revenue,
            profit: profit,
            roi: roi,
            breakEvenDays: Math.ceil(breakEvenDays)
        });

        // Show success notification
        this.showNotification('ROI calculation completed successfully!', 'success');
    }

    displayROIResults(results) {
        const resultsContainer = document.getElementById('roi-results');
        if (!resultsContainer) return;

        // Update values with animation
        this.animateValue('monthly-revenue', 0, results.revenue, '$', 0);
        this.animateValue('monthly-profit', 0, results.profit, '$', 0);
        this.animateValue('roi-percentage', 0, results.roi, '', 1, '%');
        this.animateValue('break-even-days', 0, results.breakEvenDays, '', 0, ' days');

        // Show results container
        resultsContainer.classList.add('show');
        
        // Smooth scroll to results
        setTimeout(() => {
            resultsContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 300);
    }

    animateValue(elementId, start, end, prefix = '', decimals = 0, suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            element.textContent = prefix + current.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    handleContactForm(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!data['first-name'] || !data['last-name'] || !data['email'] || !data['message']) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data['email'])) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Simulate form submission
        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        submitButton.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            event.target.reset();
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Show notification
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
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
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        // Monitor page load performance
        window.addEventListener('load', () => {
            this.measurePageLoad();
        });

        // Monitor Core Web Vitals
        this.measureCoreWebVitals();
    }

    measurePageLoad() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            };
        }
    }

    measureCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.metrics.lcp = lastEntry.startTime;
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                });
            }).observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.metrics.cls = clsValue;
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }

    getMetrics() {
        return this.metrics;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main website functionality
    const websiteManager = new WebsiteManager();
    
    // Initialize performance monitoring
    const performanceMonitor = new PerformanceMonitor();
    
    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100,
            disable: 'mobile' // Disable on mobile for better performance
        });
    }
    
    // Service Worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    // Expose performance metrics to global scope for debugging
    window.getPerformanceMetrics = () => performanceMonitor.getMetrics();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebsiteManager, PerformanceMonitor };
}

