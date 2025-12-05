import mongoose, { Schema, Document, models, model } from 'mongoose'

export interface IProduct extends Document {
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  barcode: string
  expiryDate?: Date
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: '기타' },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    barcode: { type: String, unique: true, sparse: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
)

export default (models.Product as mongoose.Model<IProduct>) ||
  model<IProduct>('Product', ProductSchema)
