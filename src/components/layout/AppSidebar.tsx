import { useLocation } from 'react-router-dom'
import { NavLink } from '@/components/NavLink'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  MessageSquare,
  Bell,
  ClipboardList,
  Calendar,
  QrCode,
  Store,
  FileText,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useEffect, useState } from 'react'

const ownerMenuItems = [
  { title: '대시보드', url: '/owner/dashboard', icon: LayoutDashboard },
  { title: '재고/발주 관리', url: '/owner/inventory', icon: Package },
  { title: '근무자 관리', url: '/owner/staff', icon: Users },
  { title: '데이터 분석', url: '/owner/analytics', icon: BarChart3 },
  { title: '공지사항 관리', url: '/owner/announcements', icon: Bell },
  { title: '게시판 관리', url: '/owner/boards', icon: MessageSquare },
]

const staffMenuItems = [
  { title: '대시보드', url: '/staff/dashboard', icon: LayoutDashboard },
  { title: '업무 인수인계', url: '/staff/handover', icon: ClipboardList },
  { title: '재고 & 폐기', url: '/staff/inventory', icon: QrCode },
  { title: '근무 스케줄', url: '/staff/schedule', icon: Calendar },
]

const commonMenuItems = [
  { title: '공지사항', url: '/announcements', icon: FileText },
  { title: '익명 커뮤니티', url: '/community', icon: MessageSquare },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()

  const [role, setRole] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const storedRole = localStorage.getItem('role') // 🔥 통일된 key
    setRole(storedRole)
    setReady(true)
  }, [])

  if (!ready) return null

  const menuItems = role === 'owner' ? ownerMenuItems : staffMenuItems
  const collapsed = state === 'collapsed'

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <div className={`p-4 border-b ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>

            {!collapsed && (
              <div>
                <h2 className="font-bold text-sm">편의점 관리</h2>
                <p className="text-xs text-muted-foreground">
                  {role === 'owner' ? '관리자 모드' : '근무자 모드'}
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && (role === 'owner' ? '관리 메뉴' : '업무 메뉴')}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{!collapsed && '공통 메뉴'}</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {commonMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
