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
import { deleteWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'
import { cn } from '@/lib/utils'

const DeleteWarehouseReceiptDialog = ({ receipt, showTrigger = true, onSuccess, contentClassName, overlayClassName, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.warehouseReceipt.loading)

  const destroy = async (id) => {
    try {
      await dispatch(deleteWarehouseReceipt(id)).unwrap()
      onSuccess?.()
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className={cn(contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Phiếu xuất kho <span className="font-semibold">{receipt?.code}</span> sẽ bị xóa.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(receipt.id)}
              disabled={loading}
            >
              Tiếp tục
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteWarehouseReceiptDialog }
