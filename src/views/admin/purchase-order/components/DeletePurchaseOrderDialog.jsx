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
import { deletePurchaseOrder } from '@/stores/PurchaseOrderSlice'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'

const DeletePurchaseOrderDialog = ({
  open,
  onOpenChange,
  purchaseOrder,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()

  const handleDelete = async () => {
    try {
      await dispatch(deletePurchaseOrder(purchaseOrder.id)).unwrap()
      toast.success('Xóa đơn đặt hàng thành công')
      onOpenChange(false)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Xóa đơn đặt hàng thất bại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa đơn đặt hàng</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa đơn đặt hàng <strong>{purchaseOrder?.code}</strong> không?
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleDelete}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeletePurchaseOrderDialog
