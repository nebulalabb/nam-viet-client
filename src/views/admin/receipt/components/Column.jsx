import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import ViewReceiptDialog from './ViewReceiptDialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useDispatch } from 'react-redux'
import { updateReceiptStatus } from '@/stores/ReceiptSlice'
import UpdateReceiptStatusDialog from './UpdateReceiptStatusDialog'
import { receiptStatus, paymentMethods } from '../data'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
    accessorKey: 'receiptCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã PT" />
    ),
    cell: function Cell({ row }) {
      const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false)
      const handleViewReceipt = () => {
        setShowViewReceiptDialog(true)
      }

      return (
        <>
          {showViewReceiptDialog && (
            <ViewReceiptDialog
              open={showViewReceiptDialog}
              onOpenChange={setShowViewReceiptDialog}
              receiptId={row.original.id}
              showTrigger={false}
            />
          )}
          <div
            className={cn("cursor-pointer font-medium text-blue-600 hover:underline")}
            onClick={handleViewReceipt}
          >
            <div className="flex items-center gap-2">
              <span>{row.getValue('receiptCode')}</span>
              {row.original.isDeposit && (
                <Badge variant="secondary" className="text-xs">
                  Cọc
                </Badge>
              )}
            </div>
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'receiptType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('receiptType')
      let label = 'Khác'
      let Icon = CircleHelp
      let colorClass = 'text-gray-600'

      if (type === 'customer' || type === 'sales') {
        label = 'Khách hàng'
        Icon = User
        colorClass = 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
      } else if (type === 'supplier') {
        label = 'Nhà cung cấp'
        Icon = Building2
        colorClass = 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm'
      } else if (type === 'employee' || type === 'user') {
        label = 'Nhân viên'
        Icon = Contact
        colorClass = 'bg-purple-100 text-purple-800 border-purple-300 shadow-sm'
      } else if (type === 'debt_collection') {
        label = 'Thu công nợ'
        Icon = CircleHelp
        colorClass = 'bg-teal-100 text-teal-800 border-teal-300 shadow-sm'
      } else if (type === 'refund') {
        label = 'Hoàn tiền'
        Icon = CircleHelp
        colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
      } else if (type) {
        label = type
      }

      return (
        <div className="shrink-0 flex pr-2">
          <Badge variant="outline" className={`whitespace-nowrap font-semibold px-2.5 py-1 text-[13px] ${colorClass}`}>
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
    accessorFn: (row) => row.customerRef?.customerName,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Người nộp" />
    ),
    cell: ({ row }) => {
      const receiver = row.original.customerRef;
      if (!receiver) return <div className="text-gray-500">Không có</div>;

      return (
        <div className="flex flex-col gap-1 min-w-[150px] pr-4">
          <span className="font-semibold text-[15px] break-words">
            {receiver.customerName}
          </span>
          {receiver.phone && (
            <div className="flex items-center text-[13px] text-blue-600 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              <a href={`tel:${receiver.phone}`} className="hover:underline">{receiver.phone}</a>
            </div>
          )}
          {receiver.cccd && (
            <div className="flex items-center text-[13px] text-gray-600 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              <span>{receiver.cccd}</span>
            </div>
          )}
          {receiver.identityCard && (
            <div className="flex items-center text-[13px] text-gray-600 gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" /></svg>
              <span>{receiver.identityCard}</span>
            </div>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'notes',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lý do" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        {row.getValue('notes') || 'Không có'}
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
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem] text-slate-800 font-bold">
            {moneyFormat(row.getValue('amount'))}
          </span>
          <Badge variant="outline" className={`whitespace-nowrap font-medium transition-colors ${paymentMethodObj?.color}`}>
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
    accessorKey: 'isPosted',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: function Cell({ row }) {
      const isPosted = row.getValue('isPosted')
      const status = isPosted ? 'posted' : 'draft'
      const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
      const dispatch = useDispatch()

      const handleUpdateStatus = async (newStatus, id) => {
        try {
          await dispatch(updateReceiptStatus({ id, status: newStatus })).unwrap()
          setShowUpdateStatusDialog(false)
        } catch (error) {
          console.error(error)
        }
      }

      const getStatusColor = (s) => {
        switch (s) {
          case 'draft': return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
          case 'posted': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
          case 'cancelled':
          case 'canceled': return 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
          default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
        }
      }

      const getStatusLabel = (s) => {
        switch (s) {
          case 'draft': return 'Chờ duyệt'
          case 'posted': return 'Đã ghi sổ'
          case 'cancelled':
          case 'canceled': return 'Đã hủy'
          default: return s
        }
      }

      return (
        <>
          <div className="w-28 flex items-center justify-center gap-2">
            <Badge
              className={cn("cursor-pointer", getStatusColor(status))}
              onClick={() => setShowUpdateStatusDialog(true)}
            >
              {getStatusLabel(status)}
            </Badge>
          </div>
          {showUpdateStatusDialog && (
            <UpdateReceiptStatusDialog
              open={showUpdateStatusDialog}
              onOpenChange={setShowUpdateStatusDialog}
              receiptId={row.original.id}
              currentStatus={status}
              statuses={receiptStatus}
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
    accessorKey: 'receiptDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày thanh toán" />
    ),
    cell: ({ row }) => (
      <div className="w-36">{dateFormat(row.getValue('receiptDate'))}</div>
    ),
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
          <span className="max-w-36 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('createdAt'), true)}
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
