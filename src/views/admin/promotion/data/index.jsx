import {
    CheckCircle2,
    Clock,
    XCircle,
    Ban,
    Timer
} from 'lucide-react'

export const promotionStatuses = [
    {
        value: 'pending',
        label: 'Chờ duyệt',
        icon: Clock,
        variant: 'outline',
    },
    {
        value: 'waiting',
        label: 'Đang chờ',
        icon: Timer,
        variant: 'default',
    },
    {
        value: 'active',
        label: 'Đang hoạt động',
        icon: CheckCircle2,
        variant: 'secondary',
    },
    {
        value: 'expired',
        label: 'Hết hạn',
        icon: XCircle,
        variant: 'destructive',
    },
    {
        value: 'cancelled',
        label: 'Đã hủy',
        icon: Ban,
        variant: 'destructive',
    },
]

export const promotionTypes = [
    {
        value: 'buy_x_get_y',
        label: 'Mua X tặng Y',
    },
    {
        value: 'gift',
        label: 'Tặng quà',
    },
]

export const applicableToOptions = [
    {
        value: 'all',
        label: 'Tất cả sản phẩm',
    },
    {
        value: 'product_group',
        label: 'Nhóm sản phẩm',
    },
    {
        value: 'specific_product',
        label: 'Sản phẩm cụ thể',
    },
    {
        value: 'customer_group',
        label: 'Nhóm khách hàng',
    },
    {
        value: 'specific_customer',
        label: 'Khách hàng cụ thể',
    },
]
