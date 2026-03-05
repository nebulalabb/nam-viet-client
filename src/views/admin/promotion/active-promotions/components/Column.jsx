import { format } from 'date-fns'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowAction'

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0)
}

export const columns = [
    {
        accessorKey: 'promotionCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã khuyến mãi" />
        ),
        cell: ({ row }) => (
            <div className="w-20 cursor-pointer font-medium text-blue-600 hover:underline">
                {row.getValue('promotionCode')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'promotionName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên khuyến mãi" />
        ),
        cell: ({ row }) => (
            <div className="max-w-[300px] truncate" title={row.getValue('promotionName')}>
                {row.getValue('promotionName')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'promotionType',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Loại KM" />
        ),
        cell: ({ row }) => {
            const type = row.getValue('promotionType')
            const labels = {
                buy_x_get_y: 'Mua X tặng Y',
                gift: 'Tặng quà',
                percentage: 'Giảm theo phần trăm',
                fixed_amount: 'Giảm cố định',
            }
            return <div>{labels[type] || type}</div>
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'minOrderValue',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đơn Tối Thiểu" />
        ),
        cell: ({ row }) => {
            const val = row.getValue('minOrderValue')
            return val ? formatCurrency(val) : '-'
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'usageCount',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đã dùng" />
        ),
        cell: ({ row }) => <div>{row.getValue('usageCount')}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'startDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Từ ngày" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('startDate')
            return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-'
        },
        filterFn: (row, id, filterValue) => {
            if (!filterValue || (!filterValue.from && !filterValue.to)) return true
            const startDate = row.getValue('startDate') ? new Date(row.getValue('startDate')) : null
            const endDate = row.getValue('endDate') ? new Date(row.getValue('endDate')) : null

            const fromDate = filterValue.from ? new Date(filterValue.from) : null
            const toDate = filterValue.to ? new Date(filterValue.to) : null

            // Nếu không có khoảng kết thúc, check lớn hơn from
            if (fromDate && !toDate) {
                return (startDate && startDate >= fromDate) || (endDate && endDate >= fromDate)
            }

            // Nếu có cả 2, check khoảng overlap
            if (fromDate && toDate) {
                // overlap: promo start <= toDate AND promo end >= fromDate
                const isOverlapping = (!startDate || startDate <= toDate) && (!endDate || endDate >= fromDate)
                return isOverlapping
            }

            return true
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'endDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đến ngày" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('endDate')
            return date ? format(new Date(date), 'dd/MM/yyyy HH:mm') : '-'
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
