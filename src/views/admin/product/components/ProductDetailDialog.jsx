import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/utils/number-format'
import { productStatuses, productTypes } from '../data'
import {
    Package, Tag, Barcode, Weight, Box, Calendar,
    Layers, Building2, Ruler, DollarSign, Warehouse, Image, PlusCircle
} from 'lucide-react'
import CreateImportDialog from '../../warehouse-in/components/CreateImportDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const InfoRow = ({ icon: Icon, label, value, valueClass = '' }) => (
    <div className="flex items-start gap-3 py-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-1 items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`text-sm font-medium text-right ${valueClass}`}>{value ?? '—'}</span>
        </div>
    </div>
)

export function ProductDetailDialog({ product, open, onOpenChange, warehouseContextId }) {
    const [showImportDialog, setShowImportDialog] = useState(false);

    if (!product) return null

    const status = productStatuses.find((s) => s.value === product.status)
    const prodType = productTypes.find((t) => t.value === product.productType)
    const StatusIcon = status?.icon

    const inventory = product.inventory || []
    const totalStock = inventory.reduce((s, inv) => s + Number(inv.quantity), 0)
    const totalReserved = inventory.reduce((s, inv) => s + Number(inv.reservedQuantity || 0), 0)
    const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Package className="h-5 w-5 text-primary" />
                        Chi tiết sản phẩm
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Image + tên */}
                    <div className="flex gap-4 items-start">
                        <div className="shrink-0">
                            {primaryImage ? (
                                <img
                                    src={`http://localhost:8000${primaryImage.imageUrl}`}
                                    alt={product.productName}
                                    className="h-24 w-24 rounded-lg object-cover border"
                                    onError={(e) => { e.target.src = '/placeholder.png'; e.target.onerror = null }}
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-muted">
                                    <Image className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <h3 className="text-base font-bold leading-tight">{product.productName}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="font-mono text-xs">
                                    {product.sku}
                                </Badge>
                                {status && (
                                    <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
                                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                        {status.label}
                                    </Badge>
                                )}
                                {product.unit && (
                                    <Badge variant="secondary" className="text-xs">
                                        {product.unit.unitName}
                                    </Badge>
                                )}
                            </div>
                            {product.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                                    {product.description}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Thông tin cơ bản */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Thông tin chung
                        </p>
                        <InfoRow icon={Tag} label="Loại sản phẩm" value={prodType?.label || product.productType} />
                        <InfoRow icon={Layers} label="Danh mục" value={product.category?.categoryName} />
                        <InfoRow icon={Building2} label="Nhà cung cấp" value={product.supplier?.supplierName} />
                        <InfoRow icon={Barcode} label="Mã vạch" value={product.barcode} />
                        <InfoRow icon={Box} label="Kiểu đóng gói" value={product.packagingType} />
                        <InfoRow icon={Weight} label="Khối lượng" value={product.weight ? `${product.weight} kg` : null} />
                        <InfoRow icon={Ruler} label="Kích thước" value={product.dimensions} />
                        <InfoRow
                            icon={Calendar}
                            label="Hạn sử dụng"
                            value={product.expiryDate ? new Date(product.expiryDate).toLocaleDateString('vi-VN') : null}
                        />
                    </div>

                    <Separator />

                    {/* Giá */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Giá bán
                        </p>
                        <InfoRow
                            icon={DollarSign}
                            label="Giá nhập"
                            value={formatCurrency(product.purchasePrice)}
                            valueClass="text-muted-foreground"
                        />
                        <InfoRow
                            icon={DollarSign}
                            label="Giá bán lẻ"
                            value={formatCurrency(product.sellingPriceRetail)}
                            valueClass="text-primary font-semibold"
                        />
                        <InfoRow
                            icon={DollarSign}
                            label="Giá bán buôn"
                            value={formatCurrency(product.sellingPriceWholesale)}
                        />
                        <InfoRow
                            icon={DollarSign}
                            label="Giá VIP"
                            value={formatCurrency(product.sellingPriceVip)}
                        />
                    </div>

                    <Separator />

                    {/* Tồn kho */}
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            Tồn kho
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg border bg-muted/40 p-3 text-center">
                                <p className="text-xs text-muted-foreground">Tổng tồn</p>
                                <p className="text-xl font-bold text-primary">{totalStock}</p>
                            </div>
                            <div className="rounded-lg border bg-muted/40 p-3 text-center">
                                <p className="text-xs text-muted-foreground">Đã đặt</p>
                                <p className="text-xl font-bold text-warning">{totalReserved}</p>
                            </div>
                            <div className="rounded-lg border bg-muted/40 p-3 text-center">
                                <p className="text-xs text-muted-foreground">Có thể bán</p>
                                <p className="text-xl font-bold text-success">{totalStock - totalReserved}</p>
                            </div>
                        </div>
                        {inventory.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {inventory.map((inv, idx) => (
                                    <div key={idx} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs">
                                        <Warehouse className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <span className="flex-1 text-muted-foreground">
                                            {inv.warehouse?.warehouseName || `Kho #${inv.warehouseId}`}
                                        </span>
                                        <span className="font-medium">{Number(inv.quantity)} {product.unit?.unitCode || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-1">
                            <InfoRow
                                icon={Warehouse}
                                label="Mức tồn tối thiểu"
                                value={product.minStockLevel}
                                valueClass={totalStock < (product.minStockLevel || 0) ? 'text-destructive' : ''}
                            />
                        </div>
                    </div>
                </div>

                {warehouseContextId && (
                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button
                            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                setShowImportDialog(true)
                            }}
                        >
                            <PlusCircle className="h-4 w-4" />
                            Tạo Phiếu Nhập
                        </Button>
                    </div>
                )}
            </DialogContent>

            {/* Render CreateImportDialog outside to prevent nested unmounting issues */}
            {warehouseContextId && (
                <CreateImportDialog
                    hideTrigger={true}
                    externalOpen={showImportDialog}
                    setExternalOpen={setShowImportDialog}
                    prefillWarehouseId={warehouseContextId}
                    prefillProductId={product.id}
                    isWarningContext={true}
                />
            )}
        </Dialog>
    )
}
