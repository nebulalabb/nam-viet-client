import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, CreditCard, Pencil } from 'lucide-react'
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
    id: 'code',
    accessorFn: (row) => normalizeText(row.code || ''),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã HĐ" />
    ),
    cell: function Cell({ row, table }) {
      const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)
      const credit = row.original?.creditNotes || []

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
            className="cursor-pointer font-medium text-blue-600 hover:underline"
            onClick={handleView}
          >
            {row.original.code}
            <br />
            {credit.length > 0 && (
              <span className="text-xs text-orange-500">
                {credit.length} HĐ điều chỉnh
              </span>
            )}
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
    cell: function Cell({ row, table }) {
      const { customer, createdAt, id } = row.original
      const rows = table.getPrePaginationRowModel().rows.map((r) => r.original)
      const isDuplicate = rows.some(
        (r) =>
          r.customer.phone === customer.phone &&
          new Date(r.createdAt).getMonth() === new Date(createdAt).getMonth() &&
          new Date(r.createdAt).getFullYear() ===
          new Date(createdAt).getFullYear() &&
          r.id !== id,
      )

      return (
        <div
          className={`${isDuplicate
            ? 'flex w-40 flex-col break-words bg-yellow-200 p-2'
            : 'flex w-40 flex-col break-words'
            }`}
          title={customer.name}
        >
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
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const amount = row.original.amount
      const discount = row.original.discount
      const paidAmount = row.original.paidAmount

      return (
        <div className="flex flex-col">
          <span className="font-medium">{moneyFormat(amount)}</span>

          {discount > 0 && (
            <span className="text-xs text-red-500">
              Giảm: {moneyFormat(discount)}
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
  // {
  //   accessorKey: 'sharingRatio',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Chia DS" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex flex-col">
  //       <span className="break-words font-semibold">
  //         {row.original?.invoiceRevenueShare?.user?.fullName}
  //       </span>

  //       <span className="break-words font-semibold text-green-500">
  //         {moneyFormat(row.original?.invoiceRevenueShare?.amount || 0)}
  //       </span>
  //     </div>
  //   ),
  //   accessorFn: (row) => row.invoiceRevenueShare?.user?.id || null,
  //   filterFn: (row, id, value) => {
  //     const userId = row?.original?.invoiceRevenueShare?.user?.id
  //     return userId ? value.map(String).includes(String(userId)) : false
  //   },
  //   sortingFn: (rowA, rowB) => {
  //     const idA = rowA.original?.invoiceRevenueShare?.user?.id || 0
  //     const idB = rowB.original?.invoiceRevenueShare?.user?.id || 0
  //     return idA - idB
  //   },
  //   enableSorting: true,
  //   enableHiding: true,
  // },
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
      const remainingAmount = totalAmount - paidAmount

      // If fully paid
      if (paymentStatus === 'paid' || remainingAmount <= 0) {
        return <span className="text-green-500">Thanh toán toàn bộ</span>
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
    accessorFn: (row) => row.status,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const dispatch = useDispatch()
      const [openUpdateStatus, setOpenUpdateStatus] = useState(false)
      const currentStatus = row.original.status
      const statusObj = statuses.find((s) => s.value === currentStatus)
      const paymentStatus = row.original.paymentStatus || 'unpaid'
      const paymentStatusObj = paymentStatuses.find(
        (s) => s.value === paymentStatus
      )

      const handleSubmit = async (nextStatus) => {
        try {
          const result = await dispatch(
            updateInvoiceStatus({ id: row.original.id, status: nextStatus }),
          ).unwrap()

          // Handle warehouseInfo response when status changes to rejected
          if (nextStatus === 'rejected' && result?.warehouseInfo) {
            const { warehouseInfo } = result

            if (warehouseInfo.message) {
              toast.info(warehouseInfo.message, { duration: 5000 })
            }

            if (warehouseInfo.hasPayments) {
              toast.warning('Đơn hàng đã có thanh toán, vui lòng kiểm tra phiếu thu', {
                duration: 5000,
              })
            }

            if (warehouseInfo.returnReceiptCode) {
              toast.success(
                `Đã tạo phiếu nhập trả hàng: ${warehouseInfo.returnReceiptCode}`,
                { duration: 6000 }
              )
            }
          }

          toast.success('Cập nhật trạng thái đơn bán thành công')
          setOpenUpdateStatus(false)
        } catch (error) {
          console.log('Submit error: ', error)
          toast.error('Cập nhật trạng thái thất bại')
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
              paymentStatus={paymentStatus}
              statuses={statuses}
              onSubmit={handleSubmit}
            />
          )}

          <div className="flex flex-col gap-2">
            <Badge
              className={cn(
                "select-none",
                ['delivered', 'cancelled'].includes(currentStatus)
                  ? `cursor-default p-0 shadow-none border-0 bg-transparent ${currentStatus === 'delivered' ? 'text-green-500' : 'text-slate-500'} hover:bg-transparent`
                  : `cursor-pointer ${statusObj?.color || ''}`
              )}
              onClick={() => !['delivered', 'cancelled'].includes(currentStatus) && setOpenUpdateStatus(true)}
              title={!['delivered', 'cancelled'].includes(currentStatus) ? "Bấm để cập nhật trạng thái" : ""}
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
      const deliveryDate = row.original.salesContract?.deliveryDate
      const status = row.original.status

      if (!deliveryDate) {
        return <span className="text-muted-foreground italic">Đơn hàng không <br /> có Hợp Đồng</span>
      }

      const date = new Date(deliveryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if overdue: date < today AND status is not delivered
      const isOverdue = date < today && status !== 'delivered'

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
    id: 'user',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const user = row.original.user
      const createdAt = row.original.createdAt

      return (
        <div className="flex w-32 flex-col">
          <span className="truncate font-medium" title={user?.fullName}>
            {user?.fullName || '—'}
          </span>
          <span className="text-xs text-muted-foreground">
            {dateFormat(createdAt, true)}
          </span>
        </div>
      )
    },
    // Server-side filtering, no filterFn needed

    accessorFn: (row) => row.user?.id || null,

    sortingFn: (rowA, rowB) => {
      const idA = rowA.original?.user?.id || 0
      const idB = rowB.original?.user?.id || 0
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
