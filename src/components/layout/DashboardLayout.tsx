import { ReactNode, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Button } from '@/components/ui/button'
import { Bell, LogOut, Megaphone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

interface DashboardLayoutProps {
  children: ReactNode
}

interface LatestAnnouncement {
  _id: string;
  title: string;
  createdAt: string;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [username, setUsername] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [latestAnnouncement, setLatestAnnouncement] = useState<LatestAnnouncement | null>(null)
  const [ready, setReady] = useState(false)

  // 최신 공지사항 불러오기
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/announcements/list')
        if (res.data && res.data.length > 0) {
          setLatestAnnouncement(res.data[0]) // 정렬된 리스트의 첫번째
        }
      } catch (err) {
        console.error('Failed to fetch announcements')
      }
    }
    
    // 토큰이 있을때만 요청
    if (localStorage.getItem('token')) {
      fetchLatest()
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUsername = localStorage.getItem('username')
    const storedRole = localStorage.getItem('role')

    if (!token || !storedUsername || !storedRole) {
      navigate('/', { replace: true })
      return
    }

    setUsername(storedUsername)
    setRole(storedRole)
    setReady(true)
  }, [navigate])

  if (!ready) return null

  const handleLogout = () => {
    localStorage.clear()
    toast({
      title: '로그아웃 완료',
      description: '안전하게 로그아웃되었습니다.',
    })
    navigate('/')
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top Banner for Latest Announcement */}
          {latestAnnouncement && (
            <div 
              className="bg-primary/90 hover:bg-primary text-primary-foreground px-4 py-2 text-sm flex items-center justify-center cursor-pointer transition-colors"
              onClick={() => navigate('/announcements')}
            >
              <Megaphone className="w-4 h-4 mr-2 animate-pulse" />
              <span className="font-semibold mr-2">[최신 공지]</span>
              <span className="mr-2">{latestAnnouncement.title}</span>
              <span className="text-primary-foreground/70 text-xs">
                ({new Date(latestAnnouncement.createdAt).toLocaleDateString()} {new Date(latestAnnouncement.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})
              </span>
            </div>
          )}

          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger className="-ml-2" />

              <div className="flex-1"></div>

              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === 'owner' ? '관리자' : '근무자'}
                  </p>
                </div>

                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout
