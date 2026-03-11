import {
  IconAlertTriangleFilled,
  IconExclamationCircle,
  IconFileInvoiceFilled,
  IconFilesOff,
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
    label: 'Đang chuẩn bị',
    icon: IconRefreshDot,
    color: 'bg-orange-500 text-white',
    textColor: 'text-orange-500',
  },
  {
    value: 'delivering',
    label: 'Đang giao hàng',
    icon: TruckIcon,
    color: 'bg-blue-500 text-white',
    textColor: 'text-blue-500',
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
    color: 'bg-gray-500 text-white',
    textColor: 'text-gray-500',
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

const attributes = {
  months: 'tháng',
  users: 'người dùng',
  orders: 'đơn hàng',
}

const eInvoiceStatuses = [
  {
    value: 'none',
    label: 'Chưa lập HĐĐT',
    icon: IconFilesOff,
    color: 'text-slate-400',
  },
  {
    value: 'draft',
    label: 'Nháp HĐĐT',
    icon: IconFileInvoiceFilled,
    color: 'text-blue-500',
  },
  {
    value: 'published',
    label: 'Đã phát hành HĐĐT',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
  {
    value: 'failed',
    label: 'Lập HĐĐT lỗi',
    icon: IconAlertTriangleFilled,
    color: 'text-red-500',
  },
  {
    value: 'canceled',
    label: 'HĐĐT đã hủy',
    icon: IconExclamationCircle,
    color: 'text-gray-500',
  },
]

const productTypeMap = {
  physical: 'vật lý',
  digital: 'phần mềm',
  service: 'dịch vụ',
}

export { statuses, paymentStatuses, attributes, eInvoiceStatuses, productTypeMap }
