import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { startDelivery } from '@/stores/DeliverySlice'
import { Textarea } from '@/components/ui/textarea'

export default function StartDeliveryDialog({ open, onOpenChange, delivery, onSuccess }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await dispatch(startDelivery({ id: delivery.id, notes })).unwrap()
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bắt đầu giao hàng</DialogTitle>
          <DialogDescription>
            Xác nhận shipper bắt đầu quá trình giao hàng cho phiếu **{delivery.deliveryCode}**?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Ghi chú thêm (nếu có)</label>
          <Textarea 
            placeholder="Nhập ghi chú..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleConfirm} loading={loading}>Xác nhận đi giao</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
