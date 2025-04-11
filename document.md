# CRM Home Appliances - API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication APIs

### 1. User Registration
**Endpoint:**
```
POST /authAPI/registerUser
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "mobile": "9876543210"
}
```
**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "60d0fe4f5311236168a109ca"
}
```

### 2. User Login
**Endpoint:**
```
POST /authAPI/loginUser
```
**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "your_jwt_token_here",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## User Management APIs

### 3. Get User Profile
**Endpoint:**
```
GET /authAPI/getUserProfile
```
**Headers:**
```
Authorization: Bearer your_jwt_token_here
```
**Response:**
```json
{
  "id": "60d0fe4f5311236168a109ca",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543210"
}
```

### 4. Update User Profile
**Endpoint:**
```
PUT /authAPI/profile
```
**Headers:**
```
Authorization: Bearer your_jwt_token_here
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "9876543210"
}
```
**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

### 5. Delete User Account
**Endpoint:**
```
DELETE /authAPI/profile
```
**Headers:**
```
Authorization: Bearer your_jwt_token_here
```
**Response:**
```json
{
  "message": "User account deleted successfully"
}
