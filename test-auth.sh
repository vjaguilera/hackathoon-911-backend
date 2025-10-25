#!/bin/bash

# Test script for Hackathoon 911 Backend Authentication endpoints
BASE_URL="http://localhost:3000/api/v1"

echo "🧪 Testing Hackathoon 911 Backend Authentication"
echo "================================================="

# Test 1: Check if backend is running
echo "1. Testing health endpoint..."
curl -s -f "${BASE_URL}/../health" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running. Please start with: docker-compose up -d"
    exit 1
fi

# Test 2: Check email availability
echo -e "\n2. Testing email availability check..."
RESPONSE=$(curl -s "${BASE_URL}/auth/check-email/test@example.com")
echo "Response: $RESPONSE"

# Test 3: Test user registration (with sample data)
echo -e "\n3. Testing user registration..."
REGISTRATION_DATA='{
  "email": "test@hackathoon911.com",
  "password": "securePassword123",
  "full_name": "Test User",
  "phone_number": "+56912345678"
}'

echo "Registration data: $REGISTRATION_DATA"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTRATION_DATA")

echo "Registration response: $REGISTER_RESPONSE"

# Test 4: Test validation errors
echo -e "\n4. Testing validation errors with invalid data..."
INVALID_DATA='{
  "email": "invalid-email",
  "password": "123",
  "full_name": ""
}'

INVALID_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "$INVALID_DATA")

echo "Validation error response: $INVALID_RESPONSE"

# Test 5: Test duplicate email registration
echo -e "\n5. Testing duplicate email registration..."
DUPLICATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTRATION_DATA")

echo "Duplicate registration response: $DUPLICATE_RESPONSE"

echo -e "\n🎉 Authentication endpoint tests completed!"
echo -e "\n📚 Visit http://localhost:3000/api-docs to see the interactive API documentation"