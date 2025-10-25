import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/auth';

const router = Router();

// TODO: Implement medical info CRUD operations
router.get('/', authenticateFirebaseToken, (req, res) => {
  res.json({ message: 'Medical info routes - To be implemented' });
});

export default router;