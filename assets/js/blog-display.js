// Blog Display Management System
class BlogDisplayManager {
    constructor() {
        this.posts = [];
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.filteredPosts = [];
        this.currentCategory = 'all';
        this.viewMode = 'grid';
        this.init();
    }

    init() {
        this.loadBlogPosts();
        this.setupEventListeners();
        this.initializeViewControls();
        this.displayPosts();
    }

    loadBlogPosts() {
        // Load from localStorage or use default posts
        const storedPosts = localStorage.getItem('blogPosts');
        if (storedPosts) {
            this.posts = JSON.parse(storedPosts);
        } else {
            this.posts = this.getDefaultPosts();
            this.savePosts();
        }
        this.filteredPosts = [...this.posts];
    }

    getDefaultPosts() {
        return [
            {
                id: 'google-ads-optimization-2024',
                title: 'Advanced Google Ads Optimization Strategies for 2024',
                excerpt: 'Discover cutting-edge techniques to maximize your Google Ads performance and ROI in the evolving digital landscape.',
                content: `
                    <h2>Introduction</h2>
                    <p>Google Ads continues to evolve with new features and optimization opportunities. In 2024, successful advertisers are leveraging advanced strategies to stay ahead of the competition.</p>
                    
                    <h3>1. Smart Bidding Strategies</h3>
                    <p>Implement automated bidding strategies like Target ROAS and Maximize Conversions to optimize your campaigns based on real-time data.</p>
                    
                    <h3>2. Audience Segmentation</h3>
                    <p>Use detailed audience insights to create highly targeted campaigns that resonate with specific customer segments.</p>
                    
                    <h3>3. Performance Max Campaigns</h3>
                    <p>Leverage Google's machine learning to automatically optimize across all Google properties for maximum reach and conversions.</p>
                `,
                author: 'Marlon Palomares',
                date: '2024-01-15',
                category: 'google-ads',
                tags: ['optimization', 'strategy', '2024'],
                image: 'assets/images/blog/google-ads-optimization.jpg',
                readTime: '8 min read',
                featured: true
            },
            {
                id: 'roi-calculation-guide',
                title: 'The Complete Guide to Calculating Google Ads ROI',
                excerpt: 'Learn how to accurately measure and improve your Google Ads return on investment with proven methodologies.',
                content: `
                    <h2>Understanding ROI in Google Ads</h2>
                    <p>Return on Investment (ROI) is the most critical metric for measuring the success of your Google Ads campaigns.</p>
                    
                    <h3>Basic ROI Formula</h3>
                    <p>ROI = (Revenue - Cost) / Cost × 100</p>
                    
                    <h3>Advanced ROI Considerations</h3>
                    <ul>
                        <li>Customer Lifetime Value (CLV)</li>
                        <li>Attribution modeling</li>
                        <li>Profit margins</li>
                        <li>Operational costs</li>
                    </ul>
                `,
                author: 'Marlon Palomares',
                date: '2024-01-10',
                category: 'analytics',
                tags: ['roi', 'measurement', 'analytics'],
                image: 'assets/images/blog/roi-calculation.jpg',
                readTime: '6 min read',
                featured: false
            },
            {
                id: 'ppc-trends-2024',
                title: 'Top PPC Trends to Watch in 2024',
                excerpt: 'Stay ahead of the curve with these emerging PPC trends that will shape digital advertising this year.',
                content: `
                    <h2>The Future of PPC Advertising</h2>
                    <p>The PPC landscape is rapidly evolving with new technologies and consumer behaviors shaping the industry.</p>
                    
                    <h3>1. AI-Powered Campaign Management</h3>
                    <p>Artificial intelligence is revolutionizing how we create, manage, and optimize PPC campaigns.</p>
                    
                    <h3>2. Privacy-First Advertising</h3>
                    <p>With increasing privacy regulations, advertisers must adapt their strategies to respect user privacy while maintaining effectiveness.</p>
                `,
                author: 'Marlon Palomares',
                date: '2024-01-05',
                category: 'trends',
                tags: ['ppc', 'trends', 'future'],
                image: 'assets/images/blog/ppc-trends.jpg',
                readTime: '5 min read',
                featured: true
            }
        ];
    }

    initializeViewControls() {
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.toggleView('grid'));
            listViewBtn.addEventListener('click', () => this.toggleView('list'));
        }
    }

    toggleView(mode) {
        this.viewMode = mode;
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        if (mode === 'grid') {
            gridViewBtn?.classList.add('active');
            listViewBtn?.classList.remove('active');
        } else {
            gridViewBtn?.classList.remove('active');
            listViewBtn?.classList.add('active');
        }

        this.displayPosts();
    }

    setupEventListeners() {
        // Category filter
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterByCategory(filter.dataset.category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchPosts(e.target.value);
            });
        }

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
    }

    displayPosts() {
        const container = document.querySelector('.blog-grid') || document.querySelector('.latest-insights');
        container.className = `blog-${this.viewMode}`; // Apply view mode class
        if (!container) return;

        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = this.filteredPosts.slice(startIndex, endIndex);

        if (postsToShow.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const postsHTML = postsToShow.map(post => this.createPostCard(post)).join('');
        container.innerHTML = postsHTML;

        this.updatePagination();
    }

    createPostCard(post) {
        const cardClass = this.viewMode === 'grid' ? 'blog-card' : 'blog-list-item';
        return `
            <article class="${cardClass}" data-id="${post.id}">
                <div class="blog-image-container">
                    <img src="${post.image}" alt="${post.title}" class="blog-image" loading="lazy">
                    <div class="blog-category-badge">${this.getCategoryName(post.category)}</div>
                    ${post.featured ? '<div class="featured-badge"><i class="fas fa-star"></i> Featured</div>' : ''}
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-author">
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                        <span class="blog-date">
                            <i class="fas fa-calendar"></i> ${this.formatDate(post.date)}
                        </span>
                        <span class="blog-read-time">
                            <i class="fas fa-clock"></i> ${post.readTime}
                        </span>
                    </div>
                    <h3 class="blog-title">
                        <a href="blog.html?id=${post.id}">${post.title}</a>
                    </h3>
                    <p class="blog-excerpt">${post.excerpt}</p>
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    <div class="blog-actions">
                        <a href="blog.html?id=${post.id}" class="read-more-btn">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                        <div class="blog-share">
                            <button class="share-btn" onclick="blogDisplay.sharePost('${post.id}')">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    displayLatestInsights(limit = 3) {
        const container = document.querySelector('.latest-insights');
        if (!container) return;

        const latestPosts = this.posts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);

        if (latestPosts.length === 0) {
            container.innerHTML = this.getEmptyState();
            return;
        }

        const postsHTML = latestPosts.map(post => `
            <a href="blog.html?id=${post.id}" class="insight-card">
                <img src="${post.image}" alt="${post.title}" class="insight-card-image">
                <div class="insight-card-content">
                    <h3>${post.title}</h3>
                    <p>${post.excerpt}</p>
                    <div class="card-meta">
                        <span>
                            <i class="fas fa-user"></i> ${post.author}
                        </span>
                        <span>
                            <i class="fas fa-calendar"></i> ${this.formatDate(post.date)}
                        </span>
                    </div>
                </div>
            </a>
        `).join('');

        container.innerHTML = postsHTML;
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;

        if (category === 'all') {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => post.category === category);
        }

        this.displayPosts();
        this.updateActiveFilter(category);
    }

    searchPosts(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (searchTerm === '') {
            this.filteredPosts = [...this.posts];
        } else {
            this.filteredPosts = this.posts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) ||
                post.excerpt.toLowerCase().includes(searchTerm) ||
                post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                post.author.toLowerCase().includes(searchTerm)
            );
        }

        this.currentPage = 1;
        this.displayPosts();
    }

    updateActiveFilter(activeCategory) {
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.classList.remove('active');
            if (filter.dataset.category === activeCategory) {
                filter.classList.add('active');
            }
        });
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        
        if (!paginationContainer || totalPages <= 1) {
            if (paginationContainer) paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        
        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="${this.currentPage - 1}">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const isActive = i === this.currentPage ? 'active' : '';
            paginationHTML += `<button class="pagination-btn ${isActive}" data-page="${i}">${i}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="pagination-btn" data-page="${this.currentPage + 1}">Next</button>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    goToPage(page) {
        this.currentPage = page;
        this.displayPosts();
        
        // Scroll to top of blog section
        const blogSection = document.querySelector('.blog-section');
        if (blogSection) {
            blogSection.scrollIntoView({ behavior: 'smooth' });
        }
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

    getEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>No Posts Found</h3>
                <p>No blog posts match your current filters. Try adjusting your search or category selection.</p>
            </div>
        `;
    }

    sharePost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        const shareData = {
            title: post.title,
            text: post.excerpt,
            url: `${window.location.origin}/blog.html?id=${postId}`
        };

        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showNotification('Link copied to clipboard!');
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    savePosts() {
        localStorage.setItem('blogPosts', JSON.stringify(this.posts));
    }

    addPost(post) {
        post.id = post.id || this.generateId();
        post.date = post.date || new Date().toISOString().split('T')[0];
        this.posts.unshift(post);
        this.savePosts();
        this.filteredPosts = [...this.posts];
        this.displayPosts();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Initialize blog display manager
document.addEventListener('DOMContentLoaded', () => {
    window.blogDisplay = new BlogDisplayManager();
    
    // Display latest insights on homepage
    if (document.querySelector('.latest-insights')) {
        window.blogDisplay.displayLatestInsights(3);
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogDisplayManager;
}

