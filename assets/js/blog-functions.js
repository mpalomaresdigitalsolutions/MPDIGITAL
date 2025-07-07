// Blog Functions - CRUD Operations and Utilities
class BlogFunctions {
    constructor() {
        this.posts = this.loadPosts();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSinglePost();
    }

    setupEventListeners() {
        // Comment form submission
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => this.handleCommentSubmission(e));
        }

        // Newsletter subscription
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterSubscription(e));
        }

        // Social sharing buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('social-share-btn')) {
                e.preventDefault();
                this.handleSocialShare(e.target);
            }
        });

        // Reading progress indicator
        this.setupReadingProgress();
    }

    loadPosts() {
        const storedPosts = localStorage.getItem('blogPosts');
        return storedPosts ? JSON.parse(storedPosts) : [];
    }

    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    loadSinglePost() {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (postId && document.querySelector('.blog-post-content')) {
            this.displaySinglePost(postId);
        }
    }

    displaySinglePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        
        if (!post) {
            this.displayPostNotFound();
            return;
        }

        // Update page title
        document.title = `${post.title} - Mpalomares Digital Solutions`;

        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', post.excerpt);
        }

        // Display post content
        this.renderPostContent(post);
        this.displayRelatedPosts(post);
        this.setupPostInteractions(post);
        this.updateReadingTime(post);
    }

    renderPostContent(post) {
        const container = document.querySelector('.blog-post-content');
        if (!container) return;

        const postHTML = `
            <article class="single-post">
                <header class="post-header">
                    <div class="post-meta">
                        <span class="post-category">${this.getCategoryName(post.category)}</span>
                        <span class="post-date">
                            <i class="fas fa-calendar"></i> ${this.formatDate(post.date)}
                        </span>
                        <span class="post-author">
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                        <span class="post-read-time">
                            <i class="fas fa-clock"></i> ${post.readTime}
                        </span>
                    </div>
                    
                    <h1 class="post-title">${post.title}</h1>
                    
                    <div class="post-excerpt">
                        <p>${post.excerpt}</p>
                    </div>

                    ${post.featured ? '<div class="featured-indicator"><i class="fas fa-star"></i> Featured Article</div>' : ''}
                </header>

                <div class="post-image-container">
                    <img src="${post.image}" alt="${post.title}" class="post-featured-image">
                </div>

                <div class="post-content">
                    ${post.content}
                </div>

                <footer class="post-footer">
                    <div class="post-tags">
                        <h4>Tags:</h4>
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>

                    <div class="post-share">
                        <h4>Share this article:</h4>
                        <div class="social-share-buttons">
                            <button class="social-share-btn" data-platform="facebook" data-url="${window.location.href}" data-title="${post.title}">
                                <i class="fab fa-facebook-f"></i> Facebook
                            </button>
                            <button class="social-share-btn" data-platform="twitter" data-url="${window.location.href}" data-title="${post.title}">
                                <i class="fab fa-twitter"></i> Twitter
                            </button>
                            <button class="social-share-btn" data-platform="linkedin" data-url="${window.location.href}" data-title="${post.title}">
                                <i class="fab fa-linkedin-in"></i> LinkedIn
                            </button>
                            <button class="social-share-btn" data-platform="copy" data-url="${window.location.href}">
                                <i class="fas fa-link"></i> Copy Link
                            </button>
                        </div>
                    </div>
                </footer>
            </article>

            <section class="comments-section">
                <h3>Leave a Comment</h3>
                <form id="comment-form" class="comment-form">
                    <div class="form-group">
                        <label for="comment-name">Name *</label>
                        <input type="text" id="comment-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="comment-email">Email *</label>
                        <input type="email" id="comment-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="comment-message">Comment *</label>
                        <textarea id="comment-message" name="message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="submit-comment-btn">
                        <i class="fas fa-paper-plane"></i> Submit Comment
                    </button>
                </form>
                
                <div id="comments-list" class="comments-list">
                    ${this.renderComments(post.id)}
                </div>
            </section>
        `;

        container.innerHTML = postHTML;
    }

    displayRelatedPosts(currentPost) {
        const relatedContainer = document.querySelector('.related-posts');
        if (!relatedContainer) return;

        // Find related posts based on category and tags
        const relatedPosts = this.posts
            .filter(post => post.id !== currentPost.id)
            .filter(post => 
                post.category === currentPost.category ||
                post.tags.some(tag => currentPost.tags.includes(tag))
            )
            .slice(0, 3);

        if (relatedPosts.length === 0) {
            relatedContainer.style.display = 'none';
            return;
        }

        const relatedHTML = `
            <section class="related-posts-section">
                <h3>Related Articles</h3>
                <div class="related-posts-grid">
                    ${relatedPosts.map(post => `
                        <article class="related-post-card">
                            <a href="blog.html?id=${post.id}">
                                <img src="${post.image}" alt="${post.title}" class="related-post-image">
                                <div class="related-post-content">
                                    <h4>${post.title}</h4>
                                    <p>${post.excerpt.substring(0, 100)}...</p>
                                    <div class="related-post-meta">
                                        <span><i class="fas fa-calendar"></i> ${this.formatDate(post.date)}</span>
                                        <span><i class="fas fa-clock"></i> ${post.readTime}</span>
                                    </div>
                                </div>
                            </a>
                        </article>
                    `).join('')}
                </div>
            </section>
        `;

        relatedContainer.innerHTML = relatedHTML;
    }

    setupPostInteractions(post) {
        // Track reading progress
        this.trackReadingProgress(post.id);
        
        // Setup table of contents if exists
        this.generateTableOfContents();
        
        // Setup code highlighting if exists
        this.highlightCodeBlocks();
    }

    handleCommentSubmission(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const comment = {
            id: this.generateId(),
            postId: new URLSearchParams(window.location.search).get('id'),
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            date: new Date().toISOString(),
            approved: false // Comments need approval
        };

        this.saveComment(comment);
        this.showNotification('Comment submitted successfully! It will appear after approval.');
        e.target.reset();
    }

    handleNewsletterSubscription(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email');
        
        // Save to localStorage (in real app, send to backend)
        const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        
        if (subscribers.includes(email)) {
            this.showNotification('You are already subscribed to our newsletter!', 'warning');
            return;
        }

        subscribers.push(email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
        
        this.showNotification('Successfully subscribed to our newsletter!', 'success');
        e.target.reset();
    }

    handleSocialShare(button) {
        const platform = button.dataset.platform;
        const url = button.dataset.url;
        const title = button.dataset.title;

        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        };

        if (platform === 'copy') {
            navigator.clipboard.writeText(url).then(() => {
                this.showNotification('Link copied to clipboard!');
            });
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
    }

    setupReadingProgress() {
        const progressBar = document.querySelector('.reading-progress');
        if (!progressBar) return;

        window.addEventListener('scroll', () => {
            const article = document.querySelector('.single-post');
            if (!article) return;

            const articleTop = article.offsetTop;
            const articleHeight = article.offsetHeight;
            const windowHeight = window.innerHeight;
            const scrollTop = window.pageYOffset;

            const progress = Math.min(
                Math.max((scrollTop - articleTop + windowHeight) / articleHeight, 0),
                1
            );

            progressBar.style.width = `${progress * 100}%`;
        });
    }

    generateTableOfContents() {
        const headings = document.querySelectorAll('.post-content h2, .post-content h3');
        const tocContainer = document.querySelector('.table-of-contents');
        
        if (!tocContainer || headings.length === 0) return;

        const tocHTML = Array.from(headings).map((heading, index) => {
            const id = `heading-${index}`;
            heading.id = id;
            
            return `
                <li class="toc-item toc-${heading.tagName.toLowerCase()}">
                    <a href="#${id}">${heading.textContent}</a>
                </li>
            `;
        }).join('');

        tocContainer.innerHTML = `
            <h4>Table of Contents</h4>
            <ul class="toc-list">${tocHTML}</ul>
        `;
    }

    highlightCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            block.classList.add('highlighted');
        });
    }

    renderComments(postId) {
        const comments = this.getComments(postId);
        
        if (comments.length === 0) {
            return '<p class="no-comments">No comments yet. Be the first to comment!</p>';
        }

        return comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <strong class="comment-author">${comment.name}</strong>
                    <span class="comment-date">${this.formatDate(comment.date)}</span>
                </div>
                <div class="comment-content">
                    <p>${comment.message}</p>
                </div>
            </div>
        `).join('');
    }

    getComments(postId) {
        const comments = JSON.parse(localStorage.getItem('blogComments') || '[]');
        return comments.filter(comment => comment.postId === postId && comment.approved);
    }

    saveComment(comment) {
        const comments = JSON.parse(localStorage.getItem('blogComments') || '[]');
        comments.push(comment);
        localStorage.setItem('blogComments', JSON.stringify(comments));
    }

    trackReadingProgress(postId) {
        const readingData = JSON.parse(localStorage.getItem('readingProgress') || '{}');
        readingData[postId] = {
            startTime: Date.now(),
            lastPosition: 0
        };
        localStorage.setItem('readingProgress', JSON.stringify(readingData));
    }

    updateReadingTime(post) {
        const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200); // Average reading speed
        
        const readTimeElements = document.querySelectorAll('.post-read-time');
        readTimeElements.forEach(element => {
            element.innerHTML = `<i class="fas fa-clock"></i> ${readingTime} min read`;
        });
    }

    displayPostNotFound() {
        const container = document.querySelector('.blog-post-content');
        if (!container) return;

        container.innerHTML = `
            <div class="post-not-found">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>Post Not Found</h2>
                <p>The blog post you're looking for doesn't exist or has been removed.</p>
                <a href="blog.html" class="back-to-blog-btn">
                    <i class="fas fa-arrow-left"></i> Back to Blog
                </a>
            </div>
        `;
    }

    getCategoryName(category) {
        const categories = {
            'google-ads': 'Google Ads',
            'analytics': 'Analytics',
            'trends': 'Trends',
            'strategy': 'Strategy',
            'optimization': 'Optimization'
        };
        return categories[category] || category;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Admin functions for managing posts
    createPost(postData) {
        const post = {
            id: this.generateId(),
            ...postData,
            date: new Date().toISOString().split('T')[0],
            author: postData.author || 'Marlon Palomares'
        };

        this.posts.unshift(post);
        this.savePosts();
        return post;
    }

    updatePost(postId, updates) {
        const index = this.posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            this.posts[index] = { ...this.posts[index], ...updates };
            this.savePosts();
            return this.posts[index];
        }
        return null;
    }

    deletePost(postId) {
        const index = this.posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            this.posts.splice(index, 1);
            this.savePosts();
            return true;
        }
        return false;
    }
}

// Initialize blog functions
document.addEventListener('DOMContentLoaded', () => {
    window.blogFunctions = new BlogFunctions();
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogFunctions;
}

