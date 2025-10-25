import { Router } from 'express';
import {
  getUserEmergencyContacts,
  getEmergencyContactById,
  createEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from '../controllers/emergencyContacts';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     EmergencyContact:
 *       type: object
 *       required:
 *         - contact_name
 *         - phone_number
 *         - relationship
 *       properties:
 *         id:
 *           type: string
 *           description: Emergency contact's unique identifier
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *         contact_name:
 *           type: string
 *           description: Name of the emergency contact
 *         phone_number:
 *           type: string
 *           description: Phone number of the emergency contact
 *         relationship:
 *           type: string
 *           description: Relationship to the user (e.g., "Mother", "Friend", "Doctor")
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the emergency contact
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateEmergencyContact:
 *       type: object
 *       required:
 *         - contact_name
 *         - phone_number
 *         - relationship
 *       properties:
 *         contact_name:
 *           type: string
 *           description: Name of the emergency contact
 *         phone_number:
 *           type: string
 *           description: Phone number of the emergency contact
 *         relationship:
 *           type: string
 *           description: Relationship to the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the emergency contact (optional)
 *     UpdateEmergencyContact:
 *       type: object
 *       properties:
 *         contact_name:
 *           type: string
 *           description: Name of the emergency contact
 *         phone_number:
 *           type: string
 *           description: Phone number of the emergency contact
 *         relationship:
 *           type: string
 *           description: Relationship to the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the emergency contact
 */

/**
 * @swagger
 * /api/v1/emergency-contacts:
 *   get:
 *     summary: Get all emergency contacts for the authenticated user
 *     tags: [Emergency Contacts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of emergency contacts retrieved successfully
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
 *                     $ref: '#/components/schemas/EmergencyContact'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticateFirebaseToken, getUserEmergencyContacts);

/**
 * @swagger
 * /api/v1/emergency-contacts/{id}:
 *   get:
 *     summary: Get a specific emergency contact by ID
 *     tags: [Emergency Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency contact ID
 *     responses:
 *       200:
 *         description: Emergency contact retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EmergencyContact'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency contact not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticateFirebaseToken, getEmergencyContactById);

/**
 * @swagger
 * /api/v1/emergency-contacts:
 *   post:
 *     summary: Create a new emergency contact
 *     tags: [Emergency Contacts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEmergencyContact'
 *     responses:
 *       201:
 *         description: Emergency contact created successfully
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
 *                   $ref: '#/components/schemas/EmergencyContact'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateFirebaseToken, createEmergencyContact);

/**
 * @swagger
 * /api/v1/emergency-contacts/{id}:
 *   put:
 *     summary: Update an emergency contact
 *     tags: [Emergency Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency contact ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEmergencyContact'
 *     responses:
 *       200:
 *         description: Emergency contact updated successfully
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
 *                   $ref: '#/components/schemas/EmergencyContact'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency contact not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateFirebaseToken, updateEmergencyContact);

/**
 * @swagger
 * /api/v1/emergency-contacts/{id}:
 *   delete:
 *     summary: Delete an emergency contact
 *     tags: [Emergency Contacts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Emergency contact ID
 *     responses:
 *       200:
 *         description: Emergency contact deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Emergency contact not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateFirebaseToken, deleteEmergencyContact);

export default router;