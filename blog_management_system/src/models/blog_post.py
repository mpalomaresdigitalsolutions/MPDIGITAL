from datetime import datetime
from sqlalchemy.sql import func
from models import db
import re

class BlogPost(db.Model):
    __tablename__ = 'blog_posts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    slug = db.Column(db.String(200), unique=True, nullable=False)
    content = db.Column(db.Text, nullable=False)
    excerpt = db.Column(db.Text)
    author = db.Column(db.String(100))
    category = db.Column(db.String(50))
    status = db.Column(db.String(20), default='draft')  # draft, published
    featured_image = db.Column(db.String(500))
    meta_description = db.Column(db.String(200))
    meta_keywords = db.Column(db.String(200))
    tags = db.Column(db.JSON, default=list)
    views = db.Column(db.Integer, default=0)
    reading_time = db.Column(db.Integer, default=0)  # in minutes
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        super(BlogPost, self).__init__(**kwargs)
        if self.title:
            self.slug = self.generate_slug(self.title)
        if self.content:
            self.reading_time = self.calculate_reading_time(self.content)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'content': self.content,
            'excerpt': self.excerpt,
            'author': self.author,
            'category': self.category,
            'status': self.status,
            'featured_image': self.featured_image,
            'meta_description': self.meta_description,
            'meta_keywords': self.meta_keywords,
            'tags': self.tags,
            'views': self.views,
            'reading_time': self.reading_time,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

    @staticmethod
    def generate_slug(title):
        """Generate a URL-friendly slug from the title"""
        # Convert to lowercase and replace spaces with hyphens
        slug = title.lower().strip().replace(' ', '-')
        # Remove special characters
        slug = re.sub(r'[^\w\-]', '', slug)
        # Remove multiple consecutive hyphens
        slug = re.sub(r'-+', '-', slug)
        return slug

    @staticmethod
    def calculate_reading_time(content):
        """Calculate estimated reading time in minutes"""
        words_per_minute = 200
        word_count = len(content.split())
        minutes = max(1, round(word_count / words_per_minute))
        return minutes