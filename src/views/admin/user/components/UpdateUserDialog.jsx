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
import { PasswordInput } from '@/components/custom/PasswordInput'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { getRoles } from '@/stores/RoleSlice'
import { updateUser } from '@/stores/UserSlice'
import { updateUserFormSchema } from '../schema'

const genders = [
  { label: 'Nam', value: 'male' },
  { label: 'Nữ', value: 'female' },
  { label: 'Khác', value: 'other' },
]

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
      fullName: user.fullName || '',
      employeeCode: user.employeeCode || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      cccd: user.cccd || '',
      issuedAt: user.issuedAt ? user.issuedAt.split('T')[0] : '',
      issuedBy: user.issuedBy || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      roleId: user.roleId,
      warehouseId: user.warehouseId || undefined,
      status: user.status || 'active',
    },
  })

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getRoles())
  }, [dispatch])

  const onSubmit = async (data) => {
    try {
      // Loại bỏ password rỗng và các field rỗng không cần thiết
      const payload = {
        ...data,
        password: data.password || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        cccd: data.cccd || undefined,
        issuedAt: data.issuedAt || undefined,
        issuedBy: data.issuedBy || undefined,
        gender: data.gender || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
      }
      await dispatch(updateUser({ id: user.id, data: payload })).unwrap()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cập nhật: {user.fullName}</DialogTitle>
          <DialogDescription>
            Chỉnh sửa thông tin nhân viên
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-user" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Họ và tên */}
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

                {/* Mã nhân viên */}
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

                {/* Email */}
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

                {/* Mật khẩu mới (tùy chọn) */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mật khẩu mới</FormLabel>
                      <FormControl>
                        <PasswordInput
                          autoComplete="new-password"
                          placeholder="Để trống nếu không đổi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Số điện thoại */}
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

                {/* Địa chỉ */}
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

                {/* CCCD */}
                <FormField
                  control={form.control}
                  name="cccd"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>CCCD</FormLabel>
                      <FormControl>
                        <Input placeholder="Số CCCD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ngày cấp CCCD */}
                <FormField
                  control={form.control}
                  name="issuedAt"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Ngày cấp CCCD</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nơi cấp CCCD */}
                <FormField
                  control={form.control}
                  name="issuedBy"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Nơi cấp CCCD</FormLabel>
                      <FormControl>
                        <Input placeholder="Nơi cấp CCCD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Ngày sinh */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Ngày sinh</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Giới tính */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Giới tính</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn giới tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {genders.map((g) => (
                              <SelectItem key={g.value} value={g.value}>
                                {g.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Vai trò */}
                <FormField
                  control={form.control}
                  name="roleId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Vai trò</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(parseInt(val))}
                        defaultValue={field.value?.toString()}
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
                                {role.roleName}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Trạng thái */}
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
