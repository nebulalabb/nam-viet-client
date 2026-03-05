import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { employeeStatuses } from '../data/index'
import { normalizeText } from '@/utils/normalize-text'
import UserDetailDialog from './EmployeeDetailDialog'
import UpdateUserStatusDialog from './UpdateEmployeeStatusDialog'
import { useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

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
        accessorKey: 'employeeCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã NV" />
        ),
        cell: function Cell({ row }) {
            const [showUserDetailDialog, setShowUserDetailDialog] = useState(false)

            return (
                <div>
                    <div
                        onClick={() => setShowUserDetailDialog(true)}
                        className="w-20 cursor-pointer font-medium text-blue-600 hover:underline"
                        title={row.getValue('employeeCode')}
                    >
                        {row.getValue('employeeCode')}
                    </div>

                    {showUserDetailDialog && (
                        <UserDetailDialog
                            open={showUserDetailDialog}
                            onOpenChange={setShowUserDetailDialog}
                            user={row.original}
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
        accessorKey: 'fullName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nhân viên" />
        ),
        cell: ({ row }) => {
            const name = row.original?.fullName
            const phone = row.original?.phone
            const email = row.original?.email

            return (
                <div className="flex flex-col gap-1 w-48">
                    <div className="whitespace-normal break-words font-medium">
                        {name}
                    </div>

                    {phone && (
                        <a
                            href={`tel:${phone}`}
                            className="text-xs text-primary underline dark:text-secondary-foreground"
                        >
                            {phone}
                        </a>
                    )}
                    {email && (
                        <span className="text-xs text-muted-foreground break-all">{email}</span>
                    )}
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
        filterFn: (row, id, value) => {
            const name = normalizeText(row.original?.fullName || '')
            const phone = normalizeText(row.original?.phone || '')
            const email = normalizeText(row.original?.email || '')
            const searchValue = normalizeText(value || '')

            return name.includes(searchValue) || phone.includes(searchValue) || email.includes(searchValue)
        },
    },

    {
        accessorKey: 'role',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Chức vụ" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-nowrap font-medium text-sm">
                {row.original?.role?.roleName || 'N/A'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },

    {
        accessorKey: 'warehouse',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Kho" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-normal font-medium text-sm text-muted-foreground w-36">
                {row.original?.warehouse?.warehouseName || '-'}
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
            const status = employeeStatuses.find((s) => s.value === statusValue) || {
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
                        <UpdateUserStatusDialog
                            open={showUpdateStatusDialog}
                            onOpenChange={setShowUpdateStatusDialog}
                            user={row.original}
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
        cell: ({ row }) => <span className="text-sm">{dateFormat(row.getValue('createdAt'), true)}</span>,
    },

    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thao tác" />
        ),
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
