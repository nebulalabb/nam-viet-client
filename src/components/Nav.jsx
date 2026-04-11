import { cn } from '@/lib/utils'
import { TooltipContent, TooltipProvider } from './ui/tooltip'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from './custom/Button'
import useCheckActiveNav from '@/hooks/UseCheckActiveNav'
import { Tooltip, TooltipTrigger } from '@radix-ui/react-tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible'
import { ChevronDown, ChevronRight } from 'lucide-react'
import Can from '@/utils/can'
import { useState } from 'react'

const Nav = ({ links, isCollapsed, className, closeNav }) => {
  const [openDropdownIdx, setOpenDropdownIdx] = useState(null)

  const renderLink = ({ sub, ...rest }, idx) => {
    const key = `${rest.title}-${rest.href || 'no-href'}`

    if (isCollapsed && sub)
      return (
        <NavLinkIconDropdown
          {...rest}
          sub={sub}
          key={key}
          closeNav={closeNav}
        />
      )

    if (isCollapsed)
      return <NavLinkIcon {...rest} key={key} closeNav={closeNav} />

    if (sub)
      return (
        <NavLinkDropdown
          {...rest}
          sub={sub}
          key={key}
          closeNav={closeNav}
          isOpen={openDropdownIdx === idx}
          userInteracted={openDropdownIdx !== null}
          onOpenChange={(open) => {
            if (open) {
              setOpenDropdownIdx(idx) // mở menu này, đóng tất cả menu khác
            } else {
              setOpenDropdownIdx(-1) // đánh dấu user chủ động đóng
            }
          }}
        />
      )

    return <NavLink {...rest} key={key} closeNav={closeNav} onClick={() => setOpenDropdownIdx(-1)} />
  }

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        'group border-b bg-transparent py-2 transition-[max-height,padding] duration-150 data-[collapsed=true]:py-2 md:border-none',
        className,
      )}
    >
      <TooltipProvider delayDuration={0}>
        <nav className="grid gap-2 px-3 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {links.map((link, idx) => {
            const key = `${link.href || 'no-href'}-${link.title || 'no-title'}-${idx}`

            return (
              <Can permission={link.permission} key={key} option="some">
                {renderLink(link, idx)}
              </Can>
            )
          })}
        </nav>
      </TooltipProvider>
    </div>
  )
}

export const ACTIVE_CLASS = 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold shadow-md shadow-emerald-500/20 ring-1 ring-emerald-700/50 dark:from-emerald-600/80 dark:to-teal-700/80'
export const INACTIVE_CLASS = 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'

const NavLink = ({ title, icon, label, href, closeNav, subLink = false, onClick }) => {
  const { checkActiveNav } = useCheckActiveNav()
  const isActive = checkActiveNav(href)

  return (
    <Link
      to={href}
      onClick={(e) => {
        closeNav?.()
        onClick?.(e)
      }}
      className={cn(
        buttonVariants({
          variant: 'ghost',
          size: 'sm',
        }),
        'h-[3.25rem] w-full justify-start text-wrap rounded-lg px-4 font-medium transition-all group',
        isActive ? ACTIVE_CLASS : INACTIVE_CLASS,
        subLink && 'h-11 w-full border-l-2 border-slate-100 dark:border-slate-800 px-4 rounded-none rounded-r-lg',
        subLink && isActive && 'border-emerald-500 shadow-none ring-0 from-emerald-50 to-emerald-100 text-emerald-700 dark:from-emerald-500/10 dark:to-emerald-500/5 dark:text-emerald-400'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className={cn("mr-2 transition-transform group-hover:scale-110", isActive && !subLink ? "text-emerald-50 drop-shadow-sm" : "")}>{icon}</div>
      {title}
      {label && (
        <div className={cn("ml-2 rounded-md px-1.5 py-0.5 text-[0.625rem]", isActive && !subLink ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")}>
          {label}
        </div>
      )}
    </Link>
  )
}

const NavLinkIcon = ({ title, icon, label, href }) => {
  const { checkActiveNav } = useCheckActiveNav()
  const isActive = checkActiveNav(href)
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={href}
          className={cn(
            buttonVariants({
              variant: 'ghost',
              size: 'icon',
            }),
            'h-12 w-12 transition-all group',
            isActive ? ACTIVE_CLASS : INACTIVE_CLASS
          )}
        >
          <div className={cn("transition-transform group-hover:scale-110", isActive ? "text-emerald-50 drop-shadow-sm" : "")}>{icon}</div>
          <span className="sr-only">{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {title}
        {label && (
          <span className="ml-auto text-muted-foreground">{label}</span>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

const NavLinkDropdown = ({ title, icon, label, sub, closeNav, isOpen, userInteracted = false, onOpenChange }) => {
  const { checkActiveNav } = useCheckActiveNav()

  const isChildActive = !!sub?.find((s) => checkActiveNav(s.href))

  // userInteracted = false: chưa tương tác → auto open nếu con đang active
  // userInteracted = true, isOpen = true: user mở menu này
  // userInteracted = true, isOpen = false: user đóng hoặc mở menu khác
  const openState = userInteracted ? isOpen : isChildActive

  return (
    <Collapsible
      open={openState}
      onOpenChange={onOpenChange}
    >
      <CollapsibleTrigger
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'group h-[3.25rem] w-full justify-start rounded-lg px-4 font-medium transition-all outline-none',
          isChildActive ? ACTIVE_CLASS : INACTIVE_CLASS
        )}
      >
        <div className={cn("mr-2 transition-transform group-hover:scale-110", isChildActive ? "text-emerald-50" : "")}>{icon}</div>
        {title}
        {label && (
           <div className={cn("ml-2 rounded-md px-1.5 py-0.5 text-[0.625rem]", isChildActive ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")}>
            {label}
          </div>
        )}
        <span
          className={cn(
            'ml-auto transition-transform duration-200 group-data-[state="open"]:rotate-180',
          )}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="collapsibleDropdown" asChild>
        <ul className="mt-1.5 pl-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-zinc-800">
          {sub &&
            sub.map((subLink) => (
              <Can
                permission={subLink.permission}
                key={subLink.href}
                option="some"
              >
                <li key={subLink.title} className="my-1 relative z-10 w-[calc(100%-8px)] ml-auto">
                  <NavLink {...subLink} subLink closeNav={closeNav} />
                </li>
              </Can>
            ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

const NavLinkIconDropdown = ({ title, icon, label, sub }) => {
  const { checkActiveNav } = useCheckActiveNav()

  const isChildActive = !!sub?.find((s) => checkActiveNav(s.href))

  return (
    <DropdownMenu>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-12 w-12 transition-all group", isChildActive ? ACTIVE_CLASS : INACTIVE_CLASS)}
            >
              <div className={cn("transition-transform group-hover:scale-110", isChildActive ? "text-emerald-50" : "")}>{icon}</div>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {title}{' '}
          {label && (
            <span className="ml-auto text-muted-foreground">{label}</span>
          )}
          <ChevronRight
            size={18}
            className="text-muted-foreground"
          />
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        <DropdownMenuLabel>
          {title} {label ? `(${label})` : ''}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sub &&
          sub.map(({ title, icon, label, href, permission }) => (
            <Can permission={permission} key={href} option="some">
              <DropdownMenuItem asChild>
                <Link
                  to={href}
                  className={`${checkActiveNav(href) ? 'bg-secondary' : ''}`}
                >
                  {icon}
                  <span className="ml-2 max-w-52 text-wrap">{title}</span>
                  {label && <span className="ml-auto text-xs">{label}</span>}
                </Link>
              </DropdownMenuItem>
            </Can>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Nav
