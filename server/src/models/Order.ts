import mongoose, { Schema, Document } from 'mongoose'

export interface IOrder extends Document {
  orderNumber: string
  items: {
    productId: string
    productName: string
    price: number
    quantity: number
  }[]
  totalAmount: number
  paymentMethod: 'card' | 'cash'
  createdAt: Date
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        productName: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, default: 'card' },
  },
  { timestamps: true }
)

export default mongoose.model<IOrder>('Order', OrderSchema)
