import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/Button'
import { Textarea } from '@/components/ui/textarea'
import { completeDelivery } from '@/stores/DeliverySlice'
import { formatCurrency } from '@/utils/number-format'

const formSchema = z.object({
  receivedBy: z.string().min(1, 'Vui lòng nhập tên người nhận'),
  receivedPhone: z.string().optional(),
  collectedAmount: z.coerce.number().min(0),
  deliveryProof: z.string().optional(),
  notes: z.string().optional(),
})

export default function CompleteDeliveryDialog({ open, onOpenChange, delivery, onSuccess }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receivedBy: delivery?.order?.recipientName || '',
      receivedPhone: delivery?.order?.recipientPhone || '',
      collectedAmount: Number(delivery?.codAmount || 0),
      deliveryProof: '',
      notes: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      await dispatch(completeDelivery({ id: delivery.id, ...values })).unwrap()
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Xác nhận giao hàng thành công</DialogTitle>
          <DialogDescription>
            Phiếu giao: **{delivery?.deliveryCode}** - Số tiền COD: **{formatCurrency(delivery?.codAmount)}**
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="receivedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Người nhận hàng thực tế</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receivedPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại người nhận</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collectedAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền thực thu (VNĐ)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Ghi chú về buổi giao hàng..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" loading={loading} className="bg-green-600 hover:bg-green-700">Xác nhận hoàn thành</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
