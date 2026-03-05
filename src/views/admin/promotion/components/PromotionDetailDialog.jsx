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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { dateFormat } from '@/utils/date-format'
import { applicableToOptions, promotionStatuses, promotionTypes } from '../data'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import CustomerDetailDialog from '../../customer/components/CustomerDetailDialog'
import { ProductDetailDialog } from '../../product/components/ProductDetailDialog'
import {
    Hash,
    Tag,
    CalendarDays,
    CheckCircle2,
    PackageSearch,
    Users,
    ShoppingCart,
    X,
    Gift,
    Layers,
    Pencil,
} from 'lucide-react'
import UpdatePromotionDialog from './UpdatePromotionDialog'
import Can from '@/utils/can'

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value || 0)
}

export function PromotionDetailDialog({ open, onOpenChange, promotion }) {
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [showCustomerModal, setShowCustomerModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showProductModal, setShowProductModal] = useState(false)
    const [showUpdateDialog, setShowUpdateDialog] = useState(false)

    useEffect(() => {
        if (!open) return
        const fetchData = async () => {
            try {
                const [resProducts, resCustomers] = await Promise.all([
                    api.get('/products?limit=1000'),
                    api.get('/customers?limit=1000')
                ])

                if (resProducts.data?.data) {
                    setProducts(resProducts.data.data)
                } else if (resProducts.data) {
                    setProducts(resProducts.data)
                }

                if (resCustomers.data?.data) {
                    setCustomers(resCustomers.data.data)
                } else if (resCustomers.data) {
                    setCustomers(resCustomers.data)
                }
            } catch (error) {
                console.error('Fetch data error:', error)
            }
        }
        fetchData()
    }, [open])

    const getProductName = (id) => {
        if (!id) return ''
        const product = products.find(p => p.id === Number(id))
        return product ? product.productName : `ID: ${id}`
    }

    const handleCustomerClick = (customerId) => {
        if (!customerId) return
        const customer = customers.find(c => c.id === Number(customerId))
        if (customer) {
            setSelectedCustomer(customer)
            setShowCustomerModal(true)
        }
    }

    const handleProductClick = (productId) => {
        if (!productId) return
        const product = products.find(p => p.id === Number(productId))
        if (product) {
            setSelectedProduct(product)
            setShowProductModal(true)
        }
    }

    const getCustomerName = (id) => {
        if (!id) return ''
        const customer = customers.find(c => c.id === Number(id))
        return customer ? customer.customerName || customer.name || `ID: ${id}` : `ID: ${id}`
    }

    if (!promotion) return null

    const type = promotionTypes.find((t) => t.value === promotion.promotionType)
    const status = promotionStatuses.find((s) => s.value === promotion.status)
    const applicableTo = applicableToOptions.find((a) => a.value === promotion.applicableTo)

    const getStatusBadge = (statusValue) => {
        const colors = {
            active: 'bg-green-100 text-green-800',
            waiting: 'bg-blue-100 text-blue-800',
            expired: 'bg-gray-100 text-gray-800',
            pending: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
        }
        return (
            <Badge variant="outline" className={colors[statusValue] || 'bg-gray-100'}>
                {status?.label || statusValue}
            </Badge>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("md:h-auto md:max-w-4xl p-6")}>
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
                        {/* Thông tin chung */}
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
                                <span className="font-medium">{type?.label || promotion.promotionType}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Phạm vi:</span>
                                <span className="font-medium">{applicableTo?.label || promotion.applicableTo}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <CheckCircle2 className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Lượt sử dụng:</span>
                                <span className="font-medium">
                                    {promotion.usageCount || 0} / {promotion.quantityLimit || 'Không giới hạn'}
                                </span>
                            </div>
                        </div>

                        {/* Điều kiện áp dụng */}
                        <div className="rounded-lg border p-4 space-y-3 bg-slate-50/50">
                            <h3 className="font-semibold text-base mb-2">Điều kiện áp dụng</h3>

                            <div className="flex items-center text-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Từ ngày:</span>
                                <span className="font-medium">
                                    {promotion.startDate ? dateFormat(promotion.startDate) : '-'}
                                </span>
                            </div>

                            <div className="flex items-center text-sm">
                                <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">
                                    {promotion.promotionType === "gift" ? "Hạn chót:" : "Đến ngày:"}
                                </span>
                                <span className="font-medium">
                                    {promotion.endDate ? dateFormat(promotion.endDate) : '-'}
                                </span>
                            </div>

                            <div className="flex items-center text-sm">
                                <PackageSearch className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Đơn tối thiểu:</span>
                                <span className="font-medium text-orange-600 font-semibold">
                                    {promotion.minOrderValue ? formatCurrency(promotion.minOrderValue) : 'Không yêu cầu'}
                                </span>
                            </div>

                            {promotion.conditions?.buy_quantity && (
                                <div className="flex items-center text-sm">
                                    <ShoppingCart className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-muted-foreground w-28">Mua SL (X):</span>
                                    <span className="font-medium">{promotion.conditions.buy_quantity}</span>
                                </div>
                            )}

                            {(promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity) && (
                                <div className="flex items-center text-sm">
                                    <Gift className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <span className="text-muted-foreground w-28">Tặng SL (Y):</span>
                                    <span className="font-medium">
                                        {promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sản phẩm & Quà tặng */}
                    {(promotion.applicableTo === 'specific_product' && promotion.products?.[0]?.productId) ||
                        (promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id) ? (
                        <div className="rounded-lg border p-4 mb-4">
                            <h3 className="font-semibold text-base mb-3">Sản phẩm áp dụng / Quà tặng</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-secondary/50">
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead className="text-right">Số lượng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {promotion.applicableTo === 'specific_product' && promotion.products?.[0]?.productId && (
                                        <TableRow>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700">Sản phẩm chính</Badge>
                                            </TableCell>
                                            <TableCell
                                                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline underline-offset-2"
                                                onClick={() => handleProductClick(promotion.products[0].productId)}
                                            >
                                                {getProductName(promotion.products[0].productId)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {promotion.conditions?.buy_quantity || '-'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {(promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id) && (
                                        <TableRow>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-green-50 text-green-700">Quà tặng</Badge>
                                            </TableCell>
                                            <TableCell
                                                className="font-medium text-green-600 hover:text-green-800 cursor-pointer underline underline-offset-2"
                                                onClick={() => handleProductClick(promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id)}
                                            >
                                                {getProductName(promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity || '-'}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    ) : null}

                    {/* Nhóm sản phẩm (đơn vị) */}
                    {promotion.applicableTo === 'product_group' && promotion.conditions?.unit && (
                        <div className="rounded-lg border p-4 mb-4">
                            <h3 className="font-semibold text-base mb-3">Sản phẩm áp dụng</h3>
                            <div className="flex items-center text-sm">
                                <PackageSearch className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Đơn vị:</span>
                                <span className="font-medium">{promotion.conditions.unit}</span>
                            </div>
                        </div>
                    )}

                    {/* Nhóm khách hàng */}
                    {promotion.applicableTo === 'customer_group' && (
                        <div className="rounded-lg border p-4 mb-4">
                            <h3 className="font-semibold text-base mb-3">Nhóm khách hàng áp dụng</h3>
                            <div className="flex items-center text-sm">
                                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Loại KH:</span>
                                <span className="font-medium">
                                    {promotion.conditions?.applicable_customer_types?.length > 0
                                        ? promotion.conditions.applicable_customer_types.map(t =>
                                            t === 'individual' ? 'Cá nhân' : t === 'company' ? 'Doanh nghiệp' : t
                                        ).join(', ')
                                        : 'Tất cả'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Khách hàng áp dụng */}
                    {promotion.applicableTo === 'specific_customer' && promotion.conditions?.customer_id && (
                        <div className="rounded-lg border p-4">
                            <h3 className="font-semibold text-base mb-3">Khách hàng áp dụng</h3>
                            <div className="flex items-center text-sm">
                                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-muted-foreground w-28">Khách hàng:</span>
                                <span
                                    className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline underline-offset-2"
                                    onClick={() => handleCustomerClick(promotion.conditions.customer_id)}
                                >
                                    {getCustomerName(promotion.conditions.customer_id)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 gap-2">
                    {promotion.status === 'pending' && (
                        <Can permission="UPDATE_PROMOTION">
                            <Button
                                size="sm"
                                type="button"
                                variant="default"
                                className="gap-2"
                                onClick={() => setShowUpdateDialog(true)}
                            >
                                <Pencil className="h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                        </Can>
                    )}
                    <DialogClose asChild>
                        <Button size="sm" type="button" variant="outline" className="gap-2">
                            <X className="h-4 w-4" />
                            Đóng
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
            {showCustomerModal && selectedCustomer && (
                <CustomerDetailDialog
                    open={showCustomerModal}
                    onOpenChange={setShowCustomerModal}
                    customer={selectedCustomer}
                    showTrigger={false}
                />
            )}
            {showProductModal && selectedProduct && (
                <ProductDetailDialog
                    open={showProductModal}
                    onOpenChange={setShowProductModal}
                    product={selectedProduct}
                />
            )}
            {showUpdateDialog && (
                <UpdatePromotionDialog
                    open={showUpdateDialog}
                    onOpenChange={setShowUpdateDialog}
                    promotion={promotion}
                />
            )}
        </Dialog>
    )
}
