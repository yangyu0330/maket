import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  BarChart3,
  Package,
  Users,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

// 테스트용 데이터 - 실제로는 백엔드 API로 대체될 예정
const salesData = [
  { time: '06:00', sales: 45 },
  { time: '09:00', sales: 120 },
  { time: '12:00', sales: 280 },
  { time: '15:00', sales: 95 },
  { time: '18:00', sales: 310 },
  { time: '21:00', sales: 185 },
]

const inventoryData = [
  { name: '정상', value: 850, color: 'hsl(var(--success))' },
  { name: '부족', value: 45, color: 'hsl(var(--warning))' },
  { name: '임박', value: 25, color: 'hsl(var(--destructive))' },
]

const todayStaff = [
  { name: '김알바', shift: '06:00 - 14:00', status: '근무중' },
  { name: '이알바', shift: '14:00 - 22:00', status: '대기' },
  { name: '박알바', shift: '22:00 - 06:00', status: '대기' },
]

const OwnerDashboard = () => {
  return (
    <div className="space-y-6">
      {/* ======= 2.a) 관리자 대시보드 - 실시간 판매량 그래프, 재고 현황, 금일 근무자, 주요 알람 ======= */}
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-1">
          실시간 매장 현황을 확인하세요
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              오늘 매출
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₩1,235,000</div>
            <p className="text-xs text-success mt-1">+12.5% 전일 대비</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              전체 재고
            </CardTitle>
            <Package className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">920개</div>
            <p className="text-xs text-muted-foreground mt-1">
              정상 재고 비율: 92%
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              발주 대기
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8건</div>
            <p className="text-xs text-warning mt-1">확인 필요</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              근무자
            </CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12명</div>
            <p className="text-xs text-muted-foreground mt-1">금일 근무: 3명</p>
          </CardContent>
        </Card>
      </div>

      {/* ======= 2.a-1) 실시간 판매량 그래프 (백엔드 연동), 2.a-2) 재고 현황 요약 ======= */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>실시간 판매량</CardTitle>
            <CardDescription>
              시간대별 매출 현황 (백엔드 연동 예정)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>재고 현황 요약</CardTitle>
            <CardDescription>카테고리별 재고 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={inventoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Staff and Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ======= 2.a-3) 금일 근무자 정보 ======= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              금일 근무자 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayStaff.map((staff, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {staff.shift}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      staff.status === '근무중'
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ======= 2.a-4) 주요 알람 (발주 알림, 폐기된 물품 알림) ======= */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              주요 알람
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium text-sm">발주 요청 대기</p>
                  <p className="text-xs text-muted-foreground">
                    8건의 발주 요청이 승인을 기다리고 있습니다
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">폐기 물품 알림</p>
                  <p className="text-xs text-muted-foreground">
                    오늘 3개 품목이 폐기되었습니다 (₩45,000)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">유통기한 임박</p>
                  <p className="text-xs text-muted-foreground">
                    15개 품목의 유통기한이 3일 이내입니다
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default OwnerDashboard
