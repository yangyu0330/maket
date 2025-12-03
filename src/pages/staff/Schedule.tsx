import { useState } from 'react'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  UserCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 테스트용 데이터 - 백엔드 연동 시 API로 대체 예정
const mySchedule = [
  { date: '2024-01-15', shift: '14:00 - 22:00', hours: 8, status: 'completed' },
  { date: '2024-01-16', shift: '14:00 - 22:00', hours: 8, status: 'today' },
  { date: '2024-01-17', shift: '휴무', hours: 0, status: 'off' },
  { date: '2024-01-18', shift: '06:00 - 14:00', hours: 8, status: 'upcoming' },
  { date: '2024-01-19', shift: '14:00 - 22:00', hours: 8, status: 'upcoming' },
  { date: '2024-01-20', shift: '22:00 - 06:00', hours: 8, status: 'upcoming' },
]

const substituteRequests = [
  {
    id: 1,
    date: '2024-01-22',
    shift: '06:00 - 14:00',
    requester: '김알바',
    reason: '병원 예약',
    posted: '2시간 전',
  },
  {
    id: 2,
    date: '2024-01-25',
    shift: '14:00 - 22:00',
    requester: '박알바',
    reason: '개인 사정',
    posted: '1일 전',
  },
]

const Schedule = () => {
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [substituteDate, setSubstituteDate] = useState('')
  const [substituteReason, setSubstituteReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleRequestSubstitute = () => {
    // 백엔드 API 연동 예정
    if (!substituteDate || !substituteReason) {
      toast({
        title: '입력 오류',
        description: '날짜와 사유를 모두 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: '대타 요청 완료',
      description: '다른 근무자들에게 알림이 전송되었습니다.',
    })
    setSubstituteDate('')
    setSubstituteReason('')
    setIsDialogOpen(false)
  }

  const handleAcceptSubstitute = (requestId: number) => {
    // 백엔드 API 연동 예정
    toast({
      title: '대타 신청 완료',
      description: '사장님의 승인 대기 중입니다.',
    })
  }

  const weeklyHours = mySchedule.reduce((acc, day) => acc + day.hours, 0)
  const upcomingShifts = mySchedule.filter(
    (day) => day.status === 'upcoming'
  ).length

  return (
    <div className="space-y-6">
      {/* ======= 3.d) 근무 스케줄 - 나의 달력, 대타요청 등록폼, 신청가능 대타 조회 ======= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">근무 스케줄</h1>
          <p className="text-muted-foreground mt-1">
            나의 근무 일정을 확인하고 대타를 관리하세요
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              대타 요청
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>대타 근무 요청</DialogTitle>
              {/* ======= 3.d-2) 대타 근무 요청 등록 폼 ======= */}
              <DialogDescription>
                대타가 필요한 날짜와 사유를 입력하세요
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={substituteDate}
                  onChange={(e) => setSubstituteDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">사유</Label>
                <Textarea
                  id="reason"
                  placeholder="대타 사유를 입력하세요..."
                  value={substituteReason}
                  onChange={(e) => setSubstituteReason(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleRequestSubstitute} className="w-full">
                대타 요청하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              이번 주 근무
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyHours}시간</div>
            <p className="text-xs text-muted-foreground">
              총 {mySchedule.length}일
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              다가오는 근무
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingShifts}일</div>
            <p className="text-xs text-muted-foreground">이번 주 남은 근무</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              대타 가능
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {substituteRequests.length}건
            </div>
            <p className="text-xs text-muted-foreground">신청 가능한 대타</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ======= 3.d-1) 나의 근무 스케줄 달력 ======= */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>나의 근무 스케줄</CardTitle>
              <CardDescription>이번 주 근무 일정</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mySchedule.map((day, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      day.status === 'today'
                        ? 'bg-primary/10 border-primary'
                        : day.status === 'off'
                        ? 'bg-muted'
                        : day.status === 'completed'
                        ? 'bg-muted/50'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{day.date}</p>
                          <p className="text-sm text-muted-foreground">
                            {day.shift}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {day.status === 'today' && (
                          <Badge className="bg-primary">오늘</Badge>
                        )}
                        {day.status === 'off' && (
                          <Badge variant="outline">휴무</Badge>
                        )}
                        {day.status === 'completed' && (
                          <Badge
                            variant="outline"
                            className="border-success text-success"
                          >
                            완료
                          </Badge>
                        )}
                        {day.hours > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {day.hours}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>달력 보기</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>
        </div>

        {/* ======= 3.d-3) 신청 가능 대타 목록 조회 ======= */}
        <Card>
          <CardHeader>
            <CardTitle>신청 가능한 대타 목록</CardTitle>
            <CardDescription>다른 근무자들의 대타 요청</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {substituteRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{request.requester}</h4>
                        <Badge variant="outline" className="text-xs">
                          {request.posted}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.date} • {request.shift}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        사유: {request.reason}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleAcceptSubstitute(request.id)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    대타 신청하기
                  </Button>
                </div>
              ))}

              {substituteRequests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>현재 신청 가능한 대타가 없습니다</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Schedule
