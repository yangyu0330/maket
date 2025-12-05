import { Router } from 'express'
import { authMiddleware } from '../middleware/auth'
import Product from '../models/Product'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q, category } = req.query

    const filter: Record<string, any> = {
      $and: [
        { name: { $exists: true } },
        { name: { $ne: '' } },
        { name: { $ne: '이름 없음' } },
        { name: { $ne: null } },
      ],
    }

    if (category && category !== '전체') {
      filter.category = category
    }

    if (q) {
      filter.name = { $regex: q as string, $options: 'i' }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    console.error('상품 목록 로드 에러:', err)
    res.status(500).json({ message: '상품 목록 로드 실패' })
  }
})

export default router
