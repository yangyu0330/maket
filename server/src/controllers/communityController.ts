import { Request, Response } from 'express';
import Post from '../models/Post';
import Comment from '../models/Comment';

// --- 통계 API (NEW) ---
export const getCommunityStats = async (req: Request, res: Response) => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    // 1. 카테고리별 오늘 신규 게시글
    const tipsToday = await Post.countDocuments({ 
      category: 'tips', 
      createdAt: { $gte: yesterday } 
    });
    
    const suggestionsToday = await Post.countDocuments({ 
      category: 'suggestions', 
      createdAt: { $gte: yesterday } 
    });

    // 2. 오늘 신규 댓글
    const commentsToday = await Comment.countDocuments({ 
      createdAt: { $gte: yesterday } 
    });

    // 3. 오늘 신규 신고 (Aggregation 사용)
    const reportsTodayData = await Post.aggregate([
      { $unwind: "$reports" },
      { $match: { "reports.createdAt": { $gte: yesterday } } },
      { $count: "count" }
    ]);
    const reportsToday = reportsTodayData.length > 0 ? reportsTodayData[0].count : 0;

    res.json({
      tipsToday,
      suggestionsToday,
      commentsToday,
      reportsToday
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '통계 로드 실패' });
  }
};

// 게시글 목록 조회
export const getPosts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const query: any = {};

    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    const postsWithCommentCount = await Promise.all(posts.map(async (p) => {
        const commentCount = await Comment.countDocuments({ postId: p._id as any });
        return { ...p.toObject(), commentCount };
    }));

    res.json(postsWithCommentCount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '서버 오류' });
  }
};

// 게시글 상세 조회
export const getPostDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true });
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    const comments = await Comment.find({ postId: id }).sort({ createdAt: 1 });
    res.json({ post, comments });
  } catch (err) {
    res.status(500).json({ message: '서버 오류' });
  }
};

// 게시글 작성
export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '권한 없음' });

    const randomNum = Math.floor(Math.random() * 1000);
    const newPost = await Post.create({
      title,
      content,
      category,
      authorId: userId,
      authorName: `익명${randomNum}`
    });
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: '작성 실패' });
  }
};

// 게시글 수정
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user?.userId;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    if (post.authorId !== userId) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
};

// 게시글 삭제
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    if (role !== 'owner' && post.authorId !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await Post.findByIdAndDelete(id);
    await Comment.deleteMany({ postId: id });
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 오류' });
  }
};

// 게시글 좋아요 토글
export const togglePostLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '로그인 필요' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    const index = post.likes.indexOf(userId);
    if (index === -1) post.likes.push(userId);
    else post.likes.splice(index, 1);

    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ message: '오류' });
  }
};

// 게시글 신고 토글 (구조 변경 대응)
export const togglePostReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '로그인 필요' });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: '게시글 없음' });

    if (!post.reports) post.reports = [];

    // reports 배열에서 userId가 있는지 확인 (객체 배열이므로 findIndex 사용)
    const index = post.reports.findIndex((r: any) => r.userId === userId);
    
    if (index === -1) {
      // 신고 추가
      post.reports.push({ userId, createdAt: new Date() });
    } else {
      // 신고 취소
      post.reports.splice(index, 1);
    }

    await post.save();
    res.json({ reports: post.reports });
  } catch (err) {
    res.status(500).json({ message: '오류' });
  }
};

// 신고 해결
export const resolvePostReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { reports: [] }, { new: true });
    if (!post) return res.status(404).json({ message: '게시글 없음' });
    res.json({ message: '신고 해결 완료', reports: [] });
  } catch (err) {
    res.status(500).json({ message: '오류' });
  }
};

// 댓글 작성
export const createComment = async (req: Request, res: Response) => {
  try {
    const { postId, content, parentCommentId } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '권한 없음' });

    const newComment = await Comment.create({
      postId,
      parentCommentId: parentCommentId || null,
      content,
      authorId: userId,
      authorName: '익명'
    });
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: '작성 실패' });
  }
};

// 댓글 수정
export const updateComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: '댓글 없음' });

    if (comment.authorId !== userId) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    comment.content = content;
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: '수정 실패' });
  }
};

// 댓글 삭제
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const role = req.user?.role;

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: '댓글 없음' });

    if (role !== 'owner' && comment.authorId !== userId) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await Comment.findByIdAndDelete(id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '삭제 오류' });
  }
};

// 댓글 좋아요
export const toggleCommentLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: '로그인 필요' });

    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ message: '댓글 없음' });

    const index = comment.likes.indexOf(userId);
    if (index === -1) comment.likes.push(userId);
    else comment.likes.splice(index, 1);

    await comment.save();
    res.json({ likes: comment.likes });
  } catch (err) {
    res.status(500).json({ message: '오류' });
  }
};
