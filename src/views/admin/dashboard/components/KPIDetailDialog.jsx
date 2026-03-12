import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../../../components/ui/dialog'
import { Loader2, TrendingUp, ShoppingBag, CreditCard, Activity, AlertTriangle, CheckCircle2, Clock, PhoneMissed, TrendingDown, Eye } from 'lucide-react'
import { Button } from '../../../../components/ui/button'
import api from '../../../../utils/axios'

// Page imports moved to DashboardPage (for PagePreviewDialog rendering)

// Safe Vietnamese money formatter (handles Prisma Decimal / BigInt)
const vndFormat = (value) => {
    const num = typeof value === 'bigint' ? Number(value) : Number(value || 0)
    if (isNaN(num)) return '0 đ'
    return new Intl.NumberFormat('vi-VN').format(Math.round(num)) + ' đ'
}

// Recharts
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export const KPIDetailDialog = ({ open, type, onClose, onOpenPreview }) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (open && type) {
            setError(null)
            fetchDetailData(type)
        } else {
            setData(null)
            setError(null)
        }
    }, [open, type])

    const fetchDetailData = async (kpiType) => {
        setLoading(true)
        try {
            let finalData = {
                chartData: null,
                listData: [],
                timestamp: new Date().toISOString()
            }

            switch (kpiType) {
                case 'revenue': {
                    const revRes = await api.get('/reports/dashboard/revenue')
                    const orderRes = await api.get('/reports/dashboard/recent-orders?limit=5')
                    finalData.chartData = revRes.data?.data?.data || []
                    finalData.listData = orderRes.data?.data || []
                    break
                }
                case 'orders':
                case 'pending_orders': {
                    const res = await api.get('/reports/dashboard/recent-orders?limit=10')
                    // if pending_orders, maybe filter locally or backend
                    let list = res.data?.data || []
                    if (kpiType === 'pending_orders') list = list.filter(o => o.orderStatus === 'pending')
                    finalData.listData = list
                    break
                }
                case 'debt':
                case 'overdue_debts': {
                    const res = await api.get('/reports/dashboard/overdue-debts')
                    finalData.listData = res.data?.data || []
                    break
                }
                case 'production':
                case 'delayed_production': {
                    // /api/production-orders chưa có route riêng — dùng report stats để lấy data production
                    try {
                        const res = await api.get('/reports/dashboard/stats')
                        const statsData = res.data?.data
                        // Nếu có production data trong stats thì dùng, ngược lại để list rỗng
                        let list = statsData?.production_orders || statsData?.recent?.production_orders || []
                        if (kpiType === 'production') list = list.filter(o => o.status === 'in_progress' || o.status === 'active')
                        if (kpiType === 'delayed_production') list = list.filter(o => o.status === 'delayed' || o.status === 'overdue')
                        finalData.listData = list
                    } catch {
                        finalData.listData = []
                    }
                    break
                }
                case 'low_stock':
                case 'expiring': {
                    const res = await api.get('/reports/dashboard/stats')
                    finalData.listData = res.data?.data?.alerts?.low_stock || []
                    break
                }
            }

            setData(finalData)
        } catch (error) {
            console.error('Failed to fetch KPI details:', error)
            setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối server.')
        } finally {
            setLoading(false)
        }
    }

    const getKpiTitle = (kpiType) => {
        switch (kpiType) {
            case 'revenue': return 'Chi tiết Doanh thu thuần'
            case 'orders': return 'Chi tiết Đơn hàng'
            case 'debt': return 'Chi tiết Công nợ phải thu'
            case 'production': return 'Lệnh SX đang chạy'
            case 'low_stock': return 'Danh sách Tồn kho thấp'
            case 'pending_orders': return 'Danh sách Đơn hàng cần duyệt'
            case 'expiring': return 'Sắp hết hạn'
            case 'overdue_debts': return 'Công nợ quá hạn'
            case 'delayed_production': return 'Lệnh SX trễ tiến độ'
            default: return 'Chi tiết KPI'
        }
    }

    const getKpiIcon = (kpiType) => {
        switch (kpiType) {
            case 'revenue': return <TrendingUp className="h-5 w-5 text-blue-500" />
            case 'orders': return <ShoppingBag className="h-5 w-5 text-indigo-500" />
            case 'debt': return <CreditCard className="h-5 w-5 text-orange-500" />
            case 'production': return <Activity className="h-5 w-5 text-emerald-500" />
            case 'low_stock': return <AlertTriangle className="h-5 w-5 text-red-500" />
            case 'pending_orders': return <CheckCircle2 className="h-5 w-5 text-blue-500" />
            case 'expiring': return <Clock className="h-5 w-5 text-orange-500" />
            case 'overdue_debts': return <PhoneMissed className="h-5 w-5 text-red-500" />
            case 'delayed_production': return <TrendingDown className="h-5 w-5 text-purple-600" />
            default: return null
        }
    }

    const handleNavigate = () => {
        let preview = null
        switch (type) {
            case 'revenue':
                preview = { pageKey: 'revenue-report', title: 'Báo cáo Doanh thu', route: '/revenue' }; break;
            case 'orders':
            case 'pending_orders':
                preview = { pageKey: 'invoice', title: 'Quản lý Đơn bán', route: '/invoice' }; break;
            case 'debt':
            case 'overdue_debts':
                preview = { pageKey: 'customer-debt', title: 'Công nợ Khách hàng', route: '/customer-debt' }; break;
            case 'production':
            case 'delayed_production':
                preview = { pageKey: 'production-report', title: 'Báo cáo Sản xuất', route: '/production-report' }; break;
            case 'low_stock':
            case 'expiring':
                preview = { pageKey: 'warehouse', title: 'Quản lý Kho', route: '/warehouse-list' }; break;
            default: break;
        }
        if (preview && onOpenPreview) {
            onClose() // Đóng KPIDetailDialog trước
            onOpenPreview(preview)
        }
    }

    const renderChart = () => {
        if (!data?.chartData || data.chartData.length === 0) return null
        return (
            <div className="h-40 w-full mb-6 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenueDialog" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip
                            formatter={(value) => [`${new Intl.NumberFormat('vi-VN').format(value)} ₫`, 'Doanh thu']}
                            labelFormatter={(label) => `Ngày: ${label}`}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenueDialog)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )
    }

    const renderList = () => {
        if (!data?.listData || data.listData.length === 0) {
            return <div className="text-center text-sm text-muted-foreground py-8">Không có danh sách dữ liệu liên quan.</div>
        }

        // Render specific lists based on type
        if (type === 'revenue' || type === 'orders' || type === 'pending_orders') {
            return (
                <div className="space-y-2 max-h-[250px] overflow-auto pr-2">
                    {data.listData.map((order, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg text-sm">
                            <div>
                                <p className="font-medium text-primary">{order.orderCode || order.order_code}</p>
                                <p className="text-xs text-muted-foreground">{order.customer?.customerName || order.customer_name || 'Khách lẻ'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{vndFormat(order.totalAmount || order.total_amount)}</p>
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground">{order.orderStatus || order.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (type === 'debt' || type === 'overdue_debts') {
            return (
                <div className="space-y-2 max-h-[250px] overflow-auto pr-2">
                    {data.listData.map((c, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg text-sm">
                            <div>
                                <p className="font-medium text-foreground">{c.customer_name || c.customerName}</p>
                                <p className="text-xs text-muted-foreground">{c.phone}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-500">{vndFormat(c.total_debt || c.currentDebt)}</p>
                                {c.days_overdue && <p className="text-xs text-muted-foreground">Trễ {c.days_overdue} ngày</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (type === 'low_stock' || type === 'expiring') {
            return (
                <div className="space-y-2 max-h-[250px] overflow-auto pr-2">
                    {data.listData.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg text-sm">
                            <div>
                                <p className="font-medium inline-block max-w-[200px] truncate" title={p.product_name || p.productName}>{p.product_name || p.productName}</p>
                                <p className="text-xs text-muted-foreground">{p.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-orange-600">Tồn: {p.current_stock || p.available_quantity || p.quantity}</p>
                                <p className="text-xs text-muted-foreground">Min: {p.min_stock || p.minStockLevel || 0}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (type === 'production' || type === 'delayed_production') {
            return (
                <div className="space-y-2 max-h-[250px] overflow-auto pr-2">
                    {data.listData.map((po, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-background border rounded-lg text-sm">
                            <div>
                                <p className="font-medium text-primary">{po.orderCode}</p>
                                <p className="text-xs text-muted-foreground">Thiết kế: {po.designCode}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">SL: {po.targetQuantity}</p>
                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{po.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }

        return null
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
                <div className="p-6 pb-2">
                    <DialogHeader>
                        <div className="flex items-center gap-2">
                            {getKpiIcon(type)}
                            <DialogTitle className="text-lg">{getKpiTitle(type)}</DialogTitle>
                        </div>
                        <DialogDescription>
                            Dữ liệu thực tế được lấy trực tiếp từ hệ thống.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="px-6 pb-6 pt-2 bg-muted/10 min-h-[200px] flex flex-col">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                            <p>Đang tải dữ liệu thực tế từ backend...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center text-red-500 py-12">
                            <AlertTriangle className="h-8 w-8 mb-3" />
                            <p className="text-sm text-center">{error}</p>
                            <Button variant="outline" size="sm" className="mt-4" onClick={() => fetchDetailData(type)}>Thử lại</Button>
                        </div>
                    ) : data ? (
                        <div className="w-full text-left flex flex-col pt-2">
                            {/* Render Trend Chart if it exists */}
                            {renderChart()}

                            {/* Render List View */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h4 className="text-sm font-semibold text-foreground">Danh sách liên quan</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Cập nhật: {new Date(data.timestamp).toLocaleTimeString('vi-VN')}
                                    </p>
                                </div>
                                {renderList()}
                            </div>

                            <Button onClick={handleNavigate} className="mt-6 flex items-center justify-center gap-2 w-full">
                                <Eye className="h-4 w-4" />
                                Xem trang quản lý đầy đủ
                            </Button>
                        </div>
                    ) : (
                        <div className="text-muted-foreground text-center py-12">Không có dữ liệu.</div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
