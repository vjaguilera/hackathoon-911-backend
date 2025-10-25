import { Router } from 'express';
import { 
  registerUser, 
  verifyEmail, 
  checkEmailAvailability, 
  signInUser,
  loginWithEmail,
  getAuthenticatedUserProfile 
} from '../controllers/auth';
import { authenticateFirebaseToken, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - full_name
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User's password (minimum 6 characters)
 *         full_name:
 *           type: string
 *           description: User's full name
 *         phone_number:
 *           type: string
 *           description: User's phone number (optional)
 *         rut:
 *           type: string
 *           description: Chilean RUT (optional, e.g., 19831267-3)
 *         profile_picture_url:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture (optional)
 *     RegisterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             custom_token:
 *               type: string
 *               description: Firebase custom token for immediate authentication
 *             firebase_uid:
 *               type: string
 *               description: Firebase user ID
 *     EmailAvailabilityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             available:
 *               type: boolean
 *             exists_in_database:
 *               type: boolean
 *             exists_in_firebase:
 *               type: boolean
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account in both Firebase and the database
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "securePassword123"
 *             full_name: "John Doe"
 *             phone_number: "+56912345678"
 *             rut: "19831267-3"
 *             profile_picture_url: "https://example.com/profile.jpg"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: Bad request - validation error or Firebase error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Validation Error"
 *                 message:
 *                   type: string
 *                   example: "Invalid input data"
 *                 details:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       409:
 *         description: Conflict - user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Conflict"
 *                 message:
 *                   type: string
 *                   example: "User with this email already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /api/v1/auth/check-email/{email}:
 *   get:
 *     summary: Check if email is available for registration
 *     description: Checks if an email address is available for new user registration
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: Email address to check
 *         example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email availability status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailAvailabilityResponse'
 *       400:
 *         description: Bad request - invalid email format
 *       500:
 *         description: Internal server error
 */
router.get('/check-email/:email', checkEmailAvailability);

/**
 * @swagger
 * /api/v1/auth/signin:
 *   post:
 *     summary: Sign in with Firebase ID token
 *     description: Authenticates a user using Firebase ID token and returns user profile
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_token
 *             properties:
 *               id_token:
 *                 type: string
 *                 description: Firebase ID token from client authentication
 *           example:
 *             id_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     firebase_claims:
 *                       type: object
 *       401:
 *         description: Invalid or expired token
 *       500:
 *         description: Internal server error
 */
router.post('/signin', signInUser);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password
 *     description: Server-side login using Firebase email/password (returns a Bearer token)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *           example:
 *             email: "user@example.com"
 *             password: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     refresh_token:
 *                       type: string
 *                     expires_in:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Internal server error
 */
router.post('/login', loginWithEmail);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   get:
 *     summary: Get authenticated user profile
 *     description: Returns the complete profile of the authenticated user with all related data
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profile_completeness:
 *                       type: object
 *                       properties:
 *                         has_medical_info:
 *                           type: boolean
 *                         has_emergency_contacts:
 *                           type: boolean
 *                         has_addresses:
 *                           type: boolean
 *                         has_vehicles:
 *                           type: boolean
 *                         completion_percentage:
 *                           type: number
 *       401:
 *         description: User not authenticated
 *       404:
 *         description: User profile not found
 */
router.get('/profile', authenticateFirebaseToken, getAuthenticatedUserProfile);

/**
 * @swagger
 * /api/v1/auth/verify-email:
 *   post:
 *     summary: Generate email verification link
 *     description: Generates an email verification link for a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *             properties:
 *               uid:
 *                 type: string
 *                 description: Firebase user ID
 *     responses:
 *       200:
 *         description: Email verification link generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     verification_link:
 *                       type: string
 *                       format: uri
 *       400:
 *         description: Bad request - missing user ID
 *       500:
 *         description: Internal server error
 */
router.post('/verify-email', verifyEmail);

export default router;