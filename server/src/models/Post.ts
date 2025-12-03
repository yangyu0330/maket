import mongoose, { Document, Schema } from 'mongoose';

export interface IReport {
  userId: string;
  createdAt: Date;
}

export interface IPost extends Document {
  title: string;
  content: string;
  category: 'tips' | 'suggestions';
  authorId: string;
  authorName: string;
  views: number;
  likes: string[];
  reports: IReport[]; // 변경됨: 객체 배열
  createdAt: Date;
}

const PostSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, enum: ['tips', 'suggestions'], default: 'tips' },
    authorId: { type: String, required: true },
    authorName: { type: String, default: '익명' },
    views: { type: Number, default: 0 },
    likes: [{ type: String }],
    reports: [{ 
      userId: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }], 
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
