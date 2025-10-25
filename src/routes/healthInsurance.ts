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

// All routes require authentication
router.use(authenticateFirebaseToken);

// GET /health-insurance - Get all health insurance records for the authenticated user
router.get('/', getHealthInsurance);

// GET /health-insurance/:id - Get a specific health insurance record by ID
router.get('/:id', getHealthInsuranceById);

// POST /health-insurance - Create a new health insurance record
router.post('/', createHealthInsurance);

// PUT /health-insurance/:id - Update a health insurance record
router.put('/:id', updateHealthInsurance);

// DELETE /health-insurance/:id - Delete a health insurance record
router.delete('/:id', deleteHealthInsurance);

export default router;