import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import {
  addStaff,
  getStaffList,
  deleteStaff,
} from '../controllers/staffController'

const router = Router()

router.post('/add', authMiddleware, addStaff)
router.get('/list', authMiddleware, getStaffList)
router.delete('/delete/:id', authMiddleware, deleteStaff)

export default router
