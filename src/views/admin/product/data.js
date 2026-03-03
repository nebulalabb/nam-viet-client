import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export const productStatuses = [
    {
        value: 'active',
        label: 'Đang bán',
        icon: CheckCircle,
        color: 'text-green-600',
        variant: 'outline',
        badgeClass: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
    },
    {
        value: 'inactive',
        label: 'Ngừng bán',
        icon: XCircle,
        color: 'text-red-600',
        variant: 'outline',
        badgeClass: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    },
    {
        value: 'discontinued',
        label: 'Bỏ mẫu',
        icon: AlertCircle,
        color: 'text-yellow-600',
        variant: 'outline',
        badgeClass: 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
    },
]

export const productTypes = [
    { value: 'raw_material', label: 'Nguyên vật liệu' },
    { value: 'packaging', label: 'Bao bì' },
    { value: 'finished_product', label: 'Thành phẩm' },
    { value: 'goods', label: 'Hàng hóa' },
]
