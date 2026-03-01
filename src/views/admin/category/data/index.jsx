import { CheckCircleIcon, PauseCircle } from 'lucide-react'

export const categoryStatuses = [
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
]
