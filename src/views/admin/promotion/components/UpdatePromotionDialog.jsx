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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { updatePromotionSchema } from '../schema'
import { updatePromotion } from '@/stores/PromotionSlice'
import { applicableToOptions, promotionTypes } from '../data'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import api from '@/utils/axios'

const UpdatePromotionDialog = ({ promotion, open, onOpenChange }) => {
    const form = useForm({
        resolver: zodResolver(updatePromotionSchema),
        defaultValues: {
            promotionName: promotion?.promotionName || '',
            promotionType: promotion?.promotionType || 'buy_x_get_y',
            applicableTo: promotion?.applicableTo || 'all',
            minOrderValue: promotion?.minOrderValue || 0,
            minQuantity: promotion?.minQuantity || 0,
            quantityLimit: promotion?.quantityLimit || 0,
            startDate: promotion?.startDate ? format(new Date(promotion.startDate), 'yyyy-MM-dd') : null,
            endDate: promotion?.endDate ? format(new Date(promotion.endDate), 'yyyy-MM-dd') : null,
            productId: promotion?.products?.[0]?.productId || undefined,
            giftProductId: promotion?.products?.[0]?.giftProductId || promotion?.conditions?.gift_product_id || undefined,
            buyQuantity: promotion?.conditions?.buy_quantity || undefined,
            getQuantity: promotion?.products?.[0]?.giftQuantity || promotion?.conditions?.get_quantity || undefined,
            customerId: promotion?.conditions?.customer_id || undefined,
        },
    })

    const watchPromotionType = form.watch('promotionType')
    const watchApplicableTo = form.watch('applicableTo')

    const [openStartDatePicker, setOpenStartDatePicker] = useState(false)
    const [openEndDatePicker, setOpenEndDatePicker] = useState(false)
    const [productsList, setProductsList] = useState([])
    const [customersList, setCustomersList] = useState([])

    useEffect(() => {
        if (watchPromotionType === 'buy_x_get_y') {
            if (['customer_group', 'specific_customer'].includes(watchApplicableTo)) {
                form.setValue('applicableTo', 'all')
            }
        } else if (watchPromotionType === 'gift') {
            if (['all', 'category', 'product_group', 'specific_product'].includes(watchApplicableTo)) {
                form.setValue('applicableTo', 'customer_group')
            }
        }
    }, [watchPromotionType, watchApplicableTo, form])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resProducts, resCustomers] = await Promise.all([
                    api.get('/products?limit=1000'),
                    api.get('/customers?limit=1000')
                ])
                if (resProducts.data?.data) {
                    setProductsList(resProducts.data.data)
                } else if (resProducts.data) {
                    setProductsList(resProducts.data)
                }

                if (resCustomers.data?.data) {
                    setCustomersList(resCustomers.data.data)
                } else if (resCustomers.data) {
                    setCustomersList(resCustomers.data)
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (open) fetchData()
    }, [open])

    // Set default values when promotion changes
    useEffect(() => {
        if (promotion) {
            form.reset({
                promotionName: promotion.promotionName || '',
                promotionType: promotion.promotionType || 'buy_x_get_y',
                applicableTo: promotion.applicableTo || 'all',
                minOrderValue: promotion.minOrderValue ? Number(promotion.minOrderValue) : 0,
                minQuantity: promotion.minQuantity ? Number(promotion.minQuantity) : 0,
                quantityLimit: promotion.quantityLimit ? Number(promotion.quantityLimit) : 0,
                startDate: promotion.startDate ? format(new Date(promotion.startDate), 'yyyy-MM-dd') : null,
                endDate: promotion.endDate ? format(new Date(promotion.endDate), 'yyyy-MM-dd') : null,
                productId: promotion?.products?.[0]?.productId || undefined,
                giftProductId: promotion?.products?.[0]?.giftProductId || promotion?.conditions?.gift_product_id || undefined,
                buyQuantity: promotion?.conditions?.buy_quantity || undefined,
                getQuantity: promotion?.products?.[0]?.giftQuantity || promotion?.conditions?.get_quantity || undefined,
                customerId: promotion?.conditions?.customer_id || undefined,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [promotion])


    const loading = useSelector((state) => state.promotion.loading)
    const dispatch = useDispatch()

    const onSubmit = async (data) => {
        try {
            if (!data.startDate || !data.endDate) {
                toast.error('Vui lòng chọn ngày bắt đầu và kết thúc')
                return
            }
            console.log('[SUBMIT] giftProductId:', data.giftProductId, 'getQuantity:', data.getQuantity, 'all data:', data)

            const payload = {
                promotionName: data.promotionName,
                promotionType: data.promotionType,
                applicableTo: data.applicableTo,
                minOrderValue: Number(data.minOrderValue) || 0,
                minQuantity: Number(data.minQuantity) || 0,
                quantityLimit: Number(data.quantityLimit) || 0,
                startDate: data.startDate,
                endDate: data.endDate,
                isRecurring: data.isRecurring,
            }

            // Build products array
            if (data.applicableTo === 'specific_product' && data.productId) {
                payload.products = [{
                    productId: Number(data.productId),
                    giftProductId: data.giftProductId ? Number(data.giftProductId) : undefined,
                    giftQuantity: data.promotionType === 'buy_x_get_y' ? Number(data.getQuantity) : undefined
                }]
            } else if (data.applicableTo === 'all' && data.promotionType === 'buy_x_get_y') {
                payload.products = [{
                    productId: 0,
                    giftProductId: data.giftProductId ? Number(data.giftProductId) : undefined,
                    giftQuantity: Number(data.getQuantity) || 0
                }]
            } else {
                payload.products = []
            }

            // Build conditions
            if (data.promotionType === 'gift') {
                payload.conditions = {
                    gift_product_id: Number(data.giftProductId),
                    get_quantity: Number(data.getQuantity),
                }
                if (data.applicableTo === 'specific_customer' && data.customerId) {
                    payload.conditions.customer_id = Number(data.customerId)
                }
            } else if (data.promotionType === 'buy_x_get_y') {
                payload.conditions = {
                    buy_quantity: Number(data.buyQuantity),
                    get_quantity: Number(data.getQuantity),
                }
            }

            await dispatch(updatePromotion({ id: promotion.id, data: payload })).unwrap()
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:h-auto md:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Cập nhật khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Cập nhật chi tiết chương trình khuyến mãi: <strong>{promotion?.promotionCode}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] p-1">
                    <Form {...form}>
                        <form id="update-promotion" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="promotionName"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel required={true}>Tên chương trình</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ví dụ: Giảm giá hè 2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="promotionType"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel required={true}>Loại khuyến mãi</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                                disabled // Normally promotionType isn't changed later, but allow if backend permits
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn loại khuyến mãi" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {promotionTypes.map((type) => (
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

                                <FormField
                                    control={form.control}
                                    name="applicableTo"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel required={true}>Đối tượng áp dụng</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn đối tượng ưu đãi" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {applicableToOptions.filter((type) => {
                                                        if (watchPromotionType === 'buy_x_get_y') {
                                                            return ['all', 'category', 'product_group', 'specific_product'].includes(type.value)
                                                        }
                                                        if (watchPromotionType === 'gift') {
                                                            return ['customer_group', 'specific_customer'].includes(type.value)
                                                        }
                                                        return true
                                                    }).map((type) => (
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

                                {watchApplicableTo === 'specific_customer' && (
                                    <FormField
                                        control={form.control}
                                        name="customerId"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Khách hàng</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? String(field.value) : undefined}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn khách hàng" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {customersList.map((customer) => (
                                                            <SelectItem key={customer.id} value={String(customer.id)}>
                                                                {customer.customerName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {watchApplicableTo === 'specific_product' && (
                                    <FormField
                                        control={form.control}
                                        name="productId"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Sản phẩm chính</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? String(field.value) : undefined}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn sản phẩm" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {productsList.map((product) => (
                                                            <SelectItem key={product.id} value={String(product.id)}>
                                                                {product.productName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {watchPromotionType === 'buy_x_get_y' && (
                                    <FormField
                                        control={form.control}
                                        name="buyQuantity"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Mua số lượng (X)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Mua X sản phẩm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {(watchPromotionType === 'buy_x_get_y' || watchPromotionType === 'gift') && (
                                    <FormField
                                        control={form.control}
                                        name="getQuantity"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Tặng số lượng (Y)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="Được Tặng Y sản phẩm" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {(watchPromotionType === 'buy_x_get_y' || watchPromotionType === 'gift' || watchApplicableTo === 'specific_product') && (
                                    <FormField
                                        control={form.control}
                                        name="giftProductId"
                                        render={({ field }) => (
                                            <FormItem className="mb-2 space-y-1">
                                                <FormLabel required={true}>Sản phẩm tặng (Gift)</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? String(field.value) : undefined}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn sản phẩm tặng" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {productsList.map((product) => (
                                                            <SelectItem key={product.id} value={String(product.id)}>
                                                                {product.productName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                <FormField
                                    control={form.control}
                                    name="minOrderValue"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel>Giá trị đơn tối thiểu (VND)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Nhập giá trị đơn" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="quantityLimit"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel>Giới hạn số lượng dùng</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="Tổng mã được dùng" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel required={true}>Thời gian bắt đầu</FormLabel>
                                            <Popover open={openStartDatePicker} onOpenChange={setOpenStartDatePicker}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), 'dd/MM/yyyy', {
                                                                    locale: vi,
                                                                })
                                                            ) : (
                                                                <span>Chọn thời điểm bắt đầu</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <DatePicker
                                                        mode="single"
                                                        captionLayout="dropdown-buttons"
                                                        fromYear={2020}
                                                        toYear={2030}
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            field.onChange(date ? format(date, 'yyyy-MM-dd') : null)
                                                            setOpenStartDatePicker(false)
                                                        }}
                                                        initialFocus
                                                        locale={vi}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="mb-2 space-y-1">
                                            <FormLabel required={true}>Thời gian kết thúc</FormLabel>
                                            <Popover open={openEndDatePicker} onOpenChange={setOpenEndDatePicker}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(new Date(field.value), 'dd/MM/yyyy', {
                                                                    locale: vi,
                                                                })
                                                            ) : (
                                                                <span>Chọn thời điểm kết thúc</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <DatePicker
                                                        mode="single"
                                                        captionLayout="dropdown-buttons"
                                                        fromYear={2020}
                                                        toYear={2030}
                                                        selected={field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            field.onChange(date ? format(date, 'yyyy-MM-dd') : null)
                                                            setOpenEndDatePicker(false)
                                                        }}
                                                        initialFocus
                                                        locale={vi}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="flex gap-2 sm:space-x-0 p-6 pt-2 border-t mt-4">
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

                    <Button form="update-promotion" loading={loading}>
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdatePromotionDialog
