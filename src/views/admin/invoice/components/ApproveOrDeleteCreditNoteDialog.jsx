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
import { TrashIcon, CheckIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateCreditNoteStatus,
  getCreditNotesByInvoiceId,
} from '@/stores/CreditNoteSlice'
import { toast } from 'sonner'

const ApproveOrDeleteCreditNoteDialog = ({
  creditNote,
  invoiceId,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.creditNote.loading)

  const handleDelete = async () => {
    // try {
    //   await dispatch(deleteCreditNote(creditNote.id)).unwrap()
    //   toast.success(`Đã xóa hóa đơn âm ${creditNote.code}`)
    //   await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    // } catch (error) {
    //   toast.error('Không thể xóa hóa đơn âm. Vui lòng thử lại.')
    // }
  }

  const handleApprove = async () => {
    if (creditNote.status === 'accepted') {
      toast.warning('Hóa đơn âm đã được duyệt trước đó.')
      return
    }

    try {
      await dispatch(
        updateCreditNoteStatus({ id: creditNote.id, status: 'accepted' }),
      ).unwrap()
      toast.success(`Đã duyệt hóa đơn âm ${creditNote.code}`)
      await dispatch(getCreditNotesByInvoiceId(invoiceId)).unwrap()
    } catch (error) {
      toast.error('Không thể duyệt hóa đơn âm. Vui lòng thử lại.')
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xử lý
          </Button>
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận hành động</DialogTitle>
          <DialogDescription>
            Bạn muốn <strong>duyệt</strong> hay <strong>xóa</strong> hóa đơn âm:{' '}
            <span className="text-primary">{creditNote.code}</span>? Hành động
            này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={loading}
            >
              <TrashIcon className="mr-1 size-4" />
              Xóa
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button variant="default" onClick={handleApprove} loading={loading}>
              <CheckIcon className="mr-1 size-4" />
              Duyệt
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ApproveOrDeleteCreditNoteDialog
