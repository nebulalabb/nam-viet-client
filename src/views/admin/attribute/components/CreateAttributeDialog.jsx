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
import { createAttributeSchema } from '../schema'
import { createAttribute } from '@/stores/AttributeSlice'

// ✅ import options cho select
import { dataTypes, units } from '../data'

// ✅ import Select của shadcn
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CreateAttributeDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.attribute.loading)

  const form = useForm({
    resolver: zodResolver(createAttributeSchema),
    defaultValues: {
      name: '',
      code: '',
      dataType: '',
      unit: '',
    },
  })

  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(createAttribute(data)).unwrap()
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
          <DialogTitle>Thêm thuộc tính mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm thuộc tính mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-unit" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-1">
                {/* Tên thuộc tính */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên thuộc tính</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên thuộc tính (VD: Màu sắc, Trọng lượng...)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mã thuộc tính */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã thuộc tính</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập mã thuộc tính (VD: COLOR, WEIGHT...)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Kiểu dữ liệu */}
                <FormField
                  control={form.control}
                  name="dataType"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Kiểu dữ liệu</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kiểu dữ liệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {dataTypes.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Đơn vị */}
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Đơn vị</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn đơn vị" />
                          </SelectTrigger>
                          <SelectContent>
                            {units.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

          <Button form="create-unit" loading={loading}>
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAttributeDialog
