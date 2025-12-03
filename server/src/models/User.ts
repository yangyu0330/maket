// src/models/User.ts
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    rawPassword: { type: String }, // staff에게만 표시
    role: { type: String, enum: ['owner', 'staff'], default: 'staff' },

    name: String,
    phone: String,
    joinDate: Date,
    status: String,
  },
  { timestamps: true }
)

export default mongoose.model('User', UserSchema)
