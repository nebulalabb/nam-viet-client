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
    color: 'text-green-600',
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: IconBuildingBank,
    color: 'text-blue-600',
  },
  {
    value: 'bank_transfer',
    label: 'Chuyển khoản',
    icon: IconBuildingBank,
    color: 'text-blue-600',
  },
]

export const paymentStatus = [
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconFileText,
  },
  {
    value: 'completed',
    label: 'Đã chi',
    icon: IconCheck,
  },
  {
    value: 'cancelled',
    label: 'Đã hủy',
    icon: IconCircleX,
  },
]
