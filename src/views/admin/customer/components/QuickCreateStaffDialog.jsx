import { Button } from '@/components/custom/Button'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getRoles } from '@/stores/RoleSlice'
import { createUser } from '@/stores/UserSlice'

const schema = z.object({
  fullName: z.string().min(2, 'Nhập tối thiểu 2 ký tự'),
  employeeCode: z.string().optional(),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'Vui lòng chọn vai trò'),
})

const QuickCreateStaffDialog = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const roles = useSelector((state) => state.role?.roles || [])

  useEffect(() => {
    if (open) {
      dispatch(getRoles())
    }
  }, [open, dispatch])

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      employeeCode: '',
      phone: '',
      roleId: '',
    },
  })

  // Reset khi mở lại form
  useEffect(() => {
    if (open) {
      form.reset()
    }
  }, [open, form])

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const ts = Date.now()
      const empCode = values.employeeCode?.trim() || `NV${ts.toString().slice(-6)}`
      
      const payload = {
        fullName: values.fullName,
        employeeCode: empCode,
        phone: values.phone || undefined,
        roleId: parseInt(values.roleId),
        status: 'active'
      }

      await dispatch(createUser(payload)).unwrap()
      
      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-[100100]">
        <DialogHeader>
          <DialogTitle>Thêm nhanh nhân viên giả lập</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên nhân viên..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employeeCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã nhân viên (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="Để trống để tự động sinh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="Số điện thoại" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[100110]">
                      {roles.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()}>{r.roleName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" loading={loading}>
                Thêm nhân viên
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default QuickCreateStaffDialog
