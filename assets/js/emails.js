// Email Management and Communication System
class EmailManager {
    constructor() {
        this.emailService = 'emailjs'; // Default service
        this.serviceConfig = {
            emailjs: {
                serviceId: 'service_mpalomares',
                templateId: 'template_contact',
                publicKey: '7cldp91TueGi-giUu'
            }
        };
        this.init();
    }

    init() {
        this.initializeEmailJS();
        this.setupEventListeners();
        this.setupFormValidation();
    }

    initializeEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.serviceConfig.emailjs.publicKey);
        }
    }

    setupEventListeners() {
        // Contact form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'contact-form') {
                e.preventDefault();
                this.handleContactForm(e.target);
            }
        });

        // Newsletter subscription
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'newsletter-form') {
                e.preventDefault();
                this.handleNewsletterSubscription(e.target);
            }
        });

        // Quote request form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'quote-form') {
                e.preventDefault();
                this.handleQuoteRequest(e.target);
            }
        });

        // Consultation booking form
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'consultation-form') {
                e.preventDefault();
                this.handleConsultationBooking(e.target);
            }
        });

        // ROI calculator email results
        document.addEventListener('click', (e) => {
            if (e.target.id === 'email-roi-results') {
                e.preventDefault();
                this.emailROIResults();
            }
        });
    }

    setupFormValidation() {
        // Real-time validation for email forms
        document.addEventListener('input', (e) => {
            if (e.target.type === 'email') {
                this.validateEmailField(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const contactData = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject') || 'Contact Form Submission',
            message: formData.get('message'),
            phone: formData.get('phone') || '',
            company: formData.get('company') || '',
            timestamp: new Date().toISOString()
        };

        // Validate form data
        const validation = this.validateContactData(contactData);
        if (!validation.isValid) {
            this.showFormError(form, validation.message);
            return;
        }

        this.showFormLoading(form, 'Sending message...');

        try {
            // Send email via EmailJS
            const result = await this.sendContactEmail(contactData);
            
            if (result.success) {
                this.showFormSuccess(form, 'Message sent successfully! We\'ll get back to you soon.');
                this.saveContactSubmission(contactData);
                this.trackEmailEvent('contact_form_sent', contactData);
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showFormError(form, 'Failed to send message. Please try again or contact us directly.');
        } finally {
            this.hideFormLoading(form);
        }
    }

    async handleNewsletterSubscription(form) {
        const formData = new FormData(form);
        const subscriptionData = {
            email: formData.get('email'),
            name: formData.get('name') || '',
            interests: formData.getAll('interests') || [],
            timestamp: new Date().toISOString()
        };

        if (!this.isValidEmail(subscriptionData.email)) {
            this.showFormError(form, 'Please enter a valid email address.');
            return;
        }

        // Check if already subscribed
        if (this.isAlreadySubscribed(subscriptionData.email)) {
            this.showFormError(form, 'This email is already subscribed to our newsletter.');
            return;
        }

        this.showFormLoading(form, 'Subscribing...');

        try {
            const result = await this.sendWelcomeEmail(subscriptionData);
            
            if (result.success) {
                this.showFormSuccess(form, 'Successfully subscribed! Check your email for confirmation.');
                this.saveNewsletterSubscription(subscriptionData);
                this.trackEmailEvent('newsletter_subscription', subscriptionData);
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showFormError(form, 'Failed to subscribe. Please try again.');
        } finally {
            this.hideFormLoading(form);
        }
    }

    async handleQuoteRequest(form) {
        const formData = new FormData(form);
        const quoteData = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            phone: formData.get('phone'),
            projectType: formData.get('project-type'),
            budget: formData.get('budget'),
            timeline: formData.get('timeline'),
            description: formData.get('description'),
            timestamp: new Date().toISOString()
        };

        const validation = this.validateQuoteData(quoteData);
        if (!validation.isValid) {
            this.showFormError(form, validation.message);
            return;
        }

        this.showFormLoading(form, 'Sending quote request...');

        try {
            const result = await this.sendQuoteRequestEmail(quoteData);
            
            if (result.success) {
                this.showFormSuccess(form, 'Quote request sent! We\'ll prepare a custom proposal for you.');
                this.saveQuoteRequest(quoteData);
                this.trackEmailEvent('quote_request_sent', quoteData);
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Quote request error:', error);
            this.showFormError(form, 'Failed to send quote request. Please try again.');
        } finally {
            this.hideFormLoading(form);
        }
    }

    async handleConsultationBooking(form) {
        const formData = new FormData(form);
        const consultationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            preferredDate: formData.get('preferred-date'),
            preferredTime: formData.get('preferred-time'),
            consultationType: formData.get('consultation-type'),
            goals: formData.get('goals'),
            currentChallenges: formData.get('current-challenges'),
            timestamp: new Date().toISOString()
        };

        const validation = this.validateConsultationData(consultationData);
        if (!validation.isValid) {
            this.showFormError(form, validation.message);
            return;
        }

        this.showFormLoading(form, 'Booking consultation...');

        try {
            const result = await this.sendConsultationBookingEmail(consultationData);
            
            if (result.success) {
                this.showFormSuccess(form, 'Consultation booked! We\'ll confirm your appointment soon.');
                this.saveConsultationBooking(consultationData);
                this.trackEmailEvent('consultation_booked', consultationData);
                form.reset();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Consultation booking error:', error);
            this.showFormError(form, 'Failed to book consultation. Please try again.');
        } finally {
            this.hideFormLoading(form);
        }
    }

    async emailROIResults() {
        const roiResults = this.getROICalculatorResults();
        if (!roiResults) {
            this.showNotification('Please calculate ROI first before emailing results.', 'warning');
            return;
        }

        const email = prompt('Enter your email address to receive the ROI analysis:');
        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            return;
        }

        this.showNotification('Sending ROI analysis...', 'info');

        try {
            const result = await this.sendROIResultsEmail(email, roiResults);
            
            if (result.success) {
                this.showNotification('ROI analysis sent to your email!', 'success');
                this.trackEmailEvent('roi_results_emailed', { email, roiResults });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('ROI email error:', error);
            this.showNotification('Failed to send ROI analysis. Please try again.', 'error');
        }
    }

    // Email sending methods
    async sendContactEmail(contactData) {
        const templateParams = {
            from_name: contactData.name,
            from_email: contactData.email,
            subject: contactData.subject,
            message: contactData.message,
            phone: contactData.phone,
            company: contactData.company,
            timestamp: contactData.timestamp,
            to_email: 'contact@mpalomares.com'
        };

        try {
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.serviceConfig.emailjs.serviceId,
                    'template_contact',
                    templateParams
                );
                return { success: true, response };
            } else {
                // Fallback to custom email service
                return await this.sendEmailViaCustomService('contact', templateParams);
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendWelcomeEmail(subscriptionData) {
        const templateParams = {
            to_email: subscriptionData.email,
            to_name: subscriptionData.name || 'Subscriber',
            interests: subscriptionData.interests.join(', '),
            timestamp: subscriptionData.timestamp
        };

        try {
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.serviceConfig.emailjs.serviceId,
                    'template_welcome',
                    templateParams
                );
                return { success: true, response };
            } else {
                return await this.sendEmailViaCustomService('welcome', templateParams);
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendQuoteRequestEmail(quoteData) {
        const templateParams = {
            from_name: quoteData.name,
            from_email: quoteData.email,
            company: quoteData.company,
            phone: quoteData.phone,
            project_type: quoteData.projectType,
            budget: quoteData.budget,
            timeline: quoteData.timeline,
            description: quoteData.description,
            timestamp: quoteData.timestamp,
            to_email: 'quotes@mpalomares.com'
        };

        try {
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.serviceConfig.emailjs.serviceId,
                    'template_quote',
                    templateParams
                );
                return { success: true, response };
            } else {
                return await this.sendEmailViaCustomService('quote', templateParams);
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendConsultationBookingEmail(consultationData) {
        const templateParams = {
            from_name: consultationData.name,
            from_email: consultationData.email,
            phone: consultationData.phone,
            company: consultationData.company,
            preferred_date: consultationData.preferredDate,
            preferred_time: consultationData.preferredTime,
            consultation_type: consultationData.consultationType,
            goals: consultationData.goals,
            current_challenges: consultationData.currentChallenges,
            timestamp: consultationData.timestamp,
            to_email: 'consultations@mpalomares.com'
        };

        try {
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.serviceConfig.emailjs.serviceId,
                    'template_consultation',
                    templateParams
                );
                return { success: true, response };
            } else {
                return await this.sendEmailViaCustomService('consultation', templateParams);
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendROIResultsEmail(email, roiResults) {
        const templateParams = {
            to_email: email,
            roi_percentage: roiResults.monthly.roi.toFixed(1),
            monthly_revenue: roiResults.monthly.revenue.toLocaleString(),
            monthly_profit: roiResults.monthly.profit.toLocaleString(),
            roas: roiResults.monthly.roas.toFixed(2),
            annual_revenue: roiResults.annual.revenue.toLocaleString(),
            annual_profit: roiResults.annual.profit.toLocaleString(),
            break_even_cpc: roiResults.metrics.breakEvenCPC.toFixed(2),
            timestamp: new Date().toISOString()
        };

        try {
            if (typeof emailjs !== 'undefined') {
                const response = await emailjs.send(
                    this.serviceConfig.emailjs.serviceId,
                    'template_roi_results',
                    templateParams
                );
                return { success: true, response };
            } else {
                return await this.sendEmailViaCustomService('roi_results', templateParams);
            }
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async sendEmailViaCustomService(type, templateParams) {
        // Fallback email service implementation
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: type,
                params: templateParams
            })
        });

        if (response.ok) {
            return { success: true, response: await response.json() };
        } else {
            throw new Error('Failed to send email via custom service');
        }
    }

    // Validation methods
    validateContactData(data) {
        if (!data.name || data.name.length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long.' };
        }

        if (!this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        if (!data.message || data.message.length < 10) {
            return { isValid: false, message: 'Message must be at least 10 characters long.' };
        }

        return { isValid: true };
    }

    validateQuoteData(data) {
        if (!data.name || !data.email || !data.company || !data.projectType) {
            return { isValid: false, message: 'Please fill in all required fields.' };
        }

        if (!this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        return { isValid: true };
    }

    validateConsultationData(data) {
        if (!data.name || !data.email || !data.preferredDate || !data.consultationType) {
            return { isValid: false, message: 'Please fill in all required fields.' };
        }

        if (!this.isValidEmail(data.email)) {
            return { isValid: false, message: 'Please enter a valid email address.' };
        }

        const selectedDate = new Date(data.preferredDate);
        const today = new Date();
        if (selectedDate <= today) {
            return { isValid: false, message: 'Please select a future date for the consultation.' };
        }

        return { isValid: true };
    }

    validateEmailField(field) {
        const email = field.value.trim();
        const isValid = this.isValidEmail(email);
        
        field.classList.toggle('invalid', !isValid && email.length > 0);
        field.classList.toggle('valid', isValid);

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const isValid = !isRequired || value.length > 0;

        field.classList.toggle('invalid', !isValid);
        field.classList.toggle('valid', isValid && value.length > 0);

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Data storage methods
    saveContactSubmission(data) {
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push(data);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
    }

    saveNewsletterSubscription(data) {
        const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
        subscriptions.push(data);
        localStorage.setItem('newsletterSubscriptions', JSON.stringify(subscriptions));
    }

    saveQuoteRequest(data) {
        const quotes = JSON.parse(localStorage.getItem('quoteRequests') || '[]');
        quotes.push(data);
        localStorage.setItem('quoteRequests', JSON.stringify(quotes));
    }

    saveConsultationBooking(data) {
        const bookings = JSON.parse(localStorage.getItem('consultationBookings') || '[]');
        bookings.push(data);
        localStorage.setItem('consultationBookings', JSON.stringify(bookings));
    }

    isAlreadySubscribed(email) {
        const subscriptions = JSON.parse(localStorage.getItem('newsletterSubscriptions') || '[]');
        return subscriptions.some(sub => sub.email === email);
    }

    getROICalculatorResults() {
        // Get results from ROI calculator
        const resultElement = document.querySelector('#roi-result .roi-results-container');
        if (!resultElement) return null;

        // Extract data from the displayed results
        // This would need to be coordinated with the calculator.js
        return window.roiCalculator?.lastCalculationResults || null;
    }

    // UI feedback methods
    showFormLoading(form, message) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${message}`;
        }
    }

    hideFormLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
        }
    }

    showFormSuccess(form, message) {
        this.showFormMessage(form, message, 'success');
    }

    showFormError(form, message) {
        this.showFormMessage(form, message, 'error');
    }

    showFormMessage(form, message, type) {
        let messageElement = form.querySelector('.form-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.className = 'form-message';
            form.appendChild(messageElement);
        }

        messageElement.className = `form-message ${type}`;
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageElement.style.opacity = '0';
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 300);
        }, 5000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    trackEmailEvent(eventType, data) {
        if (window.analyticsManager) {
            window.analyticsManager.trackEvent('email_' + eventType, {
                type: eventType,
                timestamp: Date.now(),
                ...data
            });
        }
    }

    // Email templates management
    getEmailTemplates() {
        return {
            contact: {
                subject: 'New Contact Form Submission',
                template: 'template_contact'
            },
            welcome: {
                subject: 'Welcome to Mpalomares Digital Solutions Newsletter',
                template: 'template_welcome'
            },
            quote: {
                subject: 'New Quote Request',
                template: 'template_quote'
            },
            consultation: {
                subject: 'New Consultation Booking',
                template: 'template_consultation'
            },
            roi_results: {
                subject: 'Your Google Ads ROI Analysis Results',
                template: 'template_roi_results'
            }
        };
    }

    // Bulk email operations
    async sendBulkEmails(emailList, templateType, customData = {}) {
        const results = [];
        const batchSize = 10; // Send in batches to avoid rate limiting

        for (let i = 0; i < emailList.length; i += batchSize) {
            const batch = emailList.slice(i, i + batchSize);
            const batchPromises = batch.map(email => 
                this.sendSingleEmail(email, templateType, customData)
            );

            try {
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
                
                // Wait between batches
                if (i + batchSize < emailList.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error('Batch email error:', error);
            }
        }

        return results;
    }

    async sendSingleEmail(email, templateType, customData) {
        const templates = this.getEmailTemplates();
        const template = templates[templateType];
        
        if (!template) {
            throw new Error(`Unknown template type: ${templateType}`);
        }

        const templateParams = {
            to_email: email,
            ...customData
        };

        return await emailjs.send(
            this.serviceConfig.emailjs.serviceId,
            template.template,
            templateParams
        );
    }
}

// Initialize email manager
document.addEventListener('DOMContentLoaded', () => {
    window.emailManager = new EmailManager();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailManager;
}

