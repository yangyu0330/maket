import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  QrCode,
  Camera,
  Package,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// 테스트용 데이터 - 백엔드 연동 시 API로 대체 예정
const expiringItems = [
  {
    id: 1,
    name: '삼각김밥 참치',
    barcode: '8801234567890',
    expiryDate: '2024-01-17',
    daysLeft: 2,
    location: '냉장 1번',
  },
  {
    id: 2,
    name: '도시락 김치볶음밥',
    barcode: '8801234567891',
    expiryDate: '2024-01-16',
    daysLeft: 1,
    location: '냉장 3번',
  },
  {
    id: 3,
    name: '바나나우유',
    barcode: '8801234567892',
    expiryDate: '2024-01-18',
    daysLeft: 3,
    location: '냉장 2번',
  },
  {
    id: 4,
    name: '샌드위치 햄치즈',
    barcode: '8801234567893',
    expiryDate: '2024-01-17',
    daysLeft: 2,
    location: '냉장 1번',
  },
]

const disposedItems = [
  {
    id: 1,
    name: '컵라면 신라면',
    reason: '유통기한 만료',
    date: '2024-01-15 14:30',
    disposedBy: '김알바',
  },
  {
    id: 2,
    name: '삼각김밥 참치',
    reason: '포장 손상',
    date: '2024-01-15 09:20',
    disposedBy: '이알바',
  },
]

const InventoryEntry = () => {
  const { toast } = useToast()
  const [isScannerActive, setIsScannerActive] = useState(false)

  const handleQRScan = () => {
    setIsScannerActive(true)
    // ======= 3.c-1) 카메라로 QR스캔하여 DB업로드 (백엔드 개발), QR에는 백엔드 DB정보 포함 =======
    // TODO: 백엔드 QR 스캔 연동 - 카메라 활성화
    toast({
      title: 'QR 스캔 모드 활성화',
      description: '카메라로 상품의 QR 코드를 스캔하세요. (백엔드 연동 예정)',
    })

    // 시뮬레이션: 3초 후 스캔 완료
    setTimeout(() => {
      setIsScannerActive(false)
      toast({
        title: '스캔 완료',
        description: '상품 정보가 등록되었습니다.',
      })
    }, 3000)
  }

  const handleDisposeItem = (itemId: number, reason: 'expired' | 'damaged') => {
    // ======= 3.c-2) 폐기 상품 관리 (시간이지나 폐기된목록, 손상등의이유로 폐기된것 QR입력) =======
    // TODO: 백엔드 API 연동 - 폐기 등록
    const reasonText = reason === 'expired' ? '유통기한 만료' : '손상/파손'
    toast({
      title: '폐기 등록 완료',
      description: `${reasonText}로 폐기 처리되었습니다.`,
    })
  }

  return (
    <div className="space-y-6">
      {/* ======= 3.c) 재고 및 폐기 등록 - QR스캔(카메라), 폐기상품관리, 유통기한임박상품 ======= */}
      <div>
        <h1 className="text-3xl font-bold">재고 & 폐기 등록</h1>
        <p className="text-muted-foreground mt-1">
          QR 스캔으로 재고를 관리하고 폐기 물품을 등록하세요
        </p>
      </div>

      {/* QR 스캔 카드 */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR 코드 스캔
          </CardTitle>
          <CardDescription>
            상품의 QR 코드를 스캔하여 재고를 등록하거나 폐기 처리하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            {isScannerActive ? (
              <div className="w-full max-w-sm">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  <Camera className="w-16 h-16 text-muted-foreground animate-pulse" />
                  <div className="absolute inset-0 border-4 border-primary animate-pulse" />
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  QR 코드를 카메라에 비춰주세요...
                </p>
              </div>
            ) : (
              <>
                <QrCode className="w-24 h-24 text-primary mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  카메라로 상품 QR 코드를 스캔하세요
                </p>
                <Button size="lg" onClick={handleQRScan}>
                  <Camera className="w-5 h-5 mr-2" />
                  QR 스캔 시작
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 통계 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              유통기한 임박
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {expiringItems.length}개
            </div>
            <p className="text-xs text-muted-foreground">3일 이내 유통기한</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              오늘 폐기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disposedItems.length}개</div>
            <p className="text-xs text-muted-foreground">
              ₩{(42000).toLocaleString()} 손실
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              스캔 완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">45개</div>
            <p className="text-xs text-muted-foreground">오늘 등록된 상품</p>
          </CardContent>
        </Card>
      </div>

      {/* 탁 */}
      <Tabs defaultValue="expiring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="expiring">유통기한 임박</TabsTrigger>
          <TabsTrigger value="disposed">폐기 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>유통기한 임박 상품</CardTitle>
              {/* ======= 3.c-3) 유통기한 임박 상품 확인 목록 ======= */}
              <CardDescription>
                3일 이내 유통기한이 도래하는 상품 목록
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <AlertTriangle className="w-5 h-5 text-destructive mt-1" />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            바코드: {item.barcode}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            위치: {item.location}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className="border-destructive text-destructive"
                            >
                              D-{item.daysLeft}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {item.expiryDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisposeItem(item.id, 'expired')}
                        >
                          유통기한 폐기
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisposeItem(item.id, 'damaged')}
                        >
                          손상 폐기
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                폐기 처리 안내
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• 유통기한 당일: 즉시 폐기 처리</p>
              <p>• D-1~3: 할인 판매 후 미판매 시 폐기</p>
              <p>• 손상/파손: 즉시 폐기 처리</p>
              <p>• 폐기 시 반드시 QR 스캔으로 등록</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disposed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>폐기 처리 내역</CardTitle>
              <CardDescription>최근 폐기 처리된 상품 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {disposedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <Trash2 className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          사유: {item.reason}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.date} • 처리자: {item.disposedBy}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-muted-foreground text-muted-foreground"
                      >
                        폐기 완료
                      </Badge>
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

export default InventoryEntry
