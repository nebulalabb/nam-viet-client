import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { normalizeText } from '@/utils/normalize-text'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { purchaseOrderStatuses, purchaseOrderPaymentStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'

import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder
} from '@/stores/PurchaseOrderSlice'
import { Badge } from '@/components/ui/badge'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import { Phone, CreditCard, Receipt, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export const getColumns = (onView) => [
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
    id: 'code',
    accessorFn: (row) => normalizeText(row.poCode || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã ĐĐH" />
    ),
    cell: ({ row }) => {
      return (
        <div
          className="cursor-pointer font-bold text-blue-600 hover:underline"
          onClick={() => onView(row.original.id)}
        >
          {row.original.poCode}
        </div>
      )
    },
  },
  {
    id: 'sourceType',
    accessorFn: (row) => row.supplier ? 'supplier' : row.customer ? 'customer' : null,
    header: () => null,
    cell: () => null,
    enableHiding: true,
    enableSorting: false,
    filterFn: (row, id, value) => {
      const val = row.supplier ? 'supplier' : row.customer ? 'customer' : null
      return value.includes(val)
    },
  },
  {
    accessorKey: 'supplier',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhà cung cấp" />
    ),
    cell: function Cell({ row }) {
      const { supplier, customer } = row.original
      const party = supplier || customer
      const isCustomer = !supplier && !!customer

      if (!party) return <span className="text-muted-foreground italic">—</span>

      return (
        <div className="flex w-64 flex-col break-words gap-0.5" title={party.supplierName || party.name}>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'shrink-0 rounded px-1 py-0 text-[10px] font-semibold leading-4',
                isCustomer
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700',
              )}
            >
              {isCustomer ? 'KH' : 'NCC'}
            </span>
            <span className="font-semibold">{party.supplierName || party.name}</span>
          </div>

          {party.contactName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" />
              {party.contactName}
            </span>
          )}

          {!isCustomer && party.taxCode && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Receipt className="h-3 w-3 shrink-0" />
              {party.taxCode}
            </span>
          )}

          {isCustomer && party.identityCard && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CreditCard className="h-3 w-3 shrink-0" />
              {party.identityCard}
            </span>
          )}

          {party.phone && (
            <span className="flex items-center gap-1 text-slate-600 underline hover:text-slate-900">
              <Phone className="h-3 w-3" />
              <a href={`tel:${party.phone}`}>{party.phone}</a>
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const supplier = row.original.supplier
      const customer = row.original.customer
      const searchableText = normalizeText(
        `${supplier?.supplierName || supplier?.name || ''} ${supplier?.taxCode || ''} ${customer?.name || ''} ${customer?.code || ''}`,
      )
      return searchableText.includes(normalizeText(value))
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const amount = row.original.totalAmount
      const discount = row.original.discountAmount
      const paidAmount = row.original.paidAmount || 0

      return (
        <div className="flex flex-col">
          <span className="font-medium">{moneyFormat(amount)}</span>

          {discount > 0 && (
            <span className="text-xs text-red-500">
              Giảm: {moneyFormat(discount)}
            </span>
          )}

          {row.original.otherCosts > 0 && (
            <span className="text-xs text-blue-600">
              Chi phí khác: {moneyFormat(row.original.otherCosts)}
            </span>
          )}

          {row.original.paidAmount > 0 && (
            <span className="text-xs text-emerald-600">
              Đã trả: {moneyFormat(row.original.paidAmount)}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'taxAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thuế" />
    ),
    cell: ({ row }) => <span>{moneyFormat(row.original.taxAmount || 0)}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ" />
    ),
    cell: ({ row }) => {
      const order = row.original
      const paymentStatus = order?.paymentStatus
      const totalAmount = parseFloat(order?.totalAmount || 0)
      const paidAmount = parseFloat(order?.paidAmount || 0)
      const remainingAmount = totalAmount - paidAmount

      // If fully paid
      if (paymentStatus === 'paid' || remainingAmount <= 0) {
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium hover:bg-emerald-100">Đã thanh toán</Badge>
      }

      // If partially paid
      if (paidAmount > 0 && remainingAmount > 0) {
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 font-medium hover:bg-orange-100">
            Còn nợ: {moneyFormat(remainingAmount)}
          </Badge>
        )
      }

      // If not paid at all
      if (paidAmount === 0) {
        return (
          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-medium hover:bg-rose-100">
            Còn nợ: {moneyFormat(remainingAmount)}
          </Badge>
        )
      }

      return (
        <span className="italic text-muted-foreground">
          Chưa thanh toán
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'status',
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.status
      const statusObj = purchaseOrderStatuses.find((s) => s.value === currentStatus)
      const paymentStatus = row.original.paymentStatus || 'unpaid'
      const paymentStatusObj = purchaseOrderPaymentStatuses.find(
        (s) => s.value === paymentStatus
      )

      const handleSubmit = async (nextStatus) => {
        try {
          if (nextStatus === 'approved') {
            await dispatch(confirmPurchaseOrder(row.original.id)).unwrap()
          } else if (nextStatus === 'cancelled') {
            await dispatch(cancelPurchaseOrder(row.original.id)).unwrap()
          } else if (nextStatus === 'pending' && row.original.status === 'approved') {
            await dispatch(revertPurchaseOrder(row.original.id)).unwrap()
          } else {
            await dispatch(
              updatePurchaseOrderStatus({ id: row.original.id, status: nextStatus }),
            ).unwrap()
          }
          toast.success('Cập nhật trạng thái đơn mua hàng thành công')
          setOpenUpdateStatus(false)
        } catch (error) {
          console.log('Submit error: ', error)
          toast.error(error?.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
        }
      }

      const isTerminalStatus = ['cancelled', 'completed'].includes(currentStatus)

      return (
        <>
          {openUpdateStatus && (
            <UpdatePurchaseOrderStatusDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              purchaseOrderId={row.original.id}
              currentStatus={currentStatus}
              statuses={purchaseOrderStatuses}
              onSubmit={handleSubmit}
            />
          )}

          <div className="flex flex-col gap-2">
            <Badge
              className={cn(
                'select-none w-fit font-medium transition-colors border',
                currentStatus === 'completed' || currentStatus === 'cancelled'
                  ? `cursor-default ${statusObj?.bgColor || ''}`
                  : `cursor-pointer border-dashed hover:opacity-80 ${statusObj?.bgColor || ''}`,
              )}
              onClick={() => !isTerminalStatus && setOpenUpdateStatus(true)}
              title={!isTerminalStatus ? 'Bấm để cập nhật trạng thái' : ''}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {statusObj?.icon ? (
                  <statusObj.icon className="h-4 w-4" />
                ) : null}
              </span>
              {statusObj?.label || 'Không xác định'}
            </Badge>
            <Badge
              variant="outline"
              className={cn(`cursor-default select-none w-fit font-medium hover:opacity-80`, paymentStatusObj?.color || 'border-gray-200 text-gray-500 bg-gray-50 hover:bg-gray-100')}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {paymentStatusObj?.icon ? (
                  <paymentStatusObj.icon className="h-4 w-4" />
                ) : null}
              </span>
              {paymentStatusObj?.label || 'Không xác định'}
            </Badge>
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'expectedDeliveryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày dự kiến giao" />
    ),
    cell: ({ row }) => {
      const deliveryDate = row.original.expectedDeliveryDate
      const status = row.original.status

      if (!deliveryDate) return <span className="text-muted-foreground italic">—</span>

      const date = new Date(deliveryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if overdue: date < today AND not delivered /received
      const isOverdue = date < today && !['received', 'completed', 'cancelled'].includes(status)

      return (
        <span
          className={isOverdue ? 'text-red-500 font-bold' : ''}
          title={isOverdue ? 'Quá hạn giao hàng' : ''}
        >
          {dateFormat(deliveryDate)}
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'user', // Match with PurchaseOrderPage filter logic
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const user = row.original.creator || row.original.createdByUser
      const createdAt = row.original.createdAt

      return (
        <div className="flex w-32 flex-col">
          <span className="font-medium" title={user?.fullName}>
            {user?.fullName || '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(createdAt, true)}
          </span>
        </div>
      )
    },
    // Server-side filtering, no filterFn needed

    accessorFn: (row) => (row.creator || row.createdByUser)?.id || null,

    sortingFn: (rowA, rowB) => {
      const idA = (rowA.original?.creator || rowA.original?.createdByUser)?.id || 0
      const idB = (rowB.original?.creator || rowB.original?.createdByUser)?.id || 0
      return idA - idB
    },
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
