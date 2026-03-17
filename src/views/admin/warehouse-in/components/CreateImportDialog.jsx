import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { PlusCircle, Trash2, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { createImportTransaction, getStockTransactions } from '@/stores/StockTransactionSlice'
import { getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import api from '@/utils/axios'

const detailSchema = z.object({
    productId: z.coerce.number().int().positive('Chọn sản phẩm'),
    quantity: z.coerce.number().positive('SL phải > 0'),
    unitPrice: z.coerce.number().min(0).optional(),
    totalPrice: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
})

const formSchema = z.object({
    warehouseId: z.coerce.number().int().positive('Chọn kho'),
    reason: z.string().optional(),
    notes: z.string().optional(),
    details: z.array(detailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
})

export default function CreateImportDialog({
    hideTrigger = false,
    externalOpen,
    setExternalOpen,
    prefillWarehouseId,
    prefillProductId,
    isWarningContext = false
}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = externalOpen !== undefined
    const open = isControlled ? externalOpen : internalOpen
    const navigate = useNavigate()

    const handleOpenChange = (v) => {
        if (isControlled) {
            setExternalOpen?.(v)
        } else {
            setInternalOpen(v)
        }
        if (!v) form.reset()
    }
    const dispatch = useDispatch()
    const { actionLoading } = useSelector((state) => state.stockTransaction)
    const warehouses = useSelector((state) => state.warehouse.warehouses || [])
    const products = useSelector((state) => state.product.products || [])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            warehouseId: undefined,
            reason: '',
            notes: '',
            details: [{ productId: '', quantity: 1, unitPrice: 0, totalPrice: 0, notes: '' }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

    useEffect(() => {
        if (open && (prefillWarehouseId || prefillProductId)) {
            if (prefillWarehouseId) {
                form.setValue('warehouseId', prefillWarehouseId)
            }
            if (prefillProductId && products.length > 0) {
                const product = products.find((p) => p.id === prefillProductId);
                if (product) {
                    form.setValue(`details.0.productId`, Number(prefillProductId));
                    form.setValue(`details.0.unitPrice`, product.purchasePrice || 0);
                    form.setValue(`details.0.totalPrice`, (product.purchasePrice || 0) * 1);
                }
            }
        }
    }, [open, prefillWarehouseId, prefillProductId, products, form])

    const warehouseId = form.watch('warehouseId');
    const details = form.watch('details');
    const warnedProducts = useRef(new Set());
    
    // Inventory state for stock column
    const [inventoryMap, setInventoryMap] = useState({});

    useEffect(() => {
        if (!warehouseId) {
            setInventoryMap({});
            return;
        }
        
        async function fetchInventory() {
            try {
                const res = await api.get('/inventory', { params: { warehouseId, limit: 10000 } });
                const data = res.data?.data || [];
                const map = {};
                data.forEach(inv => {
                    map[inv.productId] = Number(inv.quantity) - Number(inv.reservedQuantity || 0);
                });
                setInventoryMap(map);
            } catch (err) {
                console.error('Failed to fetch inventory:', err);
                setInventoryMap({});
            }
        }
        
        fetchInventory();
    }, [warehouseId]);

    useEffect(() => {
        if (!warehouseId || !warehouses.length || !products.length || !details?.length) {
            if (!warehouseId) warnedProducts.current.clear();
            return;
        }

        const warehouse = warehouses.find(w => w.id === warehouseId);
        if (!warehouse) return;

        const currentProductIds = new Set(details.map(d => d.productId).filter(Boolean));

        for (const key of warnedProducts.current) {
            const [wId, pId] = key.split('-');
            if (Number(wId) !== warehouseId || !currentProductIds.has(Number(pId))) {
                warnedProducts.current.delete(key);
            }
        }

        details.forEach(detail => {
            if (!detail.productId) return;
            const product = products.find(p => p.id === detail.productId);
            if (!product || product.minStockLevel <= 0) return;

            const inv = product.inventory?.find(i => i.warehouseId === warehouseId) || { quantity: 0 };
            const warningKey = `${warehouseId}-${product.id}`;

            if (inv.quantity < product.minStockLevel) {
                if (!warnedProducts.current.has(warningKey)) {
                    toast.warning(`Mức tồn của sản phẩm ${product.productName} ở kho ${warehouse.warehouseName} đang ở mức thấp!`);
                    warnedProducts.current.add(warningKey);
                }
            } else {
                warnedProducts.current.delete(warningKey);
            }
        });
    }, [warehouseId, details, warehouses, products]);

    const handleProductSelect = (idx, productId) => {
        const product = products.find((p) => p.id === productId);
        if (product) {
            form.setValue(`details.${idx}.productId`, productId);
            form.setValue(`details.${idx}.unitPrice`, product.purchasePrice || 0);
            const qty = form.getValues(`details.${idx}.quantity`) || 1;
            form.setValue(`details.${idx}.totalPrice`, (product.purchasePrice || 0) * qty);
        }
    };

    const handleQuantityChange = (idx, val) => {
        const qty = Number(val) || 0;
        form.setValue(`details.${idx}.quantity`, qty);
        const unitPrice = form.getValues(`details.${idx}.unitPrice`) || 0;
        form.setValue(`details.${idx}.totalPrice`, qty * unitPrice);
    };

    const handleUnitPriceChange = (idx, val) => {
        const price = Number(val) || 0;
        form.setValue(`details.${idx}.unitPrice`, price);
        const qty = form.getValues(`details.${idx}.quantity`) || 0;
        form.setValue(`details.${idx}.totalPrice`, qty * price);
    };

    const handleTotalPriceChange = (idx, val) => {
        const total = Number(val) || 0;
        form.setValue(`details.${idx}.totalPrice`, total);
        const qty = form.getValues(`details.${idx}.quantity`) || 0;
        if (qty > 0) {
            form.setValue(`details.${idx}.unitPrice`, total / qty);
        }
    };

    const onSubmit = async (values) => {
        try {
            // Remove totalPrice before sending to backend
            const formattedValues = {
                ...values,
                details: values.details.map(d => {
                    const { totalPrice, ...rest } = d;
                    // Remove empty notes
                    if (!rest.notes) {
                        delete rest.notes;
                    }
                    return rest;
                })
            };
            await dispatch(createImportTransaction(formattedValues)).unwrap()
            await dispatch(getStockTransactions({ transactionType: 'import', limit: 20, page: 1 }))
            // Refresh product list so inventory reflects the new stock
            await dispatch(getProducts())
            handleOpenChange(false)
            form.reset()

            // Redirect to the warehouse-in page on success
            navigate('/admin/warehouse-in')
        } catch (error) {
            console.error('Failed to create import transaction:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        Tạo Phiếu Nhập
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Phiếu Nhập Kho</DialogTitle>
                    <DialogDescription>Phiếu sẽ được tạo ở trạng thái Chờ duyệt.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="warehouseId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kho nhập *</FormLabel>
                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Chọn kho" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {warehouses.map((w) => (
                                                <SelectItem key={w.id} value={String(w.id)}>{w.warehouseName}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="reason" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lý do nhập kho</FormLabel>
                                    <FormControl><Input placeholder="VD: Nhập hàng từ NCC..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl><Textarea placeholder="Ghi chú thêm..." className="resize-none h-16" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Items */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-sm">Danh sách mặt hàng</p>
                                <Button type="button" size="sm" variant="outline" className="h-7 gap-1"
                                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, totalPrice: 0, notes: '' })}>
                                    <PlusCircle className="h-3.5 w-3.5" /> Thêm mặt hàng
                                </Button>
                            </div>

                            {form.formState.errors.details?.root && (
                                <p className="text-sm text-destructive mb-2">{form.formState.errors.details.root.message}</p>
                            )}

                            <div className="space-y-3">
                                {fields.map((field, idx) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3 bg-muted/20">
                                        {/* Product */}
                                        <div className="col-span-12 md:col-span-3">
                                            <FormField control={form.control} name={`details.${idx}.productId`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Sản phẩm *</FormLabel>
                                                    <Select onValueChange={(v) => handleProductSelect(idx, Number(v))} value={f.value ? String(f.value) : ''}>
                                                        <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chọn SP" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {products.map((p) => {
                                                                const isNew = isWarningContext && warehouseId
                                                                    ? !p.inventory || p.inventory.length === 0 || !p.inventory.some(inv => inv.warehouseId === warehouseId)
                                                                    : !p.inventory || p.inventory.length === 0;
                                                                return (
                                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                                        <div className="flex items-center gap-3 w-full">
                                                                            {p.images?.[0]?.imageUrl ? (
                                                                                <img src={`http://localhost:8000${p.images[0].imageUrl}`} alt={p.productName} className="w-8 h-8 object-cover rounded border" />
                                                                            ) : (
                                                                                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center border text-[10px] text-muted-foreground">No img</div>
                                                                            )}
                                                                            <div className="flex flex-col flex-1">
                                                                                <span className="font-medium flex items-center gap-2">
                                                                                    {p.productName}
                                                                                    {isNew && (
                                                                                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-[9px] px-1 py-0 h-4 gap-1">
                                                                                            <Sparkles className="w-2.5 h-2.5" /> MỚI
                                                                                        </Badge>
                                                                                    )}
                                                                                    <span className="text-muted-foreground text-xs font-normal">[{p.sku}]</span>
                                                                                </span>
                                                                            </div>
                                                                            <Badge variant="secondary" className="px-2 py-0 h-5">
                                                                                {p.unit?.unitName || 'VND'}
                                                                            </Badge>
                                                                            {p.purchasePrice > 0 && (
                                                                                <span className="font-bold text-blue-600 dark:text-blue-400 min-w-[80px] text-right">
                                                                                    {Number(p.purchasePrice).toLocaleString()} đ
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </SelectItem>
                                                                )
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        {/* Stock (Tồn kho) */}
                                        <div className="col-span-6 md:col-span-1">
                                            <div className="space-y-2">
                                                <FormLabel className="text-xs">Tồn kho</FormLabel>
                                                <div className="h-8 flex items-center text-sm font-medium">
                                                    {form.watch(`details.${idx}.productId`) && warehouseId ? 
                                                        (inventoryMap[form.watch(`details.${idx}.productId`)] ?? 0)
                                                    : '—'}
                                                </div>
                                            </div>
                                        </div>
                                        {/* Qty */}
                                        <div className="col-span-6 md:col-span-1">
                                            <FormField control={form.control} name={`details.${idx}.quantity`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Số lượng *</FormLabel>
                                                    <FormControl><Input type="number" className="h-8 text-xs" {...f} onChange={(e) => handleQuantityChange(idx, e.target.value)} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        {/* Price */}
                                        <div className="col-span-6 md:col-span-2">
                                            <FormField control={form.control} name={`details.${idx}.unitPrice`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Đơn giá</FormLabel>
                                                    <FormControl><Input type="number" className="h-8 text-xs" {...f} onChange={(e) => handleUnitPriceChange(idx, e.target.value)} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        {/* Total Price */}
                                        <div className="col-span-6 md:col-span-2">
                                            <FormField control={form.control} name={`details.${idx}.totalPrice`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Thành tiền</FormLabel>
                                                    <FormControl><Input type="number" className="h-8 text-xs font-medium text-emerald-600 dark:text-emerald-400" {...f} onChange={(e) => handleTotalPriceChange(idx, e.target.value)} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        {/* Note */}
                                        <div className="col-span-6 md:col-span-2">
                                            <FormField control={form.control} name={`details.${idx}.notes`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Ghi chú</FormLabel>
                                                    <FormControl><Input className="h-8 text-xs" placeholder="Ghi chú..." {...f} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        {/* Remove */}
                                        <div className="col-span-2 flex justify-end gap-1">
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 self-end text-destructive hover:text-destructive"
                                                    onClick={() => remove(idx)}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Hủy</Button>
                            <Button type="submit" disabled={actionLoading}>
                                {actionLoading ? 'Đang lưu...' : 'Tạo Phiếu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
