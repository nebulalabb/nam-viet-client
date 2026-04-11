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
        `fixed left-0 right-0 top-0 z-[500] w-full bg-slate-50 dark:bg-zinc-950 text-foreground transition-[width] md:z-30 md:bottom-0 md:right-auto md:h-svh ${isCollapsed ? 'md:w-20' : 'md:w-64'}`,
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
        <LayoutHeader className="sticky top-0 z-40 justify-between px-3 md:px-4 py-3 bg-gradient-to-r from-emerald-800 to-emerald-700 border-b border-emerald-600/50 min-h-[var(--header-height)] shadow-sm">
          <Link to={'/dashboard'} className="overflow-hidden">
            <div className={`flex items-center ${!isCollapsed ? 'gap-3' : 'gap-0'}`}>
              <div className="flex flex-shrink-0 items-center justify-center p-1.5 bg-white rounded-xl shadow-md shadow-emerald-900/30">
                <img
                  src="/images/logo/logo-nobackground.png"
                  alt="Nam Viet Logo"
                  className={`transition-all duration-300 object-contain drop-shadow-sm ${isCollapsed ? 'block h-7 w-7' : 'block h-9 w-9'}`}
                />
              </div>
              <span className="sr-only">NAM VIỆT</span>
              <div
                className={`flex flex-col justify-center truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}
              >
                <span className="text-[19px] font-black tracking-tight text-white uppercase leading-tight pt-1">
                  Nam Việt
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-200 uppercase mt-0.5">
                  Hóa Sinh Nam Việt
                </span>
              </div>
            </div>
          </Link>
          {/* Toggle Button in mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            aria-label="Toggle Navigation"
            aria-controls="sidebar-menu"
            aria-expanded={navOpened}
            onClick={() => setNavOpened((prev) => !prev)}
          >
            {navOpened ? (
              <X className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2.5} />
            )}
          </Button>
        </LayoutHeader>

        <LayoutBody className="h-full flex-1 border-r border-border p-0 md:px-0 bg-transparent backdrop-blur-sm">
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
          className="absolute -right-4 top-1/2 hidden h-8 w-8 rounded-full border border-border bg-background text-foreground shadow-sm md:inline-flex hover:bg-primary hover:text-white hover:border-primary z-50 transition-all hover:scale-110"
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
