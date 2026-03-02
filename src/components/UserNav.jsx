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
import { Key, LogOut, UserCircle, Moon, Sun, Monitor, Bell } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu'

import { Link, useNavigate } from 'react-router-dom'
import { dateFormat } from '@/utils/date-format'
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
  const notifications = []

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  )

  const todayList = useMemo(
    () => notifications.filter((n) => n.isToday),
    [notifications],
  )
  const earlierList = useMemo(
    () => notifications.filter((n) => !n.isToday),
    [notifications],
  )

  const handleClickItem = (e, noti) => {
    if (noti.isToday && noti.unread) {
      e.preventDefault()
      navigate('/expiry')
    }
  }

  const getNotificationTextClass = (noti, isToday) => {
    const isExpired = noti.name === 'Đã hết hạn sử dụng'

    if (isToday) {
      if (isExpired && noti.unread) return 'text-red-500 font-semibold'
      if (isExpired && !noti.unread) return 'text-red-400'
      if (!isExpired && !noti.unread) return 'text-gray-500'
      return 'text-gray-900'
    } else {
      if (isExpired) return 'text-red-400'
      return 'text-gray-500'
    }
  }

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
            <div className="flex items-center justify-between px-2 pb-2 text-sm font-semibold">
              <span>Danh sách</span>
              <span className="text-xs font-normal text-muted-foreground">
                Chưa đọc: <b>{unreadCount}</b>
              </span>
            </div>

            {todayList.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Hôm nay
                </div>
                <div className="space-y-1">
                  {todayList.map((noti) => (
                    <Link
                      key={noti.id}
                      to="/expiry"
                      onClick={(e) => {
                        handleClickItem(e, noti)
                        setShowMobileNotifications(false)
                      }}
                      className="flex w-full flex-col rounded-md p-3 transition hover:bg-accent"
                    >
                      <span
                        className={clsx(
                          'text-sm',
                          getNotificationTextClass(noti, true),
                        )}
                      >
                        {noti.content}
                      </span>
                      <span className="w-full text-end text-xs text-muted-foreground">
                        {dateFormat(noti.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
                <div className="my-2 h-px bg-muted" />
              </>
            )}

            {earlierList.length > 0 ? (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Trước đó
                </div>
                <div className="space-y-1">
                  {earlierList.map((noti) => (
                    <Link
                      key={noti.id}
                      to="/expiry"
                      onClick={() => setShowMobileNotifications(false)}
                      className="flex w-full flex-col rounded-md p-3 transition hover:bg-accent"
                    >
                      <span
                        className={clsx(
                          'text-sm',
                          getNotificationTextClass(noti, false),
                        )}
                      >
                        {noti.content}
                      </span>
                      <span className="w-full text-end text-xs text-muted-foreground">
                        {dateFormat(noti.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              notifications.length === 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Không có thông báo
                </div>
              )
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
