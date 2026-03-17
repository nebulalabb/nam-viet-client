import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, Clock } from 'lucide-react'

const InventoryDataTable = ({ data, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="h-64 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
        )
    }

    if (!data || !data.data) return null

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(value || 0)
    }

    const formatNumber = (value) => {
        return new Intl.NumberFormat('vi-VN').format(value || 0)
    }

    const getStatusBadges = (item) => {
        const badges = []
        
        if (item.isLowStock) {
            badges.push(
                <span key="low" className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 border border-red-200">
                    <AlertTriangle className="h-3 w-3" />
                    Tồn thấp
                </span>
            )
        }
        
        if (item.isExpiring) {
            badges.push(
                <span key="expiring" className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-800 border border-orange-200">
                    <Clock className="h-3 w-3" />
                    Sắp hết hạn
                </span>
            )
        }

        if (badges.length === 0) {
            return <span className="text-gray-400 text-xs">-</span>
        }

        return <div className="flex flex-wrap gap-1">{badges}</div>
    }

    const inventoryData = data.data || []

    return (
        <Card className="mt-8 shadow-md dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Chi tiết tồn kho
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Danh sách chi tiết sản phẩm trong kho
                        </p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tổng: <span className="font-semibold text-gray-900 dark:text-white">{inventoryData.length}</span> sản phẩm
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto p-6 dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Mã SKU
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Tên sản phẩm
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Kho
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Danh mục
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Số lượng
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Đơn giá
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Giá trị
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {inventoryData.map((item, index) => (
                                <tr key={`${item.productId}-${item.warehouseId}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        {item.sku}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.productName}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.warehouseName}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                        {item.categoryName || '-'}
                                    </td>
                                    <td className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                                        item.isLowStock 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-gray-900 dark:text-white'
                                    }`}>
                                        {formatNumber(item.availableQuantity)}
                                        {item.unit && <span className="ml-1 text-xs text-gray-500">({item.unit})</span>}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-400">
                                        {formatCurrency(item.unitPrice)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(item.totalValue)}
                                    </td>
                                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                                        {getStatusBadges(item)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {inventoryData.length === 0 && (
                        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                            Không có dữ liệu tồn kho
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default InventoryDataTable
