import os

# 파일 생성 헬퍼 함수
def create_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {path}")

# 1. Backend Model: Post.ts (신고 구조 변경: ID 문자열 -> 객체)
post_model = """import mongoose, { Document, Schema } from 'mongoose';

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
"""

# 2. Backend Controller: communityController.ts (통계 API 및 로직 수정)
community_controller = """import { Request, Response } from 'express';
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
"""

# 3. Backend Routes: communityRoutes.ts (통계 라우트 추가)
community_routes = """import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCommunityStats,
  getPosts,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  togglePostLike,
  togglePostReport,
  resolvePostReport,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} from '../controllers/communityController';

const router = Router();

// Stats
router.get('/stats', authMiddleware, getCommunityStats);

// Post
router.get('/posts', authMiddleware, getPosts);
router.get('/posts/:id', authMiddleware, getPostDetail);
router.post('/posts', authMiddleware, createPost);
router.put('/posts/:id', authMiddleware, updatePost); 
router.delete('/posts/:id', authMiddleware, deletePost); 
router.put('/posts/:id/like', authMiddleware, togglePostLike);
router.put('/posts/:id/report', authMiddleware, togglePostReport); 
router.put('/posts/:id/resolve', authMiddleware, resolvePostReport);

// Comment
router.post('/comments', authMiddleware, createComment);
router.put('/comments/:id', authMiddleware, updateComment); 
router.delete('/comments/:id', authMiddleware, deleteComment); 
router.put('/comments/:id/like', authMiddleware, toggleCommentLike);

export default router;
"""

# 4. Frontend: BoardManagement.tsx (일일 증감량 UI 추가)
board_management = """import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  MessageSquare, 
  Trash2, 
  AlertTriangle, 
  ThumbsUp, 
  RefreshCw, 
  Filter,
  CheckCircle,
  CornerDownRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface Comment {
  _id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  authorName: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'tips' | 'suggestions';
  authorName: string;
  views: number;
  likes: string[];
  reports?: { userId: string; createdAt: string }[]; // 변경: 객체 배열
  createdAt: string;
  commentCount: number;
}

interface Stats {
  tipsToday: number;
  suggestionsToday: number;
  commentsToday: number;
  reportsToday: number;
}

const BoardManagement = () => {
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('tips')
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({ tipsToday: 0, suggestionsToday: 0, commentsToday: 0, reportsToday: 0 })
  const [loading, setLoading] = useState(false)
  const [filterReported, setFilterReported] = useState(false)

  // Detail View
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. 게시글 목록
      const postsRes = await api.get('/community/posts?category=all')
      setPosts(postsRes.data)
      
      // 2. 통계 데이터
      const statsRes = await api.get('/community/stats')
      setStats(statsRes.data)
    } catch (error) {
      toast({ title: '데이터 로드 실패', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // 게시글 삭제
  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await api.delete(`/community/posts/${postId}`)
      toast({ title: '삭제 완료' })
      setIsDetailOpen(false)
      fetchData()
    } catch (error) {
      toast({ title: '삭제 실패', variant: 'destructive' })
    }
  }

  // 신고 해결
  const handleResolveReport = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation()
    if (!confirm('신고 상태를 해제하시겠습니까?')) return
    try {
      await api.put(`/community/posts/${postId}/resolve`)
      toast({ title: '해결 완료' })
      fetchData()
    } catch (error) {
      toast({ title: '오류 발생', variant: 'destructive' })
    }
  }

  // 상세보기
  const openDetail = async (post: Post) => {
    try {
      const res = await api.get(`/community/posts/${post._id}`)
      setSelectedPost(res.data.post)
      setComments(res.data.comments)
      setIsDetailOpen(true)
    } catch (error) { console.error(error) }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if(!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/community/comments/${commentId}`)
      if (selectedPost) {
        const res = await api.get(`/community/posts/${selectedPost._id}`)
        setComments(res.data.comments)
      }
    } catch (error) {
      toast({ title: '삭제 실패', variant: 'destructive' })
    }
  }

  const getFilteredPosts = (category: string) => {
    let filtered = posts.filter(p => p.category === category)
    if (filterReported) {
      filtered = filtered.filter(p => p.reports && p.reports.length > 0)
    }
    return filtered
  }

  const tipsPosts = getFilteredPosts('tips')
  const suggestionsPosts = getFilteredPosts('suggestions')
  
  const totalComments = posts.reduce((acc, curr) => acc + (curr.commentCount || 0), 0)
  const totalReported = posts.filter(p => p.reports && p.reports.length > 0).length

  // 증감량 표시 컴포넌트
  const StatBadge = ({ count, type = 'success' }: { count: number, type?: 'success' | 'destructive' }) => {
    if (count === 0) return null;
    return (
      <span className={`text-xs ml-2 font-bold ${type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
        ({count > 0 ? '+' : ''}{count})
      </span>
    )
  }

  const renderDetailComments = () => {
    const rootComments = comments.filter(c => !c.parentCommentId)
    return rootComments.map(comment => {
      const replies = comments.filter(c => c.parentCommentId === comment._id)
      return (
        <div key={comment._id} className="mb-4">
          <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.authorName}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteComment(comment._id)}>
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          {replies.map(reply => (
            <div key={reply._id} className="ml-6 mt-2 bg-muted/50 p-3 rounded-lg flex justify-between items-start">
              <div className="flex-1 flex gap-2">
                <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{reply.authorName}</span>
                    <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteComment(reply._id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )
    })
  }

  const renderPostList = (postList: Post[]) => (
    <div className="space-y-4">
      {postList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {filterReported ? '신고된 게시글이 없습니다.' : '게시글이 없습니다.'}
        </div>
      ) : (
        postList.map((post) => (
          <div 
            key={post._id} 
            className={`p-4 border rounded-lg transition-colors cursor-pointer ${post.reports && post.reports.length > 0 ? 'bg-destructive/5 border-destructive/20' : 'hover:bg-muted/30'}`}
            onClick={() => openDetail(post)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{post.title}</h4>
                  {post.reports && post.reports.length > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 h-5">신고 {post.reports.length}</Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-normal">{new Date(post.createdAt).toLocaleDateString()}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{post.authorName}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes.length}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentCount}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                {post.reports && post.reports.length > 0 && (
                  <Button 
                    size="sm" 
                    className="bg-success hover:bg-success/90 text-success-foreground h-8 px-2"
                    onClick={(e) => handleResolveReport(e, post._id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> 해결
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 h-8 px-2" 
                  onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id); }}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> 삭제
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">익명 게시판 관리</h1>
          <p className="text-muted-foreground mt-1">커뮤니티 현황을 모니터링하고 부적절한 게시글을 관리하세요</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">꿀팁 게시글</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{posts.filter(p => p.category === 'tips').length}개</div>
              <StatBadge count={stats.tipsToday} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">건의사항</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{posts.filter(p => p.category === 'suggestions').length}개</div>
              <StatBadge count={stats.suggestionsToday} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">전체 댓글</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{totalComments}개</div>
              <StatBadge count={stats.commentsToday} />
            </div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-colors ${filterReported ? 'bg-destructive/10 border-destructive' : 'hover:bg-muted/50'}`}
          onClick={() => setFilterReported(!filterReported)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${totalReported > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
              관리 필요 (신고)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className={`text-2xl font-bold ${totalReported > 0 ? 'text-destructive' : ''}`}>
                {totalReported}건
              </div>
              <StatBadge count={stats.reportsToday} type="destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterReported ? '필터 해제하려면 클릭' : '신고된 글만 보려면 클릭'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="tips">꿀팁 게시판</TabsTrigger>
            <TabsTrigger value="suggestions">건의사항 게시판</TabsTrigger>
          </TabsList>
          {filterReported && (
            <Badge variant="destructive" className="flex gap-1">
              <Filter className="w-3 h-3" /> 신고된 글 필터링 중
            </Badge>
          )}
        </div>

        <TabsContent value="tips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>꿀팁 게시판 관리</CardTitle>
              <CardDescription>등록된 꿀팁 게시글 목록</CardDescription>
            </CardHeader>
            <CardContent>{renderPostList(tipsPosts)}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>건의사항 게시판 관리</CardTitle>
              <CardDescription>등록된 건의사항 게시글 목록</CardDescription>
            </CardHeader>
            <CardContent>{renderPostList(suggestionsPosts)}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 상세 보기 다이얼로그 (관리자용) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1 mt-4">
                  <Badge variant="outline">{selectedPost.category === 'tips' ? '꿀팁' : '건의사항'}</Badge>
                  <span className="text-sm text-muted-foreground">{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  {selectedPost.reports && selectedPost.reports.length > 0 && (
                    <Badge variant="destructive">신고됨</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>작성자: {selectedPost.authorName}</span>
                  <span>조회수: {selectedPost.views}</span>
                </div>
              </DialogHeader>
              
              <div className="py-4 space-y-6">
                <div className="whitespace-pre-line text-sm leading-relaxed p-4 bg-muted/10 rounded border">
                  {selectedPost.content}
                </div>

                <div className="flex justify-end gap-2">
                  {selectedPost.reports && selectedPost.reports.length > 0 && (
                    <Button className="bg-success text-success-foreground hover:bg-success/90" onClick={(e) => { handleResolveReport(e, selectedPost._id); setIsDetailOpen(false); }}>
                      <CheckCircle className="w-4 h-4 mr-2" /> 신고 해결 처리
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => handleDeletePost(selectedPost._id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> 게시글 삭제
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> 댓글 {comments.length}
                  </h3>
                  <div className="space-y-2">
                    {comments.length > 0 ? renderDetailComments() : <p className="text-center text-sm text-muted-foreground py-4">댓글이 없습니다.</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BoardManagement
"""

# 5. Frontend: Community.tsx (신고 데이터 구조 변경 대응)
frontend_community = """import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Search, 
  CornerDownRight, 
  AlertTriangle, 
  Edit, 
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface Comment {
  _id: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  authorId: string;
  authorName: string;
  likes: string[];
  createdAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: 'tips' | 'suggestions';
  authorId: string;
  authorName: string;
  views: number;
  likes: string[];
  reports?: { userId: string; createdAt: string }[]; // 변경됨
  createdAt: string;
  commentCount?: number;
}

const Community = () => {
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('tips')
  const [posts, setPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string>('')

  const [isWriteOpen, setIsWriteOpen] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [titleInput, setTitleInput] = useState('')
  const [contentInput, setContentInput] = useState('')

  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const payload = JSON.parse(jsonPayload)
        if (payload.userId) setCurrentUserId(payload.userId)
      } catch (e) { console.error(e) }
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts', {
        params: { category: activeTab, search: searchQuery }
      })
      setPosts(res.data)
    } catch (error) { console.error(error) }
  }

  useEffect(() => { fetchPosts() }, [activeTab])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchPosts()
  }

  const openWriteDialog = (post?: Post) => {
    if (post) {
      setEditingPostId(post._id)
      setTitleInput(post.title)
      setContentInput(post.content)
    } else {
      setEditingPostId(null)
      setTitleInput('')
      setContentInput('')
    }
    setIsWriteOpen(true)
  }

  const handleSavePost = async () => {
    if (!titleInput || !contentInput) return
    try {
      if (editingPostId) {
        await api.put(`/community/posts/${editingPostId}`, {
          title: titleInput,
          content: contentInput,
          category: activeTab
        })
        toast({ title: '수정 완료' })
      } else {
        await api.post('/community/posts', {
          title: titleInput,
          content: contentInput,
          category: activeTab
        })
        toast({ title: '등록 완료' })
      }
      setIsWriteOpen(false)
      fetchPosts()
      if (selectedPost && editingPostId === selectedPost._id) {
        const res = await api.get(`/community/posts/${selectedPost._id}`)
        setSelectedPost(res.data.post)
      }
    } catch (error) {
      toast({ title: '오류 발생', variant: 'destructive' })
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    try {
      await api.delete(`/community/posts/${postId}`)
      toast({ title: '삭제 완료' })
      setIsDetailOpen(false)
      fetchPosts()
    } catch (error) {
      toast({ title: '삭제 실패', variant: 'destructive' })
    }
  }

  const openDetail = async (post: Post) => {
    try {
      const res = await api.get(`/community/posts/${post._id}`)
      setSelectedPost(res.data.post)
      setComments(res.data.comments)
      setIsDetailOpen(true)
      fetchPosts() 
    } catch (error) { console.error(error) }
  }

  const handleCommentSubmit = async () => {
    if (!commentContent || !selectedPost) return
    try {
      await api.post('/community/comments', {
        postId: selectedPost._id,
        content: commentContent,
        parentCommentId: replyTargetId
      })
      setCommentContent('')
      setReplyTargetId(null)
      const res = await api.get(`/community/posts/${selectedPost._id}`)
      setComments(res.data.comments)
    } catch (error) {
      toast({ title: '댓글 등록 실패', variant: 'destructive' })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if(!confirm('댓글을 삭제하시겠습니까?')) return
    try {
      await api.delete(`/community/comments/${commentId}`)
      if (selectedPost) {
        const res = await api.get(`/community/posts/${selectedPost._id}`)
        setComments(res.data.comments)
      }
    } catch (error) {
      toast({ title: '삭제 실패', variant: 'destructive' })
    }
  }

  const handlePostLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation()
    try {
      const res = await api.put(`/community/posts/${postId}/like`)
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p))
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost({ ...selectedPost, likes: res.data.likes })
      }
    } catch (error) { toast({ title: '오류', variant: 'destructive' }) }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const res = await api.put(`/community/comments/${commentId}/like`)
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, likes: res.data.likes } : c))
    } catch (error) { console.error(error) }
  }

  // 신고 토글 (객체 배열 대응)
  const handleReport = async (postId: string) => {
    if(!confirm('이 게시글을 신고하시겠습니까?')) return
    try {
      await api.put(`/community/posts/${postId}/report`)
      toast({ title: '처리 완료', description: '신고 상태가 변경되었습니다.' })
      fetchPosts()
      if (selectedPost) {
        const res = await api.get(`/community/posts/${postId}`)
        setSelectedPost(res.data.post)
      }
    } catch (error) {
      toast({ title: '오류', variant: 'destructive' })
    }
  }

  const renderComments = () => {
    const rootComments = comments.filter(c => !c.parentCommentId)
    return rootComments.map(comment => {
      const replies = comments.filter(c => c.parentCommentId === comment._id)
      const isLiked = comment.likes.includes(currentUserId)
      const isMyComment = comment.authorId === currentUserId

      return (
        <div key={comment._id} className="mb-4">
          <div className="bg-muted/30 p-3 rounded-lg group relative">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">{comment.authorName} {isMyComment && '(나)'}</span>
              <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <div className="flex items-center gap-3 text-xs">
              <button onClick={() => handleCommentLike(comment._id)} className={`flex items-center gap-1 ${isLiked ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                <ThumbsUp className="w-3 h-3" /> {comment.likes.length}
              </button>
              <button onClick={() => setReplyTargetId(replyTargetId === comment._id ? null : comment._id)} className="text-muted-foreground hover:text-foreground">
                대댓글
              </button>
              {isMyComment && (
                <button onClick={() => handleDeleteComment(comment._id)} className="text-destructive hover:underline ml-auto">
                  삭제
                </button>
              )}
            </div>
          </div>

          {replyTargetId === comment._id && (
            <div className="ml-6 mt-2 flex gap-2">
              <CornerDownRight className="w-4 h-4 text-muted-foreground mt-2" />
              <div className="flex-1 flex gap-2">
                <Input value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="답글 입력..." className="h-8 text-sm" />
                <Button size="sm" onClick={handleCommentSubmit}>등록</Button>
              </div>
            </div>
          )}

          {replies.map(reply => {
            const isReplyLiked = reply.likes.includes(currentUserId)
            const isMyReply = reply.authorId === currentUserId
            return (
              <div key={reply._id} className="ml-6 mt-2 bg-muted/50 p-3 rounded-lg relative">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">{reply.authorName} {isMyReply && '(나)'}</span>
                  <span className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm mb-2">{reply.content}</p>
                <div className="flex items-center gap-3 text-xs">
                  <button onClick={() => handleCommentLike(reply._id)} className={`flex items-center gap-1 ${isReplyLiked ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                    <ThumbsUp className="w-3 h-3" /> {reply.likes.length}
                  </button>
                  {isMyReply && (
                    <button onClick={() => handleDeleteComment(reply._id)} className="text-destructive hover:underline ml-auto">
                      삭제
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )
    })
  }

  // 신고 여부 확인 (객체 배열에서 userId 검색)
  const isReported = selectedPost?.reports?.some(r => r.userId === currentUserId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">익명 커뮤니티</h1>
          <p className="text-muted-foreground mt-1">자유롭게 소통하고 건의하는 공간입니다 (100% 익명 보장)</p>
        </div>
        <Button onClick={() => openWriteDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 글쓰기
        </Button>

        <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPostId ? '게시글 수정' : '게시글 작성'}</DialogTitle>
              <DialogDescription>작성된 글은 익명으로 게시됩니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>카테고리</Label>
                <div className="flex gap-2">
                  <Badge variant={activeTab === 'tips' ? 'default' : 'outline'}>
                    {activeTab === 'tips' ? '꿀팁' : '건의사항'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>제목</Label>
                <Input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea value={contentInput} onChange={(e) => setContentInput(e.target.value)} rows={5} />
              </div>
              <Button onClick={handleSavePost} className="w-full">{editingPostId ? '수정하기' : '등록하기'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="shrink-0">
            <TabsTrigger value="tips">꿀팁</TabsTrigger>
            <TabsTrigger value="suggestions">건의사항</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSearch} className="relative flex-1 md:flex-none">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 w-full md:w-[250px] h-9" />
          </form>
        </div>

        <TabsContent value={activeTab} className="space-y-3">
          {posts.map((post) => {
            const isLiked = post.likes.includes(currentUserId)
            const isMyPost = post.authorId === currentUserId
            
            return (
              <Card key={post._id} className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => openDetail(post)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm md:text-base">{post.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</Badge>
                      {isMyPost && <Badge variant="outline" className="text-xs border-primary text-primary">내글</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className={`flex items-center gap-1 ${isLiked ? 'text-primary font-bold' : ''}`}>
                      <ThumbsUp className={`w-3 h-3 ${isLiked ? 'fill-primary' : ''}`} /> {post.likes.length}
                    </div>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.commentCount || 0}</span>
                    <span>{post.authorName}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {posts.length === 0 && <div className="text-center py-10 text-muted-foreground">게시글이 없습니다.</div>}
        </TabsContent>
      </Tabs>

      {/* 상세 보기 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{selectedPost.category === 'tips' ? '꿀팁' : '건의사항'}</Badge>
                    <span className="text-sm text-muted-foreground">{new Date(selectedPost.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <DialogTitle className="text-xl">{selectedPost.title}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>작성자: {selectedPost.authorName} {selectedPost.authorId === currentUserId && '(나)'}</span>
                  <span>조회수: {selectedPost.views}</span>
                </div>
              </DialogHeader>
              
              <div className="py-4 space-y-6">
                <div className="whitespace-pre-line text-sm leading-relaxed min-h-[100px]">
                  {selectedPost.content}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Button 
                    variant={selectedPost.likes.includes(currentUserId) ? "default" : "outline"}
                    className="gap-2"
                    onClick={(e) => handlePostLike(e, selectedPost._id)}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {selectedPost.likes.includes(currentUserId) ? '좋아요 취소' : '좋아요'} ({selectedPost.likes.length})
                  </Button>

                  <div className="flex gap-2">
                    {selectedPost.authorId === currentUserId ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => { setIsDetailOpen(false); openWriteDialog(selectedPost); }}>
                          <Edit className="w-4 h-4 mr-2" /> 수정
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeletePost(selectedPost._id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> 삭제
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReport(selectedPost._id)}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" /> 
                        {isReported ? '신고 취소' : '신고하기'}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> 댓글 {comments.length}
                  </h3>
                  <div className="space-y-2 mb-6">
                    {comments.length > 0 ? renderComments() : <p className="text-center text-sm text-muted-foreground py-4">첫 댓글을 남겨보세요!</p>}
                  </div>
                  {!replyTargetId && (
                    <div className="flex gap-2">
                      <Input value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="댓글 입력..." onKeyDown={(e) => { if(e.key === 'Enter') handleCommentSubmit() }} />
                      <Button onClick={handleCommentSubmit}>등록</Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Community
"""

# 파일 덮어쓰기 실행
create_file('server/src/models/Post.ts', post_model)
create_file('server/src/controllers/communityController.ts', community_controller)
create_file('server/src/routes/communityRoutes.ts', community_routes)
create_file('src/pages/owner/BoardManagement.tsx', board_management)
create_file('src/pages/common/Community.tsx', frontend_community)

print("Board Statistics updated successfully!")