import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'
import { moneyFormat } from '@/utils/money-format'
import { Badge } from '@/components/ui/badge'
import { statuses } from '../data'
import { useState } from 'react'
import UpdateSupplierStatusDialog from './UpdateSupplierStatusDialog'
import ViewSupplierDialog from './ViewSupplierDialog'
import { Phone, FileText } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'

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
    accessorKey: 'supplierCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã NCC" />
    ),
    cell: function Cell({ row }) {
      const [showViewSupplierDialog, setShowViewSupplierDialog] =
        useState(false)

      return (
        <>
          {showViewSupplierDialog && (
            <ViewSupplierDialog
              open={showViewSupplierDialog}
              onOpenChange={setShowViewSupplierDialog}
              supplierId={row?.original?.id}
              showTrigger={false}
            />
          )}

          <div
            className="cursor-pointer font-medium text-blue-600 hover:underline"
            onClick={() => setShowViewSupplierDialog(true)}
          >
            {row.getValue('supplierCode')}
          </div>
        </>
      )
    },
  },
  {
    accessorKey: 'supplierName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-primary text-sm">
          {row.getValue('supplierName')}
        </span>
        <div className="flex flex-col text-xs text-muted-foreground gap-1">
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {row.original.phone || '—'}</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {row.original.taxCode || '—'}</span>
        </div>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.supplierName || '')
      const phone = normalizeText(row.original.phone || '')
      const taxCode = normalizeText(row.original.taxCode || '')
      const searchValue = normalizeText(value)
      return name.includes(searchValue) || phone.includes(searchValue) || taxCode.includes(searchValue)
    },
  },

  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Địa chỉ" />
    ),
    cell: ({ row }) => <div>{row.getValue('address')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalPayable',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ" className="justify-end" />
    ),
    cell: ({ row }) => {
      const amount = row.getValue('totalPayable') || 0
      const date = row.original.payableUpdatedAt
      return (
        <div className="flex flex-col gap-1 items-end text-right">
          <span className="font-medium text-red-600">{moneyFormat(amount)}</span>
          {date && (
            <span className="text-[11px] text-muted-foreground">
              Cập nhật: {dateFormat(date, true)}
            </span>
          )}
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
      const status = statuses.find((status) => status.value === statusValue) || {
        value: statusValue,
        label: statusValue,
        icon: null,
      }
      const [
        showUpdateSupplierStatusDialog,
        setShowUpdateSupplierStatusDialog,
      ] = useState(false)

      return (
        <>
          <div
            className="flex cursor-pointer items-center"
            onClick={() => setShowUpdateSupplierStatusDialog(true)}
          >
            <span>
              <Badge
                className={
                  status.value === 'active'
                    ? 'whitespace-nowrap bg-green-600 text-white hover:bg-green-700 border-transparent'
                    : 'whitespace-nowrap bg-red-600 text-white hover:bg-red-700 border-transparent'
                }
              >
                {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                {status.label}
              </Badge>
            </span>
          </div>

          {showUpdateSupplierStatusDialog && (
            <UpdateSupplierStatusDialog
              open={showUpdateSupplierStatusDialog}
              onOpenChange={setShowUpdateSupplierStatusDialog}
              supplier={row.original}
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
    cell: ({ row }) => {
      const creator = row.original.creator
      return (
        <div className="break-words">
          {creator?.fullName || '—'}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span>
            {dateFormat(row.getValue('createdAt'), true)}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span>
            {dateFormat(row.getValue('updatedAt'), true)}
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
