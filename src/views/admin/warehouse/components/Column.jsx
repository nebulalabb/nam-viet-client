import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowAction } from './DataTableRowAction'
import { format } from 'date-fns'
import { useState } from 'react'
import WarehouseDetailDialog from './WarehouseDetailDialog'
import UpdateWarehouseStatusDialog from './UpdateWarehouseStatusDialog'
import { warehouseStatuses, warehouseTypes } from '../data'

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
        accessorKey: 'warehouseCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã Kho" />
        ),
        cell: function Cell({ row }) {
            const [showDetailDialog, setShowDetailDialog] = useState(false)

            return (
                <div>
                    <div
                        onClick={() => setShowDetailDialog(true)}
                        className="cursor-pointer font-medium text-blue-600 hover:underline"
                        title={row.getValue('warehouseCode')}
                    >
                        {row.getValue('warehouseCode')}
                    </div>

                    {showDetailDialog && (
                        <WarehouseDetailDialog
                            open={showDetailDialog}
                            onOpenChange={setShowDetailDialog}
                            warehouse={row.original}
                            showTrigger={false}
                        />
                    )}
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'warehouseName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên Kho" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
                        {row.getValue('warehouseName')}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: 'warehouseType',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Loại Kho" />
        ),
        cell: ({ row }) => {
            const typeValue = row.getValue('warehouseType')
            const type = warehouseTypes.find((t) => t.value === typeValue)

            if (!type) return <div className="flex w-[150px] items-center"></div>

            const TypeIcon = type.icon

            return (
                <div className={`flex w-[150px] items-center gap-2 font-medium ${type.color || ''}`}>
                    {TypeIcon && <TypeIcon className="h-4 w-4" />}
                    <span>{type.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: 'city',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Khu vực" />
        ),
        cell: ({ row }) => {
            return (
                <div className="max-w-[200px] truncate">
                    {row.getValue('city') || 'Chưa cập nhật'}
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: function Cell({ row }) {
            const statusValue = row.getValue('status')
            const status = warehouseStatuses.find((s) => s.value === statusValue) || {
                label: statusValue,
                variant: 'outline',
            }

            const StatusIcon = status.icon
            const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

            return (
                <>
                    <div
                        className="flex w-[100px] cursor-pointer items-center"
                        onClick={() => setShowUpdateStatusDialog(true)}
                    >
                        <Badge variant={status.variant} className="flex items-center gap-1">
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {status.label}
                        </Badge>
                    </div>

                    {showUpdateStatusDialog && (
                        <UpdateWarehouseStatusDialog
                            open={showUpdateStatusDialog}
                            onOpenChange={setShowUpdateStatusDialog}
                            warehouse={row.original}
                            showTrigger={false}
                        />
                    )}
                </>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'createdAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày tạo" />
        ),
        cell: ({ row }) => {
            const createdAt = row.getValue('createdAt')
            if (!createdAt) return null;
            return <div className="w-[100px] whitespace-nowrap">{format(new Date(createdAt), 'dd/MM/yyyy')}</div>
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <DataTableRowAction row={row} />,
    },
]
