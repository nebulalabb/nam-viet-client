import { Button } from './custom/Button'
import { useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { IconSun, IconMoon, IconDeviceDesktop, IconCheck } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    const themeColor = theme === 'dark' ? '#020817' : '#fff'
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    metaThemeColor && metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9 rounded-full text-emerald-50 hover:bg-white/20 hover:text-white transition-all">
          <img src="/icons/themes.png" alt="Theme" className="h-5 w-5 brightness-0 invert opacity-95" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-2">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={cn("flex items-center justify-between cursor-pointer mb-1 rounded-md px-3 py-2", theme === 'light' && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary")}
        >
          <div className="flex items-center">
            <IconSun className="mr-2 size-4" />
            <span className={theme === 'light' ? 'font-medium' : ''}>Nền sáng</span>
          </div>
          {theme === 'light' && <IconCheck className="size-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={cn("flex items-center justify-between cursor-pointer mb-1 rounded-md px-3 py-2", theme === 'dark' && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary")}
        >
          <div className="flex items-center">
            <IconMoon className="mr-2 size-4" />
            <span className={theme === 'dark' ? 'font-medium' : ''}>Nền tối</span>
          </div>
          {theme === 'dark' && <IconCheck className="size-4" />}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={cn("flex items-center justify-between cursor-pointer rounded-md px-3 py-2", theme === 'system' && "bg-primary/10 text-primary focus:bg-primary/15 focus:text-primary")}
        >
          <div className="flex items-center">
            <IconDeviceDesktop className="mr-2 size-4" />
            <span className={theme === 'system' ? 'font-medium' : ''}>Hệ thống</span>
          </div>
          {theme === 'system' && <IconCheck className="size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ThemeSwitch
