import functools
import uuid
import firebase_admin
from firebase_admin import credentials, auth, firestore, storage, messaging
from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
import openai
from datetime import datetime
import io
import csv
from functools import wraps
import secrets
import os

# Initialize Flask app
app = Flask(__name__)
# Replace with a securely generated key in a production environment
app.secret_key = 'd85f9474d3eddf2dc72496e8f0453d304640138ec9dde88b6e00ccc7ed0d896a'
CORS(app, supports_credentials=True)

# Initialize Firebase Admin SDK
# Ensure 'skillforge-961c4-firebase-adminsdk.json' is correctly placed and accessible
cred = credentials.Certificate("D:\SkillForge\skillforge-961c4-firebase-adminsdk-fbsvc-ec1befb7a6.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'skillforge-961c4.appspot.com'
})

# Initialize Firestore and Storage
db = firestore.client()
bucket = storage.bucket()

# Initialize OpenAI
# Replace with your actual OpenAI API key, consider using environment variables for security
openai.api_key = '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'


# Decorators
def firebase_token_required(f):
    """
    Decorator to verify Firebase ID token from the Authorization header.
    Attaches the decoded token to request.user.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authorization token is missing'}), 401
        try:
            # Remove 'Bearer ' prefix if present
            decoded_token = auth.verify_id_token(token.replace('Bearer ', ''))
            request.user = decoded_token
            return f(*args, **kwargs)
        except auth.InvalidIdTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except auth.ExpiredIdTokenError:
            return jsonify({'error': 'Expired token'}), 401
        except Exception as e:
            # Catch any other unexpected errors during token verification
            return jsonify({'error': f'Token verification failed: {str(e)}'}), 401

    return decorated_function


def admin_required(f):
    """
    Decorator to check if the authenticated user has admin privileges.
    Requires firebase_token_required to be applied first.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # request.user is set by firebase_token_required
        if not hasattr(request, 'user') or not request.user.get('admin', False):
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)

    return decorated_function


def login_required(f):
    """
    Decorator to check if a user_id is present in the session.
    This is for session-based authentication, typically used alongside Firebase token verification.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)

    return decorated_function


# Auth Routes
@app.route('/api/auth/verify_token', methods=['POST'])
def verify_token():
    """
    Verifies a Firebase ID token and creates/updates a user profile in Firestore.
    Sets the user_id in the session upon successful verification.
    """
    token = request.json.get('idToken')
    if not token:
        return jsonify({'error': 'Token is missing'}), 400
    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token['uid']
        session['user_id'] = user_id # Set user_id in Flask session

        # Create or update user profile in Firestore
        user_ref = db.collection('users').document(user_id)
        # Check if user document exists before setting initial data
        if not user_ref.get().exists:
            user_ref.set({
                'email': decoded_token.get('email', ''),
                'name': decoded_token.get('name', ''),
                'created_at': datetime.utcnow(),
                'profile_public': True,
                'skills_offered': [],
                'skills_wanted': [],
                'availability': [],
                'location': '',
                'profile_photo_url': '',
                'average_rating': 0.0,
                'rating_count': 0,
                'connection_count': 0
            })
        return jsonify({'message': 'Token verified', 'uid': user_id}), 200
    except Exception as e:
        # Catch any exceptions during token verification or Firestore operations
        return jsonify({'error': str(e)}), 401


@app.route('/api/auth/logout', methods=['POST'])
@firebase_token_required
def logout():
    """
    Logs out the user by removing their ID from the session.
    Requires a valid Firebase token for access.
    """
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'}), 200


# User Profile Routes
@app.route('/api/profile', methods=['GET', 'POST'])
@firebase_token_required
def manage_profile():
    """
    Manages user profiles:
    - GET: Retrieves the authenticated user's profile.
    - POST: Updates the authenticated user's profile with provided data.
    Ensures age is 13 or older.
    """
    user_id = request.user['uid']
    user_ref = db.collection('users').document(user_id)

    if request.method == 'GET':
        user_doc = user_ref.get()
        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404
        return jsonify(user_doc.to_dict()), 200

    if request.method == 'POST':
        data = request.json
        # Validate age requirement
        if data.get('age', 0) < 13:
            return jsonify({'error': 'User must be 13 or older'}), 400
        update_data = {
            'name': data.get('name', ''),
            'location': data.get('location', ''),
            'skills_offered': data.get('skills_offered', []),
            'skills_wanted': data.get('skills_wanted', []),
            'availability': data.get('availability', []),
            'profile_public': data.get('profile_public', True),
            'age': data.get('age', 13)
        }
        user_ref.update(update_data)
        # Corrected line: Ensure proper JSON response
        return jsonify({'message': 'Profile updated successfully'}), 200


# Skill Search Routes
@app.route('/api/skills/search', methods=['GET'])
def search_skills():
    """
    Searches for public user profiles based on skills offered or wanted.
    """
    skill = request.args.get('skill', '').lower()
    # Stream all public users and filter in application logic
    # For large datasets, consider Firestore's array-contains-any query if exact matches are needed
    users = db.collection('users').where('profile_public', '==', True).stream()
    results = []
    for user in users:
        user_data = user.to_dict()
        # Check if the skill is in offered or wanted skills (case-insensitive)
        if (skill in [s.lower() for s in user_data.get('skills_offered', [])] or
                skill in [s.lower() for s in user_data.get('skills_wanted', [])]):
            results.append({
                'uid': user.id,
                'name': user_data.get('name'),
                'skills_offered': user_data.get('skills_offered', []),
                'skills_wanted': user_data.get('skills_wanted', []),
                'location': user_data.get('location', ''),
                'average_rating': user_data.get('average_rating', 0.0)
            })
    return jsonify(results), 200


# Swap Request Routes
@app.route('/api/swaps', methods=['POST'])
@firebase_token_required
def create_swap_request():
    """
    Creates a new skill swap request between two users.
    Increments connection counts for both requester and recipient.
    """
    user_id = request.user['uid']
    data = request.json
    recipient_id = data.get('recipient_id')
    skill_offered = data.get('skill_offered')
    skill_wanted = data.get('skill_wanted')

    if not (recipient_id and skill_offered and skill_wanted):
        return jsonify({'error': 'Missing required fields'}), 400

    swap_id = str(uuid.uuid4())
    swap_ref = db.collection('swaps').document(swap_id)
    swap_ref.set({
        'swap_id': swap_id,
        'requester_id': user_id,
        'recipient_id': recipient_id,
        'skill_offered': skill_offered,
        'skill_wanted': skill_wanted,
        'status': 'pending', # Initial status
        'created_at': datetime.utcnow()
    })

    # Update connection count for both users using Firestore.Increment
    user_ref = db.collection('users').document(user_id)
    user_ref.update({'connection_count': firestore.Increment(1)})
    recipient_ref = db.collection('users').document(recipient_id)
    recipient_ref.update({'connection_count': firestore.Increment(1)})

    return jsonify({'swap_id': swap_id}), 201


@app.route('/api/swaps/<swap_id>/status', methods=['PATCH'])
@firebase_token_required
def update_swap_status(swap_id):
    """
    Updates the status of a skill swap request (accepted, rejected, cancelled, completed).
    Handles access control based on user roles (requester/recipient).
    If accepted, a new chat room is created for the swap.
    """
    user_id = request.user['uid']
    swap_ref = db.collection('swaps').document(swap_id)
    swap = swap_ref.get()

    if not swap.exists:
        return jsonify({'error': 'Swap not found'}), 404

    swap_data = swap.to_dict()
    status = request.json.get('status')

    # Access control for status updates
    if status in ['accepted', 'rejected'] and user_id != swap_data['recipient_id']:
        return jsonify({'error': 'Only recipient can accept/reject a swap'}), 403
    if status == 'cancelled' and user_id != swap_data['requester_id']:
        # Only requester can cancel a pending swap
        return jsonify({'error': 'Only requester can cancel a pending swap'}), 403
    if status not in ['accepted', 'rejected', 'cancelled', 'completed']:
        return jsonify({'error': 'Invalid status provided'}), 400

    swap_ref.update({'status': status, 'updated_at': datetime.utcnow()})

    if status == 'accepted':
        # Create a new chat room for the accepted swap
        chat_id = str(uuid.uuid4())
        db.collection('chats').document(chat_id).set({
            'swap_id': swap_id,
            'users': [swap_data['requester_id'], swap_data['recipient_id']],
            'messages': [], # Initialize with an empty list of messages
            'created_at': datetime.utcnow()
        })

    return jsonify({'message': 'Swap status updated successfully'}), 200


@app.route('/api/swaps', methods=['GET'])
@firebase_token_required
def get_swaps():
    """
    Retrieves all skill swap requests associated with the authenticated user,
    either as a requester or a recipient.
    """
    user_id = request.user['uid']
    # Get swaps where user is the requester
    swaps_as_requester = db.collection('swaps').where('requester_id', '==', user_id).stream()
    # Get swaps where user is the recipient
    swaps_as_recipient = db.collection('swaps').where('recipient_id', '==', user_id).stream()

    results = []
    # Add all swaps to the results list
    for swap in swaps_as_requester:
        results.append(swap.to_dict())
    for swap in swaps_as_recipient:
        results.append(swap.to_dict())
    return jsonify(results), 200


# Chat Routes
@app.route('/api/chats/<swap_id>', methods=['GET', 'POST'])
@firebase_token_required
def manage_chat(swap_id):
    """
    Manages chat messages for a specific swap:
    - GET: Retrieves all messages for an accepted swap.
    - POST: Sends a new message within an accepted swap's chat.
    Ensures only participants of an accepted swap can access the chat.
    """
    user_id = request.user['uid']
    swap = db.collection('swaps').document(swap_id).get()

    # Check if swap exists and is accepted
    if not swap.exists or swap.to_dict()['status'] != 'accepted':
        return jsonify({'error': 'No active chat for this swap, or swap not accepted'}), 403

    swap_data = swap.to_dict()
    # Check if the current user is a participant in the swap
    if user_id not in [swap_data['requester_id'], swap_data['recipient_id']]:
        return jsonify({'error': 'Unauthorized access to this chat'}), 403

    # Find the chat document associated with this swap_id
    chat_docs = db.collection('chats').where('swap_id', '==', swap_id).limit(1).get()
    if not chat_docs: # chat_docs is a list, check if it's empty
        return jsonify({'error': 'Chat not found for this swap'}), 404
    chat_ref = chat_docs[0] # Get the first (and only) chat document

    if request.method == 'GET':
        return jsonify(chat_ref.to_dict()), 200

    if request.method == 'POST':
        message = request.json.get('message')
        if not message:
            return jsonify({'error': 'Message content is required'}), 400
        # Add the new message to the 'messages' array in the chat document
        chat_ref.reference.update({
            'messages': firestore.ArrayUnion([{
                'sender_id': user_id,
                'message': message,
                'timestamp': datetime.utcnow()
            }])
        })
        return jsonify({'message': 'Message sent successfully'}), 200


# Ratings and Feedback
@app.route('/api/swaps/<swap_id>/rating', methods=['POST'])
@firebase_token_required
def submit_rating(swap_id):
    """
    Allows users to submit a rating and feedback for a completed swap.
    Updates the average rating and rating count for the rated user.
    """
    user_id = request.user['uid']
    swap = db.collection('swaps').document(swap_id).get()

    # Ensure the swap exists and is completed before allowing rating
    if not swap.exists or swap.to_dict()['status'] != 'completed':
        return jsonify({'error': 'Swap not found or not completed'}), 400

    swap_data = swap.to_dict()
    # Determine who is being rated (the other participant in the swap)
    rated_user_id = swap_data['recipient_id'] if user_id == swap_data['requester_id'] else swap_data['requester_id']

    rating = request.json.get('rating')
    feedback = request.json.get('feedback', '')

    # Validate rating value
    if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
        return jsonify({'error': 'Invalid rating. Must be a number between 1 and 5.'}), 400

    rating_id = str(uuid.uuid4())
    db.collection('ratings').document(rating_id).set({
        'swap_id': swap_id,
        'rater_id': user_id,
        'rated_id': rated_user_id,
        'rating': rating,
        'feedback': feedback,
        'created_at': datetime.utcnow()
    })

    # Recalculate average rating for the rated user
    # Note: This approach fetches all ratings for the user. For very high volume,
    # consider using Firestore's aggregation features or a Cloud Function.
    ratings_docs = db.collection('ratings').where('rated_id', '==', rated_user_id).stream()
    total_rating = 0.0
    rating_count = 0
    for r in ratings_docs:
        total_rating += r.to_dict().get('rating', 0.0)
        rating_count += 1

    average_rating = total_rating / rating_count if rating_count > 0 else 0.0

    user_ref = db.collection('users').document(rated_user_id)
    user_ref.update({
        'average_rating': average_rating,
        'rating_count': rating_count
    })

    return jsonify({'message': 'Rating submitted successfully'}), 201


# OpenAI Skill Questions
@app.route('/api/skills/question', methods=['POST'])
@firebase_token_required
def ask_skill_question():
    """
    Uses OpenAI's GPT model to answer questions about skills.
    """
    question = request.json.get('question')
    if not question:
        return jsonify({'error': 'Question is required'}), 400

    try:
        # Call OpenAI ChatCompletion API
        response = openai.ChatCompletion.create(
            model="gpt-4", # Using gpt-4 as specified in the original code
            messages=[
                {"role": "system", "content": "You are a helpful assistant providing information about skills."},
                {"role": "user", "content": question}
            ]
        )
        answer = response.choices[0].message['content']
        return jsonify({'answer': answer}), 200
    except Exception as e:
        # Catch any errors from the OpenAI API call
        return jsonify({'error': f'Failed to get answer from AI: {str(e)}'}), 500


# Community Forum
@app.route('/api/forum/posts', methods=['GET', 'POST'])
@firebase_token_required
def manage_forum_posts():
    """
    Manages community forum posts:
    - GET: Retrieves forum posts accessible to the authenticated user (public or private if user is a participant).
    - POST: Creates a new forum post.
    Private profiles cannot access the forum.
    """
    user_id = request.user['uid']
    user_doc = db.collection('users').document(user_id).get()
    if not user_doc.exists:
        return jsonify({'error': 'User profile not found'}), 404
    user = user_doc.to_dict()

    # Check if the user's profile is public to access the forum
    if not user.get('profile_public', True):
        return jsonify({'error': 'Private profiles cannot access the forum'}), 403

    if request.method == 'GET':
        posts = db.collection('forum_posts').stream()
        results = []
        for post in posts:
            post_data = post.to_dict()
            # Only include public posts or private posts where the user is a listed participant
            if post_data.get('public', True) or user_id in post_data.get('users', []):
                results.append(post_data)
        return jsonify(results), 200

    if request.method == 'POST':
        data = request.json
        post_id = str(uuid.uuid4())
        post_data = {
            'post_id': post_id,
            'user_id': user_id,
            'content': data.get('content'),
            'public': data.get('public', True), # Default to public if not specified
            # 'users' field is only relevant if 'public' is False
            'users': data.get('users', []) if not data.get('public') else [],
            'created_at': datetime.utcnow()
        }
        db.collection('forum_posts').document(post_id).set(post_data)
        return jsonify({'post_id': post_id}), 201


# Admin Routes
@app.route('/api/admin/users/<user_id>', methods=['PATCH'])
@firebase_token_required
@admin_required
def manage_user(user_id):
    """
    Admin route to manage user accounts (suspend, ban, reinstate) via Firebase Auth.
    Requires admin privileges.
    """
    action = request.json.get('action')
    if action not in ['suspend', 'ban', 'reinstate']:
        return jsonify({'error': 'Invalid action. Must be "suspend", "ban", or "reinstate".'}), 400

    try:
        if action == 'ban' or action == 'suspend':
            # Disable user account in Firebase Auth
            auth.update_user(user_id, disabled=True)
        elif action == 'reinstate':
            # Enable user account in Firebase Auth
            auth.update_user(user_id, disabled=False)
        return jsonify({'message': f'User {action}ed successfully'}), 200
    except Exception as e:
        # Catch Firebase Auth errors
        return jsonify({'error': f'Failed to perform action on user: {str(e)}'}), 400


@app.route('/api/admin/content/<collection>/<doc_id>', methods=['DELETE'])
@firebase_token_required
@admin_required
def remove_content(collection, doc_id):
    """
    Admin route to remove content (documents) from any specified Firestore collection.
    Requires admin privileges.
    """
    try:
        # Delete the specified document from the collection
        db.collection(collection).document(doc_id).delete()
        return jsonify({'message': 'Content removed successfully'}), 200
    except Exception as e:
        # Catch any Firestore deletion errors
        return jsonify({'error': f'Failed to remove content: {str(e)}'}), 400


@app.route('/api/admin/swaps', methods=['GET'])
@firebase_token_required
@admin_required
def monitor_swaps():
    """
    Admin route to retrieve all skill swap requests in the system for monitoring.
    Requires admin privileges.
    """
    swaps = db.collection('swaps').stream()
    results = [swap.to_dict() for swap in swaps]
    return jsonify(results), 200


@app.route('/api/admin/messages', methods=['POST'])
@firebase_token_required
@admin_required
def send_broadcast_message():
    """
    Admin route to send a broadcast message to all users via Firebase Cloud Messaging (FCM).
    Requires admin privileges.
    """
    message = request.json.get('message')
    if not message:
        return jsonify({'error': 'Message content is required for broadcast'}), 400

    try:
        # Create an FCM message to send to the 'all' topic
        notification = messaging.Message(
            notification=messaging.Notification(
                title='Skill Swap Platform Update',
                body=message
            ),
            topic='all' # Send to all devices subscribed to the 'all' topic
        )
        messaging.send(notification)
        return jsonify({'message': 'Broadcast message sent successfully'}), 200
    except Exception as e:
        # Catch any errors during FCM message sending
        return jsonify({'error': f'Failed to send broadcast message: {str(e)}'}), 500


@app.route('/api/admin/reports/<report_type>', methods=['GET'])
@firebase_token_required
@admin_required
def generate_report(report_type):
    """
    Admin route to generate CSV reports for users, swaps, or feedback.
    Requires admin privileges.
    """
    if report_type not in ['users', 'swaps', 'feedback']:
        return jsonify({'error': 'Invalid report type. Choose from "users", "swaps", or "feedback".'}), 400

    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == 'users':
        writer.writerow(['UID', 'Name', 'Email', 'Average Rating', 'Connection Count', 'Created At', 'Location', 'Profile Public', 'Age'])
        users = db.collection('users').stream()
        for user in users:
            u = user.to_dict()
            writer.writerow(
                [user.id,
                 u.get('name', ''),
                 u.get('email', ''),
                 u.get('average_rating', 0.0),
                 u.get('connection_count', 0),
                 u.get('created_at', '').isoformat() if u.get('created_at') else '', # Format datetime
                 u.get('location', ''),
                 u.get('profile_public', False),
                 u.get('age', 0)
                ]
            )

    elif report_type == 'swaps':
        writer.writerow(['Swap ID', 'Requester ID', 'Recipient ID', 'Skill Offered', 'Skill Wanted', 'Status', 'Created At', 'Updated At'])
        swaps = db.collection('swaps').stream()
        for swap in swaps:
            s = swap.to_dict()
            writer.writerow([s['swap_id'],
                             s['requester_id'],
                             s['recipient_id'],
                             s['skill_offered'],
                             s['skill_wanted'],
                             s['status'],
                             s.get('created_at', '').isoformat() if s.get('created_at') else '',
                             s.get('updated_at', '').isoformat() if s.get('updated_at') else ''
                            ])

    elif report_type == 'feedback':
        writer.writerow(['Rating ID', 'Swap ID', 'Rater ID', 'Rated ID', 'Rating', 'Feedback', 'Created At'])
        ratings = db.collection('ratings').stream()
        for rating in ratings:
            r = rating.to_dict()
            writer.writerow([rating.id,
                             r['swap_id'],
                             r['rater_id'],
                             r['rated_id'],
                             r['rating'],
                             r.get('feedback', ''),
                             r.get('created_at', '').isoformat() if r.get('created_at') else ''
                            ])

    output.seek(0) # Rewind the buffer to the beginning
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')), # Encode to utf-8 for CSV
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'{report_type}report{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv' # Dynamic filename
    )


# Admin Setup (One-time use to set admin claim)
@app.route('/api/admin/setup', methods=['POST'])
@firebase_token_required
def setup_admin():
    """
    Admin setup route to grant admin custom claim to a user.
    This should be used carefully and preferably only once by a super-admin.
    Requires a valid Firebase token for the user making the request.
    """
    user_id = request.json.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required to set admin claim'}), 400
    try:
        # Set 'admin' custom claim to True for the specified user
        auth.set_custom_user_claims(user_id, {'admin': True})
        return jsonify({'message': f'Admin claim set for user {user_id}'}), 200
    except Exception as e:
        # Catch any errors during setting custom claims
        return jsonify({'error': f'Failed to set admin claim: {str(e)}'}), 400


if __name__ == '__main__':
    # Run the Flask app in debug mode (only for development)
    app.run(debug=True)