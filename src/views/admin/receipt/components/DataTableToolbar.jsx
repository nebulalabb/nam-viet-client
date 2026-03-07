import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import PaymentReminderDialog from './PaymentReminderDialog'
import { useState } from 'react'
import { BellIcon, QrCode } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { getReceiptQRCode, deleteMultipleReceipts } from '@/stores/ReceiptSlice'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { moneyFormat } from '@/utils/money-format'
import PaymentQRCodeDialog from './PaymentQRCodeDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import ExportReceiptDialog from './ExportReceiptDialog'

import { DeleteMultipleReceiptsDialog } from './DeleteMultipleReceiptsDialog'

const DataTableToolbar = ({ table, isMyReceipt = false }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const selectedRows = table.getSelectedRowModel().rows
  const [openReminder, setOpenReminder] = useState(false)
  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const dispatch = useDispatch()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const canRemind = selectedRows.length === 1

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    const selectedReceipts = selectedRows.map((row) => row.original)

    // Filter out receipts that are not draft or cancelled
    // Assuming same logic as Payment: only delete draft or cancelled? 
    // User requested "bulk delete" - usually implies same rules.
    // Let's check permissions/rules. Payment said "!['draft', 'cancelled'].includes(inv.status)" -> invalid.
    // So only draft and cancelled can be deleted.
    const invalidReceipts = selectedReceipts.filter(r => !['draft', 'cancelled'].includes(r.status))

    if (invalidReceipts.length > 0) {
      toast.error('Chỉ có thể xóa các phiếu ở trạng thái Nháp hoặc Đã hủy')
      return
    }

    try {
      await dispatch(deleteMultipleReceipts(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleGenerateQR = async () => {
    if (selectedRows.length !== 1) {
      toast.warning('Vui lòng chọn 1 (Một) phiếu thu')
      return
    }

    const receipt = selectedRows[0].original

    if (receipt.status !== 'draft') {
      toast.warning('Chỉ có thể tạo mã QR cho phiếu thu nháp')
      return
    }

    try {
      setQrLoading(true)
      const qrData = await dispatch(getReceiptQRCode(receipt.id)).unwrap()
      setQrCodeData(qrData)
      setOpenQrDialog(true)
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
      toast.error('Không lấy được mã QR thanh toán')
    } finally {
      setQrLoading(false)
    }
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu thu..."
          value={table.getState().globalFilter || ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          className="h-8 flex-1 text-sm"
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              disabled={!canRemind}
              onClick={() => setOpenReminder(true)}
              className="text-xs text-orange-500"
            >
              <BellIcon className="mr-2 h-3 w-3" />
              Nhắc hạn thanh toán
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={selectedRows.length !== 1 || selectedRows[0]?.original?.status !== 'draft'}
              onClick={handleGenerateQR}
              className="text-xs text-purple-600"
            >
              <QrCode className="mr-2 h-3 w-3" />
              Tạo QR thanh toán
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setShowExportDialog(true)}
              className="text-xs text-green-600"
            >
              <IconFileTypeXls className="mr-2 h-3 w-3" />
              Xuất Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {canRemind && (
          <PaymentReminderDialog
            open={openReminder}
            onOpenChange={setOpenReminder}
            receipt={selectedRows[0].original}
          />
        )}

        <PaymentQRCodeDialog
          open={openQrDialog}
          onOpenChange={setOpenQrDialog}
          qrCodeData={qrCodeData}
        />

        {showExportDialog && (
          <ExportReceiptDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyReceipt={isMyReceipt}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm theo mã phiếu thu..."
          value={table.getColumn('code')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('code')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Đặt lại
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            Xóa ({selectedRows.length})
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          disabled={!canRemind}
          onClick={() => setOpenReminder(true)}
          className="text-orange-500 border-orange-500 hover:bg-orange-50"
        >
          <BellIcon className="mr-2 h-4 w-4" />
          Nhắc hạn thanh toán
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={selectedRows.length !== 1 || selectedRows[0]?.original?.status !== 'draft'}
          onClick={handleGenerateQR}
          loading={qrLoading}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          <QrCode className="mr-2 h-4 w-4" />
          Tạo QR thanh toán
        </Button>

        <Button
          className="text-green-600 border-green-200 hover:bg-green-50 h-8"
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {showExportDialog && (
          <ExportReceiptDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyReceipt={isMyReceipt}
          />
        )}
      </div>

      {canRemind && (
        <PaymentReminderDialog
          open={openReminder}
          onOpenChange={setOpenReminder}
          receipt={selectedRows[0].original}
        />
      )}

      <PaymentQRCodeDialog
        open={openQrDialog}
        onOpenChange={setOpenQrDialog}
        qrCodeData={qrCodeData}
      />

      <DataTableViewOptions table={table} />
      <DeleteMultipleReceiptsDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
      />
    </div>
  )
}

export { DataTableToolbar }
