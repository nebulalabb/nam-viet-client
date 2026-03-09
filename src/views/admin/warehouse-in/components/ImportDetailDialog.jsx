import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from './StatusBadge'
import { Package, Calendar, Warehouse, FileText, User } from 'lucide-react'
import { formatCurrency } from '@/utils/number-format'

const dateFormat = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'

const InfoRow = ({ label, value }) => (
    <div className="flex items-start justify-between py-1.5 text-sm">
        <span className="text-muted-foreground shrink-0">{label}</span>
        <span className="text-right font-medium ml-4">{value ?? '—'}</span>
    </div>
)

export function ImportDetailDialog({ transaction, open, onOpenChange }) {
    if (!transaction) return null

    const details = transaction.details || []
    const totalValue = details.reduce(
        (sum, d) => sum + Number(d.quantity || 0) * Number(d.unitPrice || 0),
        0
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Chi tiết Phiếu Nhập Kho
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Header info */}
                    <div className="flex items-center justify-between">
                        <span className="font-mono text-lg font-bold text-primary">
                            {transaction.transactionCode || `#${transaction.id}`}
                        </span>
                        <StatusBadge status={transaction.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 rounded-lg border p-3 bg-muted/30">
                        <div>
                            <InfoRow label="Kho nhập" value={
                                <span className="flex items-center gap-1">
                                    <Warehouse className="h-3.5 w-3.5 text-muted-foreground" />
                                    {transaction.warehouse?.warehouseName}
                                </span>
                            } />
                            <InfoRow label="Ngày tạo" value={dateFormat(transaction.createdAt)} />
                            <InfoRow label="Ngày duyệt" value={dateFormat(transaction.approvedAt)} />
                        </div>
                        <div>
                            <InfoRow label="Người tạo" value={
                                transaction.createdByUser?.fullName || transaction.createdByUser?.username
                            } />
                            <InfoRow label="Người duyệt" value={
                                transaction.approvedByUser?.fullName || transaction.approvedByUser?.username
                            } />
                        </div>
                    </div>

                    {transaction.reason && (
                        <div className="rounded-md border px-3 py-2 bg-muted/20">
                            <p className="text-xs text-muted-foreground mb-1">Lý do nhập kho</p>
                            <p className="text-sm">{transaction.reason}</p>
                        </div>
                    )}

                    {transaction.notes && (
                        <div className="rounded-md border px-3 py-2 bg-muted/20">
                            <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                            <p className="text-sm">{transaction.notes}</p>
                        </div>
                    )}

                    <Separator />

                    {/* Items table */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Danh sách mặt hàng ({details.length})
                        </p>
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium">Sản phẩm</th>
                                        <th className="px-3 py-2 text-right font-medium">SL</th>
                                        <th className="px-3 py-2 text-right font-medium">Đơn giá</th>
                                        <th className="px-3 py-2 text-right font-medium">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.map((d, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="px-3 py-2">
                                                <p className="font-medium line-clamp-1">{d.product?.productName || `SP #${d.productId}`}</p>
                                                {d.batchNumber && <p className="text-xs text-muted-foreground">Lô: {d.batchNumber}</p>}
                                                {d.expiryDate && <p className="text-xs text-muted-foreground">HSD: {dateFormat(d.expiryDate)}</p>}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {Number(d.quantity)} {d.product?.unit?.unitCode || ''}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                {formatCurrency(d.unitPrice)}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">
                                                {formatCurrency(Number(d.quantity) * Number(d.unitPrice || 0))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-muted/30">
                                    <tr className="border-t font-semibold">
                                        <td colSpan={3} className="px-3 py-2 text-right">Tổng giá trị</td>
                                        <td className="px-3 py-2 text-right text-primary">
                                            {formatCurrency(totalValue)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {transaction.cancelReason && (
                        <div className="rounded-md border border-red-200 px-3 py-2 bg-red-50">
                            <p className="text-xs text-red-600 font-medium mb-1">Lý do hủy</p>
                            <p className="text-sm text-red-700">{transaction.cancelReason}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
