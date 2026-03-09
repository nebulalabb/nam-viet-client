import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { statuses, types } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import ViewCategoryDialog from './ViewCategoryDialog'
import UpdateCategoryStatusDialog from './UpdateCategoryStatusDialog'
import { useState } from 'react'

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
    accessorKey: 'categoryCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã danh mục" />
    ),
    cell: function Cell({ row }) {
      const [open, setOpen] = useState(false)
      const code = row.getValue('categoryCode') ?? '—'
      const id = row?.original?.id

      return (
        <>
          {open && (
            <ViewCategoryDialog
              open={open}
              onOpenChange={setOpen}
              categoryId={id}
              showTrigger={false}
            />
          )}

          <div
            className="inline-block w-28 cursor-pointer font-medium text-blue-600 hover:underline"
            onClick={() => setOpen(true)}
            title="Xem chi tiết danh mục"
          >
            {code}
          </div>
        </>
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
    cell: ({ row }) => <div className="w-36">{row.getValue('categoryName')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.categoryName)
      const searchValue = normalizeText(value)

      return name.includes(searchValue)
    },
  },
  {
    id: 'parent',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục cha" />
    ),
    cell: ({ row }) => (
      <div className="w-32">{row.original.parent?.categoryName || 'Danh mục gốc'}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'productCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số sản phẩm" />
    ),
    cell: ({ row }) => (
      <div className="w-24 text-center">{row.original._count?.products || 0}</div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    id: 'childCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục con" />
    ),
    cell: ({ row }) => (
      <div className="w-24 text-center">{row.original._count?.children || 0}</div>
    ),
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
      const status = statuses.find((status) => status.value === statusValue)
      const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

      return (
        <>
          <div
            className="flex w-[150px] cursor-pointer items-center"
            onClick={() => setShowUpdateStatusDialog(true)}
          >
            <Badge
              variant={status?.variant || 'outline'}
              className="flex w-32 items-center justify-center gap-1 py-1"
            >
              {status?.icon && <status.icon className="h-4 w-4" />}
              {status?.label || '—'}
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
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('createdAt'))}
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
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('updatedAt'))}
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
