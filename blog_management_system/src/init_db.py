from main import app, db
from models.blog_post import BlogPost
from models.user import User
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import random

def init_database():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Create tables
        db.create_all()

        # Create admin user
        admin = User(
            name='Admin',
            email='admin@example.com',
            password=generate_password_hash('admin123'),
            role='admin',
            created_at=datetime.utcnow()
        )
        db.session.add(admin)

        # Sample blog posts
        categories = ['Google Ads', 'SEO', 'Social Media', 'Content Marketing', 'Email Marketing', 'Analytics']
        statuses = ['published', 'draft']
        
        for i in range(10):
            # Generate random dates within the last month
            created_at = datetime.utcnow() - timedelta(days=random.randint(0, 30))
            
            post = BlogPost(
                title=f'Sample Blog Post {i + 1}',
                slug=f'sample-blog-post-{i + 1}',
                content=f'This is the content of blog post {i + 1}. It includes some sample text to demonstrate the blog management system.',
                excerpt=f'A brief excerpt for blog post {i + 1}...',
                author='Marlon Palomares',
                category=random.choice(categories),
                status=random.choice(statuses),
                featured_image='https://via.placeholder.com/800x400',
                meta_description=f'Meta description for blog post {i + 1}',
                meta_keywords=f'keyword1, keyword2, keyword3',
                tags=str(['tag1', 'tag2', 'tag3']),
                views=random.randint(0, 1000),
                reading_time=random.randint(3, 15),
                created_at=created_at,
                updated_at=created_at
            )
            
            # Set published_at for published posts
            if post.status == 'published':
                post.published_at = created_at
            
            db.session.add(post)

        # Commit changes
        db.session.commit()

if __name__ == '__main__':
    init_database()
    print('Database initialized with sample data!')