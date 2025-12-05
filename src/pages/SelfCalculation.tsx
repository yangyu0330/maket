import { useState, useRef, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart,
  Trash2,
  CreditCard,
  Barcode,
  Search,
  Plus,
  Minus,
  RotateCcw,
  ScanBarcode,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import axios from 'axios'

// 장바구니 아이템 타입
interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  barcode?: string
}

// API 설정
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

const SelfCheckout = () => {
  const { toast } = useToast()
  const [cart, setCart] = useState<CartItem[]>([])
  const [barcodeInput, setBarcodeInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [quickMenu, setQuickMenu] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchQuickMenu = async () => {
      try {
        const res = await api.get('/kiosk/products/quick')
        if (res.data && Array.isArray(res.data)) {
          const validItems = res.data.filter((item: any) => {
            const name = item.name || item.productName || ''

            if (!name.trim() || name.trim() === '이름 없음') return false

            if (!item.price || item.price === 0) return false

            return true
          })

          setQuickMenu(validItems)

          if (validItems.length === 0) {
            console.log('판매 가능한 상품이 없습니다.')
          }
        }
      } catch (err) {
        console.error('퀵 메뉴 로드 실패', err)
      }
    }
    fetchQuickMenu()
  }, [])

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  // 오토 포커스
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (!isProcessing && document.activeElement !== inputRef.current) {
        inputRef.current?.focus()
      }
    }, 2000)
    return () => clearInterval(focusInterval)
  }, [isProcessing])

  // 스캔 핸들러
  const handleScan = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!barcodeInput.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      const res = await api.get(`/kiosk/scan/${barcodeInput}`)
      const product = res.data

      if (!product.price || product.price === 0) {
        toast({
          title: '판매 불가',
          description: '가격 정보가 없는 상품입니다.',
          variant: 'destructive',
        })
        setBarcodeInput('')
        return
      }

      addToCart(product)
      toast({
        title: '상품 인식 성공',
        description: `${product.name} (₩${product.price.toLocaleString()})`,
        duration: 1500,
      })
      setBarcodeInput('')
    } catch (err: any) {
      toast({
        title: '인식 실패',
        description: err.response?.data?.message || '등록되지 않은 상품입니다.',
        variant: 'destructive',
      })
      setBarcodeInput('')
    } finally {
      setIsProcessing(false)
    }
  }

  // 장바구니 담기
  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id)
      if (existing) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.name || product.productName, // 이름 필드 안전하게 처리
          price: product.price,
          quantity: 1,
          barcode: product.barcode,
        },
      ]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      })
    )
  }

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id))
  }

  const handlePayment = async () => {
    if (cart.length === 0) return
    if (!confirm(`총 ${totalAmount.toLocaleString()}원을 결제하시겠습니까?`))
      return

    try {
      await api.post('/kiosk/checkout', {
        items: cart.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          barcode: item.barcode,
        })),
        totalAmount,
        paymentMethod: 'card',
      })

      alert('결제가 완료되었습니다. 이용해주셔서 감사합니다! 🙇‍♂️')
      setCart([])
      // 결제 후 재고 반영을 위해 목록 새로고침 (선택사항)
      window.location.reload()
    } catch (err) {
      toast({
        title: '결제 실패',
        description: '서버와 통신 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ScanBarcode className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">셀프 계산대</h1>
            <p className="text-xs text-muted-foreground">
              24시간 무인 운영중 (POS-01)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1 bg-white">
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full h-[calc(100vh-80px)]">
        {/* [왼쪽 영역] 스캔 및 상품 선택 */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <Card className="border-2 border-primary/20 shadow-md overflow-hidden shrink-0">
            <CardHeader className="bg-white pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Barcode className="w-5 h-5 text-primary" />
                상품 스캔
              </CardTitle>
              <CardDescription>
                상품의 바코드를 리더기로 스캔하거나 번호를 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-50/50 pt-6">
              <div
                className="aspect-[4/1] bg-white rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center mb-6 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => inputRef.current?.focus()}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
                <Barcode className="w-16 h-16 text-slate-300 group-hover:text-primary/40 transition-colors mb-2" />
                <p className="text-slate-400 font-medium text-sm group-hover:text-primary/60">
                  여기를 클릭하면 입력창에 포커스됩니다
                </p>
              </div>

              <form onSubmit={handleScan} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    ref={inputRef}
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="바코드 번호 입력 (스캔 시 자동 입력)"
                    className="pl-10 h-14 text-lg bg-white shadow-sm"
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 text-lg shadow-sm"
                >
                  입력
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="flex-1 overflow-y-auto pr-1">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 ml-1 flex items-center gap-2">
              <span className="text-primary">★</span> 상품 목록 (터치하여 담기)
            </h3>

            {quickMenu.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {quickMenu.map((item) => (
                  <Button
                    key={item._id}
                    variant="outline"
                    className="h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 hover:shadow-sm transition-all bg-white whitespace-normal relative overflow-hidden"
                    onClick={() => addToCart(item)}
                    disabled={item.stock <= 0} // 재고 없으면 클릭 방지
                  >
                    {/* 품절 표시 */}
                    {item.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="text-white font-bold transform -rotate-12 border-2 border-white px-2 py-1">
                          품절
                        </span>
                      </div>
                    )}

                    <span className="font-bold text-base line-clamp-2">
                      {item.name || item.productName}
                    </span>
                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-600 pointer-events-none"
                      >
                        ₩{(item.price || 0).toLocaleString()}
                      </Badge>
                      {/* 재고 표시 (선택사항) */}
                      {item.stock > 0 && item.stock <= 5 && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] h-5 px-1"
                        >
                          {item.stock}개 남음
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                <p>판매 가능한 상품이 없습니다.</p>
                <Button
                  variant="link"
                  onClick={() =>
                    api
                      .post('/kiosk/init-data')
                      .then(() => window.location.reload())
                  }
                >
                  초기 데이터 생성하기 (클릭)
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* [오른쪽 영역] 장바구니 및 결제 */}
        <div className="lg:col-span-1 h-full">
          <Card className="h-full flex flex-col border-t-4 border-t-primary shadow-xl">
            <CardHeader className="bg-white pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="w-5 h-5 text-primary" /> 결제 목록
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive h-8 px-2"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> 전체 취소
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0 bg-slate-50">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 space-y-4 opacity-60">
                  <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                    <Barcode className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="text-base font-medium text-center">
                    상품을 스캔하거나
                    <br />
                    왼쪽에서 선택해주세요
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="p-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="font-bold text-base truncate text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-sm text-slate-500 font-medium">
                          ₩{item.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-lg h-9 bg-slate-50 shadow-sm">
                          <button
                            className="px-2.5 hover:bg-slate-200 h-full rounded-l-lg transition-colors active:bg-slate-300"
                            onClick={() => updateQuantity(item._id, -1)}
                          >
                            <Minus className="w-3 h-3 text-slate-600" />
                          </button>
                          <span className="w-8 text-center font-bold text-sm tabular-nums select-none">
                            {item.quantity}
                          </span>
                          <button
                            className="px-2.5 hover:bg-slate-200 h-full rounded-r-lg transition-colors active:bg-slate-300"
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            <Plus className="w-3 h-3 text-slate-600" />
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          onClick={() => removeItem(item._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="bg-slate-900 text-white mt-auto rounded-b-xl overflow-hidden z-20 shadow-inner-top">
              <div className="p-5 space-y-3 bg-slate-800/50">
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>총 수량</span>
                  <span>
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}개
                  </span>
                </div>
                <div className="flex justify-between text-slate-300 text-sm">
                  <span>할인 금액</span>
                  <span>- 0원</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="flex justify-between items-end pt-1">
                  <span className="font-medium text-lg text-slate-200">
                    결제할 금액
                  </span>
                  <span className="font-bold text-4xl text-yellow-400 tabular-nums tracking-tight">
                    ₩{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-black/40 backdrop-blur-sm">
                <Button
                  size="lg"
                  className="w-full h-16 text-xl font-bold bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePayment}
                  disabled={cart.length === 0}
                >
                  <CreditCard className="w-6 h-6 mr-3" />
                  카드 결제하기
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default SelfCheckout
