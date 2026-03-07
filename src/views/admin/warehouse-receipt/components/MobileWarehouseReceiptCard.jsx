import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Printer, Trash2, Pencil, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { warehouseReceiptStatuses, receiptTypes } from '../data'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import ViewWarehouseReceiptDialog from './ViewWarehouseReceiptDialog'
import PrintWarehouseReceiptView from './PrintWarehouseReceiptView'
import { DeleteWarehouseReceiptDialog } from './DeleteWarehouseReceiptDialog'
import { UpdateWarehouseReceiptStatusDialog } from './UpdateWarehouseReceiptStatusDialog'
import { updateWarehouseReceipt, getWarehouseReceipts, cancelWarehouseReceipt, postWarehouseReceipt, getWarehouseReceiptById } from '@/stores/WarehouseReceiptSlice'
import ExportWarehouseReceiptPreview from './ExportWarehouseReceiptPreview'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MobileWarehouseReceiptCard = ({
  receipt,
  isSelected,
  onSelectChange,
}) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [exportData, setExportData] = useState(null)
  const [targetStatus, setTargetStatus] = useState(null)

  // Print state
  const setting = useSelector((state) => state.setting.setting)
  const [printData, setPrintData] = useState(null)

  const { code, receiptDate, totalAmount, status, note, supplier, customer, receiptType, invoice } = receipt

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
      // Refresh list handled by parent or slice if needed, but usually we should refresh
      dispatch(getWarehouseReceipts())
    } catch (error) {
      console.error(error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleStatusChange = (newStatus) => {
    setTargetStatus(newStatus)
    setShowUpdateStatusDialog(true)
  }

  const handlePrintReceipt = () => {
    setPrintData(receipt)
    setTimeout(() => setPrintData(null), 100)
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

  // Helper for select display
  const selectedStatusObj = warehouseReceiptStatuses.find((s) => s.value === status)

  const partnerName = receiptType === 1 ? supplier?.name : customer?.name
  const partnerLabel = receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'

  return (
    <>
      {showViewDialog && (
        <ViewWarehouseReceiptDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          receiptId={receipt.id}
          showTrigger={false}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdateWarehouseReceiptStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={(open) => {
            setShowUpdateStatusDialog(open)
            if (!open) setTargetStatus(null)
          }}
          receiptId={receipt.id}
          receiptCode={code}
          currentStatus={status}
          targetStatus={targetStatus}
          statuses={warehouseReceiptStatuses}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[10002]"
          overlayClassName="z-[10001]"
        />
      )}

      {showDeleteDialog && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
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

      <div className="border rounded-lg bg-card mb-3 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="h-4 w-4"
          />

          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate text-primary cursor-pointer hover:underline"
              onClick={() => setShowViewDialog(true)}
            >
              <div className="flex items-center gap-2">
                <span>{code}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(receiptDate, true)}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => setShowViewDialog(true)}
                className="text-blue-600 hover:text-blue-700 focus:text-blue-700"
              >
                <Eye className="mr-2 h-4 w-4" />
                Xem
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handlePrintReceipt}
                className="text-violet-600 hover:text-violet-700 focus:text-violet-700"
              >
                <Printer className="mr-2 h-4 w-4" />
                In phiếu
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleExportClick}
                className="text-green-600 hover:text-green-700 focus:text-green-700"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Xuất Excel
              </DropdownMenuItem>

              {status === 'draft' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowViewDialog(true)}
                    className="text-orange-600 hover:text-orange-700 focus:text-orange-700"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Amount & Status Section */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Tổng tiền:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(totalAmount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>
            <div className="w-[140px]">
              <Select
                value={status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-7 text-xs px-2">
                  <SelectValue placeholder="Chọn trạng thái">
                    {selectedStatusObj ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-medium',
                          selectedStatusObj.value === 'posted' ? 'text-green-600' :
                            selectedStatusObj.value === 'confirmed' ? 'text-blue-600' :
                              selectedStatusObj.value === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                        )}
                      >
                        {selectedStatusObj.label}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-[140px] z-[10005]">
                  {warehouseReceiptStatuses.filter((s) => {
                    if (status === 'posted') {
                      return s.value === 'cancelled'
                    }
                    if (status === 'cancelled') {
                      return false
                    }
                    return true
                  }).map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="cursor-pointer text-xs"
                    >
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 font-medium',
                          s.value === 'posted' ? 'text-green-600' :
                            s.value === 'confirmed' ? 'text-blue-600' :
                              s.value === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                        )}
                      >
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">{partnerLabel}:</span>
            <span className="text-xs text-right font-medium line-clamp-1">{partnerName || '---'}</span>
          </div>
          {invoice && (
            <div className="flex justify-between items-start">
              <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Hóa đơn:</span>
              <span className="text-xs text-right font-medium text-primary">{invoice.code}</span>
            </div>
          )}
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t text-xs">
            {note && (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span className="italic">{note}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Loại phiếu:</span>
              <span>{receiptTypes.find(t => t.value === receiptType)?.label}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MobileWarehouseReceiptCard
