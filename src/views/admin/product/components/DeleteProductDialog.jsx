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
import { deleteProduct } from '@/stores/ProductSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

import { cn } from '@/lib/utils'

const DeleteProductDialog = ({ product, showTrigger = true, contentClassName, overlayClassName, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.product.loading)

  const destroy = async (data) => {
    try {
      await dispatch(deleteProduct(data)).unwrap()
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
      <DialogContent className={cn(contentClassName)} overlayClassName={cn(overlayClassName)}>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Nó sẽ xóa dữ liệu trên server
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(product.id)}
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

export { DeleteProductDialog }
