import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { categoryStatuses } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import CategoryDetailDialog from './CategoryDetailDialog'
import UpdateCategoryStatusDialog from './UpdateCategoryStatusDialog'
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
        accessorKey: 'categoryCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã danh mục" />
        ),
        cell: function Cell({ row }) {
            const [showCategoryDetailDialog, setShowCategoryDetailDialog] = useState(false)
            // Indent based on depth in tree if available, otherwise 0
            const depth = row.original?.depth || 0

            return (
                <div style={{ paddingLeft: `${depth * 1.5}rem` }}>
                    <div
                        onClick={() => setShowCategoryDetailDialog(true)}
                        className="w-20 cursor-pointer font-medium text-blue-600 hover:underline"
                        title={row.getValue('categoryCode')}
                    >
                        {row.getValue('categoryCode')}
                    </div>

                    {showCategoryDetailDialog && (
                        <CategoryDetailDialog
                            open={showCategoryDetailDialog}
                            onOpenChange={setShowCategoryDetailDialog}
                            category={row.original}
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
        accessorKey: 'categoryName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên danh mục" />
        ),
        cell: ({ row }) => {
            const name = row.original?.categoryName
            return (
                <div className="flex flex-col gap-1">
                    <div className="whitespace-normal break-words font-medium">
                        {name}
                    </div>
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
        filterFn: (row, id, value) => {
            const name = normalizeText(row.original.categoryName)
            const searchValue = normalizeText(value)

            return name.includes(searchValue)
        },
    },

    {
        accessorKey: 'slug',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đường dẫn (Slug)" />
        ),
        cell: ({ row }) => (
            <div className="text-muted-foreground">
                /{row.getValue('slug')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },

    {
        accessorKey: 'parent',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Danh mục cha" />
        ),
        cell: ({ row }) => {
            const parentName = row.original?.parent?.categoryName
            return (
                <div className="text-muted-foreground">
                    {parentName ? parentName : (
                        <span className="text-xs italic opacity-70">Gốc</span>
                    )}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },

    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: function Cell({ row }) {
            const statusValue = row.getValue('status')
            const status = categoryStatuses.find((s) => s.value === statusValue) || {
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
                        <UpdateCategoryStatusDialog
                            open={showUpdateStatusDialog}
                            onOpenChange={setShowUpdateStatusDialog}
                            category={row.original}
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
