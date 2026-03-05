import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateProduct } from '@/stores/ProductSlice'
import { productTypes } from '../data'

const formSchema = z.object({
    sku: z.string().optional(),
    productName: z.string().min(1, 'Tên sản phẩm là bắt buộc').max(200),
    productType: z.string().min(1, 'Loại sản phẩm là bắt buộc'),
    packagingType: z.string().optional(),
    categoryId: z.coerce.number().int().positive().nullable().optional(),
    supplierId: z.coerce.number().int().positive().nullable().optional(),
    unitId: z.coerce.number().int().positive().nullable().optional(),
    barcode: z.string().optional().nullable(),
    weight: z.coerce.number().min(0).optional().nullable(),
    dimensions: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    purchasePrice: z.coerce.number().min(0).optional().nullable(),
    sellingPriceRetail: z.coerce.number().min(0).optional().nullable(),
    sellingPriceWholesale: z.coerce.number().min(0).optional().nullable(),
    sellingPriceVip: z.coerce.number().min(0).optional().nullable(),
    taxRate: z.coerce.number().min(0).max(100).optional(),
    minStockLevel: z.coerce.number().min(0).optional(),
    status: z.string().optional(),
})

export default function UpdateProductDialog({ open, onOpenChange, product }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.product)
    const categories = useSelector((state) => state.category.categories || [])
    const suppliers = useSelector((state) => state.supplier.suppliers || [])
    const units = useSelector((state) => state.unit.units || [])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sku: '',
            productName: '',
            productType: '',
            packagingType: 'other',
            unitId: null,
            categoryId: null,
            supplierId: null,
            barcode: '',
            weight: 0,
            dimensions: '',
            description: '',
            purchasePrice: 0,
            sellingPriceRetail: 0,
            sellingPriceWholesale: 0,
            sellingPriceVip: 0,
            taxRate: 0,
            minStockLevel: 0,
            status: 'active',
        },
    })

    useEffect(() => {
        if (product && open) {
            form.reset({
                sku: product.sku || '',
                productName: product.productName || '',
                productType: product.productType || '',
                packagingType: product.packagingType || 'other',
                // ✅ unitId từ FK relation
                unitId: product.unitId || product.unit?.id || null,
                categoryId: product.categoryId || null,
                supplierId: product.supplierId || null,
                barcode: product.barcode || '',
                weight: product.weight || 0,
                dimensions: product.dimensions || '',
                description: product.description || '',
                purchasePrice: product.purchasePrice || 0,
                sellingPriceRetail: product.sellingPriceRetail || 0,
                sellingPriceWholesale: product.sellingPriceWholesale || 0,
                sellingPriceVip: product.sellingPriceVip || 0,
                taxRate: product.taxRate || 0,
                minStockLevel: product.minStockLevel || 0,
                status: product.status || 'active',
            })
        }
    }, [product, open, form])

    const onSubmit = async (values) => {
        const payload = {
            ...values,
            categoryId: values.categoryId || null,
            supplierId: values.supplierId || null,
            unitId: values.unitId || null,
        }
        try {
            await dispatch(updateProduct({ id: product.id, data: payload })).unwrap()
            onOpenChange(false)
        } catch (error) {
            // handled
        }
    }

    const productTypeValue = form.watch('productType')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cập Nhật Sản Phẩm</DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin sản phẩm.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cột 1 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold bg-muted px-2 py-1 rounded text-sm">
                                    Thông tin cơ bản
                                </h3>

                                <FormField control={form.control} name="productName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tên Sản Phẩm *</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="sku" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mã SKU</FormLabel>
                                        <FormControl><Input disabled {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="productType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Loại Sản Phẩm *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {productTypes.map((t) => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    {productTypeValue === 'packaging' && (
                                        <FormField control={form.control} name="packagingType" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Loại Bao Bì</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="bottle">Chai/Lọ</SelectItem>
                                                        <SelectItem value="box">Hộp/Thùng</SelectItem>
                                                        <SelectItem value="bag">Túi/Bao</SelectItem>
                                                        <SelectItem value="label">Nhãn mác</SelectItem>
                                                        <SelectItem value="other">Khác</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                </div>

                                {/* ✅ Đơn vị tính FK */}
                                <FormField control={form.control} name="unitId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Đơn Vị Tính</FormLabel>
                                        <Select
                                            onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                                            value={field.value ? String(field.value) : 'none'}
                                        >
                                            <FormControl><SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">— Không có —</SelectItem>
                                                {units.map((u) => (
                                                    <SelectItem key={u.id} value={String(u.id)}>
                                                        {u.unitName} ({u.unitCode})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Danh Mục</FormLabel>
                                            <Select
                                                onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                                                value={field.value ? String(field.value) : 'none'}
                                            >
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">— Không có —</SelectItem>
                                                    {categories.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.categoryName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={form.control} name="supplierId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nhà Cung Cấp</FormLabel>
                                            <Select
                                                onValueChange={(v) => field.onChange(v === 'none' ? null : Number(v))}
                                                value={field.value ? String(field.value) : 'none'}
                                            >
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">— Không có —</SelectItem>
                                                    {suppliers.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.supplierName}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>

                            {/* Cột 2 */}
                            <div className="space-y-4">
                                <h3 className="font-semibold bg-muted px-2 py-1 rounded text-sm">
                                    Giá & Kho
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="purchasePrice" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá Nhập</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="sellingPriceRetail" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá Bán Lẻ</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="sellingPriceWholesale" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá Bán Sỉ</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="sellingPriceVip" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Giá VIP</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="minStockLevel" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tồn Kho Tối Thiểu</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="taxRate" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Thuế (%)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField control={form.control} name="weight" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Khối lượng (kg)</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="barcode" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mã Barcode</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mô Tả</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Nhập mô tả..." className="resize-none" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
