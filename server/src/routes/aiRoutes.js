import express from 'express';
import { adminOnly, protect } from '../middleware/auth.js';
import { generateProductDetails } from '../controllers/aiController.js';

const router = express.Router();

router.use(protect, adminOnly);

router.post('/generate-product', generateProductDetails);

export default router;
