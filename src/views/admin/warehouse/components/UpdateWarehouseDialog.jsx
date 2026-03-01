import { useEffect } from 'react'
import { Button } from '@/components/custom/Button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
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
import { updateWarehouseSchema } from '../schema'
import { updateWarehouse, getWarehouses } from '@/stores/WarehouseSlice'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { warehouseStatuses, warehouseTypes } from '../data'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const UpdateWarehouseDialog = ({
    warehouse,
    open,
    onOpenChange,
    ...props
}) => {
    const form = useForm({
        resolver: zodResolver(updateWarehouseSchema),
        defaultValues: {
            warehouseCode: warehouse?.warehouseCode || '',
            warehouseName: warehouse?.warehouseName || '',
            warehouseType: warehouse?.warehouseType || 'goods',
            address: warehouse?.address || '',
            city: warehouse?.city || '',
            region: warehouse?.region || '',
            description: warehouse?.description || '',
            capacity: warehouse?.capacity || null,
            status: warehouse?.status || 'active',
        },
    })

    const loading = useSelector((state) => state.warehouse.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        if (warehouse && open) {
            form.reset({
                warehouseCode: warehouse.warehouseCode || '',
                warehouseName: warehouse.warehouseName || '',
                warehouseType: warehouse.warehouseType || 'goods',
                address: warehouse.address || '',
                city: warehouse.city || '',
                region: warehouse.region || '',
                description: warehouse.description || '',
                capacity: warehouse.capacity || null,
                status: warehouse.status || 'active',
            })
        }
    }, [warehouse, open, form])

    const onSubmit = async (data) => {
        try {
            await dispatch(updateWarehouse({ id: warehouse.id, data })).unwrap()
            toast.success('Cập nhật kho hàng thành công')
            dispatch(getWarehouses({ page: 1, limit: 10 }))
            onOpenChange?.(false)
        } catch (error) {
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật kho')
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className="md:max-w-xl z-[600]" overlayClassName="z-[550]">
                <DialogHeader>
                    <DialogTitle>Cập nhật kho hàng</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin chi tiết cho kho {warehouse?.warehouseCode}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] px-1">
                    <Form {...form}>
                        <form id="update-warehouse" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="warehouseCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Mã kho</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: KHO-CHINH" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="warehouseName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Tên kho</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Kho trung tâm" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="warehouseType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Loại kho</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn loại kho" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {warehouseTypes.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thành phố/Tỉnh</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên tỉnh/thành" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Khu vực</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập khu vực" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ chi tiết</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập địa chỉ" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sức chứa (tùy chọn)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="VD: 1000"
                                                {...field}
                                                onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Nhập mô tả"
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
                                        <FormLabel required={true}>Trạng thái</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {warehouseStatuses.map((status) => (
                                                    <FormItem key={status.value} className="flex items-center space-x-3 space-y-0">
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

                    <Button form="update-warehouse" loading={loading}>
                        Lưu thay đổi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateWarehouseDialog
