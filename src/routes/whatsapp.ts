import { Router } from 'express';
import { sendWhatsAppMessage } from '../controllers/whatsapp';
import { authenticateFirebaseTokenOrApiKey } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/v1/whatsapp/send-message:
 *   post:
 *     summary: Send WhatsApp message via WALI API
 *     description: Sends a WhatsApp message to a specified phone number using the WALI API integration. Supports both Bearer token and API key authentication.
 *     tags: [WhatsApp]
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
 *               - message
 *               - phone
 *             properties:
 *               message:
 *                 type: string
 *                 description: The message content to send
 *                 example: "This is an emergency alert from Hackathoon 911"
 *               phone:
 *                 type: string
 *                 description: The phone number to send the message to (international format)
 *                 example: "+56912345678"
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                   example: "WhatsApp message sent successfully"
 *                 data:
 *                   type: object
 *                   description: Response from WALI API
 *       400:
 *         description: Invalid request data
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
 *                   example: "Validation error"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "message"
 *                       message:
 *                         type: string
 *                         example: "Message is required"
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
 *       500:
 *         description: Server error or WALI API error
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
 *                   example: "Failed to send WhatsApp message"
 *                 error:
 *                   type: string
 *                   example: "WALI API returned 400: Invalid phone number"
 */
router.post('/send-message', authenticateFirebaseTokenOrApiKey, sendWhatsAppMessage);

export default router;