import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowRight, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 테스트용 데이터 - 백엔드 연동 시 API로 대체 예정
const previousHandovers = [
  {
    id: 1,
    from: '김알바',
    shift: '06:00 - 14:00',
    date: '2024-01-15',
    content:
      '• 냉장고 온도 체크 완료 (정상)\n• 음료 진열대 재고 부족 - 보충 필요\n• 고객 문의: 택배 픽업 서비스 문의 많음\n• 카드 단말기 영수증 용지 교체함',
    confirmed: false,
    checklist: [
      { item: '청소 완료', done: true },
      { item: '재고 확인', done: true },
      { item: '냉장고 온도', done: true },
      { item: '폐기 처리', done: false },
    ],
  },
]

const Handover = () => {
  const { toast } = useToast()
  const [handoverContent, setHandoverContent] = useState('')
  const [myChecklist, setMyChecklist] = useState([
    { item: '청소 완료', done: false },
    { item: '재고 보충', done: false },
    { item: '냉장고 온도 체크', done: false },
    { item: '폐기 물품 처리', done: false },
  ])

  const handleConfirmHandover = (handoverId: number) => {
    // 백엔드 API 연동 예정
    toast({
      title: '인수인계 확인 완료',
      description: '이전 근무자의 인수인계를 확인했습니다.',
    })
  }

  const handleSubmitHandover = () => {
    // 백엔드 API 연동 예정
    if (!handoverContent.trim()) {
      toast({
        title: '내용을 입력하세요',
        description: '인수인계 내용을 입력해주세요.',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: '인수인계 작성 완료',
      description: '다음 근무자에게 전달되었습니다.',
    })
    setHandoverContent('')
  }

  const toggleChecklistItem = (index: number) => {
    const updated = [...myChecklist]
    updated[index].done = !updated[index].done
    setMyChecklist(updated)
  }

  return (
    <div className="space-y-6">
      {/* ======= 3.b) 업무 인수인계 - 작성 폼, 이전 근무자 확인(확인버튼) ======= */}
      <div>
        <h1 className="text-3xl font-bold">업무 인수인계</h1>
        <p className="text-muted-foreground mt-1">
          이전 근무자의 인수인계를 확인하고 다음 근무자에게 전달하세요
        </p>
      </div>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              미확인 인수인계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {previousHandovers.filter((h) => !h.confirmed).length}건
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              완료된 체크리스트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myChecklist.filter((item) => item.done).length}/
              {myChecklist.length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              현재 근무 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3시간 15분</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ======= 3.b-1) 전 근무자 인수인계 확인 (인수인계 확인 버튼) ======= */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary rotate-180" />전
              근무자 인수인계
            </CardTitle>
            <CardDescription>확인이 필요한 인수인계 내역</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previousHandovers.map((handover) => (
                <div
                  key={handover.id}
                  className="p-4 border rounded-lg bg-primary/5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{handover.from}</p>
                      <p className="text-xs text-muted-foreground">
                        {handover.date} • {handover.shift}
                      </p>
                    </div>
                    {!handover.confirmed && (
                      <Badge
                        variant="outline"
                        className="border-warning text-warning"
                      >
                        미확인
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">인수인계 내용:</p>
                    <div className="p-3 bg-background rounded text-sm whitespace-pre-line">
                      {handover.content}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">업무 체크리스트:</p>
                    <div className="space-y-2">
                      {handover.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          {item.done ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span
                            className={
                              item.done
                                ? 'text-muted-foreground line-through'
                                : ''
                            }
                          >
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!handover.confirmed && (
                    <Button
                      onClick={() => handleConfirmHandover(handover.id)}
                      className="w-full"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      인수인계 확인
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ======= 3.b-2) 다음 근무자 인수인계 작성 폼 ======= */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-accent" />
                다음 근무자 인수인계
              </CardTitle>
              <CardDescription>
                다음 근무자: 박알바 (22:00 - 06:00)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  나의 업무 체크리스트:
                </p>
                <div className="space-y-3">
                  {myChecklist.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded transition-colors"
                    >
                      <Checkbox
                        id={`checklist-${index}`}
                        checked={item.done}
                        onCheckedChange={() => toggleChecklistItem(index)}
                      />
                      <label
                        htmlFor={`checklist-${index}`}
                        className={`text-sm cursor-pointer flex-1 ${
                          item.done ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {item.item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">인수인계 내용 작성:</p>
                <Textarea
                  placeholder="다음 근무자에게 전달할 사항을 입력하세요...&#10;&#10;예시:&#10;• 특이사항이나 주의할 점&#10;• 재고 상황&#10;• 고객 문의 내용&#10;• 기타 업무 관련 사항"
                  value={handoverContent}
                  onChange={(e) => setHandoverContent(e.target.value)}
                  rows={10}
                  className="resize-none"
                />
              </div>

              <Button onClick={handleSubmitHandover} className="w-full">
                인수인계 작성 완료
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-sm">💡 인수인계 작성 팁</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>• 구체적이고 명확하게 작성하세요</p>
              <p>• 긴급하거나 중요한 사항은 맨 위에 작성</p>
              <p>• 미완료 업무는 반드시 명시하세요</p>
              <p>• 고객 문의사항도 함께 전달하면 좋아요</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Handover
