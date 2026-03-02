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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { statuses } from '../data'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { getRoles } from '@/stores/RoleSlice'
import { updateUser } from '@/stores/UserSlice'
import { updateUserFormSchema } from '../schema'

const UpdateUserDialog = ({
  user,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.user.loading)
  const roles = useSelector((state) => state.role.roles)

  const form = useForm({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      fullName: user.fullName,
      employeeCode: user.employeeCode,
      username: user.username || user.email,
      phone: user.phone,
      roleId: user.roleId?.toString(),
      bankCode: user.bankCode || '',
      bankName: user.bankName || '',
      address: user.address || '',
      email: user.email || '',
      status: user.status?.toString(),
    },
  })

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getRoles())
  }, [dispatch])

  const onSubmit = async (data) => {
    try {
      await dispatch(updateUser({ id: user.id, data })).unwrap()
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
          {/* Custom Trigger if needed, otherwise empty to prevent ghost button */}
          <span />
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cập nhật: {user.fullName}</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm người dùng mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-user" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Họ và tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập họ và tên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mã nhân viên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã nhân viên" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên tài khoản</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên tài khoản" {...field} />
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
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Tên ngân hàng</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên ngân hàng" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Số tài khoản</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số tài khoản" {...field} />
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
                        <Input placeholder="Nhập địa chỉ" {...field} />
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
                      <FormLabel>Email</FormLabel>
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
                  name="roleId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Vai trò</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles &&
                            roles.map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="positionId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Chức vụ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn chức vụ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {positions &&
                              positions.map((position) => (
                                <SelectItem
                                  key={position.id}
                                  value={position.id.toString()}
                                >
                                  {position.name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
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
                          <SelectGroup>
                            {statuses.map((status) => (
                              <SelectItem
                                key={status.label}
                                value={status.value}
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
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

          <Button form="update-user" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateUserDialog
