import { Layout, LayoutBody, LayoutHeader } from '@/components/custom/Layout'
import { Outlet } from 'react-router-dom'
import ThemeSwitch from '@/components/ThemeSwitch'
import UserNav from '@/components/UserNav'
import Sidebar from '@/components/Sidebar'
import useIsCollapsed from '@/hooks/UseIsCollapsed'
import Notification from '@/components/custom/Notification'
import NotificationBell from '@/components/NotificationBell'
import MobileNavigation from '@/components/MobileNavigation'
import { GlobalSearch } from '@/components/GlobalSearch'

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
        className={`overflow-x-hidden pt-16 pb-16 transition-[margin] md:overflow-y-hidden md:pt-0 md:pb-0 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'} h-full`}
      >
        <Layout>
          <LayoutHeader className="sticky top-0 z-40 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white border-b border-emerald-600/50 min-h-[var(--header-height)] shadow-md">
            <div className="flex flex-1 items-center justify-end w-full">
              <div className="ml-auto flex items-center space-x-4 max-md:space-x-2 text-white">
                <GlobalSearch />
                <NotificationBell />
                <ThemeSwitch />
                <div className="pl-2 border-l border-emerald-700/50">
                  <UserNav />
                </div>
              </div>
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
