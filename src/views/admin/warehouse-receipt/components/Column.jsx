import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { receiptTypes, warehouseReceiptStatuses } from '../data'
import Can from '@/utils/can'
import { useDispatch } from 'react-redux'
import { updateWarehouseReceipt, getWarehouseReceipts, cancelWarehouseReceipt, postWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { UpdateWarehouseReceiptStatusDialog } from './UpdateWarehouseReceiptStatusDialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CreditCard, Phone, Pencil } from 'lucide-react'

export const getColumns = (onView, type = 'all', onRefresh) => [
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
        className="mx-2 translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mx-2 translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã phiếu" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="w-32 cursor-pointer font-medium text-blue-600 hover:underline"
          onClick={() => onView(row.original)}
        >
          {row.getValue('code')}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'partner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={type === 'import' ? "Nhà cung cấp" : "Khách hàng"} />
    ),
    cell: ({ row }) => {
      const receiptType = row.original.receiptType
      const supplier = row.original.supplier
      const customer = row.original.customer

      if (receiptType === 1 && supplier) {
        return (
          <div className="w-48" title={supplier.name}>
            <span className="font-semibold">{supplier.name}</span>
            <div className="text-xs text-muted-foreground">{supplier.code}</div>
            {supplier.taxCode && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <CreditCard className="h-3 w-3" />
                {supplier.taxCode}
              </span>
            )}
          </div>
        )
      }

      // Xuất kho -> hiển thị customer
      if (receiptType === 2 && customer) {
        return (
          <div className="w-48" title={customer.name}>
            <span className="font-semibold">{customer.name}</span>

            {customer.taxCode && (
              <span className="text-xs text-muted-foreground">
                MST: {customer.taxCode}
              </span>
            )}

            <span className="flex items-center gap-1 text-primary underline hover:text-secondary-foreground">
              <Phone className="h-3 w-3" />
              <a href={`tel:${customer.phone}`}>{customer.phone}</a>
            </span>

            {customer.identityCard && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <CreditCard className="h-3 w-3" />
                {customer.identityCard}
              </span>
            )}
          </div>
        )
      }

      return <div className="w-48 text-muted-foreground">Không có</div>
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'totalQuantity',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số lượng" className="justify-center" />
    ),
    cell: ({ row }) => {
      const quantity = parseFloat(row.getValue('totalQuantity') || 0)
      return (
        <div className="w-24 text-center">
          {quantity.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {moneyFormat(row.getValue('totalAmount'))}
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
      const status = row.getValue('status')
      const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
      const dispatch = useDispatch()

      const handleUpdateStatus = async (newStatus, id) => {
        try {
          if (newStatus === 'cancelled') {
            await dispatch(cancelWarehouseReceipt(id)).unwrap()
          } else if (newStatus === 'posted') {
            await dispatch(postWarehouseReceipt(id)).unwrap()
          } else {
            await dispatch(updateWarehouseReceipt({ id, data: { status: newStatus } })).unwrap()
          }

          toast.success(newStatus === 'cancelled' ? 'Hủy phiếu thành công' : newStatus === 'posted' ? 'Duyệt phiếu thành công' : 'Cập nhật trạng thái thành công')
          setShowUpdateStatusDialog(false)
          if (onRefresh) onRefresh()
        } catch (error) {
          console.error(error)
        }
      }

      const getStatus = warehouseReceiptStatuses.find(
        (s) => s.value === status,
      )

      return (
        <>
          <div className="w-28">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80"
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              <Badge
                className={cn(
                  getStatus?.color || 'bg-gray-500',
                )}
              >
                {getStatus?.label || 'Không xác định'}
              </Badge>
            </div>
          </div>
          {showUpdateStatusDialog && (
            <UpdateWarehouseReceiptStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              receiptId={row.original.id}
              receiptCode={row.original.code}
              currentStatus={status}
              statuses={warehouseReceiptStatuses}
              onSubmit={handleUpdateStatus}
              contentClassName="z-[10002]"
              overlayClassName="z-[10001]"
            />
          )}
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do" />
    ),
    cell: ({ row }) => (
      <div className="w-64 truncate" title={row.getValue('reason')}>
        {row.getValue('reason') || 'Không có'}
      </div>
    ),
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'receiptDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày lập" />
    ),
    cell: ({ row }) => (
      <div className="w-32">{dateFormat(row.getValue('receiptDate'), true)}</div>
    ),
    enableSorting: true,
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
            {dateFormat(row.getValue('updatedAt'), true)}
          </span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} onRefresh={onRefresh} />,
  },
]