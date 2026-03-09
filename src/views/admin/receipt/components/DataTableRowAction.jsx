import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { DeleteReceiptDialog } from './DeleteReceiptDialog'
import { useDispatch, useSelector } from 'react-redux'
import { getReceiptQRCode } from '@/stores/ReceiptSlice'
import { toast } from 'sonner'
import {
  Eye,
  Printer,
  Trash2,
  QrCode,
} from 'lucide-react'
import PaymentQRCodeDialog from './PaymentQRCodeDialog'
import ViewReceiptDialog from './ViewReceiptDialog'
import PrintReceiptView from './PrintReceiptView'

const DataTableRowActions = ({ row }) => {
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)
  const [showViewReceiptDialog, setShowViewReceiptDialog] = useState(false)
  const [printData, setPrintData] = useState(null)

  const [openQrDialog, setOpenQrDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)

  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting.setting)
  const receipt = row.original

  const handleGenerateQR = async () => {
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

  const handlePrintReceipt = () => {
    setPrintData(receipt)
    setTimeout(() => setPrintData(null), 100)
  }

  return (
    <>
      <PaymentQRCodeDialog
        open={openQrDialog}
        onOpenChange={setOpenQrDialog}
        qrCodeData={qrCodeData}
      />

      {showViewReceiptDialog && (
        <ViewReceiptDialog
          open={showViewReceiptDialog}
          onOpenChange={setShowViewReceiptDialog}
          receiptId={receipt.id}
          showTrigger={false}
        />
      )}

      {showDeleteReceiptDialog && (
        <DeleteReceiptDialog
          open={showDeleteReceiptDialog}
          onOpenChange={setShowDeleteReceiptDialog}
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setShowViewReceiptDialog(true)}
            className="text-blue-600 focus:text-blue-600"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handlePrintReceipt}
            className="text-orange-600 focus:text-orange-600"
          >
            <Printer className="mr-2 h-4 w-4" />
            In phiếu
          </DropdownMenuItem>

          {receipt.status === 'draft' && (
            <>
              <DropdownMenuItem
                onSelect={handleGenerateQR}
                className="text-purple-600 focus:text-purple-600"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Tạo QR
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setShowDeleteReceiptDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </>
          )}

          {(receipt.status === 'cancelled' ||
            receipt.status === 'canceled') && (
              <DropdownMenuItem
                onSelect={() => setShowDeleteReceiptDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
