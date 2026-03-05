import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { unitStatuses } from '../data'
import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import UpdateUnitStatusDialog from './UpdateUnitStatusDialog'

export const columns = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'unitCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã Đơn Vị" />
        ),
        cell: ({ row }) => (
            <div className="font-medium whitespace-nowrap">
                {row.getValue('unitCode')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'unitName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên Đơn Vị" />
        ),
        cell: ({ row }) => (
            <div className="font-medium whitespace-nowrap">
                {row.getValue('unitName')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mô Tả" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground line-clamp-2 max-w-[200px]" title={row.getValue('description')}>
                {row.getValue('description') || '-'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: function Cell({ row }) {
            const statusValue = row.getValue('status')
            const status = unitStatuses.find((s) => s.value === statusValue) || {
                label: statusValue,
                variant: 'outline',
            }

            const StatusIcon = status.icon
            const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

            return (
                <>
                    <div
                        className="flex w-[120px] cursor-pointer items-center"
                        onClick={() => setShowUpdateStatusDialog(true)}
                    >
                        <Badge variant={status.variant} className="flex items-center gap-1">
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {status.label}
                        </Badge>
                    </div>

                    {showUpdateStatusDialog && (
                        <UpdateUnitStatusDialog
                            open={showUpdateStatusDialog}
                            onOpenChange={setShowUpdateStatusDialog}
                            unit={row.original}
                            showTrigger={false}
                        />
                    )}
                </>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'creator',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Người tạo" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-nowrap font-medium" title={row.original?.creator?.fullName}>
                {row.original?.creator?.fullName || '-'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày tạo" />
        ),
        cell: ({ row }) => <span>{dateFormat(row.getValue('createdAt'), true)}</span>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thao tác" />
        ),
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
