import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/settingController.js';

const router = Router();

router.get('/', getSettings);
router.patch('/', protect, adminOnly, updateSettings);

export default router;
