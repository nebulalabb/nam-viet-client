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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { X, CalendarDays, Hash, Tag, CheckCircle2, PackageSearch } from 'lucide-react'

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0)
}

export const PromotionDetailDialog = ({ promotion, open, onOpenChange, ...props }) => {
    if (!promotion) return null

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            expired: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return (
            <Badge variant="outline" className={colors[status] || 'bg-gray-100'}>
                {status === 'active' ? 'Đang hoạt động' : status}
            </Badge>
        )
    }

    const getTypeLabel = (type) => {
        const labels = {
            buy_x_get_y: 'Mua X tặng Y',
            gift: 'Tặng quà',
            percentage: 'Giảm theo phần trăm',
            fixed_amount: 'Giảm cố định',
        }
        return labels[type] || type
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent
                className={cn("md:h-auto md:max-w-4xl p-6")}
            >
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl">{promotion.promotionName}</DialogTitle>
                        {getStatusBadge(promotion.status)}
                    </div>
                    <DialogDescription>
                        Chi tiết thông tin khuyến mãi: <strong>{promotion.promotionCode}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-2">
                        <div className="rounded-lg border p-4 space-y-3 bg-slate-50/50">
                            <h3 className="font-semibold text-base mb-2">Thông tin chung</h3>

                            <div className="flex items-center text-sm">
                                <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Mã KM:</span>
                                <span className="font-medium">{promotion.promotionCode}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Loại KM:</span>
                                <span className="font-medium">{getTypeLabel(promotion.promotionType)}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Lượt sử dụng:</span>
                                <span className="font-medium">{promotion.usageCount || 0}</span>
                            </div>
                        </div>

                        <div className="rounded-lg border p-4 space-y-3 bg-slate-50/50">
                            <h3 className="font-semibold text-base mb-2">Điều kiện áp dụng</h3>

                            <div className="flex items-center text-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Từ ngày:</span>
                                <span className="font-medium">{promotion.startDate ? format(new Date(promotion.startDate), 'dd/MM/yyyy HH:mm') : '-'}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Đến ngày:</span>
                                <span className="font-medium">{promotion.endDate ? format(new Date(promotion.endDate), 'dd/MM/yyyy HH:mm') : '-'}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <PackageSearch className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Đơn tối thiểu:</span>
                                <span className="font-medium text-orange-600 font-semibold">{promotion.minOrderValue ? formatCurrency(promotion.minOrderValue) : 'Không yêu cầu'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {promotion.description && (
                        <div className="rounded-lg border p-4 mb-6">
                            <h3 className="font-semibold text-base mb-2">Mô tả</h3>
                            <p className="text-sm text-gray-700">{promotion.description}</p>
                        </div>
                    )}

                    {/* Products List (if available) */}
                    {promotion.products && promotion.products.length > 0 && (
                        <div className="rounded-lg border p-4">
                            <h3 className="font-semibold text-base mb-3">Sản phẩm áp dụng / Quà tặng</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/50">
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Sản phẩm chính</TableHead>
                                        <TableHead>Quà tặng kèm</TableHead>
                                        <TableHead className="text-right">SL Quà</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promotion.products.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium text-xs">{item.product?.sku || item.giftProduct?.sku || '-'}</TableCell>
                                            <TableCell>{item.product?.productName || 'Áp dụng cho mọi sản phẩm'}</TableCell>
                                            <TableCell className="text-green-600 font-medium">
                                                {item.giftProduct?.productName || 'Không có Món'}
                                            </TableCell>
                                            <TableCell className="text-right">{item.quantity || 1}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button size="sm" type="button" variant="outline" className="gap-2">
                            <X className="h-4 w-4" />
                            Đóng
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
