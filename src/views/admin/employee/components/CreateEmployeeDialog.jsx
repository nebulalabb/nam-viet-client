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
import { createUserSchema } from '../schema/index'
import { createUser } from '@/stores/UserSlice'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { employeeStatuses } from '../data/index'
import { useState, useEffect } from 'react'
import api from '@/utils/axios'

const CreateEmployeeDialog = ({
    open,
    onOpenChange,
    showTrigger = true,
    ...props
}) => {
    const form = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            employeeCode: '',
            fullName: '',
            email: '',
            phone: '',
            password: '',
            roleId: '',
            status: 'active',
        },
    })

    const [grantAccount, setGrantAccount] = useState(false)
    const [roles, setRoles] = useState([])
    const loading = useSelector((state) => state.user.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get('/roles')
                if (response.data && response.data.data) {
                    setRoles(response.data.data)
                }
            } catch (error) {
                console.log('Error fetching roles:', error)
            }
        }
        fetchRoles()
    }, [])

    const onSubmit = async (data) => {
        try {
            if (grantAccount && (!data.email || !data.password)) {
                if (!data.email) form.setError('email', { type: 'manual', message: 'Vui lòng nhập Email' });
                if (!data.password) form.setError('password', { type: 'manual', message: 'Vui lòng nhập Mật khẩu' });
                return;
            }

            const payload = {
                ...data,
                roleId: data.roleId ? parseInt(data.roleId, 10) : undefined,
                phone: data.phone || undefined,
                email: grantAccount ? data.email : undefined,
                password: grantAccount ? data.password : undefined,
            }

            await dispatch(createUser(payload)).unwrap()
            form.reset()
            setGrantAccount(false)
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

            <DialogContent className="md:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Thêm nhân viên mới</DialogTitle>
                    <DialogDescription>
                        Điền vào chi tiết phía dưới để tạo tài khoản nhân viên
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id="create-user" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="employeeCode"
                                render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                        <FormLabel required={true}>Mã nhân viên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập mã nhân viên" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                        <FormLabel required={true}>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên nhân viên" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="col-span-1 md:col-span-2 my-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="grantEmployeeAccount"
                                        className="h-4 w-4 rounded border-gray-300"
                                        checked={grantAccount}
                                        onChange={(e) => setGrantAccount(e.target.checked)}
                                    />
                                    <label htmlFor="grantEmployeeAccount" className="text-sm font-medium">
                                        Cấp tài khoản đăng nhập (Email & Mật khẩu)
                                    </label>
                                </div>
                            </div>

                            {grantAccount && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập địa chỉ email" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Mật khẩu</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Mật khẩu" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="roleId"
                                render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                        <FormLabel required={true}>Chức vụ (Vai trò)</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn vai trò" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {roles.map(role => (
                                                    <SelectItem key={role.id} value={String(role.id)}>
                                                        {role.roleName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="col-span-1 border-t pt-4 mt-2">
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
                                                    className="flex flex-row gap-4"
                                                >
                                                    {employeeStatuses.map((status) => (
                                                        <FormItem key={status.value} className="flex items-center space-x-2 space-y-0">
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

                        </div>

                    </form>
                </Form>

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

                    <Button form="create-user" loading={loading}>
                        Thêm mới
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateEmployeeDialog
