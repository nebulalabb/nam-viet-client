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
import { cn } from '@/lib/utils'

const UpdatePaymentStatusDialog = ({
  open,
  onOpenChange,
  paymentId,
  currentStatus,
  statuses = [],
  onSubmit, // Handler function to call on save
  contentClassName,
  overlayClassName,
  targetStatus, // New prop to pre-select status
  selectContentClassName,
}) => {
  // Normalize status to handle both single and double 'l' from backend/frontend mismatch
  const normalizedStatus = useMemo(() => {
    if (currentStatus === 'cancelled') return 'cancelled'
    return currentStatus
  }, [currentStatus])

  const current = useMemo(
    () => statuses.find((s) => s.value === normalizedStatus),
    [statuses, normalizedStatus],
  )

  const [status, setStatus] = useState(targetStatus || normalizedStatus || '')
  const [loading, setLoading] = useState(false)

  // Explicit color mapping since data might not have it
  const getColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'text-yellow-600'
      case 'completed': return 'text-green-600'
      case 'canceled':
      case 'cancelled': return 'text-red-600'
      default: return ''
    }
  }

  useEffect(() => {
    if (!open) return
    setStatus(targetStatus || normalizedStatus || '')
  }, [open, normalizedStatus, targetStatus])

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
      await onSubmit?.(status, paymentId)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStatuses = useMemo(() => {
    if (normalizedStatus === 'cancelled') {
      return statuses.filter(
        (s) => s.value === 'cancelled',
      )
    }
    if (normalizedStatus === 'completed') {
      return statuses.filter((s) => s.value !== 'draft')
    }
    return statuses
  }, [statuses, normalizedStatus])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[460px]", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái phiếu chi</DialogTitle>
          <DialogDescription>
            Phiếu chi: <span className="font-semibold">#{paymentId}</span>
            {current?.label ? (
              <>
                {' '}
                • Hiện tại:{' '}
                <span className={`font-semibold ${getColor(currentStatus)}`}>{current.label}</span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Trạng thái mới</div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái">
                {selectedStatusObj ? (
                  <span
                    className={`inline-flex items-center gap-2 font-medium ${getColor(status)}`}
                  >
                    {selectedStatusObj.icon ? (
                      <selectedStatusObj.icon className="h-4 w-4" />
                    ) : null}
                    {selectedStatusObj.label}
                  </span>
                ) : null}
              </SelectValue>
            </SelectTrigger>

            <SelectContent position="popper" className={cn("z-[10010]", selectContentClassName)}>
              {filteredStatuses.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="cursor-pointer"
                >
                  <span
                    className={`inline-flex items-center gap-2 font-medium ${getColor(s.value)}`}
                  >
                    {s.icon ? <s.icon className="h-4 w-4" /> : null}
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button type="button" onClick={handleSave} disabled={loading}>
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePaymentStatusDialog
