import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connectDB } from './config/db' // ← 이게 정답

import authRoutes from './routes/authRoutes'
import staffRoutes from './routes/staffRoutes'
import qrRoutes from './routes/qrRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// DB 연결
connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api', qrRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
