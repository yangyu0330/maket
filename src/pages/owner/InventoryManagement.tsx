import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Package, AlertTriangle, ShoppingCart } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

type Product = {
  _id: string
  productName: string
  entryDate: string
  expireDate: string
  quantity: number
  scannedAt?: string
  category?: string
  minStock?: number
  price?: number
}

type OrderRequest = {
  id: string
  item: string
  quantity: number
  requestedBy: string
  date: string
  status: '대기' | '승인' | '거절'
  orderQuantity?: number
  orderedAt?: string
}

const InventoryManagement = () => {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('전체')
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([])
  const [approveTarget, setApproveTarget] = useState<OrderRequest | null>(null)
  const [orderQuantity, setOrderQuantity] = useState('')

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await api.get<Product[]>('/get-qr')
      const mapped = res.data.map((item) => ({
        ...item,
        category: item.category ?? '기타',
        minStock: item.minStock ?? 5,
        price: item.price ?? 0,
      }))
      setItems(mapped)
    } catch (err: any) {
      toast({
        title: '로딩 실패',
        description:
          err?.response?.data?.message || '재고 목록을 불러오지 못했습니다.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.productName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
      const matchesCategory =
        selectedCategory === '전체' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, selectedCategory])

  const daysUntil = (date?: string) => {
    if (!date) return null
    const target = new Date(date).getTime()
    const today = new Date().setHours(0, 0, 0, 0)
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  }

  const lowStockItems = filteredInventory.filter(
    (item) => item.quantity < (item.minStock ?? 0)
  )
  const expiringItems = filteredInventory.filter((item) => {
    const d = daysUntil(item.expireDate)
    return d !== null && d <= 7
  })

  useEffect(() => {
    const next = items
      .filter((item) => item.quantity <= 2)
      .map((item) => ({
        id: item._id,
        item: item.productName,
        quantity: item.quantity,
        requestedBy: '시스템 감지',
        date: new Date(item.scannedAt || item.entryDate).toLocaleDateString(),
        status: '대기' as const,
      }))

    // 기존 상태 유지(승인/거절) 후 새 데이터 병합
    setOrderRequests((prev) =>
      next.map((n) => {
        const existing = prev.find((p) => p.id === n.id)
        return existing
          ? {
              ...n,
              status: existing.status,
              orderQuantity: existing.orderQuantity,
              orderedAt: existing.orderedAt,
            }
          : n
      })
    )
  }, [items])

  const pendingOrders = orderRequests.filter((r) => r.status === '대기')
  const approvedOrders = orderRequests.filter((r) => r.status === '승인')

  const handleOrderApproval = (
    orderId: string,
    action: 'approve' | 'reject'
  ) => {
    setOrderRequests((prev) =>
      prev.map((req) =>
        req.id === orderId
          ? { ...req, status: action === 'approve' ? '승인' : '거절' }
          : req
      )
    )
    toast({
      title: action === 'approve' ? '발주 승인 완료' : '발주 거절',
      description: `발주 요청이 ${
        action === 'approve' ? '승인' : '거절'
      }되었습니다.`,
    })
  }

  const openApproveDialog = (request: OrderRequest) => {
    setApproveTarget(request)
    setOrderQuantity(request.quantity.toString())
  }

  const handleApproveConfirm = () => {
    if (!approveTarget) return
    const qty = Number(orderQuantity)
    if (Number.isNaN(qty) || qty <= 0) {
      toast({
        title: '입력 오류',
        description: '주문 수량을 1 이상 입력하세요.',
        variant: 'destructive',
      })
      return
    }

    setOrderRequests((prev) =>
      prev.map((req) =>
        req.id === approveTarget.id
          ? {
              ...req,
              status: '승인',
              orderQuantity: qty,
              orderedAt: new Date().toISOString(),
            }
          : req
      )
    )
    setApproveTarget(null)
    setOrderQuantity('')
    toast({
      title: '발주 승인 완료',
      description: `${approveTarget.item}을(를) ${qty}개 발주했습니다.`,
    })
  }

  const handleAutoRecommend = () => {
    // 백엔드 AI 추천 로직 연동 예정
    toast({
      title: '자동 발주 추천',
      description: '부족한 재고 기준으로 발주 품목을 추천했습니다.',
    })
  }

  return (
    <div className="space-y-6">
      {/* ======= 2.b) 재고/발주 관리 - DB목록, 검색/필터링, 발주요청 알림, 자동추천 및 신청, 유통기한임박 상품 ======= */}
      <div>
        <h1 className="text-3xl font-bold">재고/발주 관리</h1>
        <p className="text-muted-foreground mt-1">
          재고 현황을 확인하고 발주를 관리하세요
        </p>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">재고 목록</TabsTrigger>
          <TabsTrigger value="orders">발주 요청</TabsTrigger>
          <TabsTrigger value="expiring">유통기한 임박</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* ======= 2.b-1) 물품 검색 및 필터링, 2.b-4) 발주 품목 자동 추천 및 발주 신청 ======= */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="물품 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                <SelectItem value="식품">식품</SelectItem>
                <SelectItem value="음료">음료</SelectItem>
                <SelectItem value="생활용품">생활용품</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchInventory}
              disabled={loading}
            >
              {loading ? '불러오는 중...' : '새로고침'}
            </Button>
            <Button onClick={handleAutoRecommend}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              자동 발주 추천
            </Button>
          </div>

          {/* 알림 카드 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-warning">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  재고 부족 알림
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {lowStockItems.length}개
                </div>
                <p className="text-xs text-muted-foreground">
                  최소 재고 미달 품목
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive">
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
                <p className="text-xs text-muted-foreground">
                  7일 이내 유통기한
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 재고 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>재고 목록</CardTitle>
              <CardDescription>
                전체 {filteredInventory.length}개 품목
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredInventory.map((item) => {
                  const expiry = daysUntil(item.expireDate)
                  return (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.category} • ₩
                            {item.price?.toLocaleString?.() ?? '-'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">재고</p>
                          <p
                            className={`font-medium ${
                              item.quantity < (item.minStock ?? 0)
                                ? 'text-warning'
                                : ''
                            }`}
                          >
                            {item.quantity}개
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            유통기한
                          </p>
                          <p
                            className={`font-medium ${
                              expiry !== null && expiry <= 3
                                ? 'text-destructive'
                                : ''
                            }`}
                          >
                            {expiry === null ? '-' : `D-${expiry}`}
                          </p>
                        </div>
                        {item.quantity < (item.minStock ?? 0) && (
                          <Badge
                            variant="outline"
                            className="border-warning text-warning"
                          >
                            부족
                          </Badge>
                        )}
                        {expiry !== null && expiry <= 3 && (
                          <Badge
                            variant="outline"
                            className="border-destructive text-destructive"
                          >
                            임박
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredInventory.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    재고가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======= 2.b-3) 발주 요청 알림 목록 ======= */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>발주 요청 목록</CardTitle>
              <CardDescription>
                수량 2개 이하 품목을 자동 감지해 보여줍니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingOrders.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{request.item}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => openApproveDialog(request)}
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleOrderApproval(request.id, 'reject')
                        }
                      >
                        거절
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingOrders.length === 0 && (
                  <div className="text-center text-muted-foreground py-6">
                    2개 이하 재고가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>승인 목록</CardTitle>
              <CardDescription>승인된 발주 요청</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {approvedOrders.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{request.item}</h4>
                      <p className="text-xs text-muted-foreground">
                        주문: {request.orderQuantity ?? 0}개 •{' '}
                        {request.orderedAt
                          ? new Date(request.orderedAt).toLocaleDateString()
                          : '-'}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-success text-success"
                    >
                      승인됨
                    </Badge>
                  </div>
                ))}
                {approvedOrders.length === 0 && (
                  <div className="text-center text-muted-foreground py-6">
                    승인된 발주가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ======= 2.b-5) 유통기한 임박 상품 목록 ======= */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>유통기한 임박 상품</CardTitle>
              <CardDescription>
                7일 이내 유통기한이 도래하는 상품
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiringItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">
                          재고: {item.quantity}개
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className="border-destructive text-destructive"
                      >
                        {daysUntil(item.expireDate) !== null
                          ? `D-${daysUntil(item.expireDate)}`
                          : '-'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={!!approveTarget}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
            setOrderQuantity('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>발주 수량 입력</DialogTitle>
            <DialogDescription>
              {approveTarget?.item}에 대해 주문할 수량을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Input
              type="number"
              min={1}
              value={orderQuantity}
              onChange={(e) => setOrderQuantity(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              취소
            </Button>
            <Button onClick={handleApproveConfirm}>전송</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InventoryManagement
