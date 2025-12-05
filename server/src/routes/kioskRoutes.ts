import express from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product'
import Order from '../models/Order'

const router = express.Router()

// 1. 상품 바코드 스캔 (조회)
router.get('/scan/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params
    const product = await Product.findOne({ barcode })

    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' })
    }
    res.json(product)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '서버 에러 발생' })
  }
})

// 2. 결제 처리 및 주문 저장
router.post('/checkout', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod } = req.body

    // 재고 차감 로직
    for (const item of items) {
      let product = null

      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await Product.findById(item.productId)
      }

      if (!product && item.barcode) {
        product = await Product.findOne({ barcode: item.barcode })
      }

      if (product) {
        product.stock -= item.quantity
        await product.save()
        console.log(`✅ 재고 차감: ${product.name} (-${item.quantity})`)
      } else {
        console.log(`⚠️ 재고 차감 실패: ${item.name}`)
      }
    }

    // 주문 기록 저장
    const newOrder = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      items: items.map((item: any) => ({
        productId: mongoose.Types.ObjectId.isValid(item.productId)
          ? item.productId
          : null,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount,
      paymentMethod,
    })

    res.status(200).json({ success: true, order: newOrder })
  } catch (error) {
    console.error('결제 에러:', error)
    res.status(500).json({ message: '결제 처리에 실패했습니다.' })
  }
})

router.get('/products/quick', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ stock: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: '목록 조회 실패' })
  }
})

router.post('/init-data', async (req, res) => {
  try {
    await Product.deleteMany({})

    const initialItems = [
      {
        name: '아이스 아메리카노',
        price: 1500,
        barcode: '880001',
        category: '커피',
        stock: 100,
      },
      {
        name: '핫 아메리카노',
        price: 1200,
        barcode: '880002',
        category: '커피',
        stock: 100,
      },
      {
        name: '생수 500ml',
        price: 900,
        barcode: '880003',
        category: '음료',
        stock: 50,
      },
      {
        name: '비닐봉투',
        price: 20,
        barcode: '880004',
        category: '기타',
        stock: 1000,
      },
      {
        name: '신라면 컵',
        price: 1100,
        barcode: '880005',
        category: '식품',
        stock: 30,
      },
    ]

    await Product.insertMany(initialItems)
    res.json({ message: '초기 상품 데이터 등록 완료!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: '등록 실패' })
  }
})

export default router
