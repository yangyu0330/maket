import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './pages/Login'

import DashboardLayout from './components/layout/DashboardLayout'
import OwnerDashboard from './pages/owner/OwnerDashboard'
import StaffDashboard from './pages/staff/StaffDashboard'
import InventoryManagement from './pages/owner/InventoryManagement'
import StaffManagement from './pages/owner/StaffManagement'
import Analytics from './pages/owner/Analytics'
import AnnouncementManagement from './pages/owner/AnnouncementManagement'
import BoardManagement from './pages/owner/BoardManagement'
import Handover from './pages/staff/Handover'
import InventoryEntry from './pages/staff/InventoryEntry'
import Schedule from './pages/staff/Schedule'
import Community from './pages/common/Community'
import Announcements from './pages/common/Announcements'
import NotFound from './pages/NotFound'
import SelfCalculation from './pages/SelfCalculation'

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 로그인 */}
          <Route path="/" element={<Login />} />

          {/* Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <DashboardLayout>
                <OwnerDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/owner/inventory"
            element={
              <DashboardLayout>
                <InventoryManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/owner/staff"
            element={
              <DashboardLayout>
                <StaffManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/owner/analytics"
            element={
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            }
          />
          <Route
            path="/owner/announcements"
            element={
              <DashboardLayout>
                <AnnouncementManagement />
              </DashboardLayout>
            }
          />
          <Route
            path="/owner/boards"
            element={
              <DashboardLayout>
                <BoardManagement />
              </DashboardLayout>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <DashboardLayout>
                <StaffDashboard />
              </DashboardLayout>
            }
          />
          <Route
            path="/staff/handover"
            element={
              <DashboardLayout>
                <Handover />
              </DashboardLayout>
            }
          />
          <Route
            path="/staff/inventory"
            element={
              <DashboardLayout>
                <InventoryEntry />
              </DashboardLayout>
            }
          />
          <Route
            path="/staff/schedule"
            element={
              <DashboardLayout>
                <Schedule />
              </DashboardLayout>
            }
          />

          {/* 공통 */}
          <Route
            path="/announcements"
            element={
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            }
          />
          <Route
            path="/community"
            element={
              <DashboardLayout>
                <Community />
              </DashboardLayout>
            }
          />
          <Route path="/kiosk" element={<SelfCalculation />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
