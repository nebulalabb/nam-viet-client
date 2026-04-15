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
import { deleteSupplier } from '@/stores/SupplierSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteSupplierDialog = ({ supplier, showTrigger = true, contentClassName, overlayClassName, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.supplier.loading)

  const destroy = async (data) => {
    try {
      await dispatch(deleteSupplier(data)).unwrap()
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
      <DialogContent className={contentClassName} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Nhà cung cấp:{' '}
            <strong>{supplier.name || supplier.supplierName}</strong> sẽ bị xóa.
            {supplier?._count?.products > 0 && (
              <div className="mt-2 text-destructive">
                Nhà cung cấp này đang có <strong>{supplier._count.products}</strong> sản phẩm.
                Nếu ấn xác nhận, hệ thống sẽ xóa nhà cung cấp và các sản phẩm của họ (sản phẩm còn tồn kho sẽ được giữ lại).
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(supplier.id)}
              loading={loading}
            >
              Tiếp tục
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteSupplierDialog }
