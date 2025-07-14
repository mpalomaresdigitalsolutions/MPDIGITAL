// Blog Management System JavaScript

class BlogAdminManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.apiBase = 'http://localhost:5000/api/blog';
        this.currentEditId = null;
        this.posts = [];
        this.stats = {};
        this.init();
    }

    async init() {
        if (!this.authManager.isAuthenticated) {
            console.warn('User not authenticated. Blog management features are disabled.');
            return;
        }

        this.setupEventListeners();
        await this.loadData();
    }

    setupEventListeners() {
        // Create post button
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showCreateModal());
        }

        // Post form submission
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'blog-post-form') {
                e.preventDefault();
                this.savePost();
            }
        });
    }

    async loadData() {
        try {
            await this.loadStats();
            await this.loadPosts();
            this.updateUI();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Failed to load blog data from the server.', 'error');
        }
    }

    async loadStats() {
        const response = await this.fetchWithAuth('/stats');
        const data = await response.json();
        if (data.success) {
            this.stats = data.stats;
        }
    }

    async loadPosts() {
        const response = await this.fetchWithAuth('/posts');
        const data = await response.json();
        if (data.success) {
            this.posts = data.posts;
        }
    }

    updateUI() {
        this.updateStatsUI();
        this.updatePostsUI();
    }

    updateStatsUI() {
        const statsContainer = document.getElementById('stats-container');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <p>Total Posts: ${this.stats.total_posts || 0}</p>
                <p>Published: ${this.stats.published_posts || 0}</p>
                <p>Drafts: ${this.stats.draft_posts || 0}</p>
            `;
        }
    }

    updatePostsUI() {
        const postsContainer = document.getElementById('posts-container');
        if (!postsContainer) return;

        if (this.posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center">No posts found. Create your first post!</p>';
            return;
        }

        postsContainer.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
    }

    createPostCard(post) {
        return `
            <article class="blog-card" data-post-id="${post.id}">
                <div class="card-content">
                    <h3 class="card-title">${post.title}</h3>
                    <div class="card-meta">
                        <span class="status status-${post.status}">${post.status}</span>
                        <span class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="card-actions">
                        <button onclick="blogAdmin.editPost('${post.id}')" class="btn btn-outline">Edit</button>
                        <button onclick="blogAdmin.deletePost('${post.id}')" class="btn btn-danger">Delete</button>
                    </div>
                </div>
            </article>
        `;
    }

    showCreateModal() {
        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Create New Post';
        this.clearForm();
        document.getElementById('blog-post-modal').classList.add('active');
    }

    async editPost(postId) {
        const response = await this.fetchWithAuth(`/posts/${postId}`);
        const data = await response.json();

        if (data.success) {
            this.currentEditId = postId;
            document.getElementById('modal-title').textContent = 'Edit Post';
            this.populateForm(data.post);
            document.getElementById('blog-post-modal').classList.add('active');
        } else {
            this.showNotification('Error loading post for editing.', 'error');
        }
    }

    populateForm(post) {
        document.getElementById('post-title').value = post.title || '';
        document.getElementById('post-content').value = post.content || '';
        document.getElementById('post-status').value = post.status || 'draft';
    }

    clearForm() {
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-status').value = 'draft';
    }

    async savePost() {
        const postData = {
            title: document.getElementById('post-title').value,
            content: document.getElementById('post-content').value,
            status: document.getElementById('post-status').value
        };

        const url = this.currentEditId ? `/posts/${this.currentEditId}` : '/posts';
        const method = this.currentEditId ? 'PUT' : 'POST';

        const response = await this.fetchWithAuth(url, {
            method: method,
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (data.success) {
            this.showNotification(`Post ${this.currentEditId ? 'updated' : 'created'} successfully!`, 'success');
            this.closeModal();
            this.loadData();
        } else {
            this.showNotification(data.error || 'Failed to save post.', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Are you sure you want to delete this post?')) return;

        const response = await this.fetchWithAuth(`/posts/${postId}`, { method: 'DELETE' });
        const data = await response.json();

        if (data.success) {
            this.showNotification('Post deleted successfully!', 'success');
            this.loadData();
        } else {
            this.showNotification(data.error || 'Failed to delete post.', 'error');
        }
    }

    closeModal() {
        document.getElementById('blog-post-modal').classList.remove('active');
        this.currentEditId = null;
    }

    async fetchWithAuth(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.authManager.token) {
            headers['Authorization'] = `Bearer ${this.authManager.token}`;
        }

        return fetch(`${this.apiBase}${url}`, { ...options, headers });
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
}
