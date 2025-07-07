from flask import Blueprint, jsonify, request
from datetime import datetime
from models import db

def create_blog_blueprint():
    blog_bp = Blueprint('blog', __name__)

    @blog_bp.route('/stats', methods=['GET'])
    def get_stats():
        from models.blog_post import BlogPost
        total_posts = BlogPost.query.count()
        published_posts = BlogPost.query.filter_by(status='published').count()
        draft_posts = BlogPost.query.filter_by(status='draft').count()
        total_views = sum(post.views for post in BlogPost.query.all())

        return jsonify({
            'total_posts': total_posts,
            'published_posts': published_posts,
            'draft_posts': draft_posts,
            'total_views': total_views
        })

    @blog_bp.route('/posts', methods=['GET'])
    def get_posts():
        from models.blog_post import BlogPost
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')

        query = BlogPost.query
        if status:
            query = query.filter_by(status=status)

        posts = query.paginate(page=page, per_page=per_page)
        return jsonify({
            'posts': [post.to_dict() for post in posts.items],
            'total': posts.total,
            'pages': posts.pages,
            'current_page': posts.page
        })

    @blog_bp.route('/posts', methods=['POST'])
    def create_post():
        from models.blog_post import BlogPost
        data = request.get_json()
        
        post = BlogPost(
            title=data['title'],
            content=data['content'],
            excerpt=data.get('excerpt'),
            author=data.get('author'),
            category=data.get('category'),
            status=data.get('status', 'draft'),
            featured_image=data.get('featured_image'),
            meta_description=data.get('meta_description'),
            meta_keywords=data.get('meta_keywords'),
            tags=data.get('tags', []),
            published_at=datetime.now() if data.get('status') == 'published' else None
        )

        db.session.add(post)
        db.session.commit()
        return jsonify(post.to_dict()), 201

    @blog_bp.route('/posts/<int:post_id>', methods=['PUT'])
    def update_post(post_id):
        from models.blog_post import BlogPost
        post = BlogPost.query.get_or_404(post_id)
        data = request.get_json()

        post.title = data.get('title', post.title)
        post.content = data.get('content', post.content)
        post.excerpt = data.get('excerpt', post.excerpt)
        post.author = data.get('author', post.author)
        post.category = data.get('category', post.category)
        post.featured_image = data.get('featured_image', post.featured_image)
        post.meta_description = data.get('meta_description', post.meta_description)
        post.meta_keywords = data.get('meta_keywords', post.meta_keywords)
        post.tags = data.get('tags', post.tags)

        if data.get('status') == 'published' and post.status != 'published':
            post.published_at = datetime.now()
        post.status = data.get('status', post.status)

        post.updated_at = datetime.now()
        db.session.commit()
        return jsonify(post.to_dict())

    @blog_bp.route('/posts/<int:post_id>', methods=['DELETE'])
    def delete_post(post_id):
        from models.blog_post import BlogPost
        post = BlogPost.query.get_or_404(post_id)
        db.session.delete(post)
        db.session.commit()
        return '', 204

    return blog_bp