from flask import Flask, request, jsonify, session
from flask_cors import CORS
from functools import wraps
import json
from datetime import datetime, timedelta
import uuid

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'dev-secret-key-change-in-production'
CORS(app, supports_credentials=True)

# Mock data storage (in-memory for testing)
mock_users = {
    '1': {
        'id': '1',
        'name': 'Jane Smith',
        'email': 'jane@example.com',
        'location': 'New York, NY',
        'photoUrl': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'isPublic': True,
        'skillsOffered': ['Graphic Design', 'Photography', 'Web Design'],
        'skillsWanted': ['Spanish Language', 'Accounting', 'Cooking'],
        'availability': ['Weekends', 'Evenings'],
        'rating': 4.8,
        'ratingCount': 12,
        'connectionCount': 5,
        'isAdmin': False,
        'isBanned': False,
        'createdAt': '2023-05-12T10:00:00Z',
        'updatedAt': '2024-01-15T14:30:00Z'
    },
    '2': {
        'id': '2',
        'name': 'John Doe',
        'email': 'john@example.com',
        'location': 'San Francisco, CA',
        'photoUrl': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        'isPublic': True,
        'skillsOffered': ['Programming', 'Math Tutoring', 'Guitar Lessons'],
        'skillsWanted': ['French Language', 'Cooking', 'Photography'],
        'availability': ['Weekends', 'Monday Evenings'],
        'rating': 4.5,
        'ratingCount': 8,
        'connectionCount': 3,
        'isAdmin': False,
        'isBanned': False,
        'createdAt': '2023-06-05T09:00:00Z',
        'updatedAt': '2024-01-10T16:45:00Z'
    },
    '3': {
        'id': '3',
        'name': 'Admin User',
        'email': 'admin@example.com',
        'location': '',
        'photoUrl': '',
        'isPublic': False,
        'skillsOffered': [],
        'skillsWanted': [],
        'availability': [],
        'rating': 5.0,
        'ratingCount': 0,
        'connectionCount': 0,
        'isAdmin': True,
        'isBanned': False,
        'createdAt': '2023-01-01T00:00:00Z',
        'updatedAt': '2024-01-01T00:00:00Z'
    }
}

mock_swaps = {
    '1': {
        'id': '1',
        'requesterId': '1',
        'requesterName': 'Jane Smith',
        'providerId': '2',
        'providerName': 'John Doe',
        'skillRequested': 'Programming',
        'skillOffered': 'Graphic Design',
        'message': "I'd love to learn some basic programming in exchange for graphic design help!",
        'status': 'pending',
        'createdAt': (datetime.now() - timedelta(days=1)).isoformat(),
        'updatedAt': (datetime.now() - timedelta(days=1)).isoformat()
    },
    '2': {
        'id': '2',
        'requesterId': '2',
        'requesterName': 'John Doe',
        'providerId': '1',
        'providerName': 'Jane Smith',
        'skillRequested': 'Photography',
        'skillOffered': 'Math Tutoring',
        'message': 'Could you help me improve my photography skills? I can offer math tutoring in return.',
        'status': 'accepted',
        'createdAt': (datetime.now() - timedelta(days=2)).isoformat(),
        'updatedAt': (datetime.now() - timedelta(days=1)).isoformat()
    }
}

# Mock authentication decorator
def mock_auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization header'}), 401
        
        # For demo purposes, accept any token and assign a user
        token = auth_header.split('Bearer ')[1]
        if token == 'demo-token-jane':
            request.user_id = '1'
            request.user_email = 'jane@example.com'
        elif token == 'demo-token-john':
            request.user_id = '2'
            request.user_email = 'john@example.com'
        elif token == 'demo-token-admin':
            request.user_id = '3'
            request.user_email = 'admin@example.com'
        else:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated_function

def mock_admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        if token == 'demo-token-admin':
            request.user_id = '3'
            request.user_email = 'admin@example.com'
        else:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'SkillSwap Backend is running!'
    })

# Browse users endpoint (public)
@app.route('/api/users/browse', methods=['GET'])
def browse_users():
    """Get all public users for browsing"""
    search_query = request.args.get('search', '').lower()
    skill_filter = request.args.get('skill', '').lower()
    
    # Filter public users
    users = [user for user in mock_users.values() if user['isPublic'] and not user['isBanned']]
    
    # Apply search filter
    if search_query:
        users = [user for user in users if 
                search_query in user['name'].lower() or 
                any(search_query in skill.lower() for skill in user['skillsOffered'])]
    
    # Apply skill filter
    if skill_filter:
        users = [user for user in users if 
                any(skill_filter == skill.lower() for skill in user['skillsOffered'])]
    
    return jsonify(users)

# User profile endpoints
@app.route('/api/users/profile', methods=['GET'])
@mock_auth_required
def get_user_profile():
    """Get current user's profile"""
    user_id = request.user_id
    if user_id not in mock_users:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(mock_users[user_id])

@app.route('/api/users/profile', methods=['PUT'])
@mock_auth_required
def update_user_profile():
    """Update user profile"""
    user_id = request.user_id
    data = request.get_json()
    
    if user_id not in mock_users:
        return jsonify({'error': 'User not found'}), 404
    
    # Update user profile
    mock_users[user_id].update({
        'name': data.get('name', mock_users[user_id]['name']),
        'location': data.get('location', mock_users[user_id]['location']),
        'photoUrl': data.get('photoUrl', mock_users[user_id]['photoUrl']),
        'isPublic': data.get('isPublic', mock_users[user_id]['isPublic']),
        'skillsOffered': data.get('skillsOffered', mock_users[user_id]['skillsOffered']),
        'skillsWanted': data.get('skillsWanted', mock_users[user_id]['skillsWanted']),
        'availability': data.get('availability', mock_users[user_id]['availability']),
        'updatedAt': datetime.now().isoformat()
    })
    
    return jsonify(mock_users[user_id])

# Swap request endpoints
@app.route('/api/swaps', methods=['GET'])
@mock_auth_required
def get_user_swaps():
    """Get all swaps for the current user"""
    user_id = request.user_id
    tab = request.args.get('tab', 'all')
    
    user_swaps = []
    for swap in mock_swaps.values():
        if swap['requesterId'] == user_id or swap['providerId'] == user_id:
            if tab == 'sent' and swap['requesterId'] == user_id:
                user_swaps.append(swap)
            elif tab == 'received' and swap['providerId'] == user_id:
                user_swaps.append(swap)
            elif tab == 'all':
                user_swaps.append(swap)
    
    # Sort by creation date
    user_swaps.sort(key=lambda x: x['createdAt'], reverse=True)
    
    return jsonify(user_swaps)

@app.route('/api/swaps', methods=['POST'])
@mock_auth_required
def create_swap_request():
    """Create a new swap request"""
    user_id = request.user_id
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['providerId', 'skillRequested', 'skillOffered', 'message']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Get requester and provider info
    if user_id not in mock_users:
        return jsonify({'error': 'Requester not found'}), 404
    
    if data['providerId'] not in mock_users:
        return jsonify({'error': 'Provider not found'}), 404
    
    requester = mock_users[user_id]
    provider = mock_users[data['providerId']]
    
    # Create swap request
    swap_id = str(len(mock_swaps) + 1)
    swap_data = {
        'id': swap_id,
        'requesterId': user_id,
        'requesterName': requester['name'],
        'providerId': data['providerId'],
        'providerName': provider['name'],
        'skillRequested': data['skillRequested'],
        'skillOffered': data['skillOffered'],
        'message': data['message'],
        'status': 'pending',
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    mock_swaps[swap_id] = swap_data
    
    return jsonify(swap_data), 201

@app.route('/api/swaps/<swap_id>/status', methods=['PUT'])
@mock_auth_required
def update_swap_status(swap_id):
    """Update swap status"""
    user_id = request.user_id
    data = request.get_json()
    new_status = data.get('status')
    
    if swap_id not in mock_swaps:
        return jsonify({'error': 'Swap not found'}), 404
    
    swap_data = mock_swaps[swap_id]
    
    # Check permissions
    if new_status in ['accepted', 'rejected']:
        if swap_data['providerId'] != user_id:
            return jsonify({'error': 'Only provider can accept/reject'}), 403
    elif new_status == 'cancelled':
        if swap_data['requesterId'] != user_id:
            return jsonify({'error': 'Only requester can cancel'}), 403
    elif new_status == 'completed':
        if swap_data['requesterId'] != user_id and swap_data['providerId'] != user_id:
            return jsonify({'error': 'Only participants can mark as completed'}), 403
    
    # Update status
    swap_data['status'] = new_status
    swap_data['updatedAt'] = datetime.now().isoformat()
    
    return jsonify(swap_data)

@app.route('/api/swaps/<swap_id>', methods=['DELETE'])
@mock_auth_required
def delete_swap_request(swap_id):
    """Delete a swap request"""
    user_id = request.user_id
    
    if swap_id not in mock_swaps:
        return jsonify({'error': 'Swap not found'}), 404
    
    swap_data = mock_swaps[swap_id]
    
    # Check permissions
    if swap_data['requesterId'] != user_id:
        return jsonify({'error': 'Only requester can delete'}), 403
    
    if swap_data['status'] != 'pending':
        return jsonify({'error': 'Can only delete pending requests'}), 400
    
    # Delete swap
    del mock_swaps[swap_id]
    
    return jsonify({'success': True})

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
@mock_admin_required
def get_all_users():
    """Get all users for admin dashboard"""
    users = list(mock_users.values())
    
    # Add swap count for each user
    for user in users:
        completed_swaps = sum(1 for swap in mock_swaps.values() 
                            if (swap['requesterId'] == user['id'] or swap['providerId'] == user['id']) 
                            and swap['status'] == 'completed')
        user['swapsCompleted'] = completed_swaps
    
    return jsonify(users)

@app.route('/api/admin/swaps', methods=['GET'])
@mock_admin_required
def get_all_swaps():
    """Get all swaps for admin dashboard"""
    swaps = list(mock_swaps.values())
    swaps.sort(key=lambda x: x['createdAt'], reverse=True)
    return jsonify(swaps)

# Demo authentication endpoint
@app.route('/api/auth/verify_token', methods=['POST'])
def verify_token():
    """Mock token verification for demo purposes"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    # Map demo tokens to users
    token_mapping = {
        'demo-token-jane': '1',
        'demo-token-john': '2',
        'demo-token-admin': '3'
    }
    
    if token not in token_mapping:
        return jsonify({'error': 'Invalid token'}), 401
    
    user_id = token_mapping[token]
    user_data = mock_users[user_id].copy()
    
    return jsonify({
        'success': True,
        'user': user_data
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user"""
    return jsonify({'success': True})

if __name__ == '__main__':
    print("🚀 Starting SkillSwap Backend (Demo Mode)")
    print("=" * 50)
    print("Demo tokens available:")
    print("- demo-token-jane (Jane Smith)")
    print("- demo-token-john (John Doe)")
    print("- demo-token-admin (Admin User)")
    print("=" * 50)
    print("Backend will be available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000) 