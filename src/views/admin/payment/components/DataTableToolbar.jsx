import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { useState, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { deleteMultiplePayments } from '@/stores/PaymentSlice'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { DeleteMultiplePaymentVouchersDialog } from './DeleteMultiplePaymentVouchersDialog'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'
import { IconFileTypeXls } from '@tabler/icons-react'
import ExportPaymentDialog from './ExportPaymentDialog'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import PaymentDialog from './PaymentDialog'

export function DataTableToolbar({ table, isMyPayment = false }) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedPaymentIds, setSelectedPaymentIds] = useState([])
  const [selectedPayments, setSelectedPayments] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const dispatch = useDispatch()
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    const payments = selectedRows.map((row) => row.original)
    setSelectedPayments(payments)
    setSelectedPaymentIds(payments.map((inv) => inv.id))
  }, [selectedRows])

  const handleDelete = async () => {
    const selectedIds = selectedPayments.map((inv) => inv.id)
    // Filter out payments that are not draft or cancelled
    const invalidPayments = selectedPayments.filter(inv => !['draft', 'cancelled'].includes(inv.status))

    if (invalidPayments.length > 0) {
      toast.error('Chỉ có thể xóa các phiếu ở trạng thái Nháp hoặc Đã hủy')
      return
    }

    try {
      await dispatch(deleteMultiplePayments(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 flex-1 text-sm"
        />

        <Can permission="CREATE_PAYMENT">
          <Button
            className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            Thêm
          </Button>
        </Can>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => setShowExportDialog(true)}
              className="text-xs text-green-600"
            >
              <IconFileTypeXls className="mr-2 h-3 w-3" />
              Xuất Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {showExportDialog && (
          <ExportPaymentDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyPayment={isMyPayment}
          />
        )}

        {showCreateDialog && (
          <PaymentDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            showTrigger={false}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu chi..."
          value={table.getColumn('voucherCode')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('voucherCode')?.setFilterValue(event.target.value)
          }
          className="h-8 flex-1 lg:flex-none lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {selectedPayments.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Xóa ({selectedPayments.length})
          </Button>
        )}

        <Button
          className="text-green-600 border-green-200 hover:bg-green-50 h-8"
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất file
        </Button>

        <Can permission="CREATE_PAYMENT">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white h-8"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </Can>

        {showExportDialog && (
          <ExportPaymentDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyPayment={isMyPayment}
          />
        )}

        {showCreateDialog && (
          <PaymentDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            showTrigger={false}
          />
        )}

        <DeleteMultiplePaymentVouchersDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedPayments.length}
        />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}


