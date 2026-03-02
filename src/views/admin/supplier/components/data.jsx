import {
    IconBuildingStore,
    IconCheck,
    IconX,
} from '@tabler/icons-react'

export const supplierStatuses = [
    {
        value: 'active',
        label: 'Đang giao dịch',
        icon: IconCheck,
        variant: 'success',
    },
    {
        value: 'inactive',
        label: 'Ngừng giao dịch',
        icon: IconX,
        variant: 'secondary',
    },
]

export const supplierTypes = [
    {
        value: 'local',
        label: 'Trong nước',
        color: 'text-blue-600',
        icon: IconBuildingStore,
    },
    {
        value: 'foreign',
        label: 'Nước ngoài',
        color: 'text-purple-600',
        icon: IconBuildingStore,
    },
]
