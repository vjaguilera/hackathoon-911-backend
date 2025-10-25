import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import {
  getMedicalInfo,
  createMedicalInfo,
  updateMedicalInfo,
  deleteMedicalInfo,
  upsertMedicalInfo
} from '../controllers/medicalInfo';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Medical info unique identifier
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *         medical_conditions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medical conditions
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergies
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medications
 *         blood_type:
 *           type: string
 *           nullable: true
 *           description: Blood type (e.g., "A+", "O-")
 *         emergency_notes:
 *           type: string
 *           nullable: true
 *           description: Emergency medical notes
 *         voice_password_hash:
 *           type: string
 *           nullable: true
 *           description: Voice password hash for emergency access
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateMedicalInfo:
 *       type: object
 *       properties:
 *         medical_conditions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medical conditions
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergies
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medications
 *         blood_type:
 *           type: string
 *           description: Blood type (optional)
 *         emergency_notes:
 *           type: string
 *           description: Emergency medical notes (optional)
 *         voice_password_hash:
 *           type: string
 *           description: Voice password hash for emergency access (optional)
 *     UpdateMedicalInfo:
 *       type: object
 *       properties:
 *         medical_conditions:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medical conditions
 *         allergies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of allergies
 *         medications:
 *           type: array
 *           items:
 *             type: string
 *           description: List of medications
 *         blood_type:
 *           type: string
 *           description: Blood type
 *         emergency_notes:
 *           type: string
 *           description: Emergency medical notes
 *         voice_password_hash:
 *           type: string
 *           description: Voice password hash for emergency access
 */

// All routes require authentication
router.use(authenticateFirebaseToken);

/**
 * @swagger
 * /api/v1/medical-info:
 *   get:
 *     summary: Get medical info for the authenticated user
 *     tags: [Medical Info]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Medical information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MedicalInfo'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medical information not found
 *       500:
 *         description: Internal server error
 */
router.get('/', getMedicalInfo);

/**
 * @swagger
 * /api/v1/medical-info:
 *   post:
 *     summary: Create medical info for the authenticated user
 *     tags: [Medical Info]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicalInfo'
 *     responses:
 *       201:
 *         description: Medical information created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MedicalInfo'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - Medical information already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', createMedicalInfo);

/**
 * @swagger
 * /api/v1/medical-info:
 *   put:
 *     summary: Update medical info for the authenticated user
 *     tags: [Medical Info]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMedicalInfo'
 *     responses:
 *       200:
 *         description: Medical information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MedicalInfo'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Medical information not found
 *       500:
 *         description: Internal server error
 */
router.put('/', updateMedicalInfo);

/**
 * @swagger
 * /api/v1/medical-info:
 *   delete:
 *     summary: Delete medical info for the authenticated user
 *     tags: [Medical Info]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Medical information deleted successfully
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
 *         description: Medical information not found
 *       500:
 *         description: Internal server error
 */
router.delete('/', deleteMedicalInfo);

/**
 * @swagger
 * /api/v1/medical-info:
 *   patch:
 *     summary: Create or update medical info (upsert operation)
 *     tags: [Medical Info]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMedicalInfo'
 *     responses:
 *       200:
 *         description: Medical information saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MedicalInfo'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch('/', upsertMedicalInfo);

export default router;