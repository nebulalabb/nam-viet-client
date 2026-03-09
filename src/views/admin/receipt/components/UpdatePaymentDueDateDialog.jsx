import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import { Pencil } from 'lucide-react'
import { updatePaymentDueDate } from '@/stores/PaymentSlice'

const toInputDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const isValidInputDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v)

const UpdatePaymentDueDateDialog = ({
  payment,
  onUpdated,
  open,
  onOpenChange,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()

  const defaultDate = useMemo(
    () => toInputDate(payment?.dueDate),
    [payment?.dueDate],
  )
  const [dueDate, setDueDate] = useState(defaultDate)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setDueDate(defaultDate)
  }, [defaultDate, open])

  const handleSubmit = async () => {
    if (!payment?.id) return

    if (!dueDate || !isValidInputDate(dueDate)) {
      toast.error('Vui lòng chọn ngày hợp lệ')
      return
    }

    try {
      setSubmitting(true)
      await dispatch(updatePaymentDueDate({ id: payment.id, dueDate })).unwrap()
      await onUpdated?.()
      onOpenChange?.(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center rounded-md p-1 text-muted-foreground hover:text-primary"
            title="Sửa hạn chót"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa hạn chót</DialogTitle>
          <DialogDescription>
            Cập nhật hạn chót cho khoản thanh toán{' '}
            <strong>{payment?.code}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">Hạn chót mới</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={submitting}>
              Hủy
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePaymentDueDateDialog
