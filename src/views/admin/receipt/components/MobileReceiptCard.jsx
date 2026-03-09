import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Eye, Printer, Trash2, QrCode } from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu'
import { receiptStatus } from '../data'
import { useMemo } from 'react'
import ViewReceiptDialog from './ViewReceiptDialog'
import { useDispatch, useSelector } from 'react-redux'
import { updateReceiptStatus, getReceiptQRCode, getReceipts } from '@/stores/ReceiptSlice'
import { toast } from 'sonner'
import UpdateReceiptStatusDialog from './UpdateReceiptStatusDialog'
import { DeleteReceiptDialog } from './DeleteReceiptDialog'
import PrintReceiptView from './PrintReceiptView'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PaymentQRCodeDialog from './PaymentQRCodeDialog'

const MobileReceiptCard = ({
  receipt,
  isSelected,
  onSelectChange,
}) => {
  const dispatch = useDispatch()
  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Print state
  const setting = useSelector((state) => state.setting.setting)
  const [printData, setPrintData] = useState(null)

  // QR state
  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Target status for dialog
  const [targetStatus, setTargetStatus] = useState(null)

  const { code, createdAt, amount, status, reason, paymentMethod, receiverType, invoice } = receipt

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      await dispatch(updateReceiptStatus({ id, status: newStatus })).unwrap()
      toast.success('Cập nhật trạng thái thành công')
      setShowUpdateStatusDialog(false)
      dispatch(getReceipts())
    } catch (error) {
      console.error(error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handlePrintReceipt = () => {
    setPrintData(receipt)
    setTimeout(() => setPrintData(null), 100)
  }

  const handleGenerateQR = async () => {
    if (status !== 'draft') {
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

  // Filter statuses logic matching UpdateReceiptStatusDialog
  const filteredStatuses = useMemo(() => {
    const normalizedStatus = status === 'cancelled' ? 'canceled' : status

    if (normalizedStatus === 'canceled' || normalizedStatus === 'cancelled') {
      return receiptStatus.filter(
        (s) => s.value === 'canceled' || s.value === 'cancelled',
      )
    }
    if (normalizedStatus === 'completed') {
      return receiptStatus.filter((s) => s.value !== 'draft')
    }
    return receiptStatus
  }, [status])

  const selectedStatusObj = receiptStatus.find((s) => s.value === status)

  const handleStatusChange = (newStatus) => {
    setTargetStatus(newStatus)
    setShowUpdateStatusDialog(true)
  }

  const getStatusBadge = (statusValue) => {
    // Legacy badge function if needed, but we are replacing with Select in UI
    const statusObj = receiptStatus.find((s) => s.value === statusValue)
    const colorClass = statusValue === 'completed' ? 'bg-green-500' : statusValue === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'

    return (
      <Badge
        className={`cursor-pointer hover:underline ${colorClass}`}
        onClick={() => setShowUpdateStatusDialog(true)}
      >
        {statusObj?.label || statusValue}
      </Badge>
    )
  }

  return (
    <>
      {showViewDialog && (
        <ViewReceiptDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          receiptId={receipt.id}
          showTrigger={false}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdateReceiptStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={(open) => {
            setShowUpdateStatusDialog(open)
            if (!open) setTargetStatus(null)
          }}
          receiptId={receipt.id}
          currentStatus={status}
          targetStatus={targetStatus}
          statuses={receiptStatus}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[10002]"
          overlayClassName="z-[10001]"
        />
      )}

      {showDeleteDialog && (
        <DeleteReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          receipt={receipt}
          showTrigger={false}
        />
      )}

      {/* Print View */}
      {printData && (
        <PrintReceiptView
          receipt={printData}
          setting={setting}
        />
      )}

      {/* QR Dialog */}
      <PaymentQRCodeDialog
        open={openQrDialog}
        onOpenChange={setOpenQrDialog}
        qrCodeData={qrCodeData}
      />

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
                {receipt.isDeposit && (
                  <Badge variant="secondary" className="text-[10px] h-5 px-1">
                    Cọc
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(createdAt)}</div>
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
              <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                In phiếu
              </DropdownMenuItem>

              {status === 'draft' && (
                <>
                  <DropdownMenuItem onSelect={handleGenerateQR}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Tạo QR
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
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
            <span className="text-xs text-muted-foreground">Số tiền:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(amount)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>
            {/* Replaced Badge with Select */}
            <div className="w-[140px]">
              <Select
                value={status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="h-7 text-xs px-2">
                  <SelectValue placeholder="Chọn trạng thái">
                    {selectedStatusObj ? (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${selectedStatusObj.value === 'completed' ? 'text-green-600' : selectedStatusObj.value === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                          }`}
                      >
                        {selectedStatusObj.label}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-[140px] z-[10005]">
                  {filteredStatuses.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="cursor-pointer text-xs"
                    >
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${s.value === 'completed' ? 'text-green-600' : s.value === 'canceled' ? 'text-red-600' : 'text-yellow-600'
                          }`}
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
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Loại:</span>
            <span className="text-xs text-right font-medium">{receiverType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground w-20 flex-shrink-0">Thanh toán:</span>
            <Badge variant="outline" className="text-[10px] h-5 px-1 font-normal">
              {paymentMethod === 'cash' ? 'Tiền mặt' : paymentMethod === 'transfer' ? 'Chuyển khoản' : paymentMethod}
            </Badge>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t text-xs">
            {invoice && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hóa đơn:</span>
                <span className="font-medium">{invoice.code}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground">Lý do:</span>
              <span className="italic">{reason || 'Không có'}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MobileReceiptCard
