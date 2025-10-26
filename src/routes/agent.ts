import { Router } from 'express';
import { agentCompute } from '../controllers/agent';
import { authenticateFirebaseTokenOrApiKey } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/agent/agent_compute:
 *   post:
 *     summary: Execute agent compute with user data
 *     description: Sends comprehensive user data (emergency contacts, medical info, user data, health insurance, bank accounts, addresses) to the Agent API for processing. Supports both Bearer token and API key authentication.
 *     tags: [Agent]
 *     security:
 *       - BearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: User ID to process data for. Required when using API key authentication. Optional when using Bearer token (uses authenticated user's ID if not provided).
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Agent compute completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Agent compute completed successfully"
 *                 data:
 *                   type: object
 *                   description: Response from Agent API
 *       400:
 *         description: Bad request - Invalid user_id or missing user_id for API key auth
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
 *                   example: "Bad Request"
 *                 message:
 *                   type: string
 *                   example: "user_id is required when using API key authentication"
 *       401:
 *         description: Authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized"
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing authentication token"
 *       404:
 *         description: User not found
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
 *                   example: "Not Found"
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Server error or Agent API error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Agent API request failed"
 *                 error:
 *                   type: string
 *                   example: "Agent API returned 500: Internal server error"
 */
router.post('/agent_compute', authenticateFirebaseTokenOrApiKey, agentCompute);

export default router;