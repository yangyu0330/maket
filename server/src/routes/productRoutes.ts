import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import Product from '../models/Product'

const router = Router()

// 전체 목록 + 검색/카테고리 필터
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q, category } = req.query
    const filter: Record<string, any> = {}

    if (category && category !== '전체') filter.category = category
    if (q) filter.name = { $regex: q as string, $options: 'i' }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: '상품 목록 로드 실패' })
  }
})

export default router
