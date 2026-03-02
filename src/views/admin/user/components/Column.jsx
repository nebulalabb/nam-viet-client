import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateUserStatus } from '@/stores/UserSlice'
import { UpdateUserStatusDialog } from './UpdateUserStatusDialog'
import { statuses } from '../data'
import { Badge } from '@/components/ui/badge'
import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { normalizeText } from '@/utils/normalize-text'

export const columns = [
  {
    accessorKey: 'employeeCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã nhân viên" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue('employeeCode')}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Họ và tên / Email" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col space-y-1">
          <span className="max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]">
            {row.getValue('fullName')}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {row.original.email}
          </span>
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const fullName = normalizeText(row.original.fullName || '')
      const email = normalizeText(row.original.email || '')
      const searchValue = normalizeText(value)

      return fullName.includes(searchValue) || email.includes(searchValue)
    },
  },
  {
    id: 'role',
    accessorFn: (row) => row.role?.roleName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Vai trò" />
    ),
    cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue('role') || '---'}</div>,
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
      const dispatch = useDispatch()

      const handleUpdateStatus = async (newStatus, id) => {
        try {
          await dispatch(updateUserStatus({ id, data: { status: newStatus } })).unwrap()
          setShowUpdateStatusDialog(false)
        } catch (error) {
          console.error(error)
        }
      }

      return (
        <>
          <div className="flex w-[110px] items-center">
            <span
              className="cursor-pointer hover:opacity-80"
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              <Badge
                className={
                  status.value === 'active'
                    ? 'bg-green-500 text-white hover:bg-green-600 border-transparent'
                    : 'bg-red-500 text-white hover:bg-red-600 border-transparent'
                }
              >
                {status.icon && <status.icon className="mr-2 h-4 w-4" />}
                {status.label}
              </Badge>
            </span>
          </div>
          {showUpdateStatusDialog && (
            <UpdateUserStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              userId={row.original.id}
              userCode={row.getValue('employeeCode')}
              userName={row.getValue('fullName')}
              currentStatus={statusValue}
              statuses={statuses}
              onSubmit={handleUpdateStatus}
              contentClassName="z-[10002]"
              overlayClassName="z-[10001]"
            />
          )}
        </>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },

    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số điện thoại" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          {row.getValue('phone') ? (
            <a
              href={`tel:${row.getValue('phone')}`}
              className="text-primary underline dark:text-secondary-foreground"
            >
              {row.getValue('phone')}
            </a>
          ) : (
            'Không có'
          )}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
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
