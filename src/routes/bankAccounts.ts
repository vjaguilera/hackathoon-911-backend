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

// All routes require authentication
router.use(authenticateFirebaseToken);

// GET /bank-accounts - Get all bank accounts for the authenticated user
router.get('/', getBankAccounts);

// GET /bank-accounts/:id - Get a specific bank account by ID
router.get('/:id', getBankAccountById);

// POST /bank-accounts - Create a new bank account
router.post('/', createBankAccount);

// PUT /bank-accounts/:id - Update a bank account
router.put('/:id', updateBankAccount);

// DELETE /bank-accounts/:id - Delete a bank account
router.delete('/:id', deleteBankAccount);

export default router;