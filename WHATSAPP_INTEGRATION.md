# WhatsApp Integration Documentation

## Overview
This document describes the WhatsApp messaging integration using the WALI API for the Hackathoon 911 backend system.

## Environment Variables Required

Add the following environment variables to your `.env` file:

```bash
# WALI API Configuration
WALI_API_URL=https://your-wali-api-url.com
WALI_API_KEY=your-wali-api-key-here
```

## API Endpoint

### Send WhatsApp Message

**POST** `/api/v1/whatsapp/send-message`

Sends a WhatsApp message to a specified phone number using the WALI API.

#### Authentication
- Requires either Firebase Bearer token or API key authentication
- Header: `Authorization: Bearer <firebase_token>` OR `api-key: <your_api_key>`

#### Request Body
```json
{
  "message": "Your message content here",
  "phone": "+56912345678"
}
```

#### Request Parameters
- `message` (string, required): The message content to send
- `phone` (string, required): Phone number in international format (e.g., +56912345678)

#### Response Format

**Success (200)**
```json
{
  "success": true,
  "message": "WhatsApp message sent successfully",
  "data": {
    // WALI API response data
  }
}
```

**Validation Error (400)**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "message",
      "message": "Message is required"
    }
  ]
}
```

**Server Error (500)**
```json
{
  "success": false,
  "message": "Failed to send WhatsApp message",
  "error": "WALI API returned 400: Invalid phone number"
}
```

## WALI API Integration Details

The endpoint integrates with the WALI API using the following configuration:

- **API Endpoint**: `{WALI_API_URL}/wali/4ceedd94-5ce3-4a55-8faf-12f0037df7f4/send_message`
- **Query Parameters**: 
  - `manager=whapi`
  - `schema=repartes`
- **Headers**:
  - `Content-Type: application/json`
  - `api-key: {WALI_API_KEY}`
- **Request Body**:
  ```json
  {
    "message": "The message content",
    "device_id": "whapi",
    "phone": "recipient_phone_number",
    "is_group": false
  }
  ```

## Testing

### Using cURL
```bash
curl -X POST "http://localhost:3000/api/v1/whatsapp/send-message" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "message": "Test message from Hackathoon 911",
    "phone": "+56912345678"
  }'
```

### Using the Test Script
Run the provided test script:
```bash
./test-whatsapp.sh
```

### Testing Checklist
Before testing, ensure:
1. ✅ Server is running (`npm run dev`)
2. ✅ Environment variables `WALI_API_URL` and `WALI_API_KEY` are set
3. ✅ You have a valid Firebase authentication token
4. ✅ Phone number is in international format
5. ✅ WALI API service is accessible

## Error Handling

The endpoint handles various error scenarios:

1. **Validation Errors**: Invalid request body parameters
2. **Authentication Errors**: Missing or invalid tokens
3. **Configuration Errors**: Missing environment variables
4. **WALI API Errors**: Issues with the external API service
5. **Network Errors**: Connection issues with WALI API

## Security Considerations

- API keys and tokens are validated before processing requests
- Phone numbers should be validated on the client side
- Rate limiting should be implemented for production use
- Sensitive information is not logged in production

## Integration Usage Examples

### Emergency Alert System
```javascript
// Send emergency alert to emergency contacts
const sendEmergencyAlert = async (emergencyData, contacts) => {
  const message = `EMERGENCY ALERT: ${emergencyData.type} at ${emergencyData.location}. Contact: ${emergencyData.contactPhone}`;
  
  for (const contact of contacts) {
    await fetch('/api/v1/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        message: message,
        phone: contact.phone
      })
    });
  }
};
```

### Status Updates
```javascript
// Send status update to user
const sendStatusUpdate = async (userId, status) => {
  const user = await getUserById(userId);
  const message = `Your emergency request status has been updated to: ${status}`;
  
  await fetch('/api/v1/whatsapp/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      message: message,
      phone: user.phone
    })
  });
};
```

## Production Considerations

1. **Rate Limiting**: Implement rate limiting to prevent API abuse
2. **Retry Logic**: Add retry mechanisms for failed message deliveries
3. **Queue System**: Consider using a message queue for high-volume scenarios
4. **Monitoring**: Add logging and monitoring for message delivery status
5. **Fallback**: Implement fallback mechanisms (SMS, email) if WhatsApp fails