import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { types, customerStatuses } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import CustomerDetailDialog from './CustomerDetailDialog'
import UpdateCustomerStatusDialog from './UpdateCustomerStatusDialog'
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
    accessorKey: 'customerCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã KH" />
    ),
    cell: function Cell({ row }) {
      const [showCustomerDetailDialog, setShowCustomerDetailDialog] =
        useState(false)

      return (
        <div>
          <div
            onClick={() => setShowCustomerDetailDialog(true)}
            className="w-20 cursor-pointer font-medium text-blue-600 hover:underline"
            title={row.getValue('customerCode')}
          >
            {row.getValue('customerCode')}
          </div>

          {showCustomerDetailDialog && (
            <CustomerDetailDialog
              open={showCustomerDetailDialog}
              onOpenChange={setShowCustomerDetailDialog}
              customer={row.original}
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
    accessorKey: 'customerName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const name = row.original?.customerName
      const phone = row.original?.phone

      return (
        <div className="flex flex-col gap-1">
          <div className="whitespace-normal break-words font-medium">
            {name}
          </div>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="text-sm text-primary underline dark:text-secondary-foreground"
            >
              {phone}
            </a>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.customerName)
      const phone = normalizeText(row.original.phone || '')
      const searchValue = normalizeText(value)

      return name.includes(searchValue) || phone.includes(searchValue)
    },
  },

  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const statusValue = row.getValue('status')
      const status = customerStatuses.find((s) => s.value === statusValue) || {
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
            <UpdateCustomerStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              customer={row.original}
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
    id: 'invoiceCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SL đơn" />
    ),
    cell: ({ row }) => (
      <div className="w-16 text-center">{row.original._count?.salesOrders || 0}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'debtInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ / Hạn mức" />
    ),
    cell: ({ row }) => {
      const currentDebt = Number(row.original?.currentDebt) || 0
      const creditLimit = Number(row.original?.creditLimit) || 0

      const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(value)

      // Use the backend-provided flag for overLimit check
      const isOverLimit = row.original?.isOverLimit

      return (
        <div className="flex flex-col gap-1 w-36">
          <span
            className={`font-medium ${isOverLimit ? 'text-destructive' : 'text-primary'
              }`}
          >
            {formatCurrency(currentDebt)}
          </span>
          <span className="text-xs text-muted-foreground border-t pt-1 border-dashed">
            Hạn mức: {formatCurrency(creditLimit)}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'customerType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại khách hàng" />
    ),
    cell: ({ row }) => {
      const typeValue = row.getValue('customerType')
      const type = types.find((t) => t.value === typeValue)

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
      return value.includes(row.original?.customerType)
    },
    enableSorting: true,
    enableHiding: true,
  },

  {
    id: 'rewardInfo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Điểm / Mã thưởng" />
    ),
    cell: ({ row }) => {
      const points = row.original?.rewardPoints || 0
      const code = row.original?.rewardCode

      return (
        <div className="flex flex-col gap-1 w-32">
          <span className="font-medium text-amber-600">{points} điểm</span>
          {code && (
            <span className="text-xs text-muted-foreground border px-1.5 py-0.5 rounded-sm bg-muted/50 w-fit">
              {code}
            </span>
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },

  {
    accessorKey: 'creator',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => (
      <div className="whitespace-nowrap font-medium" title={row.original?.creator?.fullName}>
        {row.original?.creator?.fullName}
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
  },

  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
