import { IconCircleCheck, IconLock } from '@tabler/icons-react'

export const statuses = [
  {
    value: 'published',
    label: 'Cho phép sử dụng',
    icon: IconCircleCheck,
  },
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconLock,
  },
  {
    value: 'pending',
    label: 'Chưa sẵn dùng',
    icon: IconLock,
  },
]
