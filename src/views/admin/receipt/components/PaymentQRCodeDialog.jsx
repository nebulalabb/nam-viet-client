import { Download, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { cn } from '@/lib/utils'

const PaymentQRCodeDialog = ({
  open,
  onOpenChange,
  qrCodeData,
  className,
  overlayClassName,
  title = "Mã QR Thanh Toán",
  description,
}) => {
  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSaveImage = async () => {
    if (!qrCodeData?.qrLink) return

    try {
      const response = await fetch(qrCodeData.qrLink)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vietqr-payment-${qrCodeData.voucherCode || 'code'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Đã tải ảnh QR thành công')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Không thể tải ảnh QR')
    }
  }

  const handleShare = async () => {
    if (!qrCodeData?.qrLink) return

    try {
      const response = await fetch(qrCodeData.qrLink)
      const blob = await response.blob()

      if (navigator.share) {
        const file = new File([blob], 'payment-qr.png', { type: 'image/png' })
        await navigator.share({
          title: 'Mã QR Thanh Toán',
          text: `Thanh toán cho đơn: ${qrCodeData.voucherCode || ''}\nSố tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(qrCodeData.amount)}`,
          files: [file]
        })
      } else {
        // Fallback or just notify user
        toast.info('Trình duyệt không hỗ trợ chia sẻ ảnh trực tiếp')
      }
    } catch (error) {
      console.error('Share error:', error)
      // Usually share cancellation, ignore or subtle toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", className)}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || `Quét mã QR để thanh toán ${qrCodeData?.voucherCode || ''}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {qrCodeData?.qrLink ? (
            <>
              <img
                src={qrCodeData.qrLink}
                alt="Payment QR Code"
                className="h-64 w-64 object-contain"
              />
              <div className="text-center text-sm space-y-1">
                <p className="font-semibold">
                  {qrCodeData?.bankName} - {qrCodeData?.accountNo}
                </p>
                <p>{qrCodeData?.accountName}</p>
                <p className="text-muted-foreground mt-2">
                  Số tiền:{" "}
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(qrCodeData?.amount || 0)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Nội dung: <span className="font-medium">{qrCodeData?.description}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
              Không có dữ liệu mã QR
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {qrCodeData?.qrLink && (
            <div className="flex justify-center gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={handleSaveImage}>
                <Download className="mr-2 h-4 w-4" />
                Lưu ảnh
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ
              </Button>
            </div>
          )}
          <Button onClick={handleClose} className="w-full">Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentQRCodeDialog
