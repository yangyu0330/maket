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
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import {
  Users,
  UserPlus,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 테스트용 데이터 - 백엔드 연동 시 API로 대체 예정
const mockStaff = [
  {
    id: 1,
    name: '김알바',
    phone: '010-1234-5678',
    joinDate: '2024-01-01',
    weeklyHours: 40,
    status: 'active',
  },
  {
    id: 2,
    name: '이알바',
    phone: '010-2345-6789',
    joinDate: '2024-01-15',
    weeklyHours: 32,
    status: 'active',
  },
  {
    id: 3,
    name: '박알바',
    phone: '010-3456-7890',
    joinDate: '2023-12-01',
    weeklyHours: 24,
    status: 'active',
  },
]

const mockSubstituteRequests = [
  {
    id: 1,
    requester: '김알바',
    date: '2024-01-20',
    shift: '14:00-22:00',
    reason: '개인 사정',
    status: '대기',
  },
  {
    id: 2,
    requester: '이알바',
    date: '2024-01-22',
    shift: '06:00-14:00',
    reason: '병원 예약',
    status: '대기',
  },
]

const weekSchedule = [
  {
    day: '월요일',
    shifts: [
      { time: '06:00-14:00', staff: '김알바' },
      { time: '14:00-22:00', staff: '이알바' },
      { time: '22:00-06:00', staff: '박알바' },
    ],
  },
  {
    day: '화요일',
    shifts: [
      { time: '06:00-14:00', staff: '이알바' },
      { time: '14:00-22:00', staff: '박알바' },
      { time: '22:00-06:00', staff: '김알바' },
    ],
  },
  // 더 많은 요일...
]

const StaffManagement = () => {
  const { toast } = useToast()
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const handleAddStaff = () => {
    // 백엔드 API 연동 - 자동으로 ID/비밀번호 생성 예정
    const randomPassword = Math.floor(100000 + Math.random() * 900000)

    toast({
      title: '근무자 추가 완료',
      description: `아이디: ${newStaffName}, 임시 비밀번호: ${randomPassword}`,
      duration: 10000,
    })

    setNewStaffName('')
    setNewStaffPhone('')
    setIsAddDialogOpen(false)
  }

  const handleSubstituteApproval = (requestId: number, approve: boolean) => {
    // 백엔드 API 연동 예정
    toast({
      title: approve ? '대타 요청 승인' : '대타 요청 거절',
      description: `대타 요청이 ${approve ? '승인' : '거절'}되었습니다.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* ======= 2.c) 근무자 관리 - 명단/연락처, 시간표(생성/수정/배포), 대타요청 승인, 신규근무자추가 ======= */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">근무자 관리</h1>
          <p className="text-muted-foreground mt-1">
            근무자 정보와 스케줄을 관리하세요
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              근무자 추가
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 근무자 추가</DialogTitle>
              {/* ======= 2.c-4) 신규 근무자 추가 (아이디=이름, 비밀번호=무작위숫자 자동생성 후 DB저장) ======= */}
              <DialogDescription>
                근무자 정보를 입력하면 자동으로 아이디와 임시 비밀번호가
                생성됩니다.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  placeholder="이름을 입력하세요"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  placeholder="010-0000-0000"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                />
              </div>
              <Button onClick={handleAddStaff} className="w-full">
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">근무자 명단</TabsTrigger>
          <TabsTrigger value="schedule">근무 시간표</TabsTrigger>
          <TabsTrigger value="substitute">대타 요청</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* ======= 2.c-1) 근무자 명단 및 연락처 ======= */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  전체 근무자
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStaff.length}명</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  평균 근무시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">32시간/주</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  활성 근무자
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {mockStaff.length}명
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>근무자 명단</CardTitle>
              <CardDescription>전체 근무자 정보</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockStaff.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{staff.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {staff.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          주당 근무
                        </p>
                        <p className="font-medium">{staff.weeklyHours}시간</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">입사일</p>
                        <p className="font-medium">{staff.joinDate}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-success text-success"
                      >
                        활성
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {/* ======= 2.c-2,3) 월별 근무 시간표(생성/수정/배포), 대타 요청 확인 및 승인 ======= */}
                <span>주간 근무 시간표</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    수정
                  </Button>
                  <Button size="sm">배포</Button>
                </div>
              </CardTitle>
              <CardDescription>이번 주 근무 스케줄</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weekSchedule.map((day, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{day.day}</h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      {day.shifts.map((shift, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-3 bg-secondary rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{shift.time}</p>
                            <p className="text-xs text-muted-foreground">
                              {shift.staff}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="substitute" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>대타 요청 목록</CardTitle>
              {/* ======= 2.c-3) 대타 요청 확인 및 승인 ======= */}
              <CardDescription>승인이 필요한 대타 요청</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockSubstituteRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{request.requester}</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.date} • {request.shift}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        사유: {request.reason}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {request.status === '대기' ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSubstituteApproval(request.id, true)
                            }
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleSubstituteApproval(request.id, false)
                            }
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            거절
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline">처리됨</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StaffManagement
