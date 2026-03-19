import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updatePaymentStatus } from '@/stores/PaymentSlice'
import UpdatePaymentStatusDialog from './UpdatePaymentStatusDialog'
import { paymentStatus, paymentMethods } from '../data'
import { toast } from 'sonner'
import ViewPaymentDialog from './ViewPaymentDialog'
import { Pencil, User, Building2, Contact, CircleHelp } from 'lucide-react'

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
    accessorKey: 'voucherCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã PC" />
    ),
    cell: function Cell({ row }) {
      const [showViewPaymentDialog, setShowViewPaymentDialog] = useState(false)
      const handleViewPayment = () => {
        setShowViewPaymentDialog(true)
      }

      return (
        <>
          {showViewPaymentDialog && (
            <ViewPaymentDialog
              open={showViewPaymentDialog}
              onOpenChange={setShowViewPaymentDialog}
              paymentId={row.original.id}
              showTrigger={false}
            />
          )}
          <div
            className={cn(" font-medium cursor-pointer text-primary hover:underline")}
            onClick={handleViewPayment}
          >
            {row.getValue('voucherCode')}
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'voucherType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('voucherType')
      let label = 'Khác'
      let Icon = CircleHelp
      let colorClass = 'text-gray-600'

      if (type === 'supplier_payment') {
        label = 'Nhà cung cấp'
        Icon = Building2
        colorClass = 'text-orange-600'
      } else if (type === 'salary') {
        label = 'Lương'
        Icon = Contact
        colorClass = 'text-purple-600'
      } else if (type === 'operating_cost') {
        label = 'Chi phí VH'
        Icon = CircleHelp
        colorClass = 'text-blue-600'
      } else if (type === 'refund') {
        label = 'Hoàn tiền'
        Icon = CircleHelp
        colorClass = 'text-green-600'
      }

      return (
        <div className="shrink-0 flex pr-2">
          <Badge variant="outline" className={`whitespace-nowrap border-transparent bg-transparent px-0 font-medium ${colorClass}`}>
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'receiverName',
    accessorFn: (row) => row.supplier?.supplierName || row.receiver?.name,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người nhận" />
    ),
    cell: ({ row }) => {
      const supplier = row.original.supplier;
      const receiver = row.original.receiver;
      const type = row.original.voucherType;

      if (!supplier && !receiver && type !== 'salary') {
        return <div className="text-gray-500">Tự do</div>;
      }
      if (type === 'salary') {
        return <div className="text-purple-600 font-medium">Nhân viên</div>;
      }

      const name = supplier ? (supplier.supplierName || supplier.name) : receiver?.name;
      const phone = supplier ? supplier.phone : receiver?.phone;

      return (
        <div className="flex flex-col gap-1 min-w-[150px] pr-4">
          <span className="font-semibold text-[15px] break-words" >
            {name}
          </span>
          {phone && (
            <div className="flex items-center text-[13px] text-blue-600 gap-1.5">
              <svg xmlns="http://www.w3.org/0000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
            </div>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'reason',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do chi" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        {row.getValue('reason') || 'Không có'}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
  },

  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Số tiền" />
    ),
    cell: ({ row }) => {
      const method = row.original.paymentMethod
      const paymentMethodObj = paymentMethods.find(m => m.value === method)
      const Icon = paymentMethodObj?.icon

      return (
        <div className="flex flex-col gap-1 items-end">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem] font-medium text-red-600">
            {moneyFormat(row.getValue('amount'))}
          </span>
          <Badge variant="outline" className={`whitespace-nowrap border-transparent bg-transparent px-0 font-medium ${paymentMethodObj?.color}`}>
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {paymentMethodObj?.label || method || '—'}
          </Badge>
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
          await dispatch(updatePaymentStatus({ id, status: newStatus })).unwrap()
          // PaymentSlice.updatePaymentStatus.fulfilled updates local state directly — no need to refetch
          setShowUpdateStatusDialog(false)
        } catch (error) {
          console.error(error)
        }
      }

      return (
        <>
          <div className="w-28 flex items-center justify-center gap-2">
            <Badge
              className={cn(
                "cursor-pointer hover:underline",
                status === 'posted' ? 'bg-green-500' :
                  status === 'cancelled' ? 'bg-red-500' :
                    'bg-yellow-500'
              )}
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              {status === 'posted' ? 'Đã chi' : status === 'draft' ? 'Nháp' : status === 'cancelled' ? 'Đã hủy' : status}
            </Badge>
          </div>
          {showUpdateStatusDialog && (
            <UpdatePaymentStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              paymentId={row.original.id}
              currentStatus={status}
              statuses={paymentStatus}
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
    accessorKey: 'paymentDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày chi" />
    ),
    cell: ({ row }) => (
      <div className="w-36">{dateFormat(row.getValue('paymentDate'))}</div>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'creator',
    accessorFn: (row) => row.creator?.fullName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người tạo" />
    ),
    cell: ({ row }) => {
      const creator = row.original.creator
      
      return (
        <div className="flex flex-col gap-0.5">
          {creator ? (
            <span className="font-medium text-[14px] max-w-[150px] truncate text-primary">
              {creator.fullName}
            </span>
          ) : (
            <span className="font-medium text-[14px] text-gray-500">Hệ thống</span>
          )}
          <span className="text-[12px] text-muted-foreground">
            {dateFormat(row.original?.createdAt, true)}
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
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
