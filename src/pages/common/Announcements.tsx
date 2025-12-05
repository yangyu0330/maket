import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Bell, Pin, Eye, ThumbsUp } from 'lucide-react'
import api from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface Announcement {
  _id: string
  title: string
  content: string
  author: string
  important: boolean
  views: number
  likes: string[]
  createdAt: string
}

const Announcements = () => {
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // 토큰에서 UserID 추출
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // JWT Payload 디코딩 (라이브러리 없이 base64 decode)
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
        if (payload.userId) {
          setCurrentUserId(payload.userId)
        }
      } catch (e) {
        console.error('Token decode error', e)
      }
    }
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements/list')
      setAnnouncements(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // 조회수 증가
  const handleView = async (id: string) => {
    try {
      await api.put(`/announcements/${id}/view`)
      fetchAnnouncements()
    } catch (error) {
      console.error(error)
    }
  }

  // 좋아요 토글
  const handleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.put(`/announcements/${id}/like`)
      await fetchAnnouncements() // 최신 상태 반영
    } catch (error: any) {
      toast({
        title: '오류',
        description: '로그인이 필요하거나 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">공지사항</h1>
        <p className="text-muted-foreground mt-1">
          매장 운영 관련 주요 소식을 확인하세요
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            공지 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {announcements.map((item) => {
              const isLiked = item.likes.includes(currentUserId)

              return (
                <AccordionItem key={item._id} value={item._id}>
                  <AccordionTrigger
                    className="hover:no-underline"
                    onClick={() => handleView(item._id)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-2 text-left w-full pr-4">
                      <div className="flex items-center gap-2">
                        {item.important && (
                          <Pin className="w-4 h-4 text-warning fill-warning" />
                        )}
                        <span
                          className={
                            item.important
                              ? 'font-bold text-foreground'
                              : 'font-medium text-muted-foreground'
                          }
                        >
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 md:ml-auto text-xs font-normal text-muted-foreground">
                        <Badge variant="outline">{item.author}</Badge>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.views}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            isLiked ? 'text-primary font-bold' : ''
                          }`}
                        >
                          <ThumbsUp
                            className={`w-3 h-3 ${
                              isLiked ? 'fill-primary' : ''
                            }`}
                          />
                          {item.likes.length}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm whitespace-pre-line p-4 bg-muted/30 rounded-md">
                    <div className="mb-4">{item.content}</div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant={isLiked ? 'default' : 'outline'}
                        className="gap-2"
                        onClick={(e) => handleLike(item._id, e)}
                      >
                        <ThumbsUp
                          className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`}
                        />
                        {isLiked ? '좋아요 취소' : '좋아요'} (
                        {item.likes.length})
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
            {announcements.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                등록된 공지사항이 없습니다.
              </div>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

export default Announcements
