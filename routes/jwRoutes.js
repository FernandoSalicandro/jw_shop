import express from 'express';
import jwController from '../controllers/jwController.js';

const router = express.Router();


router.get('/', jwController.index)
router.get('/:id', jwController.show)

export default router;