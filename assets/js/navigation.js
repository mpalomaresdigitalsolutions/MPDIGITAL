// Navigation Management System
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setActiveNavItem();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupDropdownMenus();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.mobileMenuOpen && !e.target.closest('.navbar')) {
                this.closeMobileMenu();
            }
        });

        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-links a')) {
                this.handleNavClick(e);
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Handle scroll for header effects
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    setActiveNavItem() {
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            const linkPage = href.replace('.html', '').replace('./', '');
            
            if (linkPage === this.currentPage || 
                (this.currentPage === 'index' && (linkPage === 'index' || href === '/'))) {
                link.classList.add('active');
            }
        });
    }

    setupMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        // Add mobile menu class
        navLinks.classList.add('mobile-nav');

        // Create mobile menu overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-menu-overlay';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', () => this.closeMobileMenu());
    }

    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const mobileToggle = document.querySelector('.mobile-toggle');

        if (navLinks) navLinks.classList.add('mobile-open');
        if (overlay) overlay.classList.add('active');
        if (mobileToggle) mobileToggle.classList.add('active');

        document.body.classList.add('mobile-menu-open');
        this.mobileMenuOpen = true;

        // Animate menu items
        const menuItems = navLinks.querySelectorAll('a');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-in');
        });
    }

    closeMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const overlay = document.querySelector('.mobile-menu-overlay');
        const mobileToggle = document.querySelector('.mobile-toggle');

        if (navLinks) navLinks.classList.remove('mobile-open');
        if (overlay) overlay.classList.remove('active');
        if (mobileToggle) mobileToggle.classList.remove('active');

        document.body.classList.remove('mobile-menu-open');
        this.mobileMenuOpen = false;

        // Remove animation classes
        const menuItems = navLinks?.querySelectorAll('a') || [];
        menuItems.forEach(item => {
            item.classList.remove('animate-in');
            item.style.animationDelay = '';
        });
    }

    setupScrollEffects() {
        const header = document.querySelector('header');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const scrollY = window.scrollY;
            
            // Add/remove scrolled class
            if (scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }

            // Hide/show header on scroll
            if (scrollY > lastScrollY && scrollY > 200) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }

            lastScrollY = scrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    setupDropdownMenus() {
        const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
        
        dropdownItems.forEach(item => {
            const submenu = item.querySelector('.submenu');
            if (!submenu) return;

            let timeout;

            item.addEventListener('mouseenter', () => {
                clearTimeout(timeout);
                this.showSubmenu(submenu);
            });

            item.addEventListener('mouseleave', () => {
                timeout = setTimeout(() => {
                    this.hideSubmenu(submenu);
                }, 300);
            });

            // Handle keyboard navigation for dropdowns
            const mainLink = item.querySelector('a');
            if (mainLink) {
                mainLink.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleSubmenu(submenu);
                    }
                });
            }
        });
    }

    showSubmenu(submenu) {
        submenu.classList.add('active');
        submenu.style.opacity = '1';
        submenu.style.visibility = 'visible';
        submenu.style.transform = 'translateY(0)';
    }

    hideSubmenu(submenu) {
        submenu.classList.remove('active');
        submenu.style.opacity = '0';
        submenu.style.visibility = 'hidden';
        submenu.style.transform = 'translateY(-10px)';
    }

    toggleSubmenu(submenu) {
        if (submenu.classList.contains('active')) {
            this.hideSubmenu(submenu);
        } else {
            this.showSubmenu(submenu);
        }
    }

    handleNavClick(e) {
        const link = e.target.closest('a');
        const href = link.getAttribute('href');

        // Close mobile menu if open
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Handle smooth scrolling for anchor links
        if (href.startsWith('#')) {
            e.preventDefault();
            this.smoothScrollToSection(href);
            return;
        }

        // Handle external links
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        }

        // Add loading state for internal navigation
        if (!href.startsWith('http') && !href.startsWith('#')) {
            this.showNavigationLoading();
        }
    }

    smoothScrollToSection(targetId) {
        const target = document.querySelector(targetId);
        if (!target) return;

        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL without triggering page reload
        history.pushState(null, null, targetId);
    }

    showNavigationLoading() {
        const loader = document.createElement('div');
        loader.className = 'navigation-loader';
        loader.innerHTML = '<div class="loader-spinner"></div>';
        document.body.appendChild(loader);

        // Remove loader after a short delay (page should load by then)
        setTimeout(() => {
            loader.remove();
        }, 2000);
    }

    handleScroll() {
        // Update active nav item based on scroll position for single-page navigation
        if (this.currentPage === 'index') {
            this.updateActiveNavOnScroll();
        }

        // Show/hide scroll-to-top button
        this.toggleScrollToTopButton();
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.setActiveNavItemByHref(`#${sectionId}`);
            }
        });
    }

    setActiveNavItemByHref(href) {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === href) {
                link.classList.add('active');
            }
        });
    }

    toggleScrollToTopButton() {
        let scrollToTopBtn = document.querySelector('.scroll-to-top');
        
        if (!scrollToTopBtn) {
            scrollToTopBtn = this.createScrollToTopButton();
        }

        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    createScrollToTopButton() {
        const button = document.createElement('button');
        button.className = 'scroll-to-top';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.setAttribute('aria-label', 'Scroll to top');
        
        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(button);
        return button;
    }

    handleKeyboardNavigation(e) {
        // Handle Escape key to close mobile menu
        if (e.key === 'Escape' && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }

        // Handle Tab navigation
        if (e.key === 'Tab') {
            this.handleTabNavigation(e);
        }
    }

    handleTabNavigation(e) {
        if (!this.mobileMenuOpen) return;

        const focusableElements = document.querySelectorAll(
            '.nav-links a, .mobile-toggle, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Breadcrumb functionality
    generateBreadcrumbs() {
        const breadcrumbContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbContainer) return;

        const pathSegments = window.location.pathname.split('/').filter(segment => segment);
        const breadcrumbs = [{ name: 'Home', url: '/' }];

        let currentPath = '';
        pathSegments.forEach(segment => {
            currentPath += `/${segment}`;
            const name = this.formatBreadcrumbName(segment);
            breadcrumbs.push({ name, url: currentPath });
        });

        const breadcrumbHTML = breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return `
                <li class="breadcrumb-item ${isLast ? 'active' : ''}">
                    ${isLast ? 
                        `<span>${crumb.name}</span>` : 
                        `<a href="${crumb.url}">${crumb.name}</a>`
                    }
                </li>
            `;
        }).join('');

        breadcrumbContainer.innerHTML = `
            <nav aria-label="Breadcrumb">
                <ol class="breadcrumb-list">
                    ${breadcrumbHTML}
                </ol>
            </nav>
        `;
    }

    formatBreadcrumbName(segment) {
        return segment
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('.html', '');
    }

    // Search functionality
    setupSearch() {
        const searchToggle = document.querySelector('.search-toggle');
        const searchOverlay = document.querySelector('.search-overlay');
        const searchInput = document.querySelector('.search-input');
        const searchClose = document.querySelector('.search-close');

        if (!searchToggle || !searchOverlay) return;

        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput?.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });

        searchInput?.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
    }

    performSearch(query) {
        if (query.length < 2) return;

        // This would typically make an API call
        // For now, we'll search through page content
        const results = this.searchPageContent(query);
        this.displaySearchResults(results);
    }

    searchPageContent(query) {
        const searchableElements = document.querySelectorAll('h1, h2, h3, p, .blog-title, .blog-excerpt');
        const results = [];

        searchableElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            if (text.includes(query.toLowerCase())) {
                results.push({
                    title: element.textContent.trim(),
                    url: window.location.href,
                    type: element.tagName.toLowerCase()
                });
            }
        });

        return results.slice(0, 5); // Limit to 5 results
    }

    displaySearchResults(results) {
        const resultsContainer = document.querySelector('.search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
            return;
        }

        const resultsHTML = results.map(result => `
            <div class="search-result-item">
                <h4><a href="${result.url}">${result.title}</a></h4>
                <span class="result-type">${result.type}</span>
            </div>
        `).join('');

        resultsContainer.innerHTML = resultsHTML;
    }

    // Utility methods
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

    // Initialize additional features
    initializeAdditionalFeatures() {
        this.generateBreadcrumbs();
        this.setupSearch();
    }
}

// Initialize navigation manager
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
    window.navigationManager.initializeAdditionalFeatures();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

