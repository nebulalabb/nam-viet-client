import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'

export const columns = [
  {
    accessorKey: 'roleKey',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã VT" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('roleKey')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'roleName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên vai trò" />
    ),
    cell: ({ row }) => <div className="w-28">{row.getValue('roleName')}</div>,
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.roleName)
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
