import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';
import {
  getBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount
} from '../controllers/bankAccounts';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BankAccount:
 *       type: object
 *       required:
 *         - bank_name
 *         - account_type
 *         - account_number
 *         - rut
 *       properties:
 *         id:
 *           type: string
 *           description: Bank account unique identifier
 *         user_id:
 *           type: string
 *           description: User's unique identifier
 *         bank_name:
 *           type: string
 *           description: Name of the bank
 *         account_type:
 *           type: string
 *           description: Type of bank account (e.g., "Checking", "Savings")
 *         account_number:
 *           type: string
 *           description: Bank account number
 *         rut:
 *           type: string
 *           description: Chilean RUT
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateBankAccount:
 *       type: object
 *       required:
 *         - bank_name
 *         - account_type
 *         - account_number
 *         - rut
 *       properties:
 *         bank_name:
 *           type: string
 *           description: Name of the bank
 *         account_type:
 *           type: string
 *           description: Type of bank account
 *         account_number:
 *           type: string
 *           description: Bank account number
 *         rut:
 *           type: string
 *           description: Chilean RUT
 *     UpdateBankAccount:
 *       type: object
 *       properties:
 *         bank_name:
 *           type: string
 *           description: Name of the bank
 *         account_type:
 *           type: string
 *           description: Type of bank account
 *         account_number:
 *           type: string
 *           description: Bank account number
 *         rut:
 *           type: string
 *           description: Chilean RUT
 */

// All routes require authentication
router.use(authenticateFirebaseToken);

/**
 * @swagger
 * /api/v1/bank-accounts:
 *   get:
 *     summary: Get all bank accounts for the authenticated user
 *     tags: [Bank Accounts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of bank accounts retrieved successfully
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
 *                     $ref: '#/components/schemas/BankAccount'
 *                 count:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', getBankAccounts);

/**
 * @swagger
 * /api/v1/bank-accounts/{id}:
 *   get:
 *     summary: Get a specific bank account by ID
 *     tags: [Bank Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getBankAccountById);

/**
 * @swagger
 * /api/v1/bank-accounts:
 *   post:
 *     summary: Create a new bank account
 *     tags: [Bank Accounts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBankAccount'
 *     responses:
 *       201:
 *         description: Bank account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Missing required fields or invalid RUT format
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Conflict - Bank account already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', createBankAccount);

/**
 * @swagger
 * /api/v1/bank-accounts/{id}:
 *   put:
 *     summary: Update a bank account
 *     tags: [Bank Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBankAccount'
 *     responses:
 *       200:
 *         description: Bank account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BankAccount'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid RUT format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bank account not found
 *       409:
 *         description: Conflict - Bank account already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateBankAccount);

/**
 * @swagger
 * /api/v1/bank-accounts/{id}:
 *   delete:
 *     summary: Delete a bank account
 *     tags: [Bank Accounts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bank account ID
 *     responses:
 *       200:
 *         description: Bank account deleted successfully
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
 *         description: Bank account not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteBankAccount);

export default router;