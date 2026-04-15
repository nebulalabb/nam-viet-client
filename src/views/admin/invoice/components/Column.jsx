import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, CreditCard, Truck, Store } from 'lucide-react'
import { normalizeText } from '@/utils/normalize-text'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { statuses, paymentStatuses } from '../data'
import { useState } from 'react'
import Can from '@/utils/can'
import ViewInvoiceDialog from './ViewInvoiceDialog'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { updateInvoiceStatus } from '@/stores/InvoiceSlice'
import UpdateInvoiceStatusDialog from './UpdateInvoiceStatusDialog'
import InvoiceDialog from './InvoiceDialog'
import { cn } from '@/lib/utils'

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
    id: 'orderCode',
    accessorFn: (row) => normalizeText(row.orderCode || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã ĐB" />
    ),
    cell: function Cell({ row, table }) {
      const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)

      const handleView = () => {
        if (table?.options?.meta?.onView) {
          table.options.meta.onView(row.original.id)
        }
      }

      return (
        <>
          <Can permission={'CREATE_INVOICE'}>
            {showUpdateInvoiceDialog && (
              <InvoiceDialog
                open={showUpdateInvoiceDialog}
                onOpenChange={setShowUpdateInvoiceDialog}
                invoiceId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <span
            className="cursor-pointer font-semibold text-blue-600 hover:underline"
            onClick={handleView}
          >
            {row.original.orderCode}
          </span>
        </>
      )
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const { customer } = row.original

      return (
        <div
          className="flex w-40 flex-col break-words"
          title={customer?.customerName}
        >
          <span className="font-semibold">{customer.customerName}</span>

          {customer.taxCode && (
            <span className="text-xs text-muted-foreground">
              MST: {customer.taxCode}
            </span>
          )}

          <span className="flex items-center gap-1 text-primary underline hover:text-secondary-foreground">
            <Phone className="h-3 w-3" />
            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
          </span>

          {customer.cccd && (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <CreditCard className="h-3 w-3" />
              {customer.cccd}
            </span>
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const customer = row.original.customer
      const searchableText = normalizeText(
        `${customer.name || ''} ${customer.taxCode || ''}`,
      )
      const searchValue = normalizeText(value)
      return searchableText.includes(searchValue)
    },
  },
  {
    id: 'orderType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hình thức" />
    ),
    cell: ({ row }) => {
      const { isPickupOrder, deliveryAddress, shippingFee } = row.original
      return (
        <div className="flex flex-col gap-1 min-w-[120px]">
          {isPickupOrder ? (
            <Badge variant="outline" className="w-fit bg-green-50 text-green-700 border-green-200 font-medium">
              <Store className="mr-1 h-3.5 w-3.5" />
              Tại cửa hàng
            </Badge>
          ) : (
            <>
              <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 font-medium">
                <Truck className="mr-1 h-3.5 w-3.5" />
                Giao hàng
              </Badge>
              {deliveryAddress && (
                <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed" title={deliveryAddress}>
                  Đ/c: {deliveryAddress}
                </span>
              )}
              {shippingFee > 0 && (
                <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 w-fit px-1.5 py-0.5 rounded border border-orange-100 mt-0.5">
                  Phí ship: {moneyFormat(shippingFee)}
                </span>
              )}
            </>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const totalAmount = row.original.totalAmount
      const discountAmount = row.original.discountAmount
      const paidAmount = row.original.paidAmount

      return (
        <div className="flex flex-col">
          <span className="font-medium">{moneyFormat(totalAmount)}</span>

          {discountAmount > 0 && (
            <span className="text-xs text-red-500">
              Giảm: {moneyFormat(discountAmount)}
            </span>
          )}

          {paidAmount > 0 && (
            <span className="text-xs text-green-600">
              Đã thu: {moneyFormat(paidAmount)}
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
    cell: ({ row }) => <span>{moneyFormat(row.original.taxAmount)}</span>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'debt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Công nợ" />
    ),
    cell: ({ row }) => {
      const invoice = row.original
      const paymentStatus = invoice?.paymentStatus
      const totalAmount = parseFloat(invoice?.totalAmount || 0)
      const paidAmount = parseFloat(invoice?.paidAmount || 0)
      const refundedAmount = parseFloat(invoice?.refundedAmount || 0)
      const remainingAmount = totalAmount - paidAmount - refundedAmount
      
      const customerDebt = Number(invoice?.customer?.currentDebt || 0)
      const hasPrepaidCredit = customerDebt < 0

      // If fully paid or has prepaid credit
      if (paymentStatus === 'paid' || remainingAmount <= 0 || hasPrepaidCredit) {
        return <span className="text-green-500">{hasPrepaidCredit ? 'Đã trả trước' : 'Thanh toán toàn bộ'}</span>
      }

      // If partially paid
      if (paidAmount > 0 && remainingAmount > 0) {
        return (
          <span className="text-yellow-600">
            Còn nợ: {moneyFormat(remainingAmount)}
          </span>
        )
      }

      // If not paid at all
      if (paidAmount === 0) {
        return (
          <span className="text-red-500">
            Còn nợ: {moneyFormat(remainingAmount)}
          </span>
        )
      }

      // Default fallback
      return (
        <span className="italic text-muted-foreground">
          Chưa có phiếu thu
        </span>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'status',
    accessorFn: (row) => row.orderStatus,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row, table }) {
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.orderStatus
      const statusObj = statuses.find((s) => s.value === currentStatus)
      
      const customerDebt = Number(row.original.customer?.currentDebt || 0)
      const hasPrepaidCredit = customerDebt < 0
      
      const paymentStatus = hasPrepaidCredit ? 'paid' : (row.original.paymentStatus || 'unpaid')
      const paymentStatusObj = paymentStatuses.find(
        (s) => s.value === paymentStatus
      )

      const handleSubmit = async (nextStatus, _, reason) => {
        try {
          const result = await dispatch(
            updateInvoiceStatus({ 
              id: row.original.id, 
              status: nextStatus,
              reason: reason
            }),
          ).unwrap()

          // Handle warehouseInfo response when status changes for rejected/cancelled
          if (result?.warehouseInfo) {
            const { warehouseInfo } = result
            if (warehouseInfo.message) toast.info(warehouseInfo.message, { duration: 5000 })
            if (warehouseInfo.hasPayments) toast.warning('Đơn hàng đã có thanh toán, vui lòng kiểm tra phiếu thu', { duration: 5000 })
            if (warehouseInfo.returnReceiptCode) {
              toast.success(`Đã tạo phiếu nhập trả hàng: ${warehouseInfo.returnReceiptCode}`, { duration: 6000 })
            }
          }

          setOpenUpdateStatus(false)
          if (table && table.options && table.options.meta) {
            table.options.meta.onSuccess?.()
          }
        } catch (error) {
          console.log('Submit error: ', error)
          throw error
        }
      }

      return (
        <>
          {openUpdateStatus && (
            <UpdateInvoiceStatusDialog
              open={openUpdateStatus}
              onOpenChange={setOpenUpdateStatus}
              invoiceId={row.original.id}
              currentStatus={currentStatus}
              isPickupOrder={row.original.isPickupOrder}
              paymentStatus={paymentStatus}
              statuses={statuses}
              onSubmit={handleSubmit}
            />
          )}

          <div className="flex flex-col gap-2">
            <Badge
              className={cn(
                "select-none",
                ['completed', 'cancelled'].includes(currentStatus)
                  ? `cursor-default p-0 shadow-none border-0 bg-transparent ${currentStatus === 'completed' ? 'text-green-500' : 'text-red-500'} hover:bg-transparent`
                  : `cursor-pointer ${statusObj?.color || ''}`
              )}
              onClick={() => !['completed', 'cancelled'].includes(currentStatus) && setOpenUpdateStatus(true)}
              title={!['completed', 'cancelled'].includes(currentStatus) ? "Bấm để cập nhật trạng thái" : ""}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {statusObj?.icon ? <statusObj.icon className="h-4 w-4" /> : null}
              </span>
              {statusObj?.label || 'Không xác định'}
            </Badge>
            <Badge
              variant="outline"
              className={`cursor-default select-none border-0 ${paymentStatusObj?.color || 'text-gray-500'
                }`}
            >
              <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                {paymentStatusObj?.icon ? (
                  <paymentStatusObj.icon className="h-4 w-4" />
                ) : null}
              </span>
              {hasPrepaidCredit ? 'Đã trả trước' : (paymentStatusObj?.label || 'Không xác định')}
            </Badge>



          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const creator = row.original.creator
      const createdAt = row.original.createdAt

      return (
        <div className="flex flex-col">
          <span className="font-medium" title={creator?.fullName}>
            {creator?.fullName || '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(createdAt, true)}
          </span>
        </div>
      )
    },
    // Server-side filtering, no filterFn needed

    accessorFn: (row) => row.creator?.id || null,

    sortingFn: (rowA, rowB) => {
      const idA = rowA.original?.creator?.id || 0
      const idB = rowB.original?.creator?.id || 0
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
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
  },
]
