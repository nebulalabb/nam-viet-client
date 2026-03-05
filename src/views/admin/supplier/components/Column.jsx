import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'
import { Badge } from '@/components/ui/badge'
import { statuses } from '../data'
import { useState } from 'react'
import UpdateSupplierStatusDialog from './UpdateSupplierStatusDialog'
import ViewSupplierDialog from './ViewSupplierDialog'

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
            className="w-[150px] cursor-pointer font-medium text-blue-600 hover:underline"
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
      <DataTableColumnHeader column={column} title="Tên nhà cung cấp" />
    ),
    cell: ({ row }) => <div>{row.getValue('supplierName')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.supplierName || '')
      const searchValue = normalizeText(value)
      return name.includes(searchValue)
    },
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('phone')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Địa chỉ" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('address')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'taxCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã số thuế" />
    ),
    cell: ({ row }) => (
      <div className="w-28">{row.getValue('taxCode') || 'Không có'}</div>
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
            className="flex w-[150px] cursor-pointer items-center"
            onClick={() => setShowUpdateSupplierStatusDialog(true)}
          >
            <span>
              <Badge
                className={
                  status.value === 'active'
                    ? 'bg-green-600 text-white hover:bg-green-700 border-transparent'
                    : 'bg-red-600 text-white hover:bg-red-700 border-transparent'
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
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 sm:max-w-72 md:max-w-[31rem]">
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
          <span className="max-w-32 sm:max-w-72 md:max-w-[31rem]">
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
