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
    color: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    textColor: 'text-amber-600',
  },
  {
    value: 'preparing',
    label: 'Đã duyệt',
    icon: IconRefreshDot,
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    textColor: 'text-blue-600',
  },
  {
    value: 'delivering',
    label: 'Đang giao hàng',
    icon: TruckIcon,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    textColor: 'text-indigo-600',
  },
  {
    value: 'completed',
    label: 'Hoàn thành',
    icon: CheckCircleIcon,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
    textColor: 'text-emerald-600',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconX,
    color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
    textColor: 'text-red-600',
  },
]

// Payment Status (Trạng thái thanh toán - tách riêng)
const paymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa TT',
    icon: IconRefreshDot,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    value: 'partial',
    label: 'TT một phần',
    icon: IconAlertTriangleFilled,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    value: 'paid',
    label: 'Đã TT',
    icon: CheckCircleIcon,
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
]

export { statuses, paymentStatuses }
