import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { moneyFormat } from '../../../../utils/money-format'
import { DashboardProductDetailDialog } from './dialogs/DashboardProductDetailDialog'

export const TopProductsTable = ({ products = [], onOpenDialog }) => {
    const [selectedProduct, setSelectedProduct] = useState(null)

    return (
        <div className="p-4 bg-card border shadow-sm rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500"><path d="M1.5 13.5C1.5 13.7761 1.72386 14 2 14H13C13.2761 14 13.5 13.7761 13.5 13.5C13.5 13.2239 13.2761 13 13 13H2C1.72386 13 1.5 13.2239 1.5 13.5ZM1.5 8.5C1.5 8.77614 1.72386 9 2 9H13C13.2761 9 13.5 8.77614 13.5 8.5C13.5 8.22386 13.2761 8 13 8H2C1.72386 8 1.5 8.22386 1.5 8.5ZM1.5 3.5C1.5 3.77614 1.72386 4 2 4H13C13.2761 4 13.5 3.77614 13.5 3.5C13.5 3.22386 13.2761 3 13 3H2C1.72386 3 1.5 3.22386 1.5 3.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    Sản phẩm bán chạy
                </h3>
                <button
                    onClick={() => onOpenDialog && onOpenDialog('revenue')}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    Xem báo cáo <ArrowRight className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-transparent border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">Sản phẩm</th>
                            <th className="px-4 py-3 font-medium">SKU</th>
                            <th className="px-4 py-3 font-medium text-center">Đã bán</th>
                            <th className="px-4 py-3 font-medium text-right">Doanh thu</th>
                            <th className="px-4 py-3 font-medium text-right">Giá trung bình</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    Chưa có dữ liệu bán hàng
                                </td>
                            </tr>
                        ) : (
                            products.map((product, idx) => (
                                <tr key={product.id || product.productId || product.product_id || `product-${idx}`} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                    <td className="px-4 py-3 font-medium text-muted-foreground">{idx + 1}</td>
                                    <td className="px-4 py-3 font-medium">
                                        <span className="line-clamp-1">{product.name || product.productName || product.product_name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.sku || product.productCode || '-'}</td>
                                    <td className="px-4 py-3 text-center font-medium">{product.sold || product.quantitySold || product.total_quantity || 0}</td>
                                    <td className="px-4 py-3 text-right text-primary">{moneyFormat(product.revenue || product.totalRevenue || product.total_revenue || 0)}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">
                                        {product.averagePrice || product.average_price ? moneyFormat(product.averagePrice || product.average_price) :
                                            ((product.revenue || product.totalRevenue || product.total_revenue || 0) / (product.sold || product.quantitySold || product.total_quantity || 1)).toFixed(0) + ' ₫'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DashboardProductDetailDialog
                open={!!selectedProduct}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    )
}
