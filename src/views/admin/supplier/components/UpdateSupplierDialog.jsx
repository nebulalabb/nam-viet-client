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
import { updateSupplierSchema } from '../schema'
import { updateSupplier } from '@/stores/SupplierSlice'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { supplierTypes, supplierStatuses } from '../components/data'
import { toast } from 'sonner'

const UpdateSupplierDialog = ({
    open,
    onOpenChange,
    supplier,
    ...props
}) => {
    const form = useForm({
        resolver: zodResolver(updateSupplierSchema),
        defaultValues: {
            supplierName: supplier?.supplierName || '',
            supplierType: supplier?.supplierType || 'local',
            contactName: supplier?.contactName || '',
            phone: supplier?.phone || '',
            email: supplier?.email || '',
            address: supplier?.address || '',
            taxCode: supplier?.taxCode || '',
            paymentTerms: supplier?.paymentTerms || '',
            notes: supplier?.notes || '',
            status: supplier?.status || 'active',
        },
    })

    const loading = useSelector((state) => state.supplier.loading)
    const dispatch = useDispatch()

    const onSubmit = async (data) => {
        try {
            await dispatch(updateSupplier({ id: supplier.id, data })).unwrap()
            form.reset()
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Có lỗi xảy ra khi cập nhật'
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className="md:h-auto md:max-w-4xl border-green-200">
                <DialogHeader>
                    <DialogTitle>Cập nhật nhà cung cấp</DialogTitle>
                    <DialogDescription>
                        Điền vào chi tiết phía dưới để cập nhật nhà cung cấp <strong>{supplier?.supplierCode}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] px-1">
                    <Form {...form}>
                        <form id="update-supplier" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Cột 1: Thông tin cơ bản */}
                                <div className="space-y-4 border p-4 rounded-lg bg-green-50/30 border-green-100">
                                    <h3 className="font-semibold text-green-800 border-b border-green-200 pb-2">Thông tin chung</h3>

                                    {/* Mã NCC là read-only khi update */}
                                    <FormItem className="space-y-1">
                                        <FormLabel>Mã nhà cung cấp</FormLabel>
                                        <FormControl>
                                            <Input value={supplier?.supplierCode || ''} disabled className="bg-gray-100 text-gray-500" />
                                        </FormControl>
                                    </FormItem>

                                    <FormField
                                        control={form.control}
                                        name="supplierName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel required={true}>Tên nhà cung cấp</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập tên nhà cung cấp" className="focus-visible:ring-green-500" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="supplierType"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 pt-2">
                                                    <FormLabel required={true}>Phân loại</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            {supplierTypes.map((type) => (
                                                                <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={type.value} className="text-green-600 focus:text-green-600" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-normal">{type.label}</FormLabel>
                                                                </FormItem>
                                                            ))}
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem className="space-y-2 pt-2">
                                                    <FormLabel required={true}>Trạng thái</FormLabel>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            {supplierStatuses.map((status) => (
                                                                <FormItem key={status.value} className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={status.value} className="text-green-600 focus:text-green-600" />
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

                                {/* Cột 2: Thông tin liên hệ */}
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50 border-gray-100">
                                    <h3 className="font-semibold text-gray-700 border-b pb-2">Liên hệ & Địa chỉ</h3>

                                    <FormField
                                        control={form.control}
                                        name="contactName"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel>Người liên hệ đại diện</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Tên người đại diện..." className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel>Số điện thoại</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Vd: 09..." className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="abc@email.com" className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
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
                                            <FormItem className="space-y-1">
                                                <FormLabel>Địa chỉ đầy đủ</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={2}
                                                        placeholder="Số nhà, đường, phường, quận..."
                                                        className="focus-visible:ring-green-500"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Full width: Thanh toán & Khác */}
                            <div className="space-y-4 border p-4 rounded-lg bg-white border-gray-200">
                                <h3 className="font-semibold text-gray-700 border-b pb-2">Thanh toán & Ghi chú</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="taxCode"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel>Mã số thuế</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Nhập MST..." className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="paymentTerms"
                                        render={({ field }) => (
                                            <FormItem className="space-y-1">
                                                <FormLabel>Điều khoản thanh toán</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Vd: Công nợ 30 ngày..." className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Ghi chú thêm</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    rows={2}
                                                    placeholder="Những lưu ý khi giao dịch với NNC này..."
                                                    className="focus-visible:ring-green-500"
                                                    {...field}
                                                    value={field.value || ''}
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

                <DialogFooter className="flex gap-2 sm:space-x-0 pt-4">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            Hủy
                        </Button>
                    </DialogClose>

                    <Button form="update-supplier" loading={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateSupplierDialog
