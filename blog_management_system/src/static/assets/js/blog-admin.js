// Blog Management System JavaScript

class BlogAdminManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.apiBase = 'http://localhost:5000/api';
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

        try {
            await this.loadStats();
            await this.loadPosts();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.useLocalStorage();
        }
    }

    useLocalStorage() {
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

        this.posts = JSON.parse(localStorage.getItem('blog_posts'));
        this.stats = JSON.parse(localStorage.getItem('blog_stats'));
        this.updateUI();
    }

    setupEventListeners() {
        // Create post button
        const createPostBtn = document.getElementById('create-post-btn');
        if (createPostBtn) {
            createPostBtn.addEventListener('click', () => this.showCreateModal());
        }

        // Post form submission
        const postForm = document.getElementById('blog-post-form');
        if (postForm) {
            postForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePost();
            });
        }

        // Auto-generate slug from title
        const titleInput = document.getElementById('post-title');
        if (titleInput) {
            titleInput.addEventListener('input', (e) => {
                const slug = this.generateSlug(e.target.value);
                const slugInput = document.getElementById('post-slug');
                if (slugInput) {
                    slugInput.value = slug;
                }
            });
        }

        // Close modal buttons
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });

        // Modal close on outside click
        const modal = document.getElementById('blog-post-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    generateSlug(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                this.stats = data.stats;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            throw error;
        }
    }

    async loadPosts() {
        try {
            const response = await fetch(`${this.apiBase}/posts`);
            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                this.posts = data.posts;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            throw error;
        }
    }

    updateUI() {
        const postsContainer = document.getElementById('blog-posts-container');
        if (!postsContainer) return;

        if (!this.authManager.isAuthenticated) {
            postsContainer.innerHTML = '<p class="text-center">Please log in to manage blog posts.</p>';
            return;
        }

        if (this.posts.length === 0) {
            postsContainer.innerHTML = '<p class="text-center">No posts found. Create your first post!</p>';
            return;
        }

        postsContainer.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
    }

    createPostCard(post) {
        return `
            <article class="blog-card" data-post-id="${post.id}">
                ${post.featured_image ? `
                    <div class="card-image">
                        <img src="${post.featured_image}" alt="${post.title}">
                    </div>
                ` : ''}
                <div class="card-content">
                    <div class="card-meta">
                        <span class="category">${post.category}</span>
                        <span class="status status-${post.status}">${post.status}</span>
                    </div>
                    <h3 class="card-title">${post.title}</h3>
                    <p class="card-excerpt">${post.excerpt || ''}</p>
                    <div class="card-footer">
                        <span class="author">${post.author}</span>
                        <span class="date">${new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    ${this.authManager.isAuthenticated ? `
                        <div class="card-actions">
                            <button onclick="blogAdminManager.editPost('${post.id}')" class="edit-btn">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button onclick="blogAdminManager.deletePost('${post.id}')" class="delete-btn">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }

    showCreateModal() {
        if (!this.authManager.isAuthenticated) {
            this.authManager.showLoginModal();
            return;
        }

        this.currentEditId = null;
        document.getElementById('modal-title').textContent = 'Create New Post';
        this.clearForm();
        document.getElementById('blog-post-modal').classList.add('active');
        document.getElementById('post-title').focus();
    }

    async editPost(postId) {
        if (!this.authManager.isAuthenticated) {
            this.authManager.showLoginModal();
            return;
        }

        try {
            const response = await fetch(`${this.apiBase}/posts/${postId}`);
            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                this.currentEditId = postId;
                document.getElementById('modal-title').textContent = 'Edit Post';
                this.populateForm(data.post);
                document.getElementById('blog-post-modal').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading post:', error);
            alert('Error loading post for editing');
        }
    }

    populateForm(post) {
        const fields = [
            'title', 'content', 'excerpt', 'author', 'category', 'status',
            'image', 'tags', 'meta-description', 'meta-keywords'
        ];

        fields.forEach(field => {
            const element = document.getElementById(`post-${field}`);
            if (element) {
                let value = post[field.replace('-', '_')] || '';
                if (field === 'tags' && Array.isArray(value)) {
                    value = value.join(', ');
                }
                element.value = value;
            }
        });

        // Set slug
        const slugInput = document.getElementById('post-slug');
        if (slugInput) {
            slugInput.value = post.slug || this.generateSlug(post.title);
        }
    }

    clearForm() {
        const fields = [
            'title', 'content', 'excerpt', 'author', 'category', 'status',
            'image', 'tags', 'meta-description', 'meta-keywords', 'slug'
        ];

        fields.forEach(field => {
            const element = document.getElementById(`post-${field}`);
            if (element) {
                element.value = '';
            }
        });

        // Set defaults
        document.getElementById('post-status').value = 'draft';
        document.getElementById('post-author').value = this.authManager.currentUser?.name || '';
    }

    async savePost() {
        if (!this.authManager.isAuthenticated) {
            this.authManager.showLoginModal();
            return;
        }

        const formData = this.getFormData();
        if (!this.validateFormData(formData)) return;

        try {
            const url = this.currentEditId 
                ? `${this.apiBase}/posts/${this.currentEditId}`
                : `${this.apiBase}/posts`;
            
            const response = await fetch(url, {
                method: this.currentEditId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('API not available');
            
            const data = await response.json();
            if (data.success) {
                this.showNotification(this.currentEditId ? 'Post updated successfully!' : 'Post created successfully!');
                this.closeModal();
                await this.loadStats();
                await this.loadPosts();
            } else {
                this.showNotification('Error saving post: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            this.savePostToLocalStorage(formData);
        }
    }

    getFormData() {
        return {
            title: document.getElementById('post-title').value.trim(),
            content: document.getElementById('post-content').value.trim(),
            excerpt: document.getElementById('post-excerpt').value.trim(),
            author: document.getElementById('post-author').value.trim(),
            category: document.getElementById('post-category').value,
            status: document.getElementById('post-status').value,
            featured_image: document.getElementById('post-image').value.trim(),
            slug: document.getElementById('post-slug').value.trim(),
            tags: document.getElementById('post-tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
            meta_description: document.getElementById('post-meta-description').value.trim(),
            meta_keywords: document.getElementById('post-meta-keywords').value.trim()
        };
    }

    validateFormData(data) {
        if (!data.title) {
            this.showNotification('Title is required', 'error');
            return false;
        }
        if (!data.content) {
            this.showNotification('Content is required', 'error');
            return false;
        }
        if (!data.slug) {
            this.showNotification('Slug is required', 'error');
            return false;
        }
        return true;
    }

    async deletePost(postId) {
        if (!this.authManager.isAuthenticated) {
            this.authManager.showLoginModal();
            return;
        }

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
                this.showNotification('Post deleted successfully!');
                await this.loadStats();
                await this.loadPosts();
            } else {
                this.showNotification('Error deleting post: ' + data.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            this.deletePostFromLocalStorage(postId);
        }
    }

    savePostToLocalStorage(postData) {
        const posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        const stats = JSON.parse(localStorage.getItem('blog_stats') || '{}');

        if (this.currentEditId) {
            const index = posts.findIndex(p => p.id === this.currentEditId);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...postData, updated_at: new Date().toISOString() };
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

        this.updateLocalStorageStats(posts, stats);
        this.showNotification('Post saved in local storage!');
        this.closeModal();
    }

    deletePostFromLocalStorage(postId) {
        const posts = JSON.parse(localStorage.getItem('blog_posts') || '[]');
        const stats = JSON.parse(localStorage.getItem('blog_stats') || '{}');

        const index = posts.findIndex(p => p.id === postId);
        if (index !== -1) {
            posts.splice(index, 1);
            this.updateLocalStorageStats(posts, stats);
            this.showNotification('Post deleted from local storage!');
        }
    }

    updateLocalStorageStats(posts, stats) {
        stats.total_posts = posts.length;
        stats.published_posts = posts.filter(p => p.status === 'published').length;
        stats.draft_posts = posts.filter(p => p.status === 'draft').length;

        localStorage.setItem('blog_posts', JSON.stringify(posts));
        localStorage.setItem('blog_stats', JSON.stringify(stats));

        this.posts = posts;
        this.stats = stats;
        this.updateUI();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    closeModal() {
        document.getElementById('blog-post-modal').classList.remove('active');
        this.currentEditId = null;
    }
}

