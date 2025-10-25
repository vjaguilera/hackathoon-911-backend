import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import {
  getHealthInsurance,
  getHealthInsuranceById,
  createHealthInsurance,
  updateHealthInsurance,
  deleteHealthInsurance
} from '../controllers/healthInsurance';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     HealthInsurance:
 *       type: object
 *       required:
 *         - primary_provider
 *         - provider_name
 *         - member_id
 *       properties:
 *         id:
 *           type: string
 *           description: Health insurance unique identifier
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *         primary_provider:
 *           type: string
 *           description: Primary insurance provider
 *         provider_name:
 *           type: string
 *           description: Insurance provider name
 *         plan_name:
 *           type: string
 *           nullable: true
 *           description: Insurance plan name
 *         member_id:
 *           type: string
 *           description: Member identification number
 *         coverage_info:
 *           type: string
 *           nullable: true
 *           description: Coverage information details
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateHealthInsurance:
 *       type: object
 *       required:
 *         - primary_provider
 *         - provider_name
 *         - member_id
 *       properties:
 *         primary_provider:
 *           type: string
 *           description: Primary insurance provider
 *         provider_name:
 *           type: string
 *           description: Insurance provider name
 *         plan_name:
 *           type: string
 *           description: Insurance plan name (optional)
 *         member_id:
 *           type: string
 *           description: Member identification number
 *         coverage_info:
 *           type: string
 *           description: Coverage information details (optional)
 *     UpdateHealthInsurance:
 *       type: object
 *       properties:
 *         primary_provider:
 *           type: string
 *           description: Primary insurance provider
 *         provider_name:
 *           type: string
 *           description: Insurance provider name
 *         plan_name:
 *           type: string
 *           description: Insurance plan name
 *         member_id:
 *           type: string
 *           description: Member identification number
 *         coverage_info:
 *           type: string
 *           description: Coverage information details
 */

// All routes require authentication
router.use(authenticateFirebaseToken);

/**
 * @swagger
 * /api/v1/health-insurance:
 *   get:
 *     summary: Get all health insurance records for the authenticated user
 *     tags: [Health Insurance]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of health insurance records retrieved successfully
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
 *                     $ref: '#/components/schemas/HealthInsurance'
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getHealthInsurance);

/**
 * @swagger
 * /api/v1/health-insurance/{id}:
 *   get:
 *     summary: Get a specific health insurance record by ID
 *     tags: [Health Insurance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health insurance record ID
 *     responses:
 *       200:
 *         description: Health insurance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthInsurance'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Health insurance record not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getHealthInsuranceById);

/**
 * @swagger
 * /api/v1/health-insurance:
 *   post:
 *     summary: Create a new health insurance record
 *     tags: [Health Insurance]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHealthInsurance'
 *     responses:
 *       201:
 *         description: Health insurance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthInsurance'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - Health insurance record already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', createHealthInsurance);

/**
 * @swagger
 * /api/v1/health-insurance/{id}:
 *   put:
 *     summary: Update a health insurance record
 *     tags: [Health Insurance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health insurance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHealthInsurance'
 *     responses:
 *       200:
 *         description: Health insurance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/HealthInsurance'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Health insurance record not found
 *       409:
 *         description: Conflict - Health insurance record already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateHealthInsurance);

/**
 * @swagger
 * /api/v1/health-insurance/{id}:
 *   delete:
 *     summary: Delete a health insurance record
 *     tags: [Health Insurance]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health insurance record ID
 *     responses:
 *       200:
 *         description: Health insurance record deleted successfully
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
 *         description: Health insurance record not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteHealthInsurance);

export default router;