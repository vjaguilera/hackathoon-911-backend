import { Router } from 'express';
import {
  getUserValidationQuestions,
  createValidationQuestion,
  updateValidationQuestion,
  deleteValidationQuestion,
  verifyValidationAnswer
} from '../controllers/validationQuestions';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

// Routes for user validation questions
router.get('/users/:userId/validation-questions', authenticateFirebaseToken, getUserValidationQuestions);
router.post('/users/:userId/validation-questions', authenticateFirebaseToken, createValidationQuestion);
router.put('/users/:userId/validation-questions/:questionId', authenticateFirebaseToken, updateValidationQuestion);
router.delete('/users/:userId/validation-questions/:questionId', authenticateFirebaseToken, deleteValidationQuestion);

// Route for verifying answers (could be used during emergency situations)
router.post('/validation-questions/verify', verifyValidationAnswer);

export default router;