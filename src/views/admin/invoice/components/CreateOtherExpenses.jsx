import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createOtherExpensesSchema } from '../schema'
import { moneyFormat } from '@/utils/money-format.jsx'

const CreateOtherExpenses = ({
  open,
  onOpenChange,
  showTrigger = true,
  setOtherExpenses,
  otherExpenses,
  ...props
}) => {
  const form = useForm({
    resolver: zodResolver(createOtherExpensesSchema),
    defaultValues: {
      price: otherExpenses.price,
      description: otherExpenses.description,
    },
  })

  const onSubmit = (data) => {
    setOtherExpenses(data)
    onOpenChange?.(false)
  }

  const formatPrice = (value) => {
    if (!value) return 0
    return moneyFormat(value)
  }

  const handlePriceChange = (value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    form.setValue('price', numericValue)
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
          <DialogTitle>Cập nhật phí vận chuyển</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật phí vận chuyển
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
                        <Input
                          placeholder="Nhập giá tiền"
                          {...field}
                          value={formatPrice(form.watch('price'))}
                          onChange={(e) => handlePriceChange(e.target.value)}
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

          <Button form="create-other-expenses">Cập nhật</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateOtherExpenses
