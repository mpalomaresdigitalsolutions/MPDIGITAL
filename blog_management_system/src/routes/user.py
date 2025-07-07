from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from models import db

def create_user_blueprint():
    user_bp = Blueprint('user', __name__)

    @user_bp.route('/register', methods=['POST'])
    def register():
        from models.user import User
        data = request.get_json()

        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400

        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            password=generate_password_hash(data['password']),
            role=data.get('role', 'user')
        )

        db.session.add(user)
        db.session.commit()

        return jsonify(user.to_dict()), 201

    @user_bp.route('/login', methods=['POST'])
    def login():
        from models.user import User
        data = request.get_json()

        user = User.query.filter_by(email=data['email']).first()
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        token = jwt.encode(
            {
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(days=1)
            },
            'your-secret-key',  # Should be stored in environment variable
            algorithm='HS256'
        )

        return jsonify({
            'token': token,
            'user': user.to_dict()
        })

    @user_bp.route('/profile', methods=['GET'])
    def get_profile():
        from models.user import User
        # Get token from header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Verify token
            data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404

            return jsonify(user.to_dict())

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    @user_bp.route('/profile', methods=['PUT'])
    def update_profile():
        from models.user import User
        # Get token from header
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            # Verify token
            data = jwt.decode(token, 'your-secret-key', algorithms=['HS256'])
            user = User.query.get(data['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 404

            # Update user data
            update_data = request.get_json()
            if 'name' in update_data:
                user.name = update_data['name']
            if 'email' in update_data:
                user.email = update_data['email']
            if 'password' in update_data:
                user.password = generate_password_hash(update_data['password'])

            user.updated_at = datetime.now()
            db.session.commit()

            return jsonify(user.to_dict())

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

    return user_bp