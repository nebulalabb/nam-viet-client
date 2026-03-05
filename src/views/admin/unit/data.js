import { CheckCircle, XCircle } from 'lucide-react'

export const unitStatuses = [
    {
        value: 'active',
        label: 'Hoạt động',
        icon: CheckCircle,
        color: 'text-green-600',
        variant: 'success',
    },
    {
        value: 'inactive',
        label: 'Ngừng hoạt động',
        icon: XCircle,
        color: 'text-red-600',
        variant: 'destructive',
    },
]
