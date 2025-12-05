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
import axios from 'axios'

// API 인스턴스 설정
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

// 요청 인터셉터: 토큰 자동 포함
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

// 데모용 모의 데이터
const MOCK_PRODUCTS: Product[] = [
  {
    _id: 'mock_1',
    productName: '코카콜라 제로',
    entryDate: new Date().toISOString(),
    expireDate: '2024-12-31',
    quantity: 50,
    category: '음료',
    minStock: 10,
    price: 1500,
  },
  {
    _id: 'mock_2',
    productName: '삼각김밥 참치마요',
    entryDate: new Date().toISOString(),
    expireDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    quantity: 2,
    category: '식품',
    minStock: 5,
    price: 1200,
  },
]

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

    const token = localStorage.getItem('token')
    if (!token) {
      setItems(MOCK_PRODUCTS)
      toast({
        title: '데모 모드',
        description: '로그인이 필요합니다. 테스트 데이터를 표시합니다.',
      })
      setLoading(false)
      return
    }

    try {
      const res = await api.get('/products')

      if (!Array.isArray(res.data)) {
        setItems([])
        return
      }

      // 데이터 매핑 및 기본값 처리
      const mapped = res.data.map((item: any) => ({
        _id: item._id,
        productName: item.name || item.productName || '',
        quantity: Number(item.stock) || 0,
        category: item.category || '기타',
        price: Number(item.price) || 0,
        minStock: Number(item.minStock) || 5,
        expireDate: item.expiryDate || '',
        entryDate: item.createdAt || new Date().toISOString(),
      }))

      const validItems = mapped.filter((item: Product) => {
        const name = item.productName.trim()
        if (!name || name === '이름 없음') return false
        if (item.price === 0 && item.quantity === 0) return false
        return true
      })

      setItems(validItems)
    } catch (err: any) {
      console.warn('API Error:', err.message)

      let errorMsg = '목록 로드 실패'
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) errorMsg = '인증 만료'
        else if (err.code === 'ERR_NETWORK') errorMsg = '서버 연결 불가'
      }

      toast({
        title: '로드 실패',
        description: errorMsg,
        variant: 'destructive',
      })
      setItems(MOCK_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // 검색 및 카테고리 필터링
  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.productName
        ? item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        : false
      const categoryMatch =
        selectedCategory === '전체' || item.category === selectedCategory
      return nameMatch && categoryMatch
    })
  }, [items, searchTerm, selectedCategory])

  // 유통기한 D-Day 계산
  const daysUntil = (date?: string) => {
    if (!date) return null
    const target = new Date(date).getTime()
    if (isNaN(target)) return null
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

  // 자동 발주 제안 생성
  useEffect(() => {
    const next = items
      .filter((item) => item.quantity <= 2)
      .map((item) => {
        let dateStr = '-'
        try {
          const d = item.scannedAt || item.entryDate
          if (d) {
            const dateObj = new Date(d)
            if (!isNaN(dateObj.getTime()))
              dateStr = dateObj.toLocaleDateString()
          }
        } catch (e) {
          dateStr = '-'
        }

        return {
          id: item._id,
          item: item.productName,
          quantity: item.quantity,
          requestedBy: '시스템 감지',
          date: dateStr,
          status: '대기' as const,
        }
      })

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

  // 발주 승인/거절 처리
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
      title: action === 'approve' ? '승인 완료' : '거절 완료',
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
        description: '올바른 수량을 입력하세요.',
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
    toast({ title: '발주 완료', description: `${qty}개 발주되었습니다.` })
  }

  const handleAutoRecommend = () => {
    toast({
      title: '자동 추천',
      description: '부족한 재고 기준으로 추천되었습니다.',
    })
  }

  return (
    <div className="space-y-6">
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

        {/* 재고 목록 탭 */}
        <TabsContent value="inventory" className="space-y-4">
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
              {loading ? '로딩 중...' : '새로고침'}
            </Button>
            <Button onClick={handleAutoRecommend}>
              <ShoppingCart className="w-4 h-4 mr-2" /> 자동 추천
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-warning">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" /> 재고 부족
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {lowStockItems.length}개
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" /> 임박
                  상품
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {expiringItems.length}개
                </div>
              </CardContent>
            </Card>
          </div>

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
                            {item.price?.toLocaleString() ?? '-'}
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
                    등록된 재고가 없습니다.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 발주 요청 탭 */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>발주 요청 목록</CardTitle>
              <CardDescription>수량 2개 이하 품목 자동 감지</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingOrders.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <h4 className="font-medium">{request.item}</h4>
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
                    요청 없음
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>승인 목록</CardTitle>
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
                    승인 내역 없음
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 유통기한 임박 탭 */}
        <TabsContent value="expiring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>유통기한 임박 상품</CardTitle>
              <CardDescription>7일 이내 만료 예정</CardDescription>
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
        onOpenChange={(open) => !open && setApproveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>발주 수량</DialogTitle>
            <DialogDescription>
              {approveTarget?.item} 주문 수량을 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            min={1}
            value={orderQuantity}
            onChange={(e) => setOrderQuantity(e.target.value)}
          />
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
