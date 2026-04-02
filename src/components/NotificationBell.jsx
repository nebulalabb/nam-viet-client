import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Bell, AlertTriangle, PackageX, Check } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLowStockProducts } from '@/stores/ProductSlice'
import {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
} from '@/stores/NotificationSlice'
import clsx from 'clsx'

// Key cố định cho thông báo tồn kho
const INVENTORY_WARNING_KEY = 'inventory_low_stock_warning'

const NotificationBell = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const notifications = useSelector(
    (state) => state.notification.notifications,
  )
  const lowStockProducts = useSelector(
    (state) => state.product.lowStockProducts || [],
  )
  const authUser = useSelector(
    (state) => state.auth.authUserWithRoleHasPermissions,
  )

  // Tính số sản phẩm thực sự thiếu hụt
  const lowStockCount = useMemo(() => {
    let count = 0
    lowStockProducts.forEach((product) => {
      product.inventory?.forEach((inv) => {
        const available =
          Number(inv.quantity) - Number(inv.reservedQuantity || 0)
        if (available < Number(product.minStockLevel)) {
          count += 1
        }
      })
    })
    return count
  }, [lowStockProducts])

  // Khi đăng nhập (authUser thay đổi) → fetch low-stock data
  useEffect(() => {
    if (authUser) {
      dispatch(getLowStockProducts({}))
    }
  }, [authUser, dispatch])

  // Khi có dữ liệu low stock → tạo hoặc xóa thông báo
  useEffect(() => {
    if (!authUser) return

    if (lowStockCount > 0) {
      // Thêm thông báo (nếu chưa có hoặc đã bị xóa)
      // Sử dụng key cố định → sẽ không tạo thêm nếu đã tồn tại
      dispatch(
        addNotification({
          key: INVENTORY_WARNING_KEY,
          title: 'Cảnh báo tồn kho',
          message: `Có ${lowStockCount} sản phẩm đang dưới mức tồn kho tối thiểu. Vui lòng kiểm tra và bổ sung hàng.`,
          link: '/inventory-warning',
          type: 'warning',
        }),
      )
    } else {
      // Không còn cảnh báo → xóa thông báo
      dispatch(removeNotification(INVENTORY_WARNING_KEY))
    }
  }, [lowStockCount, authUser, dispatch])

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  )

  const handleClickNotification = useCallback(
    (noti) => {
      dispatch(markAsRead(noti.key))
      if (noti.link) {
        navigate(noti.link)
      }
    },
    [dispatch, navigate],
  )

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllAsRead())
  }, [dispatch])

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
              className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse"
              aria-label={`${unreadCount} thông báo mới`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="mr-5 max-h-[50vh] w-80 overflow-y-auto"
        align="start"
      >
        <DropdownMenuLabel className="flex items-center justify-between text-sm font-semibold">
          <span>Thông báo</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-normal text-blue-500 hover:text-blue-700 hover:underline transition-colors cursor-pointer"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <DropdownMenuItem
              key={noti.key}
              className={clsx(
                'flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors',
                noti.unread
                  ? 'bg-blue-50/50 dark:bg-blue-950/20'
                  : 'opacity-70',
              )}
              onClick={() => handleClickNotification(noti)}
            >
              <div className="flex items-start gap-2 w-full">
                {/* Icon theo type */}
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
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={clsx(
                        'text-sm font-medium',
                        noti.unread
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {noti.title}
                    </span>
                    {noti.unread && (
                      <span className="shrink-0 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p
                    className={clsx(
                      'text-xs mt-0.5 leading-relaxed',
                      noti.unread
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/70',
                    )}
                  >
                    {noti.message}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Check className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Không có thông báo</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationBell
