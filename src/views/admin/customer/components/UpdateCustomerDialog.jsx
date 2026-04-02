import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUsers } from '@/stores/UserSlice'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { updateCustomer } from '@/stores/CustomerSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateCustomerSchema } from '../schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { types, customerStatuses } from '../data'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import MoneyInput from '@/components/custom/MoneyInput'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const UpdateCustomerDialog = ({
  customer,
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const loading = useSelector((state) => state.customer.loading)

  const form = useForm({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      customerCode: customer.customerCode || '',
      customerName: customer.customerName || customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      contactPerson: customer.contactPerson || customer.represent || '',
      notes: customer.notes || customer.note || '',
      customerType: customer.customerType || customer.type || 'individual',
      taxCode: customer.taxCode || '',
      cccd: customer.cccd || customer.identityCard || '',
      issuedAt: customer.issuedAt || customer.identityDate || null,
      issuedBy: customer.issuedBy || customer.identityPlace || '',
      creditLimit: customer.creditLimit || 0,
      rewardPoints: customer.rewardPoints || 0,
      rewardCode: customer.rewardCode || '',
      assignedUserId: customer.assignedUserId?.toString() || '',
      status: customer.status || 'active',
    },
  })

  const [openIdentityDatePicker, setOpenIdentityDatePicker] = useState(false)
  const users = useSelector((state) => state.user?.users || [])

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getUsers({ limit: 100, status: 'active' }))
  }, [dispatch])

  const onSubmit = async (data) => {
    try {
      if (data.assignedUserId === '' || data.assignedUserId === 'none') {
        data.assignedUserId = null
      } else if (data.assignedUserId) {
        data.assignedUserId = Number(data.assignedUserId)
      }
      await dispatch(updateCustomer({ id: customer.id, data })).unwrap()
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className={cn("md:h-auto md:max-w-2xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Cập nhật khách hàng</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-customer" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mã khách hàng</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Mã khách hàng" {...field} readOnly className="bg-muted/40 font-mono" />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Cố định</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên khách hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên khách hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Địa chỉ email</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Người liên hệ / Đại diện</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập người liên hệ / tên công ty" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mã số thuế</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã số thuế" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cccd"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>CCCD</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nhập số CCCD" 
                          {...field} 
                          value={field.value || ''} 
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuedAt"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Ngày cấp</FormLabel>
                      <Popover open={openIdentityDatePicker} onOpenChange={setOpenIdentityDatePicker}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              type="button"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), 'dd/MM/yyyy', {
                                  locale: vi,
                                })
                              ) : (
                                <span>Chọn ngày cấp</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date ? format(date, 'yyyy-MM-dd') : null)
                              setOpenIdentityDatePicker(false)
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                            locale={vi}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuedBy"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Nơi cấp</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập nơi cấp" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MoneyInput
                  control={form.control}
                  name="creditLimit"
                  label="Hạn mức công nợ (VND)"
                  placeholder="Nhập hạn mức công nợ"
                />

                <MoneyInput
                  control={form.control}
                  name="rewardPoints"
                  label="Điểm thưởng"
                  placeholder="Nhập điểm thưởng"
                />

                <FormField
                  control={form.control}
                  name="rewardCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mã thưởng (Code)</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã ưu đãi / mã thưởng" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Nhân viên phụ trách</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên phụ trách" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">-- Không gán --</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.employeeCode} - {user.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Nhập ghi chú nếu có"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>
                        Chọn loại khách hàng
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {types.map((type) => (
                            <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={type.value} />
                              </FormControl>
                              <FormLabel className="font-normal">{type.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>Trạng thái</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {customerStatuses.map((status) => (
                            <FormItem key={status.value} className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={status.value} />
                              </FormControl>
                              <FormLabel className="font-normal">{status.label}</FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="update-customer" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateCustomerDialog
