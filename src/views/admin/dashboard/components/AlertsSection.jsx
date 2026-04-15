import React from 'react'
import { AlertTriangle, CheckCircle2, Clock, PhoneMissed, TrendingDown, DollarSign } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const AlertsSection = ({ alerts, loading, onAlertClick }) => {
    const navigate = useNavigate()

    // Provide default fallback structure based on screenshots if alerts prop is empty
    const stockAlertsCount = alerts?.low_stock?.length || 0
    const orderAlertsCount = alerts?.pending_orders?.length || 0
    const expiryAlertsCount = alerts?.expiring?.length || 0
    const debtAlertsCount = alerts?.overdue_debts?.length || 0
    const productionAlertsCount = alerts?.delayed_production?.length || 0
    const cashFund = alerts?.cash_fund || 0

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Box 1: Tồn kho thấp */}
            <div
                onClick={() => onAlertClick ? onAlertClick('low_stock') : navigate('/warehouse-list')}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Tồn kho thấp</h3>
                </div>
                <div className="flex justify-center flex-1 items-center pb-2">
                    {stockAlertsCount > 0 ? (
                        <span className="text-red-500 font-medium">{stockAlertsCount} sản phẩm Tồn kho thấp</span>
                    ) : (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            ✓ Tồn kho ổn định
                        </span>
                    )}
                </div>
            </div>

            {/* Box 2: Đơn hàng cần duyệt */}
            <div
                onClick={() => onAlertClick ? onAlertClick('pending_orders') : navigate('/invoice')}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Đơn hàng cần duyệt</h3>
                </div>
                <div className="flex justify-center flex-1 items-center pb-2">
                    {orderAlertsCount > 0 ? (
                        <span className="text-blue-500 font-medium">{orderAlertsCount} đơn hàng chờ duyệt</span>
                    ) : (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            Không có đơn hàng chờ duyệt
                        </span>
                    )}
                </div>
            </div>

            {/* Box 3: Sắp hết hạn */}
            <div
                onClick={() => onAlertClick ? onAlertClick('expiring') : navigate('/warehouse-list')}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Sắp hết hạn</h3>
                </div>
                <div className="flex justify-center flex-1 items-center pb-2">
                    {expiryAlertsCount > 0 ? (
                        <span className="text-orange-500 font-medium">{expiryAlertsCount} sản phẩm sắp hết hạn</span>
                    ) : (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            Không có sản phẩm sắp hết hạn
                        </span>
                    )}
                </div>
            </div>

            {/* Box 4: Công nợ quá hạn */}
            <div
                onClick={() => onAlertClick ? onAlertClick('overdue_debts') : navigate('/customer-debt')}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-4">
                    <PhoneMissed className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Công nợ quá hạn</h3>
                </div>
                <div className="flex justify-center flex-1 items-center pb-2">
                    {debtAlertsCount > 0 ? (
                        <span className="text-red-500 font-medium">{debtAlertsCount} công nợ quá hạn</span>
                    ) : (
                        <span className="text-muted-foreground text-sm flex items-center gap-1">
                            ✓ Không có công nợ quá hạn
                        </span>
                    )}
                </div>
            </div>

            {/* Box 6: Quỹ tiền mặt hiện tại */}
            <div
                onClick={() => navigate('/financial-report')}
                className="bg-card border rounded-xl p-4 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Quỹ tiền mặt hiện tại</h3>
                </div>
                <div className="flex flex-col justify-center items-center flex-1 pb-2">
                    <span className="text-2xl font-bold text-emerald-500">
                        {new Intl.NumberFormat('vi-VN').format(cashFund)} ₫
                    </span>
                    <span className="text-muted-foreground text-xs mt-1">Số dư hôm nay</span>
                </div>
            </div>
        </div>
    )
}
