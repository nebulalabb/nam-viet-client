import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { promotionStatuses, promotionTypes, applicableToOptions } from '../data'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { PromotionDetailDialog } from './PromotionDetailDialog'

export const columns = [
    {
        accessorKey: 'promotionCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã KM" />
        ),
        cell: function Cell({ row }) {
            const [open, setOpen] = useState(false)
            return (
                <>
                    <div
                        className="w-24 font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline underline-offset-2"
                        title={row.getValue('promotionCode')}
                        onClick={() => setOpen(true)}
                    >
                        {row.getValue('promotionCode')}
                    </div>
                    {open && (
                        <PromotionDetailDialog
                            open={open}
                            onOpenChange={setOpen}
                            promotion={row.original}
                        />
                    )}
                </>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'promotionName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Chương trình" />
        ),
        cell: ({ row }) => {
            const name = row.original?.promotionName
            return (
                <div className="w-48 whitespace-normal break-words font-medium">
                    {name}
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'promotionType',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Loại Khuyến mãi" />
        ),
        cell: ({ row }) => {
            const typeValue = row.getValue('promotionType')
            const type = promotionTypes.find((t) => t.value === typeValue)

            const discountValue = row.original?.discountValue
            let formattedValue = ''
            if (discountValue) {
                if (typeValue === 'percent_discount') {
                    formattedValue = ` - ${discountValue}%`
                } else if (typeValue === 'fixed_discount') {
                    formattedValue = ` - ₫${new Intl.NumberFormat('vi-VN').format(discountValue)}`
                }
            }

            return (
                <div className="flex w-[160px] items-center font-medium">
                    {type ? type.label : typeValue}{formattedValue}
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'applicableTo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Phạm vi áp dụng" />
        ),
        cell: ({ row }) => {
            const val = row.getValue('applicableTo')
            const opt = applicableToOptions.find((o) => o.value === val)
            return <div className="text-sm">{opt ? opt.label : val}</div>
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'timeline',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thời gian áp dụng" />
        ),
        cell: ({ row }) => {
            const startDate = row.original?.startDate
            const endDate = row.original?.endDate
            return (
                <div className="flex flex-col gap-1 w-36 text-sm">
                    <span>{startDate ? dateFormat(startDate, false) : '-'}</span>
                    <span className="text-muted-foreground border-t pt-1 border-dashed">
                        {endDate ? dateFormat(endDate, false) : '-'}
                    </span>
                </div>
            )
        },
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
            const status = promotionStatuses.find((s) => s.value === statusValue) || {
                label: statusValue,
                variant: 'outline',
            }

            const StatusIcon = status.icon

            return (
                <Badge
                    variant={status.variant}
                    className="flex w-fit items-center gap-1"
                >
                    {StatusIcon && <StatusIcon className="h-3 w-3" />}
                    {status.label}
                </Badge>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
        enableSorting: true,
        enableHiding: true,
    },
]
