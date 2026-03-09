import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
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
import { Trash2 } from 'lucide-react'
import { createExportTransaction } from '@/stores/StockTransactionSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'

const detailSchema = z.object({
    productId: z.coerce.number().int().positive('Chọn sản phẩm'),
    productName: z.string().optional(),
    orderQty: z.coerce.number().optional(),
    quantity: z.coerce.number().min(0, 'SL phải >= 0'),
    unitPrice: z.coerce.number().min(0).optional(),
})

const formSchema = z.object({
    warehouseId: z.coerce.number().int().positive('Chọn kho xuất'),
    reason: z.string().optional(),
    notes: z.string().optional(),
    details: z.array(detailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
})

export function ConfirmWarehouseReceiptDialog({ open, onOpenChange, salesOrder, onSuccess }) {
    const dispatch = useDispatch()
    const { actionLoading } = useSelector((s) => s.stockTransaction)
    const warehouses = useSelector((s) => s.warehouse.warehouses || [])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            warehouseId: undefined,
            reason: '',
            notes: '',
            details: [],
        },
    })

    const { fields, remove } = useFieldArray({ control: form.control, name: 'details' })

    useEffect(() => {
        if (open && salesOrder) {
            form.reset({
                warehouseId: undefined,
                reason: `Xuất kho cho đơn bán #${salesOrder.orderCode}`,
                notes: '',
                details: salesOrder.details?.map(d => ({
                    productId: d.productId,
                    productName: d.product?.productName || '',
                    orderQty: Number(d.quantity),
                    quantity: Number(d.quantity), // Default to full export
                    unitPrice: Number(d.unitPrice),
                })) || [],
            })

            if (warehouses.length === 0) {
                dispatch(getWarehouses({ status: 'active', limit: 100 }))
            }
        }
    }, [open, salesOrder, form])

    const onSubmit = async (values) => {
        // Filter out items with 0 quantity if user explicitly sets them to 0 (meaning "skip this item")
        const validDetails = values.details.filter(d => d.quantity > 0)

        if (validDetails.length === 0) {
            form.setError('root', { message: 'Vui lòng xuất ít nhất 1 sản phẩm có số lượng > 0' })
            return
        }

        const payload = {
            warehouseId: values.warehouseId,
            referenceType: 'sales_order',
            referenceId: salesOrder.id,
            reason: values.reason,
            notes: values.notes,
            details: validDetails.map(d => ({
                productId: d.productId,
                quantity: d.quantity,
                unitPrice: d.unitPrice,
            })),
        }

        try {
            await dispatch(createExportTransaction(payload)).unwrap()
            if (onSuccess) onSuccess()
            onOpenChange(false)
        } catch (_) { }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Phiếu Xuất Kho</DialogTitle>
                    <DialogDescription>
                        Tạo xuất kho cho đơn hàng <b>#{salesOrder?.orderCode}</b>. Bạn có thể xuất một phần hoặc toàn bộ số lượng trong đơn.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {form.formState.errors.root && (
                            <div className="text-destructive text-sm font-medium">{form.formState.errors.root.message}</div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="warehouseId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kho xuất *</FormLabel>
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
                                    <FormLabel>Lý do xuất kho</FormLabel>
                                    <FormControl><Input placeholder="Lý do..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="notes" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ghi chú</FormLabel>
                                <FormControl><Textarea placeholder="Ghi chú thêm..." className="resize-none h-16" {...field} /></FormControl>
                            </FormItem>
                        )} />

                        {/* Items table layout for better UX than cards */}
                        <div>
                            <p className="font-semibold text-sm mb-2">Danh sách mặt hàng</p>
                            <div className="border rounded-md overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-secondary/50 text-left">
                                        <tr>
                                            <th className="p-2 w-12 text-center">TT</th>
                                            <th className="p-2">Sản phẩm</th>
                                            <th className="p-2 w-32 text-center">SL Đặt</th>
                                            <th className="p-2 w-32">SL Thực xuất</th>
                                            <th className="p-2 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fields.map((field, idx) => (
                                            <tr key={field.id} className="border-t">
                                                <td className="p-2 text-center">{idx + 1}</td>
                                                <td className="p-2 font-medium">{field.productName}</td>
                                                <td className="p-2 text-center">{field.orderQty}</td>
                                                <td className="p-2 px-4">
                                                    <FormField control={form.control} name={`details.${idx}.quantity`} render={({ field: f }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Input type="number" className="h-8 text-center" min={0} {...f} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => remove(idx)}
                                                        title="Xóa khỏi phiếu xuất"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {fields.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-4 text-center text-muted-foreground">Không có mặt hàng nào.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
                            <Button type="submit" disabled={actionLoading || fields.length === 0}>
                                {actionLoading ? 'Đang tạo...' : 'Xác nhận Tạo Phiếu Xuất'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
