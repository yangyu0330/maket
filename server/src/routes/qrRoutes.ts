import express from 'express'
import QrLog from '../models/QrLog'

const router = express.Router()

router.post('/save-qr', async (req, res) => {
  try {
    const body = req.body
    console.log('서버가 받은 데이터:', body)

    // 데이터 파싱
    let realData
    if (body.data && typeof body.data === 'string') {
      try {
        realData = JSON.parse(body.data)
      } catch (e) {
        realData = body
      }
    } else {
      realData = body.data || body
    }

    const { productName, entryDate, expireDate, quantity } = realData

    // 필수값 체크
    if (!productName) {
      return res.status(400).json({ error: '상품명(productName)이 없습니다.' })
    }

    // MongoDB 저장
    const newLog = await QrLog.create({
      productName,
      entryDate,
      expireDate,
      quantity: Number(quantity) || 1,
    })

    console.log('DB 저장 완료:', newLog)
    return res.status(200).json({ message: '저장 성공', result: newLog })
  } catch (error) {
    console.error('서버 에러:', error)
    return res.status(500).json({ error: '저장 실패' })
  }
})

// 모든 상품 목록 가져오기
router.get('/get-qr', async (req, res) => {
  try {
    const logs = await QrLog.find().sort({ scannedAt: -1 })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: '데이터 불러오기 실패' })
  }
})

// 특정 상품 정보 수정하기
router.put('/update-qr/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { productName, quantity, expireDate } = req.body

    const updatedLog = await QrLog.findByIdAndUpdate(
      id,
      { productName, quantity, expireDate },
      { new: true }
    )

    res.json({ message: '수정 성공', result: updatedLog })
  } catch (error) {
    res.status(500).json({ error: '수정 실패' })
  }
})

// 특정 상품 삭제하기
router.delete('/delete-qr/:id', async (req, res) => {
  try {
    const { id } = req.params
    await QrLog.findByIdAndDelete(id)
    res.json({ message: '삭제 성공' })
  } catch (error) {
    res.status(500).json({ error: '삭제 실패' })
  }
})

export default router
