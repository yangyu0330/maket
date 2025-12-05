import mongoose, { Schema, model, models, Document, Model } from 'mongoose'

export interface IQrLog {
  productName: string
  barcode: string
  price: number
  entryDate: string
  expireDate: string
  quantity: number
  scannedAt?: Date
}

export interface IQrLogDocument extends IQrLog, Document {}

const QrLogSchema = new Schema<IQrLogDocument>({
  productName: { type: String, required: true },
  barcode: { type: String, required: true },
  price: { type: Number, default: 0 },
  entryDate: { type: String, required: true },
  expireDate: { type: String, required: true },
  quantity: { type: Number, required: true },
  scannedAt: { type: Date, default: Date.now },
})

const QrLog =
  (models.QrLog as Model<IQrLogDocument>) ||
  model<IQrLogDocument>('QrLog', QrLogSchema)

export default QrLog
