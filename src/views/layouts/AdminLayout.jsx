import { Layout, LayoutBody, LayoutHeader } from '@/components/custom/Layout'
import { Outlet } from 'react-router-dom'
import ThemeSwitch from '@/components/ThemeSwitch'
import UserNav from '@/components/UserNav'
import Sidebar from '@/components/Sidebar'
import useIsCollapsed from '@/hooks/UseIsCollapsed'
import Notification from '@/components/custom/Notification'
import NotificationBell from '@/components/NotificationBell'
import MobileNavigation from '@/components/MobileNavigation'

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed()

  const handleCategoryClick = () => {
    // Trigger sidebar toggle by clicking the menu button in sidebar header
    const menuButton = document.querySelector('[aria-controls="sidebar-menu"]')
    if (menuButton) {
      menuButton.click()
    }
  }

  return (
    <div className="relative h-svh overflow-hidden bg-background">
      <Notification />
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main
        id="content"
        className={`overflow-x-hidden pt-16 pb-16 transition-[margin] md:overflow-y-hidden md:pt-0 md:pb-0 ${isCollapsed ? 'md:ml-14' : 'md:ml-64'} h-full`}
      >
        <Layout>
          <LayoutHeader className="sticky top-0 z-40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 text-foreground border-b border-border min-h-[var(--header-height)] shadow-sm">
            <div className="ml-auto flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4">
                <NotificationBell />
                <ThemeSwitch />
              </div>
              <UserNav />
            </div>
          </LayoutHeader>

          <LayoutBody>
            <Outlet />
          </LayoutBody>
        </Layout>
      </main>
      <MobileNavigation onCategoryClick={handleCategoryClick} />
    </div>
  )
}

export default AdminLayout
