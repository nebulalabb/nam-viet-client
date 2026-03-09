import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { updateInvoiceStatus } from '@/stores/InvoiceSlice'
import { IconCircleX } from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const RejectInvoiceDialog = ({ invoice, showTrigger = true, open, onOpenChange }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.invoice.loading)

  const handleReject = async (id) => {
    try {
      await dispatch(
        updateInvoiceStatus({
          id: id,
          status: 'rejected',
        }),
      ).unwrap()
      toast.success('Đã hủy hóa đơn thành công')
      onOpenChange?.(false)
    } catch (error) {
      console.log('Reject error: ', error)
      // Toast error is handled in slice usually, or add here if needed
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <IconCircleX className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hủy đơn bán</DialogTitle>
          <DialogDescription>
            Hành động này sẽ chuyển trạng thái đơn bán <strong>{invoice?.code}</strong> sang{' '}
            <span className="font-bold text-red-600">Đã hủy</span>.
            <br />
            Bạn có chắc chắn muốn tiếp tục?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Đóng
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleReject(invoice.id)}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đồng ý hủy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RejectInvoiceDialog
