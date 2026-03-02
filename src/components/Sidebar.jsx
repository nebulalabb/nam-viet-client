import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from './custom/Button'
import { ChevronsLeft, Menu, X } from 'lucide-react'
import { Layout, LayoutHeader, LayoutBody } from './custom/Layout'
import Nav from './Nav'
import { sideLinks } from '@/data/SideLink'
import { Link } from 'react-router-dom'

const Sidebar = ({ className, isCollapsed, setIsCollapsed }) => {
  const [navOpened, setNavOpened] = useState(false)

  return (
    <aside
      className={cn(
        `fixed left-0 right-0 top-0 z-[500] w-full bg-background text-foreground transition-[width] md:z-50 md:bottom-0 md:right-auto md:h-svh ${isCollapsed ? 'md:w-14' : 'md:w-64'}`,
        className,
      )}
    >
      {/* Overlay in mobile */}
      <div
        onClick={() => setNavOpened(false)}
        className={`absolute inset-0 transition-[opacity] duration-100 ${navOpened ? 'h-svh opacity-50' : 'h-0 opacity-0'} w-full bg-black md:hidden`}
      />

      <Layout>
        {/* Header */}
        <LayoutHeader className="sticky top-0 justify-between px-4 py-3 bg-background border-b border-border md:px-4 min-h-[var(--header-height)] shadow-sm">
          <Link to={'/dashboard'} className="overflow-hidden">
            <div className={`flex items-center ${!isCollapsed ? 'gap-3' : 'gap-0'}`}>
              <div className="flex flex-shrink-0 items-center justify-center p-1">
                <img
                  src="/images/logo/logo-nobackground.png"
                  alt="Nam Viet Logo"
                  className={`transition-all duration-300 object-contain ${isCollapsed ? 'block h-8 w-8' : 'block h-10 w-auto'}`}
                />
              </div>
              <span className="sr-only">NAM VIỆT</span>
              <div
                className={`flex flex-col justify-end truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
              >
                <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500 uppercase drop-shadow-sm">
                  Nam Việt
                </span>
              </div>
            </div>
          </Link>
          {/* Toggle Button in mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Navigation"
            aria-controls="sidebar-menu"
            aria-expanded={navOpened}
            onClick={() => setNavOpened((prev) => !prev)}
          >
            {navOpened ? (
              <X className="text-foreground h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="text-foreground h-5 w-5" strokeWidth={2} />
            )}
          </Button>
        </LayoutHeader>

        <LayoutBody className="h-full flex-1 border-r border-border p-0 md:px-0 bg-background/50 backdrop-blur-sm">
          <Nav
            id="sidebar-menu"
            className={`h-full flex-1 overflow-y-auto overflow-x-hidden transition-all ${navOpened
              ? 'max-h-[80vh] py-2 md:max-h-screen'
              : 'max-h-0 py-0 md:max-h-screen md:py-2'
              }`}
            closeNav={() => setNavOpened(false)}
            isCollapsed={isCollapsed}
            links={sideLinks}
          />
        </LayoutBody>

        {/* Scrollbar width toggle button */}
        <Button
          onClick={() => setIsCollapsed((prev) => !prev)}
          size="icon"
          variant="outline"
          className="absolute -right-4 top-1/2 hidden h-8 w-8 rounded-full border border-border bg-background text-foreground shadow-sm md:inline-flex hover:bg-accent hover:text-accent-foreground z-50 transition-transform hover:scale-105"
        >
          <ChevronsLeft
            strokeWidth={2}
            className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </Button>
      </Layout>
    </aside>
  )
}

export default Sidebar
