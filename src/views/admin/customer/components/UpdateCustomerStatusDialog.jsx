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
import { Edit } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { customerStatuses } from '../data'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateCustomerStatus } from '@/stores/CustomerSlice'
import { updateCustomerStatusSchema } from '../schema'

const UpdateCustomerStatusDialog = ({
  customer,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.customer.loading)

  const form = useForm({
    resolver: zodResolver(updateCustomerStatusSchema),
    defaultValues: {
      status: customer?.status || 'active',
    },
  })

  const onSubmit = async (data) => {
    try {
      await dispatch(
        updateCustomerStatus({ id: customer.id, status: data.status }),
      ).unwrap()
      if (props.onOpenChange) {
        props.onOpenChange(false)
      }
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Edit className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái khách hàng</DialogTitle>
          <DialogDescription>{customer?.customerName}</DialogDescription>
        </DialogHeader>

        <div className="mb-3 space-y-2">
          <Form {...form}>
            <form
              id="update-customer-status"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required={true}>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customerStatuses.map((status) => (
                          <SelectItem value={status.value} key={status.value}>
                            <div
                              className={`flex items-center font-medium ${status.value === 'active'
                                  ? 'text-green-600'
                                  : status.value === 'inactive'
                                    ? 'text-gray-600'
                                    : 'text-red-600'
                                }`}
                            >
                              {status.icon && (
                                <div className="mr-2 h-4 w-4">
                                  <status.icon className="h-4 w-4" />
                                </div>
                              )}
                              <div>{status.label}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button
            form="update-customer-status"
            loading={loading}
          >
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateCustomerStatusDialog
