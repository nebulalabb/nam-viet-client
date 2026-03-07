import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { deleteMultiplePayments } from '@/stores/PaymentSlice'
import { useDispatch, useSelector } from 'react-redux'
import { cn } from '@/lib/utils'

const DeleteMultiplePaymentsDialog = ({
  payments = [],
  open,
  onOpenChange,
  onSuccess,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.payment.loading)
  const count = payments.length

  const destroy = async () => {
    if (count === 0) return

    try {
      const ids = payments.map(p => p.id)
      await dispatch(deleteMultiplePayments(ids)).unwrap()
      onSuccess?.()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Bulk delete error: ', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className={cn(contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xóa {count} phiếu chi đã chọn?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Các phiếu chi đã chọn sẽ bị xóa vĩnh viễn.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>Hủy</Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={destroy}
            loading={loading}
          >
            Xóa {count} mục
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteMultiplePaymentsDialog
