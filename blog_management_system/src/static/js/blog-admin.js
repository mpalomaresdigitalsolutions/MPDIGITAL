// Blog Management System JavaScript

class BlogAdmin {
    constructor() {
        this.apiBase = window.location.origin + '/api';
        this.currentTab = 'all';
        this.posts = [];
        this.stats = {};
        this.useLocalStorage = false;
    }

    async init() {
        try {
            await this.loadStats();
            await this.loadPosts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            // Fall back to local storage if API is not available
            this.useLocalStorage();
        }
    }

    useLocalStorage() {
        // Initialize with empty data structure
        if (!localStorage.getItem('blog_posts')) {
            localStorage.setItem('blog_posts', JSON.stringify([]));
        }
        if (!localStorage.getItem('blog_stats')) {
            localStorage.setItem('blog_stats', JSON.stringify({
                total_posts: 0,
                published_posts: 0,
                draft_posts: 0,
                total_views: 0
            }));
        }

        // Load from localStorage
        this.posts = JSON.parse(localStorage.getItem('blog_posts'));
        this.stats = JSON.parse(localStorage.getItem('blog_stats'));

        // Render the UI
        this.renderStats();
        this.renderPosts();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-posts');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterPosts(e.target.value);
            });
        }

        // Form submission
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }

        // Modal close on outside click
        const modal = document.getElementById('post-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    async loadStats() {
        try {
            if (this.useLocalStorage) {
                const stats = JSON.parse(localStorage.getItem('blogStats')) || {
                    total_posts: 0,
                    published_posts: 0,
                    draft_posts: 0,
                    total_views: 0
                };
                this.renderStats(stats);
                return;
            }

            const response = await fetch(`${this.apiBase}/stats`);
            if (!response.ok) throw new Error('Failed to load stats');
            const data = await response.json();
            this.renderStats(data.stats);
        } catch (error) {
            console.error('Error loading stats:', error);
            this.useLocalStorage = true;
            this.loadStats(); // Retry with local storage
        }
    }

    renderStats() {
        const statsGrid = document.getElementById('stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="color: var(--primary-color);">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="stat-value">${this.stats.total_posts || 0}</div>
                <div class="stat-label">Total Posts</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: var(--success-color);">
                    <i class="fas fa-eye"></i>
                </div>
                <div class="stat-value">${this.stats.published_posts || 0}</div>
                <div class="stat-label">Published</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: var(--warning-color);">
                    <i class="fas fa-edit"></i>
                </div>
                <div class="stat-value">${this.stats.draft_posts || 0}</div>
                <div class="stat-label">Drafts</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: var(--accent-color);">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <div class="stat-value">${this.stats.total_views || 0}</div>
                <div class="stat-label">Total Views</div>
            </div>
        `;
    }

    async loadPosts() {
        try {
            if (this.useLocalStorage) {
                const posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
                this.posts = posts;
                this.renderPosts();
                return;
            }

            const response = await fetch(`${this.apiBase}/posts?per_page=50`);
            if (!response.ok) throw new Error('Failed to load posts');
            const data = await response.json();
            this.posts = data.posts;
            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.useLocalStorage = true;
            this.loadPosts(); // Retry with local storage
        }
    }

    renderPosts(filteredPosts = null) {
        const posts = filteredPosts || this.posts;
        
        // Render all posts
        this.renderPostsTable('all-posts-table', posts);
        
        // Render published posts
        const publishedPosts = posts.filter(post => post.status === 'published');
        this.renderPostsTable('published-posts-table', publishedPosts);
        
        // Render draft posts
        const draftPosts = posts.filter(post => post.status === 'draft');
        this.renderPostsTable('draft-posts-table', draftPosts);
    }

    renderPostsTable(containerId, posts) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<p class="text-center">No posts found.</p>';
            return;
        }

        const tableHTML = `
            <table class="posts-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Category</th>
                        <th>Author</th>
                        <th>Created</th>
                        <th>Views</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>
                                <strong>${post.title}</strong>
                                ${post.excerpt ? `<br><small style="color: var(--gray-600);">${post.excerpt.substring(0, 100)}...</small>` : ''}
                            </td>
                            <td>
                                <span class="status-badge status-${post.status}">
                                    ${post.status}
                                </span>
                            </td>
                            <td>${post.category || '-'}</td>
                            <td>${post.author}</td>
                            <td>${new Date(post.created_at).toLocaleDateString()}</td>
                            <td>${post.views}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="window.blogAdmin.editPost('${post.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="window.blogAdmin.deletePost('${post.id}')" title="Delete">
                                    <i class="fas fa-trash"></i>
                                </button>
                                ${post.status === 'published' ? `
                                    <button class="btn btn-sm btn-secondary" onclick="window.blogAdmin.viewPost('${post.slug}')" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    filterPosts(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderPosts();
            return;
        }

        const filtered = this.posts.filter(post => 
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        this.renderPosts(filtered);
    }

    showCreateModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Create New Post';
        this.clearForm();
        document.getElementById('post-modal').classList.add('active');
        document.getElementById('post-title').focus();
    }

    async editPost(postId) {
        try {
            const response = await fetch(`${this.apiBase}/posts/${postId}`);
            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                this.currentEditId = postId;
                document.getElementById('modal-title').textContent = 'Edit Post';
                this.populateForm(data.post);
                document.getElementById('post-modal').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            alert('Error loading post for editing');
        }
    }

    populateForm(post) {
        const elements = {
            'post-title': post.title,
            'post-status': post.status,
            'post-category': post.category || '',
            'post-author': post.author || '',
            'post-excerpt': post.excerpt || '',
            'post-content': post.content || '',
            'post-image': post.featured_image || '',
            'post-tags': post.tags ? JSON.parse(post.tags).join(', ') : '',
            'post-meta-description': post.meta_description || '',
            'post-meta-keywords': post.meta_keywords || ''
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                if (element.hasAttribute('contenteditable')) {
                    element.innerHTML = value;
                } else {
                    element.value = value;
                }
            }
        }
    }

    clearForm() {
        const elements = {
            'post-title': '',
            'post-status': 'draft',
            'post-category': 'Google Ads',
            'post-author': 'Marlon Palomares',
            'post-excerpt': '',
            'post-content': '',
            'post-image': '',
            'post-tags': '',
            'post-meta-description': '',
            'post-meta-keywords': ''
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                if (element.hasAttribute('contenteditable')) {
                    element.innerHTML = value;
                } else {
                    element.value = value;
                }
            }
        }
    }

    async savePost() {
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').innerHTML.trim();
        
        if (!title || !content) {
            alert('Title and content are required');
            return;
        }

        const postData = {
            title: title,
            content: content,
            excerpt: document.getElementById('post-excerpt').value.trim(),
            author: document.getElementById('post-author').value.trim(),
            category: document.getElementById('post-category').value.trim(),
            status: document.getElementById('post-status').value,
            featured_image: document.getElementById('post-image').value.trim(),
            meta_description: document.getElementById('post-meta-description').value.trim(),
            meta_keywords: document.getElementById('post-meta-keywords').value.trim(),
            tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        try {
            const url = this.currentEditId 
                ? `${this.apiBase}/posts/${this.currentEditId}`
                : `${this.apiBase}/posts`;
            
            const method = this.currentEditId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                alert(this.currentEditId ? 'Post updated successfully!' : 'Post created successfully!');
                this.closeModal();
                await this.loadStats();
                await this.loadPosts();
            } else {
                alert('Error saving post: ' + data.error);
            }
        } catch (error) {
            console.error('Error saving post:', error);
            // Fall back to localStorage
            this.savePostToLocalStorage(postData);
        }
    }

    savePostToLocalStorage(postData) {
        const posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        const stats = JSON.parse(localStorage.getItem('blog_stats') || '{}');

        if (this.currentEditId) {
            const index = posts.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...postData };
            }
        } else {
            const newPost = {
                id: Date.now().toString(),
                ...postData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                views: 0
            };
            posts.push(newPost);
        }

        // Update stats
        stats.total_posts = posts.length;
        stats.published_posts = posts.filter(p => p.status === 'published').length;
        stats.draft_posts = posts.filter(p => p.status === 'draft').length;

        localStorage.setItem('blog_posts', JSON.stringify(posts));
        localStorage.setItem('blog_stats', JSON.stringify(stats));

        this.posts = posts;
        this.stats = stats;

        this.renderStats();
        this.renderPosts();

        alert(this.currentEditId ? 'Post updated in local storage!' : 'Post saved in local storage!');
        this.closeModal();
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/posts/${postId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                alert('Post deleted successfully!');
                await this.loadStats();
                await this.loadPosts();
            } else {
                alert('Error deleting post: ' + data.error);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            this.deletePostFromLocalStorage(postId);
        }
    }

    deletePostFromLocalStorage(postId) {
        const posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        const stats = JSON.parse(localStorage.getItem('blog_stats') || '{}');

        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            posts.splice(index, 1);

            // Update stats
            stats.total_posts = posts.length;
            stats.published_posts = posts.filter(p => p.status === 'published').length;
            stats.draft_posts = posts.filter(p => p.status === 'draft').length;

            localStorage.setItem('blog_posts', JSON.stringify(posts));
            localStorage.setItem('blog_stats', JSON.stringify(stats));

            this.posts = posts;
            this.stats = stats;

            this.renderStats();
            this.renderPosts();

            alert('Post deleted from local storage!');
        }
    }

    viewPost(slug) {
        window.open(`/blog/${slug}`, '_blank');
    }

    closeModal() {
        document.getElementById('post-modal').classList.remove('active');
        this.currentEditId = null;
    }
}

// Initialize BlogAdmin instance
document.addEventListener('DOMContentLoaded', () => {
    window.blogAdmin = new BlogAdmin();
    window.blogAdmin.init();
});

// Tab functionality
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked nav tab
    event.target.classList.add('active');
}

// Rich text editor functions
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('post-content').focus();
}

// Modal functions
function showCreateModal() {
    window.blogAdmin.showCreateModal();
}

function closeModal() {
    window.blogAdmin.closeModal();
}

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (document.getElementById('post-modal').classList.contains('active')) {
            window.blogAdmin.savePost();
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape') {
        if (document.getElementById('post-modal').classList.contains('active')) {
            closeModal();
        }
    }
});