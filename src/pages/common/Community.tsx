import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  _id: string
  postId: string
  parentCommentId: string | null
  content: string
  authorId: string
  authorName: string
  likes: string[]
  createdAt: string
}

interface Post {
  _id: string
  title: string
  content: string
  category: 'tips' | 'suggestions'
  authorId: string
  authorName: string
  views: number
  likes: string[]
  reports?: { userId: string; createdAt: string }[] // 변경됨
  createdAt: string
  commentCount?: number
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
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join('')
        )
        const payload = JSON.parse(jsonPayload)
        if (payload.userId) setCurrentUserId(payload.userId)
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await api.get('/community/posts', {
        params: { category: activeTab, search: searchQuery },
      })
      setPosts(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [activeTab])

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
          category: activeTab,
        })
        toast({ title: '수정 완료' })
      } else {
        await api.post('/community/posts', {
          title: titleInput,
          content: contentInput,
          category: activeTab,
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
    } catch (error) {
      console.error(error)
    }
  }

  const handleCommentSubmit = async () => {
    if (!commentContent || !selectedPost) return
    try {
      await api.post('/community/comments', {
        postId: selectedPost._id,
        content: commentContent,
        parentCommentId: replyTargetId,
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

  const handlePostLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation()
    try {
      const res = await api.put(`/community/posts/${postId}/like`)
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        )
      )
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost({ ...selectedPost, likes: res.data.likes })
      }
    } catch (error) {
      toast({ title: '오류', variant: 'destructive' })
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const res = await api.put(`/community/comments/${commentId}/like`)
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, likes: res.data.likes } : c
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  // 신고 토글 (객체 배열 대응)
  const handleReport = async (postId: string) => {
    if (!confirm('이 게시글을 신고하시겠습니까?')) return
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
    const rootComments = comments.filter((c) => !c.parentCommentId)
    return rootComments.map((comment) => {
      const replies = comments.filter((c) => c.parentCommentId === comment._id)
      const isLiked = comment.likes.includes(currentUserId)
      const isMyComment = comment.authorId === currentUserId

      return (
        <div key={comment._id} className="mb-4">
          <div className="bg-muted/30 p-3 rounded-lg group relative">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-sm">
                {comment.authorName} {isMyComment && '(나)'}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => handleCommentLike(comment._id)}
                className={`flex items-center gap-1 ${
                  isLiked ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}
              >
                <ThumbsUp className="w-3 h-3" /> {comment.likes.length}
              </button>
              <button
                onClick={() =>
                  setReplyTargetId(
                    replyTargetId === comment._id ? null : comment._id
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                대댓글
              </button>
              {isMyComment && (
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-destructive hover:underline ml-auto"
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          {replyTargetId === comment._id && (
            <div className="ml-6 mt-2 flex gap-2">
              <CornerDownRight className="w-4 h-4 text-muted-foreground mt-2" />
              <div className="flex-1 flex gap-2">
                <Input
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="답글 입력..."
                  className="h-8 text-sm"
                />
                <Button size="sm" onClick={handleCommentSubmit}>
                  등록
                </Button>
              </div>
            </div>
          )}

          {replies.map((reply) => {
            const isReplyLiked = reply.likes.includes(currentUserId)
            const isMyReply = reply.authorId === currentUserId
            return (
              <div
                key={reply._id}
                className="ml-6 mt-2 bg-muted/50 p-3 rounded-lg relative"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm">
                    {reply.authorName} {isMyReply && '(나)'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mb-2">{reply.content}</p>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={() => handleCommentLike(reply._id)}
                    className={`flex items-center gap-1 ${
                      isReplyLiked
                        ? 'text-primary font-bold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" /> {reply.likes.length}
                  </button>
                  {isMyReply && (
                    <button
                      onClick={() => handleDeleteComment(reply._id)}
                      className="text-destructive hover:underline ml-auto"
                    >
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
  const isReported = selectedPost?.reports?.some(
    (r) => r.userId === currentUserId
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">익명 커뮤니티</h1>
          <p className="text-muted-foreground mt-1">
            자유롭게 소통하고 건의하는 공간입니다 (100% 익명 보장)
          </p>
        </div>
        <Button onClick={() => openWriteDialog()}>
          <Plus className="w-4 h-4 mr-2" /> 글쓰기
        </Button>

        <Dialog open={isWriteOpen} onOpenChange={setIsWriteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPostId ? '게시글 수정' : '게시글 작성'}
              </DialogTitle>
              <DialogDescription>
                작성된 글은 익명으로 게시됩니다.
              </DialogDescription>
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
                <Input
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea
                  value={contentInput}
                  onChange={(e) => setContentInput(e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={handleSavePost} className="w-full">
                {editingPostId ? '수정하기' : '등록하기'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between gap-4">
          <TabsList className="shrink-0">
            <TabsTrigger value="tips">꿀팁</TabsTrigger>
            <TabsTrigger value="suggestions">건의사항</TabsTrigger>
          </TabsList>
          <form
            onSubmit={handleSearch}
            className="relative flex-1 md:flex-none"
          >
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-full md:w-[250px] h-9"
            />
          </form>
        </div>

        <TabsContent value={activeTab} className="space-y-3">
          {posts.map((post) => {
            const isLiked = post.likes.includes(currentUserId)
            const isMyPost = post.authorId === currentUserId

            return (
              <Card
                key={post._id}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => openDetail(post)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-sm md:text-base">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Badge>
                      {isMyPost && (
                        <Badge
                          variant="outline"
                          className="text-xs border-primary text-primary"
                        >
                          내글
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {post.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div
                      className={`flex items-center gap-1 ${
                        isLiked ? 'text-primary font-bold' : ''
                      }`}
                    >
                      <ThumbsUp
                        className={`w-3 h-3 ${isLiked ? 'fill-primary' : ''}`}
                      />{' '}
                      {post.likes.length}
                    </div>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />{' '}
                      {post.commentCount || 0}
                    </span>
                    <span>{post.authorName}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
          {posts.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              게시글이 없습니다.
            </div>
          )}
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
                    <Badge variant="outline">
                      {selectedPost.category === 'tips' ? '꿀팁' : '건의사항'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedPost.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <DialogTitle className="text-xl">
                  {selectedPost.title}
                </DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span>
                    작성자: {selectedPost.authorName}{' '}
                    {selectedPost.authorId === currentUserId && '(나)'}
                  </span>
                  <span>조회수: {selectedPost.views}</span>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-6">
                <div className="whitespace-pre-line text-sm leading-relaxed min-h-[100px]">
                  {selectedPost.content}
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant={
                      selectedPost.likes.includes(currentUserId)
                        ? 'default'
                        : 'outline'
                    }
                    className="gap-2"
                    onClick={(e) => handlePostLike(e, selectedPost._id)}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {selectedPost.likes.includes(currentUserId)
                      ? '좋아요 취소'
                      : '좋아요'}{' '}
                    ({selectedPost.likes.length})
                  </Button>

                  <div className="flex gap-2">
                    {selectedPost.authorId === currentUserId ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsDetailOpen(false)
                            openWriteDialog(selectedPost)
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> 수정
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(selectedPost._id)}
                        >
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
                    {comments.length > 0 ? (
                      renderComments()
                    ) : (
                      <p className="text-center text-sm text-muted-foreground py-4">
                        첫 댓글을 남겨보세요!
                      </p>
                    )}
                  </div>
                  {!replyTargetId && (
                    <div className="flex gap-2">
                      <Input
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="댓글 입력..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCommentSubmit()
                        }}
                      />
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
