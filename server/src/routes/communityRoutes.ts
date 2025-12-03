import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCommunityStats,
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostReport,
  resolvePostReport,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/communityController';

const router = Router();

// Stats
router.get('/stats', authMiddleware, getCommunityStats);

// Post
router.get('/posts', authMiddleware, getPosts);
router.get('/posts/:id', authMiddleware, getPostDetail);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost); 
router.delete('/posts/:id', authMiddleware, deletePost); 
router.put('/posts/:id/like', authMiddleware, togglePostLike);
router.put('/posts/:id/report', authMiddleware, togglePostReport); 
router.put('/posts/:id/resolve', authMiddleware, resolvePostReport);

// Comment
router.post('/comments', authMiddleware, createComment);
router.put('/comments/:id', authMiddleware, updateComment); 
router.delete('/comments/:id', authMiddleware, deleteComment); 
router.put('/comments/:id/like', authMiddleware, toggleCommentLike);

export default router;
