import express from 'express';
import { submitContactForm, submitBulkOrderForm } from '../controllers/contactController.js';

const router = express.Router();

router.post('/', submitContactForm);
router.post('/bulk-order', submitBulkOrderForm);

export default router;
