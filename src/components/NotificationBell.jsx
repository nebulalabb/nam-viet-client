import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useMemo } from 'react'

import { Link, useNavigate } from 'react-router-dom'
import { dateFormat } from '@/utils/date-format'
import clsx from 'clsx'

const NotificationBell = () => {
  const notifications = []
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0"
          aria-label="Thông báo"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute right-0 top-0 inline-flex h-2 w-2 rounded-full bg-red-500"
              aria-label={`${unreadCount} thông báo mới`}
            />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="mr-5 max-h-[50vh] w-80 overflow-y-auto"
        align="start"
      >
        <DropdownMenuLabel className="flex items-center justify-between text-sm font-semibold">
          <span>Thông báo</span>
          <span className="text-xs font-normal text-muted-foreground">
            Chưa đọc: <b>{unreadCount}</b>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* === Hôm nay === */}
        {todayList.length > 0 && (
          <>
            <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
              Hôm nay
            </div>
            {todayList.map((noti) => (
              <DropdownMenuItem
                key={noti.id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <Link
                  to="/expiry"
                  onClick={(e) => handleClickItem(e, noti)}
                  className="flex w-full flex-col rounded-md p-3 transition"
                >
                  <span
                    className={clsx(
                      'text-sm',
                      getNotificationTextClass(noti, true),
                    )}
                  >
                    {noti.message || noti.title}
                  </span>
                  <span className="w-full text-end text-xs text-muted-foreground">
                    {dateFormat(noti.createdAt)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* === Trước đó === */}
        {earlierList.length > 0 ? (
          <>
            <div className="px-2 pb-1 text-xs font-semibold text-muted-foreground">
              Trước đó
            </div>
            {earlierList.map((noti) => (
              <DropdownMenuItem
                key={noti.id}
                asChild
                className="p-0 focus:bg-transparent"
              >
                <Link
                  to="/expiry"
                  className="flex w-full flex-col rounded-md p-3 transition"
                >
                  <span
                    className={clsx(
                      'text-sm',
                      getNotificationTextClass(noti, false),
                    )}
                  >
                    {noti.message || noti.title}
                  </span>
                  <span className="w-full text-end text-xs text-muted-foreground">
                    {dateFormat(noti.createdAt)}
                  </span>
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          notifications.length === 0 && (
            <DropdownMenuItem className="text-muted-foreground">
              Không có thông báo
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell
