import { CheckCircle2, XCircle, Lock } from 'lucide-react'

export const employeeStatuses = [
    {
        value: 'active',
        label: 'Hoạt động',
        icon: CheckCircle2,
        variant: 'success',
    },
    {
        value: 'inactive',
        label: 'Không hoạt động',
        icon: XCircle,
        variant: 'secondary',
    },
    {
        value: 'locked', // match backend 'locked' status
        label: 'Tạm khóa',
        icon: Lock,
        variant: 'destructive',
    },
]
