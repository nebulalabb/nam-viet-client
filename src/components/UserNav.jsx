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
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://ui-avatars.com/api/?bold=true&background=random&name=${authUserWithRoleHasPermissions?.fullName}`}
                alt={authUserWithRoleHasPermissions?.fullName}
              />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {authUserWithRoleHasPermissions?.fullName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {authUserWithRoleHasPermissions.username}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup onClick={() => setIsOpenProfileDialog(true)}>
            <DropdownMenuItem>
              Thông tin cá nhân
              <DropdownMenuShortcut>
                <UserCircle className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuGroup
            onClick={() => setIsOpenChangePasswordDialog(true)}
          >
            <DropdownMenuItem>
              Đổi mật khẩu
              <DropdownMenuShortcut>
                <Key className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <div className="md:hidden">
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  setShowMobileNotifications(true)
                }}
              >
                <Bell className="mr-2 h-4 w-4" />
                <span>Thông báo</span>
                {unreadCount > 0 && (
                  <span className="ml-auto mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    {unreadCount}
                  </span>
                )}
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {theme === 'dark' ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : (
                    <Sun className="mr-2 h-4 w-4" />
                  )}
                  <span>Giao diện</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Sáng</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Tối</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')}>
                      <Monitor className="mr-2 h-4 w-4" />
                      <span>Hệ thống</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsOpenLogoutAlertDialog(true)}
          >
            Đăng xuất
            <DropdownMenuShortcut>
              <LogOut className="h-4 w-4" />
            </DropdownMenuShortcut>
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
