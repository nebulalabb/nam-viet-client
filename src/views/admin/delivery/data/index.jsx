import {
  IconLoader2,
  IconTruckLoading,
  IconCircleCheck,
  IconCircleX,
  IconCash,
  IconWallet,
} from '@tabler/icons-react'

export const deliveryStatuses = [
  {
    value: 'pending',
    label: 'Chờ giao',
    icon: IconLoader2,
    color: 'bg-yellow-500 text-white',
    textColor: 'text-yellow-500',
  },
  {
    value: 'in_transit',
    label: 'Đang giao',
    icon: IconTruckLoading,
    color: 'bg-blue-500 text-white',
    textColor: 'text-blue-500',
  },
  {
    value: 'delivered',
    label: 'Đã giao',
    icon: IconCircleCheck,
    color: 'bg-green-500 text-white',
    textColor: 'text-green-500',
  },
  {
    value: 'failed',
    label: 'Thất bại',
    icon: IconCircleX,
    color: 'bg-red-500 text-white',
    textColor: 'text-red-500',
  },
]

export const settlementStatuses = [
  {
    value: 'pending',
    label: 'Chưa đối soát',
    icon: IconWallet,
    color: 'bg-amber-100 text-amber-700',
    dotColor: 'bg-amber-500',
  },
  {
    value: 'settled',
    label: 'Đã đối soát',
    icon: IconCash,
    color: 'bg-emerald-100 text-emerald-700',
    dotColor: 'bg-emerald-500',
  },
]
