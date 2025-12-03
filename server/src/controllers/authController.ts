import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User'

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(400).json({ message: '존재하지 않는 계정입니다.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    return res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        phone: user.phone,
        joinDate: user.joinDate,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 오류' })
  }
}
