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
import { settleCOD } from '@/stores/DeliverySlice'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/utils/number-format'

export default function SettleCODDialog({ open, onOpenChange, delivery, onSuccess }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await dispatch(settleCOD({ id: delivery.id, notes })).unwrap()
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
          <DialogTitle>Xác nhận đối soát COD</DialogTitle>
          <DialogDescription>
            Xác nhận kế toán đã nhận đủ số tiền **{formatCurrency(delivery.collectedAmount)}** từ shipper cho phiếu **{delivery.deliveryCode}**?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">Ghi chú đối soát</label>
          <Textarea 
            placeholder="Nhập ghi chú (nếu có)..." 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleConfirm} loading={loading} className="bg-amber-600 hover:bg-amber-700">Xác nhận đã nhận tiền</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
