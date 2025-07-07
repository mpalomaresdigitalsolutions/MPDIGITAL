from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(250), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    author = db.Column(db.String(100), nullable=False, default='Marlon Palomares')
    category = db.Column(db.String(50), default='Google Ads')
    tags = db.Column(db.Text)  # JSON string of tags
    featured_image = db.Column(db.String(500))
    meta_description = db.Column(db.String(160))
    meta_keywords = db.Column(db.String(255))
    status = db.Column(db.String(20), default='draft')  # draft, published, archived
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    views = db.Column(db.Integer, default=0)
    reading_time = db.Column(db.Integer, default=5)  # estimated reading time in minutes
    
    def __repr__(self):
        return f'<BlogPost {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'author': self.author,
            'category': self.category,
            'tags': self.tags,
            'featured_image': self.featured_image,
            'meta_description': self.meta_description,
            'meta_keywords': self.meta_keywords,
            'status': self.status,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'views': self.views,
            'reading_time': self.reading_time
        }
    
    @staticmethod
    def create_slug(title):
        """Create URL-friendly slug from title"""
        import re
        slug = title.lower()
        slug = re.sub(r'[^a-z0-9\s-]', '', slug)
        slug = re.sub(r'\s+', '-', slug)
        slug = slug.strip('-')
        return slug
    
    @staticmethod
    def calculate_reading_time(content):
        """Calculate estimated reading time based on content length"""
        words = len(content.split())
        # Average reading speed is 200-250 words per minute
        reading_time = max(1, round(words / 225))
        return reading_time

