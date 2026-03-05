import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'
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
        aria-label="Chọn tất cả"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Chọn hàng"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: 'unitCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đơn vị" />
    ),
    cell: ({ row }) => <div className="w-24">{row.getValue('unitCode')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const code = normalizeText(row.original.unitCode || '')
      const searchValue = normalizeText(value)

      return code.includes(searchValue)
    },
  },
  {
    accessorKey: 'unitName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên đơn vị" />
    ),
    cell: ({ row }) => <div className="w-32">{row.getValue('unitName')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.unitName || '')
      const searchValue = normalizeText(value)

      return name.includes(searchValue)
    },
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
