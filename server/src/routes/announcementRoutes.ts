import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  increaseView,
  toggleLike
} from '../controllers/announcementController';

const router = Router();

// 공통 (읽기, 조회수, 좋아요)
router.get('/list', authMiddleware, getAnnouncements);
router.put('/:id/view', authMiddleware, increaseView);
router.put('/:id/like', authMiddleware, toggleLike);

// 관리자 전용 (작성, 수정, 삭제)
router.post('/create', authMiddleware, createAnnouncement);
router.put('/:id', authMiddleware, updateAnnouncement); // 수정 라우트 추가
router.delete('/:id', authMiddleware, deleteAnnouncement);

export default router;
