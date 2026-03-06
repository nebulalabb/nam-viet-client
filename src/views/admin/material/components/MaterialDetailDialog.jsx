import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { priorityLabels } from './data'
import {
    Beaker,
    Barcode,
    Layers,
    Building2,
    DollarSign,
    Calendar,
    Star,
    Image,
    Ruler,
    Tag,
    X,
    Pencil,
    Trash2,
} from 'lucide-react'
import { useState } from 'react'
import UpdateMaterialDialog from './UpdateMaterialDialog'
import DeleteMaterialDialog from './DeleteMaterialDialog'

export function MaterialDetailDialog({ material, open, onOpenChange, loading = false }) {
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    if (!material && !loading) return null

    const priority = material
        ? priorityLabels.find((p) => p.value === material.priority) || {
            label: `${material.priority}`,
            color: 'bg-gray-100 text-gray-800',
        }
        : null

    const formatCurrency = (value) => {
        const num = Number(value) || 0
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(num)
    }

    const formatDate = (date) => {
        if (!date) return 'Chưa cập nhật'
        return new Date(date).toLocaleDateString('vi-VN')
    }

    const products = material?.products || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:h-auto md:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>{material?.name || 'Nguyên liệu'}</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết nguyên liệu: <strong>{material?.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[75vh] overflow-auto">
                    {loading ? (
                        <div className="flex flex-col gap-6 lg:flex-row">
                            <div className="flex-1 space-y-4 rounded-lg border p-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-10 w-full" />
                                ))}
                            </div>
                            <div className="w-full rounded-lg border p-4 lg:w-72 space-y-4">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-4 w-3/4" />
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                        </div>
                    ) : material ? (
                        <div className="flex flex-col gap-6 lg:flex-row">
                            {/* Main Content - Left Side */}
                            <div className="flex-1 space-y-6 rounded-lg border p-4">
                                {/* Giá thành & Thời gian */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-3">Giá thành & Thời gian</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="rounded-lg border bg-green-50/50 p-3 text-center">
                                            <p className="text-xs text-muted-foreground">Giá thành</p>
                                            <p className="text-lg font-bold text-green-700">
                                                {formatCurrency(material.cost)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/40 p-3 text-center">
                                            <p className="text-xs text-muted-foreground">Ngày mua vào</p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(material.purchaseDate)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border bg-muted/40 p-3 text-center">
                                            <p className="text-xs text-muted-foreground">Ngày áp dụng</p>
                                            <p className="text-sm font-semibold">
                                                {formatDate(material.effectiveDate)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sản phẩm liên kết */}
                                <div>
                                    <h2 className="text-lg font-semibold mb-3">
                                        Sản phẩm liên kết ({products.length})
                                    </h2>
                                    <Table className="min-w-full">
                                        <TableHeader>
                                            <TableRow className="bg-secondary text-xs">
                                                <TableHead className="w-8">TT</TableHead>
                                                <TableHead className="min-w-24">Mã SP</TableHead>
                                                <TableHead className="min-w-40">Tên sản phẩm</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {products.length > 0 ? (
                                                products.map((p, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{idx + 1}</TableCell>
                                                        <TableCell>
                                                            <span className="font-mono text-sm">
                                                                {p.product?.sku}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="font-medium">
                                                                {p.product?.productName}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={3}
                                                        className="text-center text-muted-foreground"
                                                    >
                                                        Không có sản phẩm liên kết
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Sidebar - Right Side */}
                            <div className="w-full rounded-lg border p-4 lg:w-72">
                                <div className="flex items-center justify-between">
                                    <h2 className="py-2 text-lg font-semibold">Nguyên liệu</h2>
                                </div>
                                <div className="space-y-6">
                                    {/* Avatar + Tên */}
                                    <div className="flex items-center gap-4">
                                        {material.imageUrl ? (
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={material.imageUrl}
                                                    alt={material.name}
                                                />
                                                <AvatarFallback>NL</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-green-100 text-green-700">
                                                    <Beaker className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div>
                                            <div className="font-medium">{material.name}</div>
                                            <div className="text-xs text-muted-foreground font-mono">
                                                {material.materialCode}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin chi tiết */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="font-medium">Thông tin nguyên liệu</div>
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm">
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Barcode className="h-4 w-4" />
                                                </div>
                                                <span>{material.materialCode}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Layers className="h-4 w-4" />
                                                </div>
                                                <span>{material.category?.categoryName || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Ruler className="h-4 w-4" />
                                                </div>
                                                <span>{material.unit || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Tag className="h-4 w-4" />
                                                </div>
                                                <span>{material.materialType || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <span>{material.supplier?.supplierName || 'Chưa cập nhật'}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <DollarSign className="h-4 w-4" />
                                                </div>
                                                <span className="font-semibold text-green-700">
                                                    {formatCurrency(material.cost)}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Star className="h-4 w-4" />
                                                </div>
                                                {priority && (
                                                    <Badge className={`${priority.color} border-0 text-xs`}>
                                                        {priority.label}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Thời gian */}
                                            <div className="my-2 border-t" />
                                            <div className="font-medium text-sm mb-2">Thời gian</div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span>Mua: {formatDate(material.purchaseDate)}</span>
                                            </div>
                                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span>Áp dụng: {formatDate(material.effectiveDate)}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span>Tạo: {formatDate(material.createdAt)}</span>
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <div className="mr-2 h-4 w-4">
                                                    <Calendar className="h-4 w-4" />
                                                </div>
                                                <span>Cập nhật: {formatDate(material.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:space-x-0 gap-2">
                    <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
                        <Button
                            size="sm"
                            onClick={() => setShowEdit(true)}
                            className="gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <Pencil className="h-4 w-4" />
                            Sửa
                        </Button>

                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setShowDelete(true)}
                            className="gap-2 w-full sm:w-auto"
                        >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                        </Button>

                        <DialogClose asChild>
                            <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                                <X className="h-4 w-4" />
                                Đóng
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>

            {showEdit && (
                <UpdateMaterialDialog
                    open={showEdit}
                    onOpenChange={setShowEdit}
                    material={material}
                    contentClassName="z-[100070]"
                    overlayClassName="z-[100069]"
                />
            )}

            {showDelete && (
                <DeleteMaterialDialog
                    open={showDelete}
                    onOpenChange={(open) => {
                        setShowDelete(open)
                        if (!open) onOpenChange?.(false)
                    }}
                    material={material}
                    showTrigger={false}
                    contentClassName="z-[100070]"
                    overlayClassName="z-[100069]"
                />
            )}
        </Dialog>
    )
}

export default MaterialDetailDialog
