import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'
import { applicableToOptions, promotionStatuses, promotionTypes } from '../data'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import CustomerDetailDialog from '../../customer/components/CustomerDetailDialog'

export function PromotionDetailDialog({ open, onOpenChange, promotion }) {
    const [products, setProducts] = useState([])
    const [customers, setCustomers] = useState([])
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [showCustomerModal, setShowCustomerModal] = useState(false)

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

    const getCustomerName = (id) => {
        if (!id) return ''
        const customer = customers.find(c => c.id === Number(id))
        return customer ? customer.customerName || customer.name || `ID: ${id}` : `ID: ${id}`
    }

    if (!promotion) return null

    const type = promotionTypes.find((t) => t.value === promotion.promotionType)
    const status = promotionStatuses.find((s) => s.value === promotion.status)
    const applicableTo = applicableToOptions.find((a) => a.value === promotion.applicableTo)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span>Chi tiết khuyến mãi</span>
                        <Badge variant={status?.variant || 'outline'}>{status?.label || promotion.status}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Mã KM: <strong className="text-foreground">{promotion.promotionCode}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 md:grid-cols-2 text-sm">
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Tên chương trình:</span>
                        <p className="font-medium">{promotion.promotionName}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Loại khuyến mãi:</span>
                        <p className="font-medium">{type?.label || promotion.promotionType}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Thời gian bắt đầu:</span>
                        <p className="font-medium">{promotion.startDate ? dateFormat(promotion.startDate) : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">{promotion.promotionType === "gift" ? "Hạn chót:" : "Thời gian kết thúc:"}</span>
                        <p className="font-medium">{promotion.endDate ? dateFormat(promotion.endDate) : '-'}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Phạm vi áp dụng:</span>
                        <p className="font-medium">{applicableTo?.label || promotion.applicableTo}</p>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground">Tổng lượt dùng:</span>
                        <p className="font-medium">
                            {promotion.usageCount} / {promotion.quantityLimit || 'Không giới hạn'}
                        </p>
                    </div>
                    {promotion.applicableTo === 'specific_product' && promotion.products?.[0]?.productId && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Sản phẩm áp dụng:</span>
                            <p className="font-medium">
                                {getProductName(promotion.products[0].productId)}
                                {promotion.conditions?.buy_quantity ? ` (Số lượng: ${promotion.conditions.buy_quantity})` : ''}
                            </p>
                        </div>
                    )}

                    {(promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id) && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Sản phẩm tặng (Gift):</span>
                            <p className="font-medium">
                                {getProductName(promotion.products?.[0]?.giftProductId || promotion.conditions?.gift_product_id)}
                                {(promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity)
                                    ? ` (Số lượng: ${promotion.conditions?.get_quantity || promotion.products?.[0]?.giftQuantity})`
                                    : ''}
                            </p>
                        </div>
                    )}
                    {promotion.applicableTo === 'specific_customer' && promotion.conditions?.customer_id && (
                        <div className="space-y-1">
                            <span className="text-muted-foreground">Khách hàng áp dụng:</span>
                            <p
                                className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer underline underline-offset-2"
                                onClick={() => handleCustomerClick(promotion.conditions.customer_id)}
                            >
                                {getCustomerName(promotion.conditions.customer_id)}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
            {showCustomerModal && selectedCustomer && (
                <CustomerDetailDialog
                    open={showCustomerModal}
                    onOpenChange={setShowCustomerModal}
                    customer={selectedCustomer}
                    showTrigger={false}
                />
            )}
        </Dialog>
    )
}
