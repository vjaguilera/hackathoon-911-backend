import { Router } from 'express';
import { 
  getAllUsers, 
  getCurrentUser, 
  getUserById, 
  updateCurrentUser, 
  deleteCurrentUser,
  getUserByRut,
  getUserByPhoneNumber,
  searchUser
} from '../controllers/users';
import { authenticateFirebaseToken, authenticateFirebaseTokenOrApiKey } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - full_name
 *       properties:
 *         id:
 *           type: string
 *           description: User's unique identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         phone_number:
 *           type: string
 *           description: User's phone number
 *         full_name:
 *           type: string
 *           description: User's full name
 *         rut:
 *           type: string
 *           description: Chilean RUT (e.g., 19831267-3)
 *         profile_picture_url:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateFirebaseToken, getAllUsers);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/me', authenticateFirebaseToken, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               profile_picture_url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: User profile updated successfully
 */
router.put('/me', authenticateFirebaseToken, updateCurrentUser);

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 */
router.delete('/me', authenticateFirebaseToken, deleteCurrentUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateFirebaseToken, getUserById);

/**
 * @swagger
 * /api/v1/users/rut/{rut}:
 *   get:
 *     summary: Get user by RUT
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: rut
 *         required: true
 *         schema:
 *           type: string
 *         description: Chilean RUT (e.g., 19831267-3)
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid RUT format
 *       404:
 *         description: User not found with the provided RUT
 *       401:
 *         description: Authentication required
 */
router.get('/rut/:rut', authenticateFirebaseTokenOrApiKey, getUserByRut);

/**
 * @swagger
 * /api/v1/users/phone/{phoneNumber}:
 *   get:
 *     summary: Get user by phone number
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number (+ character will be automatically removed if present)
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid phone number format
 *       404:
 *         description: User not found with the provided phone number
 *       401:
 *         description: Authentication required
 */
router.get('/phone/:phoneNumber', authenticateFirebaseTokenOrApiKey, getUserByPhoneNumber);

/**
 * @swagger
 * /api/v1/users/search:
 *   post:
 *     summary: Search user by RUT or phone number
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rut:
 *                 type: string
 *                 description: Chilean RUT (e.g., 19831267-3)
 *               phone_number:
 *                 type: string
 *                 description: User's phone number
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found
 */
router.post('/search', authenticateFirebaseTokenOrApiKey, searchUser);

export default router;