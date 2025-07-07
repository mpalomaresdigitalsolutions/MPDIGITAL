// Analytics and Tracking System
class AnalyticsManager {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.userId = null;
        this.pageLoadTime = Date.now();
        this.events = [];
        this.isTrackingEnabled = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.trackPageView();
        this.setupPerformanceTracking();
        this.setupUserBehaviorTracking();
        this.setupConversionTracking();
    }

    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', { timestamp: Date.now() });
            } else {
                this.trackEvent('page_visible', { timestamp: Date.now() });
            }
        });

        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollDepth > maxScrollDepth) {
                maxScrollDepth = scrollDepth;
                this.trackScrollDepth(scrollDepth);
            }
        }, 1000));

        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackClick(e);
        });

        // Track form interactions
        document.addEventListener('submit', (e) => {
            this.trackFormSubmission(e);
        });

        // Track external link clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isExternalLink(link.href)) {
                this.trackExternalLinkClick(link.href);
            }
        });

        // Track file downloads
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && this.isDownloadLink(link.href)) {
                this.trackFileDownload(link.href);
            }
        });

        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackPageUnload();
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.trackError(e);
        });
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId
        };

        this.trackEvent('page_view', pageData);
        this.updatePageMetrics();
    }

    trackEvent(eventName, eventData = {}) {
        if (!this.isTrackingEnabled) return;

        const event = {
            name: eventName,
            data: eventData,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href
        };

        this.events.push(event);
        this.sendEventToAnalytics(event);
        this.storeEventLocally(event);
    }

    trackClick(event) {
        const element = event.target;
        const clickData = {
            elementType: element.tagName.toLowerCase(),
            elementId: element.id || null,
            elementClass: element.className || null,
            elementText: element.textContent?.trim().substring(0, 100) || null,
            x: event.clientX,
            y: event.clientY,
            timestamp: Date.now()
        };

        // Track specific element types
        if (element.matches('button, .btn, [role="button"]')) {
            this.trackEvent('button_click', clickData);
        } else if (element.matches('a')) {
            this.trackEvent('link_click', { ...clickData, href: element.href });
        } else if (element.matches('img')) {
            this.trackEvent('image_click', { ...clickData, src: element.src, alt: element.alt });
        } else {
            this.trackEvent('element_click', clickData);
        }
    }

    trackFormSubmission(event) {
        const form = event.target;
        const formData = {
            formId: form.id || null,
            formClass: form.className || null,
            formAction: form.action || null,
            formMethod: form.method || 'get',
            fieldCount: form.elements.length,
            timestamp: Date.now()
        };

        this.trackEvent('form_submission', formData);
    }

    trackScrollDepth(depth) {
        // Track milestone scroll depths
        const milestones = [25, 50, 75, 90, 100];
        const milestone = milestones.find(m => depth >= m && !this.hasTrackedScrollMilestone(m));
        
        if (milestone) {
            this.trackEvent('scroll_depth', { 
                depth: milestone,
                timestamp: Date.now()
            });
            this.markScrollMilestoneTracked(milestone);
        }
    }

    trackExternalLinkClick(href) {
        this.trackEvent('external_link_click', {
            url: href,
            domain: new URL(href).hostname,
            timestamp: Date.now()
        });
    }

    trackFileDownload(href) {
        const fileName = href.split('/').pop();
        const fileExtension = fileName.split('.').pop();
        
        this.trackEvent('file_download', {
            url: href,
            fileName: fileName,
            fileExtension: fileExtension,
            timestamp: Date.now()
        });
    }

    trackPageUnload() {
        const timeOnPage = Date.now() - this.pageLoadTime;
        this.trackEvent('page_unload', {
            timeOnPage: timeOnPage,
            timestamp: Date.now()
        });
        
        // Send any pending events
        this.flushEvents();
    }

    trackError(error) {
        this.trackEvent('javascript_error', {
            message: error.message,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
            stack: error.error?.stack,
            timestamp: Date.now()
        });
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = this.getPerformanceData();
                this.trackEvent('page_performance', perfData);
            }, 0);
        });

        // Track Core Web Vitals
        this.trackCoreWebVitals();
    }

    getPerformanceData() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paint = performance.getEntriesByType('paint');
        
        return {
            loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
            domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
            navigationStart: navigation?.navigationStart,
            responseStart: navigation?.responseStart,
            responseEnd: navigation?.responseEnd,
            domInteractive: navigation?.domInteractive,
            domComplete: navigation?.domComplete
        };
    }

    trackCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.trackEvent('core_web_vital_lcp', {
                value: lastEntry.startTime,
                timestamp: Date.now()
            });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            entries.forEach(entry => {
                this.trackEvent('core_web_vital_fid', {
                    value: entry.processingStart - entry.startTime,
                    timestamp: Date.now()
                });
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
            this.trackEvent('core_web_vital_cls', {
                value: clsValue,
                timestamp: Date.now()
            });
        }).observe({ entryTypes: ['layout-shift'] });
    }

    setupUserBehaviorTracking() {
        // Track time spent on page sections
        this.setupSectionTracking();
        
        // Track user engagement
        this.trackUserEngagement();
        
        // Track device and browser info
        this.trackDeviceInfo();
    }

    setupSectionTracking() {
        const sections = document.querySelectorAll('section[id], .track-section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id || entry.target.className;
                    this.trackEvent('section_view', {
                        sectionId: sectionId,
                        timestamp: Date.now()
                    });
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => observer.observe(section));
    }

    trackUserEngagement() {
        let engagementScore = 0;
        let lastActivity = Date.now();

        // Track mouse movement
        document.addEventListener('mousemove', this.throttle(() => {
            engagementScore += 1;
            lastActivity = Date.now();
        }, 1000));

        // Track keyboard activity
        document.addEventListener('keydown', () => {
            engagementScore += 2;
            lastActivity = Date.now();
        });

        // Track engagement score periodically
        setInterval(() => {
            const timeSinceLastActivity = Date.now() - lastActivity;
            if (timeSinceLastActivity < 30000) { // Active in last 30 seconds
                this.trackEvent('user_engagement', {
                    score: engagementScore,
                    timestamp: Date.now()
                });
                engagementScore = 0; // Reset score
            }
        }, 30000);
    }

    trackDeviceInfo() {
        const deviceInfo = {
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };

        this.trackEvent('device_info', deviceInfo);
    }

    setupConversionTracking() {
        // Track form completions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.classList.contains('conversion-form') || form.id.includes('contact') || form.id.includes('newsletter')) {
                this.trackConversion('form_completion', {
                    formType: form.id || form.className,
                    timestamp: Date.now()
                });
            }
        });

        // Track button clicks that indicate conversion intent
        document.addEventListener('click', (e) => {
            const element = e.target;
            if (element.matches('.cta-button, .conversion-btn, [data-conversion]')) {
                this.trackConversion('cta_click', {
                    buttonText: element.textContent?.trim(),
                    buttonId: element.id,
                    conversionType: element.dataset.conversion || 'unknown',
                    timestamp: Date.now()
                });
            }
        });

        // Track ROI calculator usage
        document.addEventListener('click', (e) => {
            if (e.target.id === 'calculate-roi-btn' || e.target.closest('#calculate-roi-btn')) {
                this.trackConversion('roi_calculation', {
                    timestamp: Date.now()
                });
            }
        });
    }

    trackConversion(conversionType, data = {}) {
        this.trackEvent('conversion', {
            type: conversionType,
            ...data,
            timestamp: Date.now()
        });

        // Send to Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                event_category: 'Conversion',
                event_label: conversionType,
                value: 1
            });
        }
    }

    // Google Analytics integration
    initializeGoogleAnalytics() {
        if (typeof gtag !== 'undefined') {
            // Set user properties
            gtag('config', 'AW-16953595012', {
                user_id: this.userId,
                custom_map: {
                    'session_id': this.sessionId
                }
            });
        }
    }

    sendEventToGoogleAnalytics(eventName, eventData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: eventData.category || 'User Interaction',
                event_label: eventData.label || '',
                value: eventData.value || 1,
                custom_parameters: eventData
            });
        }
    }

    // Data management
    sendEventToAnalytics(event) {
        // Send to Google Analytics
        this.sendEventToGoogleAnalytics(event.name, event.data);

        // Send to custom analytics endpoint (if available)
        if (this.analyticsEndpoint) {
            fetch(this.analyticsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event)
            }).catch(error => {
                console.warn('Failed to send analytics event:', error);
            });
        }
    }

    storeEventLocally(event) {
        const storedEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
        storedEvents.push(event);
        
        // Keep only last 100 events
        if (storedEvents.length > 100) {
            storedEvents.splice(0, storedEvents.length - 100);
        }
        
        localStorage.setItem('analyticsEvents', JSON.stringify(storedEvents));
    }

    flushEvents() {
        // Send any pending events before page unload
        const pendingEvents = this.events.filter(event => !event.sent);
        if (pendingEvents.length > 0 && navigator.sendBeacon) {
            const data = JSON.stringify(pendingEvents);
            navigator.sendBeacon('/analytics/batch', data);
        }
    }

    // Utility methods
    generateSessionId() {
        return 'session_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setUserId(userId) {
        this.userId = userId;
        this.trackEvent('user_identified', { userId: userId });
    }

    isExternalLink(href) {
        try {
            const url = new URL(href);
            return url.hostname !== window.location.hostname;
        } catch {
            return false;
        }
    }

    isDownloadLink(href) {
        const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'];
        return downloadExtensions.some(ext => href.toLowerCase().includes(ext));
    }

    hasTrackedScrollMilestone(milestone) {
        const key = `scroll_milestone_${milestone}`;
        return sessionStorage.getItem(key) === 'true';
    }

    markScrollMilestoneTracked(milestone) {
        const key = `scroll_milestone_${milestone}`;
        sessionStorage.setItem(key, 'true');
    }

    updatePageMetrics() {
        // Update page view count
        const pageViews = parseInt(localStorage.getItem('pageViews') || '0') + 1;
        localStorage.setItem('pageViews', pageViews.toString());

        // Update session page count
        const sessionPageViews = parseInt(sessionStorage.getItem('sessionPageViews') || '0') + 1;
        sessionStorage.setItem('sessionPageViews', sessionPageViews.toString());
    }

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

    // Analytics reporting
    getAnalyticsReport() {
        const storedEvents = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
        const report = {
            totalEvents: storedEvents.length,
            eventTypes: {},
            sessionInfo: {
                sessionId: this.sessionId,
                userId: this.userId,
                pageViews: parseInt(localStorage.getItem('pageViews') || '0'),
                sessionPageViews: parseInt(sessionStorage.getItem('sessionPageViews') || '0')
            },
            performance: this.getPerformanceData(),
            userBehavior: this.getUserBehaviorSummary(storedEvents)
        };

        // Count event types
        storedEvents.forEach(event => {
            report.eventTypes[event.name] = (report.eventTypes[event.name] || 0) + 1;
        });

        return report;
    }

    getUserBehaviorSummary(events) {
        const clickEvents = events.filter(e => e.name.includes('click'));
        const scrollEvents = events.filter(e => e.name === 'scroll_depth');
        const conversionEvents = events.filter(e => e.name === 'conversion');

        return {
            totalClicks: clickEvents.length,
            maxScrollDepth: Math.max(...scrollEvents.map(e => e.data.depth), 0),
            conversions: conversionEvents.length,
            engagementScore: events.filter(e => e.name === 'user_engagement').length
        };
    }

    // Privacy controls
    enableTracking() {
        this.isTrackingEnabled = true;
        localStorage.setItem('analyticsEnabled', 'true');
    }

    disableTracking() {
        this.isTrackingEnabled = false;
        localStorage.setItem('analyticsEnabled', 'false');
        // Clear stored events
        localStorage.removeItem('analyticsEvents');
    }

    isTrackingAllowed() {
        const userPreference = localStorage.getItem('analyticsEnabled');
        return userPreference !== 'false'; // Default to enabled
    }
}

// Initialize analytics manager
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
    
    // Initialize Google Analytics integration
    window.analyticsManager.initializeGoogleAnalytics();
    
    // Set user ID if authenticated
    if (window.authManager && window.authManager.isAuthenticated) {
        window.analyticsManager.setUserId(window.authManager.currentUser.id);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsManager;
}

