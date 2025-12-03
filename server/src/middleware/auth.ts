// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ message: '토큰이 없습니다.' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)

    if (typeof decoded === 'object' && 'userId' in decoded) {
      req.user = {
        userId: decoded.userId as string,
        role: decoded.role as string,
      }
    }

    next()
  } catch (err) {
    return res.status(403).json({ message: '유효하지 않은 토큰입니다.' })
  }
}
