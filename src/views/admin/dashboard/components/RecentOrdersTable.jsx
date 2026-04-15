import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { moneyFormat } from '../../../../utils/money-format'
import { DashboardOrderDetailDialog } from './dialogs/DashboardOrderDetailDialog'

export const RecentOrdersTable = ({ orders = [], onOpenDialog }) => {
    const [selectedOrder, setSelectedOrder] = useState(null)

    return (
        <div className="p-4 bg-card border shadow-sm rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-foreground">Đơn hàng gần đây</h3>
                <button
                    onClick={() => onOpenDialog && onOpenDialog('orders')}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    Xem tất cả <ArrowRight className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-transparent border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Mã đơn</th>
                            <th className="px-4 py-3 font-medium">Khách hàng</th>
                            <th className="px-4 py-3 font-medium text-center">Ngày đặt</th>
                            <th className="px-4 py-3 font-medium text-right">Tổng tiền</th>
                            <th className="px-4 py-3 font-medium text-center">Thanh toán</th>
                            <th className="px-4 py-3 font-medium text-right">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    Chưa có đơn hàng nào
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                    <td className="px-4 py-3 font-medium whitespace-nowrap">{order.orderCode || order.order_code || order.id}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{order.customer?.customerName || order.customer?.name || order.customer_name || 'Khách lẻ'}</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{order.createdAt || order.orderDate ? new Date(order.createdAt || order.orderDate).toLocaleDateString('vi-VN') : order.date}</td>
                                    <td className="px-4 py-3 text-right font-medium">{moneyFormat(order.totalAmount || order.final_amount || order.total)}</td>
                                    <td className="px-4 py-3 text-center text-muted-foreground">{order.paymentStatus || order.payment_status || 'Chưa TT'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-1 rounded-full text-[11px] font-medium 
                                            ${order.orderStatus === 'completed' || order.status === 'completed' || order.status === 'Đã giao' ? 'bg-green-100 text-green-700' :
                                                order.orderStatus === 'preparing' || order.status === 'processing' || order.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' :
                                                    order.orderStatus === 'pending' || order.status === 'pending' || order.status === 'Chờ duyệt' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                            {order.orderStatus || order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DashboardOrderDetailDialog
                open={!!selectedOrder}
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    )
}
