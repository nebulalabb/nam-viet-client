import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

const UpdateInvoiceStatusDialog = ({
  open,
  onOpenChange,
  invoiceId,
  currentStatus,
  paymentStatus,
  statuses = [],
  onSubmit,
  className,
  overlayClassName,
  selectContentClassName,
}) => {
  const current = useMemo(
    () => statuses.find((s) => s.value === currentStatus),
    [statuses, currentStatus],
  )

  const [status, setStatus] = useState(currentStatus || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setStatus(currentStatus || '')
  }, [open, currentStatus])

  const selectedStatusObj = useMemo(
    () => statuses.find((s) => s.value === status),
    [statuses, status],
  )

  const handleSave = async () => {
    if (!status) {
      toast.warning('Vui lòng chọn trạng thái')
      return
    }

    if (status === currentStatus) {
      toast.warning('Trạng thái mới trùng với trạng thái hiện tại')
      return
    }

    try {
      setLoading(true)
      await onSubmit?.(status, invoiceId)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }

  const isPaid = paymentStatus === 'paid'
  const isLocked = ['delivered', 'rejected'].includes(currentStatus)
  const isActionDisabled = isPaid || isLocked

  const filteredStatuses = useMemo(() => {
    const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
    const canReject = permissions.includes('REJECT_INVOICE')
    const canRevert = permissions.includes('REVERT_INVOICE')
    const canApprove = permissions.includes('APPROVE_INVOICE')

    return statuses.filter((s) => {
      // Hide 'completed' status as it is automated
      if (s.value === 'delivered') return false

      // Permission check for 'accepted' (approve)
      if (s.value === 'accepted') {
        if (!canApprove) return false
      }

      // Permission check for 'rejected'
      if (s.value === 'rejected') {
        if (!canReject) return false
        // Only allow switching to 'rejected' if current status is 'pending'
        // if (currentStatus !== 'pending') return false
      }

      // Permission check for 'pending' (revert)
      if (s.value === 'pending') {
        if (!canRevert) return false
      }

      return true
    })
  }, [statuses, currentStatus])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-[460px]', className)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái đơn bán</DialogTitle>
          <DialogDescription>
            Đơn bán: <span className="font-semibold">#{invoiceId}</span>
            {current?.label ? (
              <>
                {' '}
                • Hiện tại:{' '}
                <span className="font-semibold">{current.label}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {isActionDisabled ? (
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Không thể thay đổi trạng thái</AlertTitle>
              <AlertDescription>
                {isPaid
                  ? 'Hóa đơn này đã được thanh toán hoàn tất (Paid). Bạn không thể thay đổi trạng thái của hóa đơn này.'
                  : `Hóa đơn đang ở trạng thái "${current?.label || currentStatus}". Bạn không thể thay đổi trạng thái này.`}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm font-medium">Trạng thái mới</div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái">
                  {selectedStatusObj ? (
                    <span
                      className={`inline-flex items-center gap-2 font-medium ${selectedStatusObj.textColor || selectedStatusObj.color || ''
                        }`}
                    >
                      {selectedStatusObj.icon ? (
                        <selectedStatusObj.icon className="h-4 w-4" />
                      ) : null}
                      {selectedStatusObj.label}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>

              <SelectContent position="popper" className={cn("z-[10004]", selectContentClassName)}>
                {filteredStatuses.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={s.value}
                    className="cursor-pointer"
                  >
                    <span
                      className={`inline-flex items-center gap-2 font-medium ${s.textColor || s.color || ''
                        }`}
                    >
                      {s.icon ? <s.icon className="h-4 w-4" /> : null}
                      {s.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {isActionDisabled ? 'Đóng' : 'Hủy'}
          </Button>
          {!isActionDisabled && (
            <Button type="button" onClick={handleSave} disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default UpdateInvoiceStatusDialog
