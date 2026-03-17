import { useState, useEffect } from 'react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/utils/axios'
import InventoryFilters from './components/InventoryFilters'
import InventoryKPICards from './components/InventoryKPICards'
import InventoryCharts from './components/InventoryCharts'
import InventoryDataTable from './components/InventoryDataTable'
import PermissionDebug from './components/PermissionDebug'

const InventoryReportPage = () => {
    const [filters, setFilters] = useState({
        warehouseId: null,
        categoryId: null,
        searchTerm: '',
        showExpiring: false
    })
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Check permissions
    const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
    const hasAllPermissions = permissions.includes('GET_CATEGORY') && permissions.includes('GET_INVENTORY_REPORT')

    // Fetch inventory report
    const fetchInventoryReport = async () => {
        setLoading(true)
        setError(null)
        try {
            // Build query params
            const params = {}
            if (filters.warehouseId) params.warehouseId = filters.warehouseId
            if (filters.categoryId) params.categoryId = filters.categoryId
            if (filters.searchTerm) params.searchTerm = filters.searchTerm
            if (filters.showExpiring) params.showExpiring = true

            console.log('Fetching inventory report with params:', params)
            const response = await api.get('/reports/inventory', { params })
            console.log('Response:', response.data)
            
            // Check response structure
            if (!response.data || !response.data.data) {
                console.error('Invalid response structure:', response.data)
                throw new Error('Invalid response structure from server')
            }

            const responseData = response.data.data
            const filteredData = responseData.data || []

            console.log('Filtered data:', filteredData.length, 'items')

            setData({
                ...responseData,
                data: filteredData,
                summary: {
                    totalItems: filteredData.length,
                    totalValue: filteredData.reduce((sum, item) => sum + (item.totalValue || 0), 0),
                    totalQuantity: filteredData.reduce((sum, item) => sum + (item.availableQuantity || 0), 0),
                    lowStockItems: filteredData.filter(item => item.isLowStock).length
                }
            })
        } catch (err) {
            console.error('Error fetching inventory report:', err)
            console.error('Error details:', err.response?.data)
            setError(err.response?.data?.message || err.message || 'Không thể tải báo cáo tồn kho')
        } finally {
            setLoading(false)
        }
    }

    // Export to Excel
    const handleExport = async () => {
        try {
            const params = {}
            if (filters.warehouseId) params.warehouseId = filters.warehouseId
            if (filters.categoryId) params.categoryId = filters.categoryId
            if (filters.searchTerm) params.searchTerm = filters.searchTerm
            if (filters.showExpiring) params.showExpiring = true

            const response = await api.get('/reports/inventory/export', {
                params,
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `BaoCaoTonKho_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export error:', err)
            alert('Không thể xuất file Excel. Vui lòng thử lại.')
        }
    }

    // Fetch data when filters change
    useEffect(() => {
        fetchInventoryReport()
    }, [filters])

    return (
        <Layout>
            <LayoutBody className="flex flex-col overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Báo cáo Tồn kho</h2>
                        <p className="text-muted-foreground">
                            Theo dõi tình trạng tồn kho và cảnh báo
                        </p>
                    </div>
                    <Button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-white text-green-700 border-2 border-green-600 hover:bg-green-600 hover:text-white font-medium"
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>

                {/* Permission Debug - chỉ hiện khi thiếu quyền */}
                {!hasAllPermissions && <PermissionDebug />}

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold mb-1">Lỗi khi tải dữ liệu</div>
                            <div className="text-sm">{error}</div>
                            {error.includes('403') && (
                                <div className="text-sm mt-2">
                                    💡 Lỗi 403 Forbidden: Bạn chưa có quyền truy cập. Vui lòng kiểm tra thông tin quyền ở trên.
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <InventoryFilters 
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                />

                {/* KPI Cards */}
                <InventoryKPICards 
                    summary={data?.summary}
                    loading={loading}
                />

                {/* Charts */}
                <InventoryCharts 
                    data={data}
                    isLoading={loading}
                />

                {/* Data Table */}
                <InventoryDataTable 
                    data={data}
                    isLoading={loading}
                />
            </LayoutBody>
        </Layout>
    )
}

export default InventoryReportPage
