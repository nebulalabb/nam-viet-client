import { IconRefreshDot } from '@tabler/icons-react'
import { CheckCircleIcon, PauseCircle, Ban } from 'lucide-react'

export const types = [
  {
    value: 'company',
    label: 'Công ty',
  },
  {
    value: 'individual',
    label: 'Cá nhân',
  },
]


export const customerStatuses = [
  {
    value: 'active',
    label: 'Hoạt động',
    variant: 'default',
    icon: CheckCircleIcon,
  },
  {
    value: 'inactive',
    label: 'Tạm ngưng',
    variant: 'secondary',
    icon: PauseCircle,
  },
  {
    value: 'blacklisted',
    label: 'Khóa',
    variant: 'destructive',
    icon: Ban,
  },
]

export const statuses = [
  {
    value: 'pending',
    label: 'Chờ duyệt',
    icon: IconRefreshDot,
    color: 'text-yellow-500',
  },
  {
    value: 'accepted',
    label: 'Đã duyệt',
    icon: CheckCircleIcon,
    color: 'text-green-500',
  },
]

export const invoiceTypes = [
  {
    value: 'physical',
    label: 'Hóa đơn vật lý',
  },
  {
    value: 'digital',
    label: 'Hóa đơn điện tử',
  },
  {
    value: 'warranty',
    label: 'Hóa đơn bảo hành',
  },
  {
    value: 'service',
    label: 'Hóa đơn dịch vụ',
  },
  {
    value: 'common_invoice',
    label: 'Hóa đơn thường',
  },
]
