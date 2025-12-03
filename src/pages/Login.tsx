import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Store, Lock, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface LoginResponse {
  token: string
  user: {
    _id: string
    username: string
    role: string
    name?: string
    phone?: string
    joinDate?: string
  }
}

const Login = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await api.post<LoginResponse>('/auth/login', {
        username,
        password,
      })

      const token = res.data.token
      const role = res.data.user.role
      const name = res.data.user.username

      // 🔥 저장 키 정확히 통일하기
      localStorage.setItem('token', token)
      localStorage.setItem('username', name)
      localStorage.setItem('role', role)

      toast({
        title: '로그인 성공',
        description: `${name}님 환영합니다.`,
      })

      // 🔥 role 기반 라우팅
      if (role === 'owner') {
        navigate('/owner/dashboard')
      } else {
        navigate('/staff/dashboard')
      }
    } catch (err: any) {
      toast({
        title: '로그인 실패',
        description:
          err?.response?.data?.message ||
          '아이디 또는 비밀번호가 올바르지 않습니다.',
        variant: 'destructive',
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Store className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">
                편의점 관리 시스템
              </CardTitle>
              <CardDescription className="text-base mt-2">
                로그인하여 시작하세요
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">아이디</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="아이디를 입력하세요"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
