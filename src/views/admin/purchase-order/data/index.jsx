import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import { IconBrandVisa, IconCash } from '@tabler/icons-react'

const attributes = {
  months: 'tháng',
  users: 'người dùng',
  orders: 'đơn hàng',
}

const purchaseOrderStatuses = [
  {
    value: 'pending',
    label: 'Chờ xác nhận',
    icon: Circle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  },
  {
    value: 'approved',
    label: 'Đã duyệt',
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  },
  {
    value: 'received',
    label: 'Hoàn thành',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
  },
]

const purchaseOrderPaymentStatuses = [
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    icon: XCircle,
    color: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    value: 'partial',
    label: 'TT một phần',
    icon: Clock,
    color: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    value: 'paid',
    label: 'Đã thanh toán',
    icon: CheckCircle2,
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
]

const productTypeMap = {
  physical: 'vật lý',
  digital: 'phần mềm',
  service: 'dịch vụ',
}

const paymentMethods = [
  {
    value: 'cash',
    label: 'Tiền mặt',
    icon: IconCash,
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: IconBrandVisa,
  },
]

export { attributes, purchaseOrderStatuses, purchaseOrderPaymentStatuses, productTypeMap, paymentMethods }