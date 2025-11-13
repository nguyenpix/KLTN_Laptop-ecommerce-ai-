import express from 'express';
import newsController from '../../controllers/newsController.js';
import { auth, adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', newsController.getAllNews);
router.get('/:newsId', newsController.getNewsById);
router.get('/category/:categoryId', newsController.getNewsByCategory);

router.post('/', adminAuth, newsController.createNews);
router.put('/:newsId', adminAuth, newsController.updateNews);
router.delete('/:newsId', adminAuth, newsController.deleteNews);

router.post('/:newsId/view', auth, newsController.trackNewsView);

export default router;