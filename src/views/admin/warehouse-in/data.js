import { CheckCircle, Clock, XCircle } from 'lucide-react'

export const transactionStatuses = [
    {
        value: 'unposted',
        label: 'Chờ duyệt',
        icon: Clock,
        badgeClass: 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    },
    {
        value: 'posted',
        label: 'Đã ghi sổ',
        icon: CheckCircle,
        badgeClass: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
    },
    {
        value: 'cancelled',
        label: 'Hủy',
        icon: XCircle,
        badgeClass: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
]

export const getStatusConfig = (value) =>
    transactionStatuses.find((s) => s.value === value) || {
        value,
        label: value,
        icon: null,
        badgeClass: 'border-gray-300 bg-gray-50 text-gray-600',
    }
