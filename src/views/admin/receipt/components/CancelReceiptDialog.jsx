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
import { updateReceiptStatus, getReceipts } from '@/stores/ReceiptSlice'
import { Ban } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const CancelReceiptDialog = ({ receipt, showTrigger = true, onSuccess, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.receipt.loading)

  const cancel = async (id) => {
    try {
      await dispatch(updateReceiptStatus({ id, status: 'canceled' })).unwrap()
      // Refresh list
      dispatch(getReceipts({}))
      onSuccess?.()
    } catch (error) {
      console.log('Cancel error: ', error)
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Ban className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hủy phiếu thu?</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn hủy phiếu thu này không? Hành động này sẽ cập nhật trạng thái phiếu thu thành "Đã hủy".
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Thoát</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => cancel(receipt.id)}
              disabled={loading}
            >
              Đồng ý hủy
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CancelReceiptDialog }
