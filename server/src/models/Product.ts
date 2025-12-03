import { Schema, model, models, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  expiryDate?: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, default: '기타' },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    expiryDate: { type: Date },
  },
  { timestamps: true }
)

export default (models.Product as any) || model<IProduct>('Product', ProductSchema)
