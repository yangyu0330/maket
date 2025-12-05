import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  CornerDownRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface Comment {
  _id: string
  postId: string
  parentCommentId: string | null
  content: string
  authorName: string
  createdAt: string
}

interface Post {
  _id: string
  title: string
  content: string
  category: 'tips' | 'suggestions'
  authorName: string
  views: number
  likes: string[]
  reports?: { userId: string; createdAt: string }[] // 변경: 객체 배열
  createdAt: string
  commentCount: number
}

interface Stats {
  tipsToday: number
  suggestionsToday: number
  commentsToday: number
  reportsToday: number
}

const BoardManagement = () => {
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('tips')
  const [posts, setPosts] = useState<Post[]>([])
  const [stats, setStats] = useState<Stats>({
    tipsToday: 0,
    suggestionsToday: 0,
    commentsToday: 0,
    reportsToday: 0,
  })
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

  useEffect(() => {
    fetchData()
  }, [])

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
    } catch (error) {
      console.error(error)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return
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
    let filtered = posts.filter((p) => p.category === category)
    if (filterReported) {
      filtered = filtered.filter((p) => p.reports && p.reports.length > 0)
    }
    return filtered
  }

  const tipsPosts = getFilteredPosts('tips')
  const suggestionsPosts = getFilteredPosts('suggestions')

  const totalComments = posts.reduce(
    (acc, curr) => acc + (curr.commentCount || 0),
    0
  )
  const totalReported = posts.filter(
    (p) => p.reports && p.reports.length > 0
  ).length

  // 증감량 표시 컴포넌트
  const StatBadge = ({
    count,
    type = 'success',
  }: {
    count: number
    type?: 'success' | 'destructive'
  }) => {
    if (count === 0) return null
    return (
      <span
        className={`text-xs ml-2 font-bold ${
          type === 'success' ? 'text-green-600' : 'text-red-500'
        }`}
      >
        ({count > 0 ? '+' : ''}
        {count})
      </span>
    )
  }

  const renderDetailComments = () => {
    const rootComments = comments.filter((c) => !c.parentCommentId)
    return rootComments.map((comment) => {
      const replies = comments.filter((c) => c.parentCommentId === comment._id)
      return (
        <div key={comment._id} className="mb-4">
          <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {comment.authorName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.content}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive"
              onClick={() => handleDeleteComment(comment._id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          {replies.map((reply) => (
            <div
              key={reply._id}
              className="ml-6 mt-2 bg-muted/50 p-3 rounded-lg flex justify-between items-start"
            >
              <div className="flex-1 flex gap-2">
                <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      {reply.authorName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{reply.content}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-destructive"
                onClick={() => handleDeleteComment(reply._id)}
              >
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
            className={`p-4 border rounded-lg transition-colors cursor-pointer ${
              post.reports && post.reports.length > 0
                ? 'bg-destructive/5 border-destructive/20'
                : 'hover:bg-muted/30'
            }`}
            onClick={() => openDetail(post)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{post.title}</h4>
                  {post.reports && post.reports.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 h-5"
                    >
                      신고 {post.reports.length}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-normal">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{post.authorName}</span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" /> {post.likes.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {post.commentCount}
                  </span>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePost(post._id)
                  }}
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
          <p className="text-muted-foreground mt-1">
            커뮤니티 현황을 모니터링하고 부적절한 게시글을 관리하세요
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">꿀팁 게시글</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">
                {posts.filter((p) => p.category === 'tips').length}개
              </div>
              <StatBadge count={stats.tipsToday} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">건의사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">
                {posts.filter((p) => p.category === 'suggestions').length}개
              </div>
              <StatBadge count={stats.suggestionsToday} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">전체 댓글</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div className="text-2xl font-bold">{totalComments}개</div>
              <StatBadge count={stats.commentsToday} />
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${
            filterReported
              ? 'bg-destructive/10 border-destructive'
              : 'hover:bg-muted/50'
          }`}
          onClick={() => setFilterReported(!filterReported)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle
                className={`w-4 h-4 ${
                  totalReported > 0
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              />
              관리 필요 (신고)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <div
                className={`text-2xl font-bold ${
                  totalReported > 0 ? 'text-destructive' : ''
                }`}
              >
                {totalReported}건
              </div>
              <StatBadge count={stats.reportsToday} type="destructive" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filterReported
                ? '필터 해제하려면 클릭'
                : '신고된 글만 보려면 클릭'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
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
                  <Badge variant="outline">
                    {selectedPost.category === 'tips' ? '꿀팁' : '건의사항'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedPost.createdAt).toLocaleString()}
                  </span>
                  {selectedPost.reports && selectedPost.reports.length > 0 && (
                    <Badge variant="destructive">신고됨</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">
                  {selectedPost.title}
                </DialogTitle>
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
                    <Button
                      className="bg-success text-success-foreground hover:bg-success/90"
                      onClick={(e) => {
                        handleResolveReport(e, selectedPost._id)
                        setIsDetailOpen(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> 신고 해결 처리
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => handleDeletePost(selectedPost._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> 게시글 삭제
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> 댓글 {comments.length}
                  </h3>
                  <div className="space-y-2">
                    {comments.length > 0 ? (
                      renderDetailComments()
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        댓글이 없습니다.
                      </p>
                    )}
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
