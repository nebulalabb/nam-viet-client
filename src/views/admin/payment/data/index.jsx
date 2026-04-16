import {
  IconCheck,
  IconCircleX,
  IconClock,
  IconFileText,
  IconCash,
  IconBuildingBank,
} from '@tabler/icons-react'

export const paymentMethods = [
  {
    value: 'cash',
    label: 'Tiền mặt',
    icon: IconCash,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: IconBuildingBank,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    value: 'bank_transfer',
    label: 'Chuyển khoản',
    icon: IconBuildingBank,
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
]

export const paymentStatus = [
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconFileText,
  },
  {
    value: 'posted',
    label: 'Đã chi',
    icon: IconCheck,
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconCircleX,
  },
]
