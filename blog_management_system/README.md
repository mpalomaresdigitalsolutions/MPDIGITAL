# Blog Management System

A modern blog management system built with Flask and JavaScript, featuring a responsive admin interface for creating, editing, and managing blog posts.

## Features

- **Blog Post Management**
  - Create, edit, and delete blog posts
  - Rich text editor for content creation
  - Support for featured images, tags, and categories
  - SEO-friendly with meta descriptions and keywords
  - Draft and published post states
  - Reading time calculation
  - View count tracking

- **Admin Interface**
  - Dashboard with post statistics
  - Tabbed navigation (All Posts, Published, Drafts)
  - Search functionality
  - Responsive design
  - Local storage fallback when offline

- **API Endpoints**
  - RESTful API for blog operations
  - User authentication
  - CORS support

## Project Structure

```
blog_management_system/
├── requirements.txt
├── README.md
└── src/
    ├── main.py
    ├── init_db.py
    ├── models/
    │   ├── __init__.py
    │   ├── blog_post.py
    │   └── user.py
    ├── routes/
    │   ├── __init__.py
    │   ├── blog.py
    │   └── user.py
    └── static/
        ├── css/
        │   └── styles.css
        ├── js/
        │   └── blog-admin.js
        └── blog-management.html
```

## Setup Instructions

1. **Create a Python Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Initialize the Database**
   ```bash
   cd src
   python init_db.py
   ```

4. **Run the Application**
   ```bash
   python main.py
   ```

5. **Access the Admin Interface**
   - Open your browser and navigate to: `http://localhost:5000/static/blog-management.html`
   - Default admin credentials:
     - Email: admin@example.com
     - Password: admin123

## API Documentation

### Blog Posts

- `GET /api/blog/posts` - Get all posts (with optional filtering)
- `GET /api/blog/posts/<post_id>` - Get a specific post
- `POST /api/blog/posts` - Create a new post
- `PUT /api/blog/posts/<post_id>` - Update a post
- `DELETE /api/blog/posts/<post_id>` - Delete a post
- `GET /api/blog/categories` - Get all categories
- `GET /api/blog/stats` - Get blog statistics

### User Management

- `POST /api/register` - Register a new user
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## Development

### Frontend

The frontend is built with vanilla JavaScript and uses modern browser features:

- CSS Grid and Flexbox for layout
- CSS Custom Properties for theming
- Fetch API for HTTP requests
- Local Storage for offline functionality
- ContentEditable for rich text editing

### Backend

The backend is built with Flask and uses:

- Flask-SQLAlchemy for database operations
- Flask-CORS for handling CORS
- JWT for authentication
- SQLite for data storage

## Security

- CORS protection enabled
- Password hashing using Werkzeug
- JWT-based authentication
- Form validation and sanitization
- SQL injection protection via SQLAlchemy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.