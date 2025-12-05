import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Bell, Plus, Edit, Trash2, Eye, ThumbsUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface Announcement {
  _id: string
  title: string
  content: string
  date: string
  important: boolean
  views: number
  likes: string[]
  createdAt: string
}

const AnnouncementManagement = () => {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null) // null이면 생성 모드, ID가 있으면 수정 모드

  // Form State
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isImportant, setIsImportant] = useState(false)

  // 데이터 불러오기
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/list')
      setAnnouncements(res.data)
    } catch (error) {
      console.error(error)
      toast({
        title: '로드 실패',
        description: '공지사항 목록을 불러오지 못했습니다.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // 다이얼로그 열기 (생성/수정 분기)
  const openDialog = (announcement?: Announcement) => {
    if (announcement) {
      // 수정 모드
      setEditingId(announcement._id)
      setTitle(announcement.title)
      setContent(announcement.content)
      setIsImportant(announcement.important)
    } else {
      // 생성 모드
      setEditingId(null)
      setTitle('')
      setContent('')
      setIsImportant(false)
    }
    setIsDialogOpen(true)
  }

  // 저장 (생성 또는 수정)
  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: '입력 오류',
        description: '제목과 내용을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    try {
      if (editingId) {
        // 수정 API 호출
        await api.put(`/announcements/${editingId}`, {
          title,
          content,
          important: isImportant,
        })
        toast({ title: '수정 완료', description: '공지사항이 수정되었습니다.' })
      } else {
        // 생성 API 호출
        await api.post('/announcements/create', {
          title,
          content,
          important: isImportant,
        })
        toast({
          title: '등록 완료',
          description: '새로운 공지사항이 등록되었습니다.',
        })
      }

      // 초기화 및 닫기
      setIsDialogOpen(false)
      fetchAnnouncements()
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '작업을 완료하지 못했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 공지사항 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await api.delete(`/announcements/${id}`)
      toast({ title: '삭제 완료', description: '공지사항이 삭제되었습니다.' })
      fetchAnnouncements()
    } catch (error) {
      toast({ title: '삭제 실패', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground mt-1">
            공지사항을 작성, 수정 및 관리하세요
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          공지 작성
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? '공지사항 수정' : '새 공지사항 작성'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? '내용을 수정합니다.'
                  : '전체 직원에게 전달할 공지사항을 작성하세요.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="공지사항 제목"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="공지사항 내용을 입력하세요..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="important"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <Label htmlFor="important" className="cursor-pointer">
                  중요 공지로 표시 (상단 고정)
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleSave}>
                {editingId ? '수정 저장' : '등록'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 카드 (생략 가능하나 유지) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              전체 공지
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements.length}개</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">중요 공지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {announcements.filter((a) => a.important).length}개
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              평균 조회수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.length > 0
                ? Math.round(
                    announcements.reduce((acc, a) => acc + a.views, 0) /
                      announcements.length
                  )
                : 0}
              회
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 공지사항 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>공지사항 목록</CardTitle>
          <CardDescription>작성된 전체 공지사항</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{announcement.title}</h4>
                      {announcement.important && (
                        <Badge
                          variant="outline"
                          className="border-warning text-warning"
                        >
                          중요
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line line-clamp-2">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {announcement.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {announcement.likes.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(announcement)} // 수정 모드로 열기
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(announcement._id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnnouncementManagement
