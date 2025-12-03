import mongoose from 'mongoose'

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  joinDate: {
    type: String,
    default: () => new Date().toISOString().slice(0, 10),
  },
  weeklyHours: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
})

export default mongoose.model('Staff', StaffSchema)
