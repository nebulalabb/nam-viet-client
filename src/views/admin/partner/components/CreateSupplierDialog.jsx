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
import { cn } from '@/lib/utils'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createSupplierSchema } from '../schema'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { statuses } from '../data'
import { Textarea } from '@/components/ui/textarea'
import { createSupplier } from '@/stores/SupplierSlice'

const CreateSupplierDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const loading = useSelector((state) => state.supplier.loading)

  const form = useForm({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      supplierCode: '',
      supplierName: '',
      taxCode: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      status: 'active',
    },
  })

  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(createSupplier(data)).unwrap()
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

      <DialogContent
        className={cn("md:h-auto md:max-w-2xl", contentClassName)}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>Thêm nhà cung cấp mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm nhà cung cấp mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-supplier" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="supplierCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã nhà cung cấp</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã nhà cung cấp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên nhà cung cấp</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên nhà cung cấp" {...field} />
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
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập số điện thoại"
                          {...field}
                        />
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
                        <Input
                          type="text"
                          placeholder="Nhập mã số thuế"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Người đại diện (liên hệ)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên người liên hệ"
                          {...field}
                        />
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
                        <Input
                          type="email"
                          placeholder="Nhập địa chỉ email"
                          {...field}
                        />
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
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập địa chỉ"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-3 mb-2">
                      <FormLabel required={true}>
                        Trạng thái
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          {statuses.map((status, index) => (
                            <FormItem
                              key={index}
                              className="flex items-center space-x-2 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={status.value} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {status.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
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
                          type="text"
                          placeholder="Nhập ghi chú nếu có"
                          {...field}
                        />
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

          <Button form="create-supplier" loading={loading}>
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSupplierDialog
