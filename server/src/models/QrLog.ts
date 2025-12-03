import mongoose, { Schema, model, models, Document, Model } from 'mongoose'

export interface IQrLog {
  productName: string
  entryDate: string
  expireDate: string
  quantity: number
  scannedAt?: Date
}

export interface IQrLogDocument extends IQrLog, Document {}

const ProductSchema = new Schema<IQrLogDocument>({
  productName: { type: String, required: true },
  entryDate: { type: String, required: true },
  expireDate: { type: String, required: true },
  quantity: { type: Number, required: true },
  scannedAt: { type: Date, default: Date.now },
})

const QrLog =
  (models.Product as Model<IQrLogDocument>) ||
  model<IQrLogDocument>('Product', ProductSchema)

export default QrLog
