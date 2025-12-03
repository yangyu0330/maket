import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  author: string;
  important: boolean;
  views: number;
  likes: string[]; // 좋아요를 누른 유저 ID 목록
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: '관리자' },
    important: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    likes: [{ type: String }], // 유저 ID 문자열 저장
  },
  { timestamps: true }
);

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
