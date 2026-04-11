import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useState, useMemo } from 'react'
import LogoutAlertDialog from './LogoutAlertDialog'
import { useDispatch, useSelector } from 'react-redux'
import UserProfileDialog from './UserProfileDialog'
import ChangePasswordDialog from './ChangePasswordDialog'
import { Key, LogOut, UserCircle, Moon, Sun, Monitor, Bell, AlertTriangle, Check } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu'

import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const UserNav = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const avatarFallback = fullName && fullName.charAt(0).toUpperCase()

  const [isOpenLogoutAlertDialog, setIsOpenLogoutAlertDialog] = useState(false)
  const [isOpenProfileDialog, setIsOpenProfileDialog] = useState(false)
  const [isOpenChangePasswordDialog, setIsOpenChangePasswordDialog] =
    useState(false)
  const [showMobileNotifications, setShowMobileNotifications] = useState(false)

  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const notifications = useSelector(
    (state) => state.notification.notifications,
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  )



  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 text-emerald-50 hover:bg-white/20 hover:text-white transition-all">
            <img src="/icons/people.png" alt="User" className="h-5 w-5 brightness-0 invert opacity-95" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
          <DropdownMenuLabel className="font-normal p-3 bg-primary/5 rounded-md mb-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={`https://ui-avatars.com/api/?bold=true&background=random&name=${fullName}`} alt={fullName} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 overflow-hidden">
                <p className="text-sm font-bold leading-none text-primary truncate">
                  {fullName}
                </p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {authUserWithRoleHasPermissions.email || authUserWithRoleHasPermissions.username}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="mb-2" />

          <DropdownMenuGroup className="space-y-1">
            <DropdownMenuItem 
              onClick={() => setIsOpenProfileDialog(true)}
              className="gap-3 cursor-pointer p-2.5 rounded-md focus:bg-primary/10 focus:text-primary transition-colors"
            >
              <UserCircle className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">Thông tin cá nhân</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={() => setIsOpenChangePasswordDialog(true)}
              className="gap-3 cursor-pointer p-2.5 rounded-md focus:bg-primary/10 focus:text-primary transition-colors"
            >
              <Key className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Đổi mật khẩu</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <div className="md:hidden">
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  setShowMobileNotifications(true)
                }}
                className="gap-3 cursor-pointer p-2.5 rounded-md focus:bg-primary/10 transition-colors"
              >
                <Bell className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Thông báo</span>
                {unreadCount > 0 && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-3 cursor-pointer p-2.5 rounded-md focus:bg-primary/10 transition-colors">
                  {theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="font-medium">Giao diện</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="p-2">
                    <DropdownMenuItem onClick={() => setTheme('light')} className="gap-2 cursor-pointer rounded-md">
                      <Sun className="h-4 w-4" />
                      <span>Sáng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')} className="gap-2 cursor-pointer rounded-md">
                      <Moon className="h-4 w-4" />
                      <span>Tối</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')} className="gap-2 cursor-pointer rounded-md">
                      <Monitor className="h-4 w-4" />
                      <span>Hệ thống</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator className="my-2" />

          <DropdownMenuItem
            className="text-destructive gap-3 cursor-pointer p-2.5 rounded-md focus:bg-destructive/10 focus:text-destructive transition-colors"
            onClick={() => setIsOpenLogoutAlertDialog(true)}
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isOpenProfileDialog && (
        <UserProfileDialog
          showTrigger={false}
          isOpen={isOpenProfileDialog}
          onOpenChange={setIsOpenProfileDialog}
        />
      )}

      {isOpenChangePasswordDialog && (
        <ChangePasswordDialog
          showTrigger={false}
          isOpen={isOpenChangePasswordDialog}
          onOpenChange={setIsOpenChangePasswordDialog}
        />
      )}

      <Dialog open={showMobileNotifications} onOpenChange={setShowMobileNotifications}>
        <DialogContent className="w-[95vw] rounded-lg p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle>Thông báo</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-2 pb-4">
            {notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.map((noti) => (
                  <div
                    key={noti.key}
                    onClick={() => {
                      if (noti.link) navigate(noti.link)
                      setShowMobileNotifications(false)
                    }}
                    className={clsx(
                      'flex items-start gap-2 rounded-md p-3 transition cursor-pointer hover:bg-accent',
                      noti.unread ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'opacity-70',
                    )}
                  >
                    <div
                      className={clsx(
                        'mt-0.5 shrink-0 rounded-full p-1.5',
                        noti.type === 'warning'
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
                      )}
                    >
                      {noti.type === 'warning' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Bell className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={clsx('text-sm font-medium', noti.unread ? 'text-foreground' : 'text-muted-foreground')}>
                        {noti.title}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {noti.message}
                      </p>
                    </div>
                    {noti.unread && (
                      <span className="shrink-0 mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Check className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Không có thông báo</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isOpenLogoutAlertDialog && (
        <LogoutAlertDialog
          isOpen={isOpenLogoutAlertDialog}
          onOpenChange={setIsOpenLogoutAlertDialog}
        />
      )}
    </>
  )
}

export default UserNav
