import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { Badge } from '@/components/ui/badge'
import { deliveryStatuses, settlementStatuses } from '../data'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableRowActions } from './DataTableRowAction'
import { formatCurrency } from "@/utils/number-format";
import { useState } from 'react'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'

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
    accessorKey: 'deliveryCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã phiếu giao" />
    ),
    cell: ({ row }) => {
      const code = row.getValue('deliveryCode')
      return <div className="font-medium text-blue-600">{code}</div>
    },
  },
  {
    accessorKey: 'order.orderCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đơn hàng" />
    ),
    cell: function Cell({ row }) {
      const [open, setOpen] = useState(false)
      const order = row.original?.order
      if (!order) return '—'

      return (
        <>
          <div
            className="cursor-pointer font-medium text-indigo-600 hover:underline"
            onClick={() => setOpen(true)}
          >
            {order.orderCode}
          </div>
          {open && (
            <ViewInvoiceDialog
              open={open}
              onOpenChange={setOpen}
              invoiceId={order.id}
              showTrigger={false}
            />
          )}
        </>
      )
    },
  },
  {
    accessorKey: 'deliveryStaff.fullName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nhân viên giao" />
    ),
    cell: ({ row }) => {
      return <div>{row.original?.deliveryStaff?.fullName || '—'}</div>
    },
  },
  {
    accessorKey: 'deliveryStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue('deliveryStatus')
      const status = deliveryStatuses.find((s) => s.value === statusValue)
      return (
        <Badge variant="outline" className={`${status?.color || ''} border-none`}>
          {status?.label || statusValue}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'settlementStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đối soát" />
    ),
    cell: ({ row }) => {
      const statusValue = row.getValue('settlementStatus')
      const status = settlementStatuses.find((s) => s.value === statusValue)
      return (
        <div className={`flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium ${status?.color || ''}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status?.dotColor || ''}`} />
          {status?.label || statusValue}
        </div>
      )
    },
  },
  {
    accessorKey: 'codAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiền COD" />
    ),
    cell: ({ row }) => {
      return <div>{formatCurrency(row.getValue('codAmount'))}</div>
    },
  },
  {
    accessorKey: 'collectedAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thực thu" />
    ),
    cell: ({ row }) => {
      return <div className="font-semibold text-green-600">{formatCurrency(row.getValue('collectedAmount'))}</div>
    },
  },
  {
    accessorKey: 'deliveryDate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày giao" />
    ),
    cell: ({ row }) => <div>{dateFormat(row.getValue('deliveryDate'))}</div>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
