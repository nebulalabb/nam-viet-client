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
import { updateOtherExpensesSchema } from '../schema'
import { Textarea } from '@/components/ui/textarea'

const UpdateOtherExpenses = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const form = useForm({
    resolver: zodResolver(updateOtherExpensesSchema),
    defaultValues: {
      price: '',
      description: '',
    },
  })

  const onSubmit = (data) => {
    console.log(data)
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

      <DialogContent className="md:h-auto">
        <DialogHeader>
          <DialogTitle>Thêm đơn chi phí</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm chi phí mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form
              id="create-other-expenses"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Giá tiền</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập giá tiền" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Nhập mô tả nếu có"
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

          <Button form="create-other-expenses">Thêm mới</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateOtherExpenses
