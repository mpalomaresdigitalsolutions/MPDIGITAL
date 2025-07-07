from flask import Blueprint, request, jsonify
from src.models.blog_post import BlogPost, db
from datetime import datetime
import json

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/posts', methods=['GET'])
def get_posts():
    """Get all blog posts with optional filtering"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status', 'published')
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = BlogPost.query
        
        # Filter by status
        if status:
            query = query.filter(BlogPost.status == status)
        
        # Filter by category
        if category:
            query = query.filter(BlogPost.category == category)
        
        # Search in title and content
        if search:
            query = query.filter(
                db.or_(
                    BlogPost.title.contains(search),
                    BlogPost.content.contains(search),
                    BlogPost.excerpt.contains(search)
                )
            )
        
        # Order by published date or created date
        query = query.order_by(
            BlogPost.published_at.desc().nullslast(),
            BlogPost.created_at.desc()
        )
        
        # Paginate results
        posts = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'success': True,
            'posts': [post.to_dict() for post in posts.items],
            'pagination': {
                'page': posts.page,
                'pages': posts.pages,
                'per_page': posts.per_page,
                'total': posts.total,
                'has_next': posts.has_next,
                'has_prev': posts.has_prev
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/posts/<post_id>', methods=['GET'])
def get_post(post_id):
    """Get a single blog post by ID or slug"""
    try:
        # Try to find by ID first, then by slug
        post = BlogPost.query.filter(
            db.or_(BlogPost.id == post_id, BlogPost.slug == post_id)
        ).first()
        
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        # Increment view count for published posts
        if post.status == 'published':
            post.views += 1
            db.session.commit()
        
        return jsonify({
            'success': True,
            'post': post.to_dict()
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/posts', methods=['POST'])
def create_post():
    """Create a new blog post"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('content'):
            return jsonify({'success': False, 'error': 'Title and content are required'}), 400
        
        # Create slug from title
        slug = BlogPost.create_slug(data['title'])
        
        # Check if slug already exists
        existing_post = BlogPost.query.filter_by(slug=slug).first()
        if existing_post:
            # Add timestamp to make slug unique
            slug = f"{slug}-{int(datetime.utcnow().timestamp())}"
        
        # Calculate reading time
        reading_time = BlogPost.calculate_reading_time(data['content'])
        
        # Create new post
        post = BlogPost(
            title=data['title'],
            slug=slug,
            content=data['content'],
            excerpt=data.get('excerpt', ''),
            author=data.get('author', 'Marlon Palomares'),
            category=data.get('category', 'Google Ads'),
            tags=json.dumps(data.get('tags', [])) if data.get('tags') else None,
            featured_image=data.get('featured_image'),
            meta_description=data.get('meta_description'),
            meta_keywords=data.get('meta_keywords'),
            status=data.get('status', 'draft'),
            reading_time=reading_time
        )
        
        # Set published_at if status is published
        if post.status == 'published':
            post.published_at = datetime.utcnow()
        
        db.session.add(post)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post created successfully',
            'post': post.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/posts/<post_id>', methods=['PUT'])
def update_post(post_id):
    """Update an existing blog post"""
    try:
        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Update fields if provided
        if 'title' in data:
            post.title = data['title']
            # Update slug if title changed
            new_slug = BlogPost.create_slug(data['title'])
            if new_slug != post.slug:
                # Check if new slug already exists
                existing_post = BlogPost.query.filter(
                    BlogPost.slug == new_slug,
                    BlogPost.id != post_id
                ).first()
                if existing_post:
                    new_slug = f"{new_slug}-{int(datetime.utcnow().timestamp())}"
                post.slug = new_slug
        
        if 'content' in data:
            post.content = data['content']
            post.reading_time = BlogPost.calculate_reading_time(data['content'])
        
        if 'excerpt' in data:
            post.excerpt = data['excerpt']
        
        if 'author' in data:
            post.author = data['author']
        
        if 'category' in data:
            post.category = data['category']
        
        if 'tags' in data:
            post.tags = json.dumps(data['tags']) if data['tags'] else None
        
        if 'featured_image' in data:
            post.featured_image = data['featured_image']
        
        if 'meta_description' in data:
            post.meta_description = data['meta_description']
        
        if 'meta_keywords' in data:
            post.meta_keywords = data['meta_keywords']
        
        if 'status' in data:
            old_status = post.status
            post.status = data['status']
            
            # Set published_at when changing from draft to published
            if old_status != 'published' and post.status == 'published':
                post.published_at = datetime.utcnow()
        
        post.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post updated successfully',
            'post': post.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/posts/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    """Delete a blog post"""
    try:
        post = BlogPost.query.get(post_id)
        if not post:
            return jsonify({'success': False, 'error': 'Post not found'}), 404
        
        db.session.delete(post)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Post deleted successfully'
        })
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all unique categories"""
    try:
        categories = db.session.query(BlogPost.category).distinct().all()
        category_list = [cat[0] for cat in categories if cat[0]]
        
        return jsonify({
            'success': True,
            'categories': category_list
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@blog_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get blog statistics"""
    try:
        total_posts = BlogPost.query.count()
        published_posts = BlogPost.query.filter_by(status='published').count()
        draft_posts = BlogPost.query.filter_by(status='draft').count()
        total_views = db.session.query(db.func.sum(BlogPost.views)).scalar() or 0
        
        return jsonify({
            'success': True,
            'stats': {
                'total_posts': total_posts,
                'published_posts': published_posts,
                'draft_posts': draft_posts,
                'total_views': total_views
            }
        })
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

