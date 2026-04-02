import React, { useState } from 'react'
import { ArrowRight, PackageX } from 'lucide-react'
import { DashboardProductDetailDialog } from './dialogs/DashboardProductDetailDialog'

export const LowStockTable = ({ products = [], onOpenDialog }) => {
    const [selectedProduct, setSelectedProduct] = useState(null)

    return (
        <div className="p-4 bg-card border shadow-sm rounded-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <PackageX className="h-4 w-4 text-orange-500" />
                    Sản phẩm sắp hết hàng
                </h3>
                <button
                    onClick={() => onOpenDialog && onOpenDialog('low_stock')}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                    Xem tất cả <ArrowRight className="h-3 w-3" />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-transparent border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium">Sản phẩm</th>
                            <th className="px-4 py-3 font-medium">SKU</th>
                            <th className="px-4 py-3 font-medium">Kho</th>
                            <th className="px-4 py-3 font-medium text-right">Tồn kho</th>
                            <th className="px-4 py-3 font-medium text-right">Tồn tối thiểu</th>
                            <th className="px-4 py-3 font-medium text-right">Thiếu</th>
                            <th className="px-4 py-3 font-medium text-center">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <PackageX className="h-8 w-8 text-muted-foreground/50 opacity-50" />
                                        Không có sản phẩm nào sắp hết hàng
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            products.map((product, idx) => (
                                <tr key={product.id || product.product_id || product.sku || `low-stock-${idx}`} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedProduct(product)}>
                                    <td className="px-4 py-3 font-medium">
                                        <span className="line-clamp-1">{product.name || product.product_name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.sku || '-'}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{product.warehouse?.name || product.warehouse_name || '-'}</td>
                                    <td className="px-4 py-3 text-right font-medium text-orange-600">{product.available_quantity || product.stock || 0}</td>
                                    <td className="px-4 py-3 text-right text-muted-foreground">{product.min_stock_level || 0}</td>
                                    <td className="px-4 py-3 text-right text-red-500 font-medium">
                                        {(product.min_stock_level || 0) - (product.available_quantity || product.stock || 0)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-orange-100 text-orange-700">
                                            {product.available_quantity === 0 ? 'Hết hàng' : 'Sắp hết'}
                                        </span>
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
