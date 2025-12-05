import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  postId: string;
  parentCommentId?: string; // 대댓글일 경우 부모 댓글 ID
  content: string;
  authorId: string;
  authorName: string;
  likes: string[];
  createdAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, required: true },
    authorId: { type: String, required: true },
    authorName: { type: String, default: '익명' },
    likes: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IComment>('Comment', CommentSchema);
