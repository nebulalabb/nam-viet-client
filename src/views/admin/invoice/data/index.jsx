import {
  IconAlertTriangleFilled,
  IconRefreshDot,
  IconX,
} from '@tabler/icons-react'
import { CheckCircleIcon, TruckIcon } from 'lucide-react'

// Invoice Status (Trạng thái đơn hàng)
const statuses = [
  {
    value: 'pending',
    label: 'Chờ xử lý',
    icon: IconRefreshDot,
    color: 'bg-yellow-500 text-white',
    textColor: 'text-yellow-500',
  },
  {
    value: 'preparing',
    label: 'Đã duyệt',
    icon: IconRefreshDot,
    color: 'bg-blue-500 text-white',
    textColor: 'text-blue-500',
  },
  {
    value: 'delivering',
    label: 'Đang giao hàng',
    icon: TruckIcon,
    color: 'bg-indigo-500 text-white',
    textColor: 'text-indigo-500',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircleIcon,
    color: 'bg-green-500 text-white',
    textColor: 'text-green-500',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconX,
    color: 'bg-red-500 text-white',
    textColor: 'text-red-500',
  },
]

// Payment Status (Trạng thái thanh toán - tách riêng)
const paymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    icon: IconRefreshDot,
    color: 'text-red-500',
  },
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    icon: IconAlertTriangleFilled,
    color: 'text-yellow-500',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
]

export { statuses, paymentStatuses }
