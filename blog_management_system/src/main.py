from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from models import db
from models.blog_post import BlogPost
from models.user import User
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'blog.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db.init_app(app)

# Import and register blueprints
from routes.blog import create_blog_blueprint
from routes.user import create_user_blueprint

blog_bp = create_blog_blueprint()
user_bp = create_user_blueprint()

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(blog_bp, url_prefix='/api')

# Create database tables
def init_db():
    with app.app_context():
        db.create_all()

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/blog-management.html')
def blog_management():
    return send_from_directory('static', 'blog-management.html')

@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory('static/assets', filename)

@app.route('/blog')
def blog():
    return send_from_directory('static', 'blog.html')

@app.route('/blog/<int:post_id>')
def blog_post(post_id):
    return send_from_directory('static', 'blog-post.html')

@app.route('/api/posts/<int:post_id>')
def get_post(post_id):
    from models.blog_post import BlogPost
    post = BlogPost.query.get_or_404(post_id)
    return jsonify(post.to_dict())

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run the application
    app.run(debug=True, port=5000)