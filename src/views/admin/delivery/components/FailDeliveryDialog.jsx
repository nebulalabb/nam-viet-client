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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/custom/Button'
import { Textarea } from '@/components/ui/textarea'
import { failDelivery } from '@/stores/DeliverySlice'

const formSchema = z.object({
  failureReason: z.string().min(1, 'Vui lòng chọn hoặc nhập lý do thất bại'),
  cancelOrder: z.boolean().default(false),
  notes: z.string().optional(),
})

const commonReasons = [
  'Khách hàng không nghe máy',
  'Khách hàng hẹn ngày khác',
  'Khách hàng từ chối nhận hàng',
  'Sai địa chỉ/thông tin liên hệ',
  'Hàng bị hỏng trong quá trình vận chuyển',
]

export default function FailDeliveryDialog({ open, onOpenChange, delivery, onSuccess }) {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      failureReason: '',
      cancelOrder: false,
      notes: '',
    },
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      await dispatch(failDelivery({ id: delivery.id, ...values })).unwrap()
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
          <DialogTitle className="text-red-600">Báo cáo giao hàng thất bại</DialogTitle>
          <DialogDescription>
            Phiếu giao: **{delivery?.deliveryCode}**
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="failureReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do thất bại</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lý do" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Lý do khác...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi tiết lý do (nếu chọn khác)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Mô tả chi tiết..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cancelOrder"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Hủy đơn hàng luôn?
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Nếu chọn, đơn bán sẽ chuyển sang "Đã hủy" và hàng sẽ được hoàn kho.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
              <Button type="submit" loading={loading} variant="destructive">Xác nhận thất bại</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
