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
import { updateUnit } from '@/stores/UnitSlice'
import { updateUnitSchema } from '../schema'

const UpdateUnitDialog = ({
  unit,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.unit.loading)

  const form = useForm({
    resolver: zodResolver(updateUnitSchema),
    defaultValues: {
      unitName: unit.unitName || '',
      unitCode: unit.unitCode || '',
    },
  })

  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(updateUnit({ id: unit.id, data })).unwrap()
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

      <DialogContent className="md:h-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật đơn vị tính mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật đơn vị tính mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-unit" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-1">
                <FormField
                  control={form.control}
                  name="unitCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>
                        Mã đơn vị tính <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: THOI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unitName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>
                        Tên đơn vị tính <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="VD: Thỏi" {...field} />
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

          <Button form="update-unit" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateUnitDialog
