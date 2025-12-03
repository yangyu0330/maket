import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Trash2,
} from 'lucide-react'

// 테스트용 데이터 - 백엔드 연동 시 API로 대체 예정
const hourlySales = [
  { hour: '06:00', sales: 45000 },
  { hour: '07:00', sales: 120000 },
  { hour: '08:00', sales: 230000 },
  { hour: '09:00', sales: 180000 },
  { hour: '10:00', sales: 95000 },
  { hour: '11:00', sales: 110000 },
  { hour: '12:00', sales: 380000 },
  { hour: '13:00', sales: 320000 },
  { hour: '14:00', sales: 150000 },
  { hour: '15:00', sales: 95000 },
  { hour: '16:00', sales: 120000 },
  { hour: '17:00', sales: 180000 },
  { hour: '18:00', sales: 410000 },
  { hour: '19:00', sales: 385000 },
  { hour: '20:00', sales: 290000 },
  { hour: '21:00', sales: 185000 },
  { hour: '22:00', sales: 95000 },
]

const weeklySales = [
  { day: '월', sales: 1235000 },
  { day: '화', sales: 1180000 },
  { day: '수', sales: 1420000 },
  { day: '목', sales: 1315000 },
  { day: '금', sales: 1580000 },
  { day: '토', sales: 1920000 },
  { day: '일', sales: 1680000 },
]

const monthlySales = [
  { month: '1월', sales: 35200000 },
  { month: '2월', sales: 32800000 },
  { month: '3월', sales: 38500000 },
  { month: '4월', sales: 36900000 },
  { month: '5월', sales: 41200000 },
  { month: '6월', sales: 39800000 },
]

const popularProducts = [
  { name: '삼각김밥', sales: 850, revenue: 1275000 },
  { name: '컵라면', sales: 720, revenue: 864000 },
  { name: '바나나우유', sales: 680, revenue: 1224000 },
  { name: '생수', sales: 620, revenue: 620000 },
  { name: '도시락', sales: 450, revenue: 2025000 },
]

const unpopularProducts = [
  { name: '과일주스 A', sales: 12, revenue: 36000 },
  { name: '샌드위치 B', sales: 18, revenue: 90000 },
  { name: '과자 C', sales: 25, revenue: 50000 },
]

const disposalData = [
  { date: '01-10', items: 8, cost: 42000 },
  { date: '01-11', items: 12, cost: 68000 },
  { date: '01-12', items: 6, cost: 35000 },
  { date: '01-13', items: 15, cost: 89000 },
  { date: '01-14', items: 9, cost: 51000 },
  { date: '01-15', items: 11, cost: 63000 },
]

const Analytics = () => {
  return (
    <div className="space-y-6">
      {/* ======= 2.d) 데이터 분석 - 시간대별/요일별/월별 판매 통계, 인기/비인기 상품, 폐기비용정산 ======= */}
      <div>
        <h1 className="text-3xl font-bold">데이터 분석</h1>
        <p className="text-muted-foreground mt-1">
          매출 통계와 상품 분석 데이터
        </p>
      </div>

      {/* 요약 통계 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              이번 주 매출
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩10,330,000</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +8.5% 전주 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              판매 품목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,240개</div>
            <p className="text-xs text-muted-foreground mt-1">이번 주 판매량</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              폐기 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩348,000</div>
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3" />
              -12% 전주 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">평균 객단가</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩8,500</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +3.2% 전주 대비
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 판매 통계 탭 */}
      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly">시간대별</TabsTrigger>
          <TabsTrigger value="weekly">요일별</TabsTrigger>
          <TabsTrigger value="monthly">월별</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly">
          <Card>
            <CardHeader>
              <CardTitle>시간대별 판매 통계</CardTitle>
              <CardDescription>
                오늘의 시간대별 매출 추이 (백엔드 연동 예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hourlySales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>요일별 판매 통계</CardTitle>
              <CardDescription>
                이번 주 요일별 매출 (백엔드 연동 예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklySales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <Card>
            <CardHeader>
              <CardTitle>월별 판매 통계</CardTitle>
              <CardDescription>
                올해 월별 매출 추이 (백엔드 연동 예정)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlySales}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => `₩${value.toLocaleString()}`}
                  />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--chart-2))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 상품 분석 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ======= 2.d-2) 인기 상품 TOP 5 / 저조한 상품 ======= */}
        <Card>
          <CardHeader>
            <CardTitle>인기 상품 TOP 5</CardTitle>
            <CardDescription>판매량 기준 (백엔드 연동 예정)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-success">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sales}개 판매
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-success">
                    ₩{product.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>저조한 상품</CardTitle>
            <CardDescription>판매 부진 상품 (백엔드 연동 예정)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unpopularProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.sales}개 판매
                    </p>
                  </div>
                  <p className="font-medium text-warning">
                    ₩{product.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ======= 2.d-3) 폐기 비용 정산 내역 (백엔드 연동) ======= */}
      <Card>
        <CardHeader>
          <CardTitle>폐기 비용 정산</CardTitle>
          <CardDescription>
            최근 7일간 폐기 물품 통계 (백엔드 연동 예정)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={disposalData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'cost')
                    return [`₩${value.toLocaleString()}`, '폐기 비용']
                  return [`${value}개`, '폐기 품목']
                }}
              />
              <Bar
                dataKey="items"
                fill="hsl(var(--chart-3))"
                name="품목"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="cost"
                fill="hsl(var(--destructive))"
                name="비용"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default Analytics
