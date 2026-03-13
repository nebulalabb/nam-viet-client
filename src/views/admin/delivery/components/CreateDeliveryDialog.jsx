import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/custom/Button'
import { Textarea } from '@/components/ui/textarea'
import { getUsers } from '@/stores/UserSlice'
import { createDelivery } from '@/stores/DeliverySlice'
import { toast } from 'sonner'

const formSchema = z.object({
  orderId: z.number(),
  deliveryStaffId: z.string().min(1, 'Vui lòng chọn nhân viên giao hàng'),
  shippingPartner: z.string().optional(),
  deliveryDate: z.string().min(1, 'Vui lòng chọn ngày giao hàng'),
  codAmount: z.coerce.number().min(0),
  deliveryCost: z.coerce.number().min(0),
  notes: z.string().optional(),
})

export default function CreateDeliveryDialog({ open, onOpenChange, invoice, onSuccess }) {
  const dispatch = useDispatch()
  const { users } = useSelector((state) => state.user)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderId: invoice?.id,
      deliveryStaffId: '',
      shippingPartner: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      codAmount: Number(invoice?.totalAmount || 0) - Number(invoice?.paidAmount || 0),
      deliveryCost: 0,
      notes: '',
    },
  })

  useEffect(() => {
    if (open) {
      dispatch(getUsers({ limit: 100, status: 'active' }))
      form.reset({
        orderId: invoice?.id,
        deliveryStaffId: '',
        shippingPartner: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        codAmount: Number(invoice?.totalAmount || 0) - Number(invoice?.paidAmount || 0),
        deliveryCost: 0,
        notes: '',
      })
    }
  }, [open, invoice, dispatch, form])

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      await dispatch(createDelivery({
        ...values,
        deliveryStaffId: Number(values.deliveryStaffId)
      })).unwrap()
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo phiếu giao hàng - {invoice?.orderCode}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deliveryStaffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nhân viên giao hàng</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nhân viên" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.fullName} ({user.employeeCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingPartner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đối tác vận chuyển (nếu có)</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên đối tác" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày giao hàng</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deliveryCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí vận chuyển thực tế</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="codAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số tiền COD (Số tiền cần thu)</FormLabel>
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
                    <Textarea placeholder="Ghi chú cho shipper..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={loading}>
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
