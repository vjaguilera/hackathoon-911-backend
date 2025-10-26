import { Router } from 'express';
import { 
  getUserEmergencyEvents,
  createEmergencyEvent,
  getEmergencyEventById,
  updateEmergencyEvent,
  deleteEmergencyEvent,
  getAllEmergencyEvents
} from '../controllers/emergencyEvents';
import { authenticateFirebaseToken, authenticateFirebaseTokenOrApiKey } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmergencyEvent:
 *       type: object
 *       required:
 *         - event_type
 *         - description
 *         - location
 *       properties:
 *         id:
 *           type: string
 *           description: Emergency event unique identifier
 *         user_id:
 *           type: string
 *           description: User ID who created the event
 *         event_type:
 *           type: string
 *           description: Type of emergency (medical, fire, police, etc.)
 *         description:
 *           type: string
 *           description: Description of the emergency
 *         location:
 *           type: string
 *           description: Location of the emergency
 *         audio_recording_url:
 *           type: string
 *           format: uri
 *           description: URL to audio recording if available
 *         status:
 *           type: string
 *           enum: [active, resolved, cancelled]
 *           description: Current status of the emergency
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/emergency-events:
 *   get:
 *     summary: Get current user's emergency events
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved, cancelled]
 *     responses:
 *       200:
 *         description: Emergency events retrieved successfully
 */
router.get('/', authenticateFirebaseToken, getUserEmergencyEvents);

/**
 * @swagger
 * /api/v1/emergency-events:
 *   post:
 *     summary: Create a new emergency event
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_type
 *               - description
 *               - location
 *             properties:
 *               event_type:
 *                 type: string
 *                 description: Type of emergency (medical, fire, police, etc.)
 *               description:
 *                 type: string
 *                 description: Description of the emergency
 *               location:
 *                 type: string
 *                 description: Location of the emergency
 *               audio_recording_url:
 *                 type: string
 *                 format: uri
 *                 description: URL to audio recording if available
 *               user_id:
 *                 type: string
 *                 description: User ID for the emergency event. Required when using API key authentication. Optional when using Bearer token (uses authenticated user's ID if not provided).
 *     responses:
 *       201:
 *         description: Emergency event created successfully
 *       400:
 *         description: Bad Request - Missing required fields, user_id required for API key auth, or provided user_id does not exist
 *       401:
 *         description: Unauthorized - Invalid authentication
 */
router.post('/', authenticateFirebaseTokenOrApiKey, createEmergencyEvent);

/**
 * @swagger
 * /api/v1/emergency-events/all:
 *   get:
 *     summary: Get all emergency events (Admin only)
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, resolved, cancelled]
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All emergency events retrieved successfully
 */
router.get('/all', authenticateFirebaseToken, getAllEmergencyEvents);

/**
 * @swagger
 * /api/v1/emergency-events/{id}:
 *   get:
 *     summary: Get emergency event by ID
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emergency event retrieved successfully
 *       404:
 *         description: Emergency event not found
 */
router.get('/:id', authenticateFirebaseToken, getEmergencyEventById);

/**
 * @swagger
 * /api/v1/emergency-events/{id}:
 *   put:
 *     summary: Update emergency event
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_type:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               audio_recording_url:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [active, resolved, cancelled]
 *     responses:
 *       200:
 *         description: Emergency event updated successfully
 */
router.put('/:id', authenticateFirebaseToken, updateEmergencyEvent);

/**
 * @swagger
 * /api/v1/emergency-events/{id}:
 *   delete:
 *     summary: Delete emergency event
 *     tags: [Emergency Events]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Emergency event deleted successfully
 */
router.delete('/:id', authenticateFirebaseToken, deleteEmergencyEvent);

export default router;