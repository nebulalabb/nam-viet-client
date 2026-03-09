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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { dateFormat } from '@/utils/date-format'
import { applicableToOptions, promotionStatuses, promotionTypes } from '../data'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import CustomerDetailDialog from '../../customer/components/CustomerDetailDialog'
import ViewProductDialog from '../../product/components/ViewProductDialog'
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
  Percent,
  DollarSign,
  Clock,
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

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    waiting: 'bg-blue-100 text-blue-800',
    expired: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const hasProducts = (promotion.applicableTo === 'specific_product' && promotion.products?.[0]?.productId) ||
    (promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id)

  const hasProductGroup = promotion.applicableTo === 'product_group' && promotion.conditions?.unit
  const hasCustomerGroup = promotion.applicableTo === 'customer_group'
  const hasSpecificCustomer = promotion.applicableTo === 'specific_customer' && promotion.conditions?.customer_id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:h-auto md:max-w-5xl")}>
        <DialogHeader>
          <DialogTitle>{promotion.promotionName}</DialogTitle>
          <DialogDescription>
            Chi tiết thông tin khuyến mãi: <strong>{promotion.promotionCode}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Main Content - Left Side */}
            <div className="flex-1 space-y-6 rounded-lg border p-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg border bg-slate-50/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Đơn tối thiểu</p>
                  <p className="text-sm font-bold text-orange-600">
                    {promotion.minOrderValue ? formatCurrency(promotion.minOrderValue) : 'Không yêu cầu'}
                  </p>
                </div>
                <div className="rounded-lg border bg-slate-50/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Lượt sử dụng</p>
                  <p className="text-sm font-bold">
                    {promotion.usageCount || 0} / {promotion.quantityLimit || '∞'}
                  </p>
                </div>
                <div className="rounded-lg border bg-slate-50/50 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Thời gian</p>
                  <p className="text-xs font-semibold">
                    {promotion.startDate ? dateFormat(promotion.startDate) : '—'}
                    {' → '}
                    {promotion.endDate ? dateFormat(promotion.endDate) : '—'}
                  </p>
                </div>
              </div>

              {/* Sản phẩm & Quà tặng */}
              {hasProducts && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Sản phẩm áp dụng / Quà tặng</h2>
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
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
              )}

              {/* Nhóm sản phẩm */}
              {hasProductGroup && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Sản phẩm áp dụng</h2>
                  <div className="flex items-center text-sm rounded-lg border p-3">
                    <PackageSearch className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Đơn vị sản phẩm:</span>
                    <span className="font-medium">{promotion.conditions.unit}</span>
                  </div>
                </div>
              )}

              {/* Nhóm khách hàng */}
              {hasCustomerGroup && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Nhóm khách hàng áp dụng</h2>
                  <div className="flex items-center text-sm rounded-lg border p-3">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Loại KH:</span>
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

              {/* Khách hàng cụ thể */}
              {hasSpecificCustomer && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Khách hàng áp dụng</h2>
                  <div className="flex items-center text-sm rounded-lg border p-3">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground mr-2">Khách hàng:</span>
                    <span
                      className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline underline-offset-2"
                      onClick={() => handleCustomerClick(promotion.conditions.customer_id)}
                    >
                      {getCustomerName(promotion.conditions.customer_id)}
                    </span>
                  </div>
                </div>
              )}

              {/* Empty state if no products/customers sections */}
              {!hasProducts && !hasProductGroup && !hasCustomerGroup && !hasSpecificCustomer && (
                <div className="text-center text-muted-foreground py-8">
                  Áp dụng cho tất cả đơn hàng
                </div>
              )}
            </div>

            {/* Sidebar - Right Side */}
            <div className="w-full rounded-lg border p-4 lg:w-72">
              <div className="flex items-center justify-between">
                <h2 className="py-2 text-lg font-semibold">Khuyến mãi</h2>
              </div>
              <div className="space-y-6">
                {/* Avatar + Tên */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      <Percent className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{promotion.promotionName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {promotion.promotionCode}
                    </div>
                  </div>
                </div>

                {/* Thông tin */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Thông tin khuyến mãi</div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Hash className="h-4 w-4" />
                      </div>
                      <span>{promotion.promotionCode}</span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Tag className="h-4 w-4" />
                      </div>
                      <span>{type?.label || promotion.promotionType}</span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Layers className="h-4 w-4" />
                      </div>
                      <span>{applicableTo?.label || promotion.applicableTo}</span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className={cn(statusColors[promotion.status] || 'bg-gray-100', 'text-xs')}>
                        {status?.label || promotion.status}
                      </Badge>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <span className="text-orange-600 font-semibold">
                        {promotion.minOrderValue ? formatCurrency(promotion.minOrderValue) : 'Không yêu cầu'}
                      </span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <ShoppingCart className="h-4 w-4" />
                      </div>
                      <span>{promotion.usageCount || 0} / {promotion.quantityLimit || 'Không giới hạn'}</span>
                    </div>

                    {promotion.conditions?.buy_quantity && (
                      <div className="flex items-center text-primary hover:text-secondary-foreground">
                        <div className="mr-2 h-4 w-4">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <span>Mua SL (X): {promotion.conditions.buy_quantity}</span>
                      </div>
                    )}

                    {(promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity) && (
                      <div className="flex items-center text-primary hover:text-secondary-foreground">
                        <div className="mr-2 h-4 w-4">
                          <Gift className="h-4 w-4" />
                        </div>
                        <span>Tặng SL (Y): {promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity}</span>
                      </div>
                    )}

                    {/* Thời gian */}
                    <div className="my-2 border-t" />
                    <div className="font-medium text-sm mb-2">Thời gian</div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <span>Từ: {promotion.startDate ? dateFormat(promotion.startDate) : 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <span>
                        {promotion.promotionType === "gift" ? "Hạn chót: " : "Đến: "}
                        {promotion.endDate ? dateFormat(promotion.endDate) : 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Clock className="h-4 w-4" />
                      </div>
                      <span>Tạo: {promotion.createdAt ? dateFormat(promotion.createdAt) : 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:space-x-0 gap-2">
          <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            {promotion.status === 'pending' && (
              <Can permission="UPDATE_PROMOTION">
                <Button
                  size="sm"
                  type="button"
                  onClick={() => setShowUpdateDialog(true)}
                  className="gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Chỉnh sửa
                </Button>
              </Can>
            )}
            <DialogClose asChild>
              <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </div>
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
        <ViewProductDialog
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
