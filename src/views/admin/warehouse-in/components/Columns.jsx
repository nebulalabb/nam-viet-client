import { Badge } from '@/components/ui/badge'
import { StatusBadge } from './StatusBadge'

const dateFormat = (d) =>
    d ? new Date(d).toLocaleDateString('vi-VN') : '—'

export const columns = [
    {
        id: 'transactionCode',
        accessorKey: 'transactionCode',
        header: 'Mã phiếu',
        cell: ({ row }) => (
            <span className="font-mono text-xs font-medium text-primary">
                {row.original.transactionCode || `#${row.original.id}`}
            </span>
        ),
    },
    {
        id: 'warehouse',
        header: 'Kho',
        cell: ({ row }) => row.original.warehouse?.warehouseName || '—',
    },
    {
        id: 'reason',
        accessorKey: 'reason',
        header: 'Lý do',
        cell: ({ row }) => (
            <span className="line-clamp-1 max-w-[200px]">
                {row.original.reason || '—'}
            </span>
        ),
    },
    {
        id: 'itemCount',
        header: 'Số mặt hàng',
        cell: ({ row }) => (
            <Badge variant="secondary">{row.original.details?.length ?? 0}</Badge>
        ),
    },
    {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Ngày tạo',
        cell: ({ row }) => dateFormat(row.original.createdAt),
    },
    {
        id: 'createdBy',
        header: 'Người tạo',
        cell: ({ row }) =>
            row.original.createdByUser?.fullName || row.original.createdByUser?.username || '—',
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Trạng thái',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
        id: 'actions',
        header: '',
        enableHiding: false,
        cell: ({ row }) => row.original, // rendered by RowActions in DataTable
    },
]
