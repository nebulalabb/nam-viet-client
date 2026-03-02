import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowAction'
import { supplierStatuses, supplierTypes } from './data'
import UpdateSupplierStatusDialog from './UpdateSupplierStatusDialog'
import { useState } from 'react'

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
                aria-label="Chọn tất cả"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn dòng"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'supplierCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã NCC" />
        ),
        cell: ({ row }) => (
            <div className="w-20 font-medium">{row.getValue('supplierCode')}</div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'supplierName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nhà Cung Cấp" />
        ),
        cell: ({ row }) => (
            <div className="font-medium whitespace-normal break-words">
                {row.getValue('supplierName')}
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
            const status = supplierStatuses.find((s) => s.value === statusValue) || {
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
                        <Badge variant={status.variant} className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {status.label}
                        </Badge>
                    </div>

                    {showUpdateStatusDialog && (
                        <UpdateSupplierStatusDialog
                            open={showUpdateStatusDialog}
                            onOpenChange={setShowUpdateStatusDialog}
                            supplier={row.original}
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
        accessorKey: 'totalPayable',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Công Nợ" />
        ),
        cell: ({ row }) => {
            const debt = Number(row.getValue('totalPayable')) || 0
            const formatCurrency = (val) =>
                new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(val)

            return (
                <div className="w-32 font-medium overflow-hidden text-ellipsis whitespace-nowrap text-red-600">
                    {formatCurrency(debt)}
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'contact',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Liên hệ (SĐT / Email)" />
        ),
        cell: ({ row }) => {
            const phone = row.original?.phone
            const email = row.original?.email
            return (
                <div className="flex flex-col gap-1 text-sm">
                    {phone ? (
                        <a
                            href={`tel:${phone}`}
                            className="font-medium underline text-green-700 hover:text-green-800"
                        >
                            {phone}
                        </a>
                    ) : (
                        <span className="text-gray-400 italic">Chưa có SĐT</span>
                    )}
                    {email ? (
                        <a
                            href={`mailto:${email}`}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {email}
                        </a>
                    ) : null}
                </div>
            )
        },
        enableSorting: false,
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
