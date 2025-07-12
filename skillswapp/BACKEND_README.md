# SkillSwap Flask Backend

This is the Flask backend for the SkillSwap platform, designed to work seamlessly with the React frontend.

## Features

### Core Features

- **User Authentication**: Firebase Authentication integration
- **User Profiles**: Complete profile management with skills, availability, and ratings
- **Skill Swaps**: Create, manage, and track skill exchange requests
- **Ratings & Feedback**: Rate completed swaps and update user ratings
- **Admin Dashboard**: User management, content moderation, and platform monitoring
- **AI Integration**: OpenAI-powered skill Q&A system
- **File Uploads**: Profile photo uploads to Firebase Storage

### Admin Features

- User banning/unbanning
- Platform-wide messaging
- Analytics and reporting
- Content moderation

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:

   - Authentication (Email/Password)
   - Cloud Firestore
   - Storage
   - Cloud Messaging

3. Download your service account key:

   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `serviceAccountKey.json` in your project root

4. Update the Firebase configuration in `app.py`:
   ```python
   cred = credentials.Certificate('path/to/your/serviceAccountKey.json')
   firebase_admin.initialize_app(cred, {
       'storageBucket': 'your-project-id.appspot.com'
   })
   ```

### 3. OpenAI Configuration

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/)
2. Update the API key in `app.py`:
   ```python
   openai.api_key = 'YOUR_OPENAI_API_KEY_HERE'
   ```

### 4. Flask Configuration

Update the Flask secret key in `app.py`:

```python
app.secret_key = 'YOUR_FLASK_SECRET_KEY_HERE'
```

### 5. Run the Backend

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/verify_token` - Verify Firebase ID token and create/update user profile
- `POST /api/auth/logout` - Logout user and clear session

### User Profiles

- `GET /api/users/profile` - Get current user's profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/upload_photo` - Upload profile photo

### Browse Users

- `GET /api/users/browse` - Get all public users (with search and filter options)

### Swap Requests

- `POST /api/swaps` - Create a new swap request
- `GET /api/swaps` - Get user's swap requests (with tab filtering)
- `PUT /api/swaps/<id>/status` - Update swap status
- `DELETE /api/swaps/<id>` - Delete a swap request

### Ratings & Feedback

- `POST /api/swaps/<id>/feedback` - Add feedback for completed swap

### AI Integration

- `POST /api/openai/ask_skill` - Ask skill-related questions to AI

### Admin Endpoints

- `GET /api/admin/users` - Get all users for admin dashboard
- `GET /api/admin/swaps` - Get all swaps for admin dashboard
- `POST /api/admin/ban_user` - Ban a user
- `POST /api/admin/unban_user` - Unban a user
- `POST /api/admin/send_message` - Send platform-wide message
- `GET /api/admin/reports/<type>` - Generate admin reports

### Health Check

- `GET /api/health` - Health check endpoint

## Data Models

### User

```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "location": "string",
  "photoUrl": "string",
  "isPublic": "boolean",
  "skillsOffered": ["string"],
  "skillsWanted": ["string"],
  "availability": ["string"],
  "rating": "number",
  "ratingCount": "number",
  "connectionCount": "number",
  "isAdmin": "boolean",
  "isBanned": "boolean",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Swap Request

```json
{
  "id": "string",
  "requesterId": "string",
  "requesterName": "string",
  "providerId": "string",
  "providerName": "string",
  "skillRequested": "string",
  "skillOffered": "string",
  "message": "string",
  "status": "pending|accepted|rejected|cancelled|completed",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Rating

```json
{
  "id": "string",
  "swapId": "string",
  "raterId": "string",
  "ratedUserId": "string",
  "rating": "number",
  "comment": "string",
  "raterRole": "requester|provider",
  "createdAt": "string"
}
```

## Authentication Flow

1. Frontend uses Firebase Authentication for login/signup
2. After successful authentication, frontend sends Firebase ID token to `/api/auth/verify_token`
3. Backend verifies token and creates/updates user profile in Firestore
4. Backend creates a session for the user
5. Subsequent requests include the Firebase ID token in Authorization header

## Security

- All endpoints (except health check) require Firebase token authentication
- Admin endpoints require additional admin privileges
- File uploads are validated and stored securely in Firebase Storage
- User data is validated before storage

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a descriptive message:

```json
{
  "error": "Error description"
}
```

## CORS Configuration

The backend is configured to allow requests from the React frontend with credentials support.

## Environment Variables

For production, consider using environment variables for sensitive configuration:

```bash
export FLASK_SECRET_KEY="your-secret-key"
export OPENAI_API_KEY="your-openai-key"
export FIREBASE_PROJECT_ID="your-project-id"
```

## Deployment

For production deployment:

1. Use a production WSGI server like Gunicorn
2. Set up proper environment variables
3. Configure Firebase security rules
4. Set up proper CORS origins
5. Use HTTPS

Example Gunicorn command:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Integration with Frontend

The backend is designed to work with the existing React frontend. The frontend will need to be updated to:

1. Use Firebase Authentication instead of mock authentication
2. Make API calls to these endpoints instead of using mock data
3. Handle file uploads for profile photos
4. Implement proper error handling for API responses

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
