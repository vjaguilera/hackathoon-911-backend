# Agent API Integration Documentation

## Overview
This document describes the Agent API integration for the Hackathoon 911 backend system. The agent_compute endpoint collects comprehensive user data and sends it to an external Agent API for processing.

## Environment Variables Required

Add the following environment variables to your `.env` file:

```bash
# Agent API Configuration
AGENT_API_URL=https://your-agent-api-url.com
AGENT_API_KEY=your-agent-api-key-here
```

## API Endpoint

### Agent Compute

**POST** `/api/v1/agent/agent_compute`

Collects comprehensive user data and sends it to the Agent API for processing.

#### Authentication
- Requires either Firebase Bearer token or API key authentication
- Header: `Authorization: Bearer <firebase_token>` OR `api-key: <your_api_key>`

#### Request Body
```json
{
  "user_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### Request Parameters
- `user_id` (string, optional for Bearer token, required for API key): UUID of the user to process data for
  - When using Bearer token: If not provided, uses authenticated user's ID
  - When using API key: Required field to specify which user's data to process

#### Response Format

**Success (200)**
```json
{
  "success": true,
  "message": "Agent compute completed successfully",
  "data": {
    // Agent API response data
  }
}
```

**Bad Request (400)**
```json
{
  "success": false,
  "error": "Bad Request",
  "message": "user_id is required when using API key authentication"
}
```

**User Not Found (404)**
```json
{
  "success": false,
  "error": "Not Found",
  "message": "User not found"
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Agent API request failed",
  "error": "Agent API returned 500: Internal server error"
}
```

## Agent API Integration Details

The endpoint sends the following data structure to the Agent API:

### API Call Configuration
- **Agent API Endpoint**: `{AGENT_API_URL}/agent_compute`
- **Headers**:
  - `Content-Type: application/json`
  - `api-key: {AGENT_API_KEY}`

### Request Body Structure
```json
{
  "emergency_contacts": [
    {
      "id": "contact-uuid",
      "contact_name": "John Doe",
      "phone_number": "+56912345678",
      "relationship": "Brother",
      "email": "john@example.com",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "medical_info": {
    "id": "medical-uuid",
    "user_id": "user-uuid",
    "medical_conditions": ["Diabetes", "Hypertension"],
    "allergies": ["Penicillin", "Nuts"],
    "medications": ["Metformin", "Lisinopril"],
    "blood_type": "O+",
    "emergency_notes": "Emergency medical notes",
    "voice_password_hash": "hashed_password",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "user_data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "Jane Smith",
    "phone_number": "+56987654321",
    "rut": "12345678-9",
    "profile_picture_url": "https://example.com/photo.jpg",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "health_insurance": [
    {
      "id": "insurance-uuid",
      "primary_provider": "FONASA",
      "provider_name": "Fonasa Group A",
      "member_id": "123456789",
      "plan_name": "Plan A",
      "coverage_info": "Basic coverage",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "bank_accounts": [
    {
      "id": "account-uuid",
      "bank_name": "Banco de Chile",
      "account_type": "Checking",
      "account_number": "1234567890",
      "rut": "12345678-9",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ],
  "addresses": [
    {
      "id": "address-uuid",
      "street_address": "123 Main St",
      "city": "Santiago",
      "region": "Metropolitana",
      "postal_code": "1234567",
      "country": "Chile",
      "address_type": "residential",
      "is_primary": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## Data Collection Process

The endpoint performs the following steps:

1. **Authentication Validation**: Verifies Bearer token or API key
2. **User ID Resolution**: Determines target user ID based on auth method
3. **Parallel Data Fetching**: Simultaneously retrieves all user data:
   - Emergency contacts (ordered by creation date, newest first)
   - Medical information (single record per user)
   - User profile data (basic information only)
   - Health insurance records (ordered by creation date, newest first)
   - Bank accounts (ordered by creation date, newest first)
   - Addresses (primary addresses first, then by creation date)
4. **Data Validation**: Ensures user exists before processing
5. **Agent API Call**: Sends structured data to external Agent API
6. **Response Forwarding**: Returns Agent API response to client

## Testing

### Using cURL with Bearer Token
```bash
curl -X POST "http://localhost:3000/api/v1/agent/agent_compute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{}'
```

### Using cURL with API Key
```bash
curl -X POST "http://localhost:3000/api/v1/agent/agent_compute" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "user_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Using the Test Script
Run the provided test script:
```bash
chmod +x test-agent.sh
./test-agent.sh
```

### Testing Checklist
Before testing, ensure:
1. ✅ Server is running (`npm run dev`)
2. ✅ Environment variables `AGENT_API_URL` and `AGENT_API_KEY` are set
3. ✅ You have a valid Firebase authentication token OR API key
4. ✅ Target user ID exists in the database with some data
5. ✅ Agent API service is accessible and configured

## Error Handling

The endpoint handles various error scenarios:

1. **Authentication Errors**: Missing or invalid tokens/API keys
2. **Validation Errors**: Invalid user_id format or missing required fields
3. **User Not Found**: Specified user_id doesn't exist in database
4. **Configuration Errors**: Missing Agent API environment variables
5. **Agent API Errors**: Issues with the external Agent API service
6. **Database Errors**: Connection or query issues with local database

## Security Considerations

- User data access is restricted based on authentication method
- Bearer token users can only access their own data (unless admin)
- API key authentication can access any user's data (emergency services)
- Sensitive information is validated before external API calls
- All database queries use parameterized queries to prevent injection
- Error messages don't expose sensitive system information

## Integration Usage Examples

### Emergency Response System
```javascript
// Process user data for emergency response
const processEmergencyData = async (userId, authToken) => {
  const response = await fetch('/api/v1/agent/agent_compute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      user_id: userId
    })
  });
  
  const result = await response.json();
  return result.data; // Agent API response
};
```

### Emergency Services Integration
```javascript
// Emergency services using API key
const getEmergencyUserData = async (userId, apiKey) => {
  const response = await fetch('/api/v1/agent/agent_compute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      user_id: userId
    })
  });
  
  return await response.json();
};
```

## Production Considerations

1. **Rate Limiting**: Implement rate limiting to prevent API abuse
2. **Caching**: Consider caching user data for frequent requests
3. **Monitoring**: Add comprehensive logging for Agent API interactions
4. **Retry Logic**: Implement retry mechanisms for failed Agent API calls
5. **Data Privacy**: Ensure compliance with data protection regulations
6. **Performance**: Monitor database query performance for large datasets
7. **Fallback**: Implement fallback mechanisms if Agent API is unavailable