import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import {
  getWarehouseReceiptById,
} from '@/stores/WarehouseReceiptSlice'
import ViewWarehouseReceiptDialog from './ViewWarehouseReceiptDialog'
import UpdateWarehouseReceiptDialog from './UpdateWarehouseReceiptDialog'
import Can from '@/utils/can'
import { Eye, Printer, Trash2, Pencil, FileSpreadsheet } from 'lucide-react'
import { DeleteWarehouseReceiptDialog } from './DeleteWarehouseReceiptDialog'
import { CancelWarehouseReceiptDialog } from './CancelWarehouseReceiptDialog'
import PrintWarehouseReceiptView from './PrintWarehouseReceiptView'
import ExportWarehouseReceiptPreview from './ExportWarehouseReceiptPreview'
import { toast } from 'sonner'

export function DataTableRowActions({ row, onRefresh }) {
  const dispatch = useDispatch()
  const receipt = row.original
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [exportData, setExportData] = useState(null)

  // Print state
  const setting = useSelector((state) => state.setting.setting)
  const [printData, setPrintData] = useState(null)

  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrintReceipt = async () => {
    try {
      setIsPrinting(true)
      const data = await dispatch(getWarehouseReceiptById(receipt.id)).unwrap()
      setPrintData(data)
      setTimeout(() => setPrintData(null), 100)
    } catch (error) {
      console.error(error)
      toast.error('Không thể lấy dữ liệu phiếu kho')
    } finally {
      setIsPrinting(false)
    }
  }

  const handleExportClick = async () => {
    try {
      const data = await dispatch(getWarehouseReceiptById(receipt.id)).unwrap()
      setExportData(data)
      setShowExportPreview(true)
    } catch (error) {
      console.error(error)
      toast.error('Không thể lấy dữ liệu chi tiết')
    }
  }

  const handlePost = async () => {
    if (receipt.status === 'posted') {
      return
    }
    const confirm = window.confirm(
      'Bạn có chắc chắn muốn duyệt phiếu kho này không? Sau khi duyệt sẽ không thể chỉnh sửa.'
    )
    if (confirm) {
      await dispatch(postWarehouseReceipt(receipt.id))
    }
  }

  return (
    <>
      <ViewWarehouseReceiptDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        receiptId={receipt.id}
        showTrigger={false}
        onSuccess={onRefresh}
      />

      {showUpdateDialog && (
        <UpdateWarehouseReceiptDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          receiptId={receipt.id}
          onSuccess={onRefresh}
        />
      )}

      {showDeleteDialog && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          receipt={receipt}
          showTrigger={false}
          onSuccess={onRefresh}
          contentClassName="z-[10002]"
          overlayClassName="z-[10001]"
        />
      )}

      {showCancelDialog && (
        <CancelWarehouseReceiptDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          receipt={receipt}
          showTrigger={false}
        />
      )}

      {/* Print View */}
      {printData && (
        <PrintWarehouseReceiptView
          receipt={printData}
          setting={setting}
        />
      )}

      {/* Export Preview Dialog */}
      {showExportPreview && (
        <ExportWarehouseReceiptPreview
          open={showExportPreview}
          onOpenChange={setShowExportPreview}
          receipt={exportData}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Mở menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => setShowViewDialog(true)}
            className="text-blue-600 hover:text-blue-700 focus:text-blue-700"
          >
            Xem
            <DropdownMenuShortcut>
              <Eye className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {receipt.status === 'draft' && (
            <Can permission={receipt.receiptType === 1 ? 'WAREHOUSE_IMPORT_UPDATE' : 'WAREHOUSE_EXPORT_UPDATE'}>
              <DropdownMenuItem
                onClick={() => setShowUpdateDialog(true)}
                className="text-amber-500 hover:text-amber-600 focus:text-amber-600"
              >
                Sửa
                <DropdownMenuShortcut>
                  <Pencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuItem
            onClick={handlePrintReceipt}
            disabled={isPrinting}
            className="text-violet-600 hover:text-violet-700 focus:text-violet-700"
          >
            {isPrinting ? 'Đang tải...' : 'In phiếu'}
            <DropdownMenuShortcut>
              <Printer className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleExportClick}
            className="text-green-600 hover:text-green-700 focus:text-green-700"
          >
            Xuất Excel
            <DropdownMenuShortcut>
              <FileSpreadsheet className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {(receipt.status === 'draft' || receipt.status === 'cancelled') && (
            <>
              {receipt.status === 'draft' && <DropdownMenuSeparator />}
              <Can permission={receipt.receiptType === 1 ? 'WAREHOUSE_IMPORT_DELETE' : 'WAREHOUSE_EXPORT_DELETE'}>
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  Xóa
                  <DropdownMenuShortcut>
                    <Trash2 className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>
            </>
          )}

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
