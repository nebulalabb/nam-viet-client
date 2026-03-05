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
import { updateTaxSchema } from '../schema'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { statuses } from '../data'
import { updateTax } from '@/stores/TaxSlice'

const UpdateTaxDialog = ({
  tax,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.tax.loading)

  const form = useForm({
    resolver: zodResolver(updateTaxSchema),
    defaultValues: {
      title: tax.title,
      percentage: tax.percentage,
      status: tax.status,
    },
  })

  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(updateTax({ id: tax.id, data })).unwrap()
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
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Cập nhật thuế: {tax.title} ({tax.percentage}%)
          </DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật thuế
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-tax" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên loại thuế</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên loại thuê" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentage"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>
                        Phần trăm <strong>(%)</strong>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Nhập phần trăm"
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
                    <FormItem className="space-y-3">
                      <FormLabel required={true}>
                        Chọn trạng thái thuế
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          {statuses.map((status, index) => (
                            <FormItem
                              key={index}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={status.value} />
                              </FormControl>
                              <FormLabel className="font-normal">
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

          <Button form="update-tax" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateTaxDialog
