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

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { updateUserSchema } from '../schema/index'
import { updateUser } from '@/stores/UserSlice'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { employeeStatuses } from '../data/index'
import { useState, useEffect } from 'react'
import api from '@/utils/axios'

const UpdateEmployeeDialog = ({
    open,
    onOpenChange,
    user,
    showTrigger = true,
    ...props
}) => {
    const form = useForm({
        resolver: zodResolver(updateUserSchema),
        defaultValues: {
            employeeCode: user?.employeeCode || '',
            fullName: user?.fullName || '',
            email: user?.email || '',
            phone: user?.phone || '',
            password: '',
            roleId: user?.roleId ? String(user.roleId) : '',
            status: user?.status || 'active',
        },
    })

    const [provideAccount, setProvideAccount] = useState(!!user?.email)
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
            if (provideAccount) {
                if (!data.email || data.email.trim() === '') {
                    form.setError('email', { type: 'manual', message: 'Vui lòng nhập email khi cấp tài khoản' })
                    return
                }
            }

            const payloadData = { ...data }
            if (!provideAccount) {
                payloadData.email = null;
                delete payloadData.password; // backend logic handles password removal if email is null
            } else {
                payloadData.email = data.email || undefined;
                if (!payloadData.password) {
                    delete payloadData.password
                }
            }
            
            payloadData.roleId = Number(payloadData.roleId)
            
            // Lọc các giá trị rỗng để không bị validator từ API chối
            Object.keys(payloadData).forEach(key => {
                if (payloadData[key] === '') {
                    payloadData[key] = null; // Hoặc có thể delete payloadData[key]
                }
            });
            if (!payloadData.phone) delete payloadData.phone;
            
            await dispatch(updateUser({ id: user.id, data: payloadData })).unwrap()
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
                        Cập nhật
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="md:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật nhân viên</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin chi tiết của nhân viên {user?.fullName}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form id={`update-user-${user?.id}`} onSubmit={form.handleSubmit(onSubmit)}>
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

                    <Button form={`update-user-${user?.id}`} loading={loading}>
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateEmployeeDialog
