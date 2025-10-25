# Authentication Documentation

## 🔐 Authentication Endpoints

The Hackathoon 911 Backend provides comprehensive authentication functionality using Firebase Authentication integrated with your local database.

### Base URL
```
http://localhost:3000/api/v1/auth
```

### Available Endpoints

#### 1. **User Registration**
**Endpoint:** `POST /register`

Creates a new user account in both Firebase and the local database.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe",
  "phone_number": "+56912345678", // Optional
  "profile_picture_url": "https://example.com/profile.jpg" // Optional
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "firebase-uid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "phone_number": "+56912345678",
      "profile_picture_url": "https://example.com/profile.jpg",
      "created_at": "2025-10-25T15:00:00Z"
    },
    "custom_token": "firebase-custom-token-for-immediate-signin",
    "firebase_uid": "firebase-uid"
  }
}
```

**Error Responses:**
- `400` - Validation error or Firebase error
- `409` - User already exists
- `500` - Internal server error

---

#### 2. **User Sign In**
**Endpoint:** `POST /signin`

Authenticates a user using Firebase ID token and returns complete user profile.

**Request Body:**
```json
{
  "id_token": "firebase-id-token-from-client"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "firebase-uid",
      "email": "user@example.com",
      "full_name": "John Doe",
      // ... complete user profile with all relations
      "medical_info": { ... },
      "emergency_contacts": [ ... ],
      "vehicles": [ ... ],
      "addresses": [ ... ],
      "emergency_events": [ ... ]
    },
    "firebase_claims": {
      "uid": "firebase-uid",
      "email": "user@example.com",
      "email_verified": true,
      "auth_time": 1635174000,
      "iat": 1635174000,
      "exp": 1635177600
    }
  }
}
```

---

#### 3. **Get User Profile**
**Endpoint:** `GET /profile`
**Authentication:** Required (Bearer token)

Returns the complete authenticated user profile with profile completeness metrics.

**Headers:**
```
Authorization: Bearer firebase-id-token
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      // Complete user profile with all relations
    },
    "profile_completeness": {
      "has_medical_info": true,
      "has_emergency_contacts": true,
      "has_addresses": false,
      "has_vehicles": true,
      "completion_percentage": 75
    }
  }
}
```

---

#### 4. **Check Email Availability**
**Endpoint:** `GET /check-email/{email}`

Checks if an email address is available for registration.

**Example:**
```
GET /check-email/user@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "available": false,
    "exists_in_database": true,
    "exists_in_firebase": true
  }
}
```

---

#### 5. **Generate Email Verification Link**
**Endpoint:** `POST /verify-email`

Generates an email verification link for a user.

**Request Body:**
```json
{
  "uid": "firebase-user-id"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Email verification link generated",
  "data": {
    "verification_link": "https://firebase.auth.link/verify-email?..."
  }
}
```

---

## 🔄 Authentication Flow

### Registration Flow:
1. **Client** calls `/register` with user details
2. **Backend** creates user in Firebase
3. **Backend** creates user record in local database
4. **Backend** returns custom token for immediate sign-in
5. **Client** can use custom token to sign in immediately

### Sign In Flow:
1. **Client** authenticates with Firebase (using Firebase SDK)
2. **Client** gets Firebase ID token
3. **Client** calls `/signin` with ID token
4. **Backend** verifies token and returns user profile
5. **Client** stores token for subsequent API calls

### Authenticated Requests:
1. **Client** includes Firebase ID token in Authorization header
2. **Backend** middleware verifies token
3. **Backend** processes request with authenticated user context

---

## 🧪 Testing Authentication

### Using cURL:

**1. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@hackathoon911.com",
    "password": "securePassword123",
    "full_name": "Test User",
    "phone_number": "+56912345678"
  }'
```

**2. Check email availability:**
```bash
curl http://localhost:3000/api/v1/auth/check-email/test@example.com
```

**3. Get authenticated profile:**
```bash
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### Using the Test Script:
```bash
./test-auth.sh
```

---

## 🛡️ Security Features

1. **Firebase Integration**: Secure authentication using Google's Firebase
2. **Input Validation**: All inputs validated using Zod schemas
3. **Atomic Operations**: User creation is atomic across Firebase and database
4. **Error Handling**: Comprehensive error handling with cleanup
5. **Token Verification**: All protected endpoints verify Firebase tokens
6. **Data Consistency**: Automatic user sync between Firebase and database

---

## 📱 Client Integration

### Frontend Integration Example (JavaScript):

```javascript
// Register user
async function registerUser(userData) {
  const response = await fetch('/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  return response.json();
}

// Sign in with Firebase
async function signInWithFirebase(idToken) {
  const response = await fetch('/api/v1/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id_token: idToken })
  });
  return response.json();
}

// Get user profile
async function getUserProfile(idToken) {
  const response = await fetch('/api/v1/auth/profile', {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
  return response.json();
}
```

---

## 🎯 Next Steps

1. **Configure Firebase**: Update `.env` with your Firebase project credentials
2. **Test Registration**: Use the test script or Swagger UI
3. **Frontend Integration**: Connect your frontend application
4. **Profile Setup**: Guide users to complete their profiles
5. **Emergency Features**: Implement emergency-specific workflows

The authentication system is now fully functional and ready for production use! 🚀