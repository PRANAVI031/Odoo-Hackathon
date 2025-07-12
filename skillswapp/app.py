from flask import Flask, request, jsonify, session
from flask_cors import CORS
from functools import wraps
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage, messaging
import openai
import os
from datetime import datetime, timedelta
import json
from werkzeug.utils import secure_filename
import uuid

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'YOUR_FLASK_SECRET_KEY_HERE'  # Change this to a secure secret key
CORS(app, supports_credentials=True)

# Firebase configuration
cred = credentials.Certificate('path/to/your/serviceAccountKey.json')  # Update path
firebase_admin.initialize_app(cred, {
    'storageBucket': 'your-project-id.appspot.com'  # Update with your Firebase project ID
})

# Initialize Firebase services
db = firestore.client()
bucket = storage.bucket()

# OpenAI configuration
openai.api_key = 'YOUR_OPENAI_API_KEY_HERE'  # Update with your OpenAI API key

# Custom decorators
def firebase_token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            request.user_email = decoded_token.get('email', '')
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No valid authorization header'}), 401
        
        token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(token)
            # Check if user has admin custom claims
            if not decoded_token.get('admin', False):
                return jsonify({'error': 'Admin access required'}), 403
            request.user_id = decoded_token['uid']
            request.user_email = decoded_token.get('email', '')
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated_function

# Authentication endpoints
@app.route('/api/auth/verify_token', methods=['POST'])
def verify_token():
    """Verify Firebase ID token and create/update user profile"""
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        email = decoded_token.get('email', '')
        
        # Check if user exists in Firestore
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            # Create new user profile
            user_data = {
                'id': user_id,
                'email': email,
                'name': decoded_token.get('name', ''),
                'location': '',
                'photoUrl': '',
                'isPublic': False,
                'skillsOffered': [],
                'skillsWanted': [],
                'availability': [],
                'rating': 0,
                'ratingCount': 0,
                'connectionCount': 0,
                'isAdmin': False,
                'isBanned': False,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat()
            }
            user_ref.set(user_data)
        else:
            user_data = user_doc.to_dict()
            user_data['id'] = user_id
        
        # Create session
        session['user_id'] = user_id
        session['user_email'] = email
        
        return jsonify({
            'success': True,
            'user': user_data
        })
        
    except Exception as e:
        return jsonify({'error': 'Invalid token'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    session.clear()
    return jsonify({'success': True})

# User profile endpoints
@app.route('/api/users/profile', methods=['GET'])
@firebase_token_required
def get_user_profile():
    """Get current user's profile"""
    user_id = request.user_id
    user_ref = db.collection('users').document(user_id)
    user_doc = user_ref.get()
    
    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user_doc.to_dict()
    user_data['id'] = user_id
    
    return jsonify(user_data)

@app.route('/api/users/profile', methods=['PUT'])
@firebase_token_required
def update_user_profile():
    """Update user profile"""
    user_id = request.user_id
    data = request.get_json()
    
    # Validate required fields
    if 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    # Update user profile
    user_ref = db.collection('users').document(user_id)
    update_data = {
        'name': data['name'],
        'location': data.get('location', ''),
        'photoUrl': data.get('photoUrl', ''),
        'isPublic': data.get('isPublic', False),
        'skillsOffered': data.get('skillsOffered', []),
        'skillsWanted': data.get('skillsWanted', []),
        'availability': data.get('availability', []),
        'updatedAt': datetime.now().isoformat()
    }
    
    user_ref.update(update_data)
    
    # Get updated user data
    user_doc = user_ref.get()
    user_data = user_doc.to_dict()
    user_data['id'] = user_id
    
    return jsonify(user_data)

@app.route('/api/users/profile/upload_photo', methods=['POST'])
@firebase_token_required
def upload_profile_photo():
    """Upload profile photo to Firebase Storage"""
    user_id = request.user_id
    
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo file provided'}), 400
    
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file:
        filename = secure_filename(file.filename)
        # Generate unique filename
        unique_filename = f"{user_id}_{uuid.uuid4()}_{filename}"
        
        # Upload to Firebase Storage
        blob = bucket.blob(f"profile_photos/{unique_filename}")
        blob.upload_from_string(
            file.read(),
            content_type=file.content_type
        )
        
        # Make the blob publicly readable
        blob.make_public()
        
        # Update user profile with photo URL
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'photoUrl': blob.public_url,
            'updatedAt': datetime.now().isoformat()
        })
        
        return jsonify({
            'success': True,
            'photoUrl': blob.public_url
        })

# Browse users endpoint
@app.route('/api/users/browse', methods=['GET'])
def browse_users():
    """Get all public users for browsing"""
    search_query = request.args.get('search', '').lower()
    skill_filter = request.args.get('skill', '').lower()
    
    # Query public users
    users_ref = db.collection('users')
    query = users_ref.where('isPublic', '==', True).where('isBanned', '==', False)
    
    users = []
    for doc in query.stream():
        user_data = doc.to_dict()
        user_data['id'] = doc.id
        
        # Apply search filter
        if search_query:
            name_match = search_query in user_data.get('name', '').lower()
            skill_match = any(search_query in skill.lower() for skill in user_data.get('skillsOffered', []))
            if not (name_match or skill_match):
                continue
        
        # Apply skill filter
        if skill_filter:
            if not any(skill_filter == skill.lower() for skill in user_data.get('skillsOffered', [])):
                continue
        
        users.append(user_data)
    
    return jsonify(users)

# Swap request endpoints
@app.route('/api/swaps', methods=['POST'])
@firebase_token_required
def create_swap_request():
    """Create a new swap request"""
    user_id = request.user_id
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['providerId', 'skillRequested', 'skillOffered', 'message']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'{field} is required'}), 400
    
    # Get requester info
    requester_ref = db.collection('users').document(user_id)
    requester_doc = requester_ref.get()
    if not requester_doc.exists:
        return jsonify({'error': 'Requester not found'}), 404
    
    requester_data = requester_doc.to_dict()
    
    # Get provider info
    provider_ref = db.collection('users').document(data['providerId'])
    provider_doc = provider_ref.get()
    if not provider_doc.exists:
        return jsonify({'error': 'Provider not found'}), 404
    
    provider_data = provider_doc.to_dict()
    
    # Create swap request
    swap_data = {
        'requesterId': user_id,
        'requesterName': requester_data['name'],
        'providerId': data['providerId'],
        'providerName': provider_data['name'],
        'skillRequested': data['skillRequested'],
        'skillOffered': data['skillOffered'],
        'message': data['message'],
        'status': 'pending',
        'createdAt': datetime.now().isoformat(),
        'updatedAt': datetime.now().isoformat()
    }
    
    # Add to Firestore
    swap_ref = db.collection('swaps').document()
    swap_ref.set(swap_data)
    
    # Add ID to response
    swap_data['id'] = swap_ref.id
    
    return jsonify(swap_data), 201

@app.route('/api/swaps', methods=['GET'])
@firebase_token_required
def get_user_swaps():
    """Get all swaps for the current user"""
    user_id = request.user_id
    tab = request.args.get('tab', 'all')  # all, sent, received
    
    # Query swaps
    swaps_ref = db.collection('swaps')
    
    if tab == 'sent':
        query = swaps_ref.where('requesterId', '==', user_id)
    elif tab == 'received':
        query = swaps_ref.where('providerId', '==', user_id)
    else:
        # Get all swaps where user is either requester or provider
        sent_swaps = swaps_ref.where('requesterId', '==', user_id).stream()
        received_swaps = swaps_ref.where('providerId', '==', user_id).stream()
        
        swaps = []
        for doc in sent_swaps:
            swap_data = doc.to_dict()
            swap_data['id'] = doc.id
            swaps.append(swap_data)
        
        for doc in received_swaps:
            swap_data = doc.to_dict()
            swap_data['id'] = doc.id
            swaps.append(swap_data)
        
        # Sort by creation date
        swaps.sort(key=lambda x: x['createdAt'], reverse=True)
        return jsonify(swaps)
    
    swaps = []
    for doc in query.stream():
        swap_data = doc.to_dict()
        swap_data['id'] = doc.id
        swaps.append(swap_data)
    
    # Sort by creation date
    swaps.sort(key=lambda x: x['createdAt'], reverse=True)
    
    return jsonify(swaps)

@app.route('/api/swaps/<swap_id>/status', methods=['PUT'])
@firebase_token_required
def update_swap_status(swap_id):
    """Update swap status (accept, reject, cancel, complete)"""
    user_id = request.user_id
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
    
    valid_statuses = ['accepted', 'rejected', 'cancelled', 'completed']
    if new_status not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    # Get swap
    swap_ref = db.collection('swaps').document(swap_id)
    swap_doc = swap_ref.get()
    
    if not swap_doc.exists:
        return jsonify({'error': 'Swap not found'}), 404
    
    swap_data = swap_doc.to_dict()
    
    # Check permissions
    if new_status == 'accepted' or new_status == 'rejected':
        if swap_data['providerId'] != user_id:
            return jsonify({'error': 'Only provider can accept/reject'}), 403
    elif new_status == 'cancelled':
        if swap_data['requesterId'] != user_id:
            return jsonify({'error': 'Only requester can cancel'}), 403
    elif new_status == 'completed':
        if swap_data['requesterId'] != user_id and swap_data['providerId'] != user_id:
            return jsonify({'error': 'Only participants can mark as completed'}), 403
    
    # Update status
    update_data = {
        'status': new_status,
        'updatedAt': datetime.now().isoformat()
    }
    
    # Add timestamp based on status
    if new_status == 'accepted':
        update_data['acceptedAt'] = datetime.now().isoformat()
        # Increment connection counts
        requester_ref = db.collection('users').document(swap_data['requesterId'])
        provider_ref = db.collection('users').document(swap_data['providerId'])
        
        requester_ref.update({
            'connectionCount': firestore.Increment(1)
        })
        provider_ref.update({
            'connectionCount': firestore.Increment(1)
        })
        
    elif new_status == 'rejected':
        update_data['rejectedAt'] = datetime.now().isoformat()
    elif new_status == 'cancelled':
        update_data['cancelledAt'] = datetime.now().isoformat()
    elif new_status == 'completed':
        update_data['completedAt'] = datetime.now().isoformat()
    
    swap_ref.update(update_data)
    
    # Get updated swap data
    updated_doc = swap_ref.get()
    updated_data = updated_doc.to_dict()
    updated_data['id'] = swap_id
    
    return jsonify(updated_data)

@app.route('/api/swaps/<swap_id>', methods=['DELETE'])
@firebase_token_required
def delete_swap_request(swap_id):
    """Delete a swap request (only if pending and user is requester)"""
    user_id = request.user_id
    
    # Get swap
    swap_ref = db.collection('swaps').document(swap_id)
    swap_doc = swap_ref.get()
    
    if not swap_doc.exists:
        return jsonify({'error': 'Swap not found'}), 404
    
    swap_data = swap_doc.to_dict()
    
    # Check permissions
    if swap_data['requesterId'] != user_id:
        return jsonify({'error': 'Only requester can delete'}), 403
    
    if swap_data['status'] != 'pending':
        return jsonify({'error': 'Can only delete pending requests'}), 400
    
    # Delete swap
    swap_ref.delete()
    
    return jsonify({'success': True})

# Rating and feedback endpoints
@app.route('/api/swaps/<swap_id>/feedback', methods=['POST'])
@firebase_token_required
def add_feedback(swap_id):
    """Add feedback for a completed swap"""
    user_id = request.user_id
    data = request.get_json()
    
    rating = data.get('rating')
    comment = data.get('comment', '')
    
    if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({'error': 'Valid rating (1-5) is required'}), 400
    
    # Get swap
    swap_ref = db.collection('swaps').document(swap_id)
    swap_doc = swap_ref.get()
    
    if not swap_doc.exists:
        return jsonify({'error': 'Swap not found'}), 404
    
    swap_data = swap_doc.to_dict()
    
    # Check if swap is completed
    if swap_data['status'] != 'completed':
        return jsonify({'error': 'Can only rate completed swaps'}), 400
    
    # Check if user is participant
    if swap_data['requesterId'] != user_id and swap_data['providerId'] != user_id:
        return jsonify({'error': 'Only participants can rate'}), 403
    
    # Determine who is being rated
    if swap_data['requesterId'] == user_id:
        rated_user_id = swap_data['providerId']
        rater_role = 'requester'
    else:
        rated_user_id = swap_data['requesterId']
        rater_role = 'provider'
    
    # Check if already rated
    existing_rating = db.collection('ratings').where('swapId', '==', swap_id).where('raterId', '==', user_id).limit(1).stream()
    if list(existing_rating):
        return jsonify({'error': 'Already rated this swap'}), 400
    
    # Create rating
    rating_data = {
        'swapId': swap_id,
        'raterId': user_id,
        'ratedUserId': rated_user_id,
        'rating': rating,
        'comment': comment,
        'raterRole': rater_role,
        'createdAt': datetime.now().isoformat()
    }
    
    rating_ref = db.collection('ratings').document()
    rating_ref.set(rating_data)
    
    # Update user's average rating
    user_ref = db.collection('users').document(rated_user_id)
    user_doc = user_ref.get()
    user_data = user_doc.to_dict()
    
    current_rating = user_data.get('rating', 0)
    current_count = user_data.get('ratingCount', 0)
    
    new_count = current_count + 1
    new_rating = ((current_rating * current_count) + rating) / new_count
    
    user_ref.update({
        'rating': round(new_rating, 1),
        'ratingCount': new_count
    })
    
    # Update swap with feedback
    swap_ref.update({
        f'{rater_role}RatingGiven': True
    })
    
    return jsonify({
        'success': True,
        'rating': rating_data
    })

# OpenAI integration
@app.route('/api/openai/ask_skill', methods=['POST'])
@firebase_token_required
def ask_skill_question():
    """Ask a skill-related question to OpenAI"""
    data = request.get_json()
    question = data.get('question')
    
    if not question:
        return jsonify({'error': 'Question is required'}), 400
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides guidance on various skills and learning topics. Keep responses concise and practical."},
                {"role": "user", "content": question}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        answer = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'answer': answer
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get AI response'}), 500

# Admin endpoints
@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users for admin dashboard"""
    users_ref = db.collection('users')
    users = []
    
    for doc in users_ref.stream():
        user_data = doc.to_dict()
        user_data['id'] = doc.id
        
        # Get swap count for this user
        swaps_query = db.collection('swaps').where('requesterId', '==', doc.id).where('status', '==', 'completed')
        completed_swaps = len(list(swaps_query.stream()))
        user_data['swapsCompleted'] = completed_swaps
        
        users.append(user_data)
    
    return jsonify(users)

@app.route('/api/admin/swaps', methods=['GET'])
@admin_required
def get_all_swaps():
    """Get all swaps for admin dashboard"""
    swaps_ref = db.collection('swaps')
    swaps = []
    
    for doc in swaps_ref.stream():
        swap_data = doc.to_dict()
        swap_data['id'] = doc.id
        swaps.append(swap_data)
    
    # Sort by creation date
    swaps.sort(key=lambda x: x['createdAt'], reverse=True)
    
    return jsonify(swaps)

@app.route('/api/admin/ban_user', methods=['POST'])
@admin_required
def ban_user():
    """Ban a user"""
    data = request.get_json()
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Update user in Firestore
    user_ref = db.collection('users').document(user_id)
    user_ref.update({
        'isBanned': True,
        'updatedAt': datetime.now().isoformat()
    })
    
    # Disable user in Firebase Auth
    try:
        auth.update_user(user_id, disabled=True)
    except Exception as e:
        # If user doesn't exist in Auth, that's okay
        pass
    
    return jsonify({'success': True})

@app.route('/api/admin/unban_user', methods=['POST'])
@admin_required
def unban_user():
    """Unban a user"""
    data = request.get_json()
    user_id = data.get('userId')
    
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    # Update user in Firestore
    user_ref = db.collection('users').document(user_id)
    user_ref.update({
        'isBanned': False,
        'updatedAt': datetime.now().isoformat()
    })
    
    # Enable user in Firebase Auth
    try:
        auth.update_user(user_id, disabled=False)
    except Exception as e:
        # If user doesn't exist in Auth, that's okay
        pass
    
    return jsonify({'success': True})

@app.route('/api/admin/send_message', methods=['POST'])
@admin_required
def send_platform_message():
    """Send platform-wide message via FCM"""
    data = request.get_json()
    message_title = data.get('title')
    message_body = data.get('body')
    
    if not message_title or not message_body:
        return jsonify({'error': 'Title and body are required'}), 400
    
    try:
        # Send to all users (this is a simplified version)
        # In production, you'd want to store FCM tokens and send to specific users
        message = messaging.Message(
            notification=messaging.Notification(
                title=message_title,
                body=message_body
            ),
            topic='all_users'  # You'd need to subscribe users to this topic
        )
        
        response = messaging.send(message)
        
        return jsonify({
            'success': True,
            'messageId': response
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to send message'}), 500

@app.route('/api/admin/reports/<report_type>', methods=['GET'])
@admin_required
def generate_report(report_type):
    """Generate admin reports"""
    if report_type == 'user_activity':
        # Get user activity report
        users_ref = db.collection('users')
        total_users = len(list(users_ref.stream()))
        
        active_users = len(list(users_ref.where('isBanned', '==', False).stream()))
        banned_users = len(list(users_ref.where('isBanned', '==', True).stream()))
        
        report = {
            'total_users': total_users,
            'active_users': active_users,
            'banned_users': banned_users,
            'generated_at': datetime.now().isoformat()
        }
        
    elif report_type == 'swap_statistics':
        # Get swap statistics
        swaps_ref = db.collection('swaps')
        all_swaps = list(swaps_ref.stream())
        
        total_swaps = len(all_swaps)
        pending_swaps = len([s for s in all_swaps if s.to_dict()['status'] == 'pending'])
        completed_swaps = len([s for s in all_swaps if s.to_dict()['status'] == 'completed'])
        rejected_swaps = len([s for s in all_swaps if s.to_dict()['status'] == 'rejected'])
        
        report = {
            'total_swaps': total_swaps,
            'pending_swaps': pending_swaps,
            'completed_swaps': completed_swaps,
            'rejected_swaps': rejected_swaps,
            'completion_rate': round((completed_swaps / total_swaps * 100) if total_swaps > 0 else 0, 2),
            'generated_at': datetime.now().isoformat()
        }
        
    else:
        return jsonify({'error': 'Invalid report type'}), 400
    
    return jsonify(report)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 