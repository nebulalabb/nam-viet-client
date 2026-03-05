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
import { deleteTax } from '@/stores/TaxSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteTaxDialog = ({ tax, showTrigger = true, ...props }) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.tax.loading)

  const destroy = async (data) => {
    try {
      await dispatch(deleteTax(data)).unwrap()
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
          <DialogDescription>
            Hành động này không thể hoàn tác. Loại thuế:{' '}
            <strong>
              {tax.title}({tax.percentage}%)
            </strong>{' '}
            sẽ bị xóa
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => destroy(tax.id)}
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

export { DeleteTaxDialog }
