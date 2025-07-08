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
        this.initializeSearch();
        this.initializePagination();
    }

    loadBlogPosts() {
        // Sample blog posts data - replace with actual API call
        this.posts = [
            {
                id: 1,
                title: 'Understanding PPC Trends in 2024',
                excerpt: 'Explore the latest trends in Pay-Per-Click advertising and how they can benefit your business.',
                image: '/assets/images/blog/ppc-trends.jpg',
                category: 'PPC',
                author: 'MP Digital Team',
                date: '2024-01-15'
            },
            {
                id: 2,
                title: 'Maximizing ROI with Performance Max',
                excerpt: 'Learn how to calculate and optimize your ROI using Google\'s Performance Max campaigns.',
                image: '/assets/images/blog/roi-calculation.jpg',
                category: 'Analytics',
                author: 'MP Digital Team',
                date: '2024-01-10'
            },
            {
                id: 3,
                title: 'Google Ads Optimization Strategies',
                excerpt: 'Discover advanced optimization techniques to improve your Google Ads performance.',
                image: '/assets/images/blog/google-ads-optimization.jpg',
                category: 'Optimization',
                author: 'MP Digital Team',
                date: '2024-01-05'
            }
        ];
        this.displayPosts();
    }

    setupEventListeners() {
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');
        const loadMoreBtn = document.getElementById('load-more');

        if (gridViewBtn && listViewBtn) {
            gridViewBtn.addEventListener('click', () => this.switchView('grid'));
            listViewBtn.addEventListener('click', () => this.switchView('list'));
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMorePosts());
        }
    }

    initializeSearch() {
        const searchInput = document.getElementById('blog-search');
        const searchButton = searchInput?.nextElementSibling;

        if (searchInput && searchButton) {
            let debounceTimeout;

            const performSearch = () => {
                const query = searchInput.value.toLowerCase().trim();
                this.filteredPosts = this.posts.filter(post => 
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.category.toLowerCase().includes(query)
                );
                this.currentPage = 1;
                this.displayPosts();
            };

            searchInput.addEventListener('input', () => {
                clearTimeout(debounceTimeout);
                debounceTimeout = setTimeout(performSearch, 300);
            });

            searchButton.addEventListener('click', performSearch);

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    performSearch();
                }
            });
        }
    }

    initializePagination() {
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            this.updateLoadMoreButton();
        }
    }

    loadMorePosts() {
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.classList.add('loading');
            setTimeout(() => {
                this.currentPage++;
                this.displayPosts();
                this.updateLoadMoreButton();
                loadMoreBtn.classList.remove('loading');
            }, 500);
        }
    }

    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            const postsToDisplay = this.filteredPosts.length > 0 ? this.filteredPosts : this.posts;
            const hasMorePosts = this.currentPage * this.postsPerPage < postsToDisplay.length;
            loadMoreBtn.style.display = hasMorePosts ? 'inline-flex' : 'none';
        }
    }

    initializeViewControls() {
        const blogPosts = document.getElementById('blog-posts');
        if (blogPosts) {
            blogPosts.className = `blog-${this.viewMode}`;
        }
    }

    switchView(mode) {
        this.viewMode = mode;
        const blogPosts = document.getElementById('blog-posts');
        const gridViewBtn = document.getElementById('grid-view-btn');
        const listViewBtn = document.getElementById('list-view-btn');

        if (blogPosts) {
            blogPosts.className = `blog-${mode}`;
        }

        if (gridViewBtn && listViewBtn) {
            gridViewBtn.classList.toggle('active', mode === 'grid');
            listViewBtn.classList.toggle('active', mode === 'list');
        }

        this.displayPosts();
    }

    displayPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        const postsToDisplay = this.filteredPosts.length > 0 ? this.filteredPosts : this.posts;
        const start = (this.currentPage - 1) * this.postsPerPage;
        const end = start + this.postsPerPage;
        const currentPosts = postsToDisplay.slice(start, end);

        container.innerHTML = currentPosts.map(post => this.createPostHTML(post)).join('');

        // Add click event listeners to posts
        container.querySelectorAll('.blog-post').forEach(post => {
            post.addEventListener('click', () => {
                window.location.href = `blog-post.html?id=${post.dataset.id}`;
            });
        });
    }

    createPostHTML(post) {
        const defaultImage = '/assets/images/blog/default-blog-image.svg?v=1.1.5';
        return `
            <article class="blog-post" data-id="${post.id}">
                <div class="blog-post-image">
                    <img src="${post.image || defaultImage}" 
                         alt="${post.title}" 
                         loading="lazy"
                         onload="this.style.opacity='1'; this.parentElement.classList.remove('loading');"
                         onerror="this.onerror=null; this.src='${defaultImage}'; this.classList.add('fallback-image'); console.warn('Image failed to load:', post.image);"
                         style="opacity: 0; transition: opacity 0.3s ease;"
                         crossorigin="anonymous">
                </div>
                <div class="blog-post-content">
                    <div class="blog-post-meta">
                        <span class="category">${post.category}</span>
                        <span class="date">${this.formatDate(post.date)}</span>
                    </div>
                    <h2 class="blog-post-title">${post.title}</h2>
                    <p class="blog-post-excerpt">${post.excerpt}</p>
                    <div class="blog-post-footer">
                        <span class="author">${post.author}</span>
                        <button class="read-more">Read More</button>
                    </div>
                </div>
            </article>
        `;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// Create instance when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.blogDisplayManager = new BlogDisplayManager();
});


function loadBlogPosts() {
    const blogPosts = [
        {
            author: 'Marlon Palomares',
            title: 'PPC Trends to Watch in 2025',
            description: 'Stay ahead of the competition with insights into the emerging trends and technologies shaping the future of PPC advertising.',
            link: './blog/ppc-trends-2025.html',
            image: 'assets/images/blog/ppc-trends.jpg'
        },
        // Add more blog posts here
    ];

    const blogContainer = document.querySelector('.blog-posts-container');
    if (!blogContainer) return;

    blogPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'blog-post';
        postElement.innerHTML = `
            <div class="post-meta">
                <span><i class="fas fa-user" aria-hidden="true"></i> ${post.author}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <a href="${post.link}" class="read-more">
                Read More <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
        `;
        blogContainer.appendChild(postElement);
    });
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', loadBlogPosts);

