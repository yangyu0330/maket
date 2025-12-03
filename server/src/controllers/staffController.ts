import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User'

// 직원 추가
export const addStaff = async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body

    if (!name || !phone) {
      return res.status(400).json({ message: '이름과 연락처는 필수입니다.' })
    }

    const username = `${name}_${Date.now()}`
    const rawPassword = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    await User.create({
      username,
      email: `${username}@staff.local`,
      password: hashedPassword,
      rawPassword,
      role: 'staff',
      name,
      phone,
      joinDate: new Date(),
      status: '활성',
    })

    return res.json({
      message: '직원 추가 완료',
      username,
      password: rawPassword,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '서버 오류' })
  }
}

// 직원 목록 조회
export const getStaffList = async (req: Request, res: Response) => {
  const staff = await User.find({ role: 'staff' })
  res.json(staff)
}

// 직원 삭제
export const deleteStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    await User.findByIdAndDelete(id)
    res.json({ message: '삭제 완료' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
}
