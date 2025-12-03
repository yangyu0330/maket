import { useEffect, useState } from 'react'
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
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

// ===== 실제 API 데이터 타입 =====
interface Staff {
  _id: string
  name: string
  phone: string
  username: string
  rawPassword?: string
  joinDate?: string
  status?: string
}

interface AddStaffResponse {
  message: string
  username: string
  password: string
}

// ===== mock: 대타 요청 =====
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

// ===== mock: 시간표 =====
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
]

const StaffManagement = () => {
  const { toast } = useToast()

  const [staffList, setStaffList] = useState<Staff[]>([])
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffPhone, setNewStaffPhone] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // ===== 직원 목록 불러오기 =====
  const fetchStaff = async () => {
    try {
      const res = await api.get<Staff[]>('/staff/list')
      setStaffList(res.data)
    } catch {
      toast({
        title: '오류',
        description: '근무자 목록을 불러오지 못했습니다.',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // ===== 직원 추가 =====
  const handleAddStaff = async () => {
    try {
      const res = await api.post<AddStaffResponse>('/staff/add', {
        name: newStaffName,
        phone: newStaffPhone,
      })

      toast({
        title: '근무자 추가 완료',
        description: `ID: ${res.data.username}\nPW: ${res.data.password}`,
        duration: 8000,
      })

      setNewStaffName('')
      setNewStaffPhone('')
      setIsAddDialogOpen(false)
      fetchStaff()
    } catch {
      toast({
        title: '추가 실패',
        description: '근무자 추가 중 오류 발생',
        variant: 'destructive',
      })
    }
  }

  // ===== 직원 삭제 =====
  const handleDeleteStaff = async (id: string) => {
    try {
      await api.delete(`/staff/delete/${id}`)
      toast({ title: '삭제 완료' })
      fetchStaff()
    } catch {
      toast({
        title: '삭제 실패',
        variant: 'destructive',
      })
    }
  }

  // ===== 대타 요청 처리 (mock) =====
  const handleSubstituteApproval = (id: number, approve: boolean) => {
    toast({
      title: approve ? '대타 요청 승인' : '대타 요청 거절',
      description: `요청이 ${approve ? '승인' : '거절'}되었습니다.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">근무자 관리</h1>

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
              <DialogDescription>
                이름/연락처 입력 시 자동으로 ID와 임시 비밀번호가 생성됩니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div>
                <Label>이름</Label>
                <Input
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                />
              </div>
              <div>
                <Label>연락처</Label>
                <Input
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleAddStaff}>
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ===== Tabs ===== */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">근무자 목록</TabsTrigger>
          <TabsTrigger value="schedule">근무 시간표</TabsTrigger>
          <TabsTrigger value="substitute">대타 요청</TabsTrigger>
        </TabsList>

        {/* ===================== 직원 목록 ====================== */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>근무자 목록</CardTitle>
              <CardDescription>등록된 전체 직원 목록입니다.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              {staffList.map((staff) => (
                <div
                  key={staff._id}
                  className="border p-4 rounded-lg flex justify-between items-start hover:bg-muted/60 transition"
                >
                  <div className="space-y-1">
                    <div className="font-semibold">{staff.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {staff.phone}
                    </div>
                    <div className="text-xs">ID: {staff.username}</div>
                    <div className="text-xs text-primary">
                      PW: {staff.rawPassword ?? '-'}
                    </div>
                    <div className="text-xs">
                      입사일:{' '}
                      {staff.joinDate
                        ? new Date(staff.joinDate).toLocaleDateString()
                        : '-'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{staff.status ?? '활성'}</Badge>

                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDeleteStaff(staff._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== 시간표 (mock) ==================== */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>주간 근무 시간표</CardTitle>
              <CardDescription>아직은 mock 데이터입니다.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {weekSchedule.map((day, idx) => (
                  <div key={idx} className="border p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{day.day}</h4>

                    <div className="grid md:grid-cols-3 gap-2">
                      {day.shifts.map((shift, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-center gap-3 bg-secondary p-3 rounded-lg"
                        >
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{shift.time}</p>
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

        {/* ===================== 대타 요청 ====================== */}
        <TabsContent value="substitute">
          <Card>
            <CardHeader>
              <CardTitle>대타 요청 목록</CardTitle>
              <CardDescription>
                승인 / 거절 기능은 백엔드 연동 예정.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {mockSubstituteRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border p-4 rounded-lg flex justify-between"
                  >
                    <div>
                      <div className="font-semibold">{req.requester}</div>
                      <div className="text-sm text-muted-foreground">
                        {req.date} • {req.shift}
                      </div>
                      <div className="text-xs mt-1 text-muted-foreground">
                        사유: {req.reason}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSubstituteApproval(req.id, true)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        승인
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSubstituteApproval(req.id, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        거절
                      </Button>
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
