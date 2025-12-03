import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Calendar,
  Clock,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { useState } from 'react'

const StaffDashboard = () => {
  const [checklist, setChecklist] = useState({
    cleaning: false,
    inventory: false,
    disposal: false,
  })

  const username = localStorage.getItem('username') || '알바'

  return (
    <div className="space-y-6">
      {/* ======= 3.a) 알바생 대시보드 - 근무시간표, 인수인계목록, 긴급공지, 체크리스트 ======= */}
      <div>
        <h1 className="text-3xl font-bold">안녕하세요, {username}님!</h1>
        <p className="text-muted-foreground mt-1">오늘도 화이팅하세요! 😊</p>
      </div>

      {/* ======= 3.a-1,2) 나의 근무 시간표 (금일/주간), 전/다음 근무자 인수인계 목록 ======= */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              금일 근무
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14:00 - 22:00</div>
            <p className="text-xs text-muted-foreground mt-1">8시간 근무</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              근무 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2시간 30분</div>
            <p className="text-xs text-success mt-1">진행 중</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              미확인 인수인계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1건</div>
            <p className="text-xs text-warning mt-1">확인 필요</p>
          </CardContent>
        </Card>
      </div>

      {/* Handover Sections */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary rotate-180" />전
              근무자 인수인계
            </CardTitle>
            <CardDescription>이전 근무자가 남긴 메시지</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">김알바</span>
                  <span className="text-xs text-muted-foreground">
                    06:00 - 14:00
                  </span>
                </div>
                <p className="text-sm mb-3">
                  • 냉장고 온도 체크 완료
                  <br />
                  • 음료 진열대 재고 부족
                  <br />• 고객 문의: 택배 픽업 서비스 문의 많음
                </p>
                <Button size="sm" className="w-full">
                  <CheckSquare className="w-4 h-4 mr-2" />
                  인수인계 확인
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-accent" />
              다음 근무자 인수인계
            </CardTitle>
            <CardDescription>다음 근무자에게 전달할 내용</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-muted/50 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">박알바</span>
                  <span className="text-xs text-muted-foreground">
                    22:00 - 06:00
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  아직 작성된 인수인계가 없습니다.
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  인수인계 작성하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======= 3.a-4) 긴급 공지/사장님 메세지, 3.a-5) 주요 업무 체크리스트 (청소,재고보충,폐기물폐기) ======= */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              주요 업무 체크리스트
            </CardTitle>
            <CardDescription>오늘의 필수 업무</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="cleaning"
                  checked={checklist.cleaning}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, cleaning: checked as boolean })
                  }
                />
                <label
                  htmlFor="cleaning"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  매장 청소 및 정리
                </label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="inventory"
                  checked={checklist.inventory}
                  onCheckedChange={(checked) =>
                    setChecklist({
                      ...checklist,
                      inventory: checked as boolean,
                    })
                  }
                />
                <label
                  htmlFor="inventory"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  재고 확인 및 보충
                </label>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id="disposal"
                  checked={checklist.disposal}
                  onCheckedChange={(checked) =>
                    setChecklist({ ...checklist, disposal: checked as boolean })
                  }
                />
                <label
                  htmlFor="disposal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  유통기한 확인 및 폐기
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ======= 3.a-3) 긴급 공지 & 사장님 메시지 ======= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              긴급 공지 & 메시지
            </CardTitle>
            <CardDescription>사장님 공지사항</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-warning">긴급</span>
                  <span className="text-xs text-muted-foreground">
                    2시간 전
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">
                  프로모션 상품 진열 변경
                </p>
                <p className="text-xs text-muted-foreground">
                  1+1 행사 상품을 입구 앞 진열대로 이동해주세요.
                </p>
              </div>
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-primary">공지</span>
                  <span className="text-xs text-muted-foreground">어제</span>
                </div>
                <p className="text-sm font-medium mb-1">
                  새로운 POS 시스템 교육
                </p>
                <p className="text-xs text-muted-foreground">
                  이번 주 금요일 교육 예정입니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StaffDashboard
