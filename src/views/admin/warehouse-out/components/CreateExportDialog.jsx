import { useState } from 'react'
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
import { PlusCircle, Trash2 } from 'lucide-react'
import { createExportTransaction, getStockTransactions } from '@/stores/StockTransactionSlice'

const detailSchema = z.object({
    productId: z.coerce.number().int().positive('Chọn sản phẩm'),
    quantity: z.coerce.number().positive('SL phải > 0'),
    unitPrice: z.coerce.number().min(0).optional(),
    notes: z.string().optional(),
})

const formSchema = z.object({
    warehouseId: z.coerce.number().int().positive('Chọn kho'),
    reason: z.string().optional(),
    notes: z.string().optional(),
    referenceType: z.string().optional(),
    referenceId: z.coerce.number().int().positive().optional(),
    details: z.array(detailSchema).min(1, 'Cần ít nhất 1 mặt hàng'),
})

export default function CreateExportDialog() {
    const [open, setOpen] = useState(false)
    const dispatch = useDispatch()
    const { actionLoading } = useSelector((s) => s.stockTransaction)
    const warehouses = useSelector((s) => s.warehouse.warehouses || [])
    const products = useSelector((s) => s.product.products || [])

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            warehouseId: undefined,
            reason: '',
            notes: '',
            referenceType: '',
            referenceId: undefined,
            details: [{ productId: '', quantity: 1, unitPrice: 0, notes: '' }],
        },
    })

    const { fields, append, remove } = useFieldArray({ control: form.control, name: 'details' })

    const onSubmit = async (values) => {
        const payload = { ...values }
        if (!payload.referenceId) delete payload.referenceId
        if (!payload.referenceType) delete payload.referenceType
        try {
            await dispatch(createExportTransaction(payload)).unwrap()
            await dispatch(getStockTransactions({ transactionType: 'export', limit: 20, page: 1 }))
            setOpen(false)
            form.reset()
        } catch (_) { }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) form.reset() }}>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tạo Phiếu Xuất
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tạo Phiếu Xuất Kho</DialogTitle>
                    <DialogDescription>Phiếu sẽ được tạo ở trạng thái Nháp.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                    <FormControl><Input placeholder="VD: Xuất cho đơn bán #INV-001..." {...field} /></FormControl>
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

                        {/* Items */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-sm">Danh sách mặt hàng xuất</p>
                                <Button type="button" size="sm" variant="outline" className="h-7 gap-1"
                                    onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, notes: '' })}>
                                    <PlusCircle className="h-3.5 w-3.5" /> Thêm mặt hàng
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, idx) => (
                                    <div key={field.id} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3 bg-muted/20">
                                        <div className="col-span-5">
                                            <FormField control={form.control} name={`details.${idx}.productId`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Sản phẩm *</FormLabel>
                                                    <Select onValueChange={(v) => f.onChange(Number(v))} value={f.value ? String(f.value) : ''}>
                                                        <FormControl><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Chọn SP" /></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {products.map((p) => (
                                                                <SelectItem key={p.id} value={String(p.id)}>
                                                                    {p.productName} [{p.sku}]
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField control={form.control} name={`details.${idx}.quantity`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Số lượng *</FormLabel>
                                                    <FormControl><Input type="number" className="h-8 text-xs" {...f} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-3">
                                            <FormField control={form.control} name={`details.${idx}.unitPrice`} render={({ field: f }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Đơn giá</FormLabel>
                                                    <FormControl><Input type="number" className="h-8 text-xs" {...f} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="col-span-1 flex items-end">
                                            {fields.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
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
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
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
