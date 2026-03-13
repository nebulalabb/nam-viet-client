import { useState, useEffect } from 'react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/utils/axios'
import { exportSalesReportToExcel } from '@/utils/sales-report-export'

// Import components
import RevenueKPICards from './components/RevenueKPICards'
import RevenueFilters from './components/RevenueFilters'
import RevenueCharts from './components/RevenueCharts'
import RevenueDataTables from './components/RevenueDataTables'
import SalesAdvancedFilters from './components/SalesAdvancedFilters'

const SalesReportPage = () => {
    // Calculate default date range (last 30 days)
    const today = new Date().toISOString().split('T')[0]
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // State management
    const [filters, setFilters] = useState({
        fromDate: thirtyDaysAgo,
        toDate: today,
        groupBy: 'day',
        warehouseId: null,
        salesChannel: null,
        customerId: null,
        createdBy: null,
        orderStatus: null
    })

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch sales report data
    const fetchSalesReport = async () => {
        try {
            setLoading(true)
            setError(null)

            console.log('📡 Fetching sales report with filters:', filters)

            // Build query params
            const params = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
            }

            // Add optional filters if they exist
            if (filters.warehouseId) params.warehouseId = filters.warehouseId
            if (filters.salesChannel) params.salesChannel = filters.salesChannel
            if (filters.customerId) params.customerId = filters.customerId
            if (filters.createdBy) params.createdBy = filters.createdBy
            if (filters.orderStatus) params.orderStatus = filters.orderStatus

            const response = await api.get('/reports/sales', { params })

            console.log('✅ Sales report data:', response.data)

            if (response.data.success) {
                const reportData = response.data.data
                
                // Validate data structure
                if (!reportData) {
                    throw new Error('Dữ liệu trả về không hợp lệ')
                }

                // Add fallbacks for missing data
                const validatedData = {
                    period: reportData.period || { fromDate: filters.fromDate, toDate: filters.toDate, days: 0 },
                    summary: reportData.summary || {
                        netRevenue: 0,
                        netRevenueGrowth: 0,
                        estimatedProfit: 0,
                        profitMargin: 0,
                        totalOrders: 0,
                        cancelledOrders: 0,
                        completedOrders: 0,
                        newDebt: 0,
                        totalDebt: 0,
                        debtPercentage: 0
                    },
                    trends: reportData.trends || [],
                    byChannel: reportData.byChannel || [],
                    topProducts: reportData.topProducts || [],
                    staffPerformance: reportData.staffPerformance || [],
                    topCustomers: reportData.topCustomers || [],
                    orders: reportData.orders || [],
                    productPerformance: reportData.productPerformance || [],
                    customerAnalysis: reportData.customerAnalysis || []
                }

                setData(validatedData)
                
                // Show appropriate message
                if (validatedData.summary.totalOrders === 0) {
                    toast.info('Không có dữ liệu trong khoảng thời gian này')
                } else {
                    toast.success(`Tải thành công ${validatedData.summary.totalOrders} đơn hàng`)
                }
            } else {
                throw new Error(response.data.message || 'Không thể tải dữ liệu')
            }
        } catch (err) {
            console.error('❌ Error fetching sales report:', err)
            const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi tải dữ liệu'
            setError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        console.log('🔍 Filters changed:', newFilters)
        setFilters(prev => ({ ...prev, ...newFilters }))
    }

    // Handle export to Excel
    const handleExportExcel = async () => {
        try {
            toast.info('Đang xuất file Excel...')
            await exportSalesReportToExcel(data, filters)
            toast.success('Xuất Excel thành công!')
        } catch (error) {
            console.error('Error exporting Excel:', error)
            toast.error('Có lỗi khi xuất Excel')
        }
    }

    // Fetch data when filters change
    useEffect(() => {
        fetchSalesReport()
    }, [filters.fromDate, filters.toDate, filters.warehouseId, filters.salesChannel, filters.customerId, filters.createdBy, filters.orderStatus])

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-4 pb-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Báo cáo Bán hàng</h2>
                        <p className="text-muted-foreground">
                            Phân tích hiệu quả bán hàng và khách hàng
                        </p>
                    </div>
                    
                    {/* Export Buttons */}
                    {data && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportExcel}
                                disabled={loading}
                                className="flex items-center gap-2"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Xuất Excel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-4">
                    <RevenueFilters onFilterChange={handleFilterChange} />
                </div>

                {/* Advanced Filters */}
                <div className="mb-6">
                    <SalesAdvancedFilters filters={filters} onFilterChange={handleFilterChange} />
                </div>

                {/* Error State */}
                {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="flex items-center gap-2 py-4">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-600">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* KPI Cards */}
                <div className="mb-6">
                    <RevenueKPICards data={data} isLoading={loading} />
                </div>

                {/* Charts */}
                <div className="mb-6">
                    <RevenueCharts data={data} isLoading={loading} />
                </div>

                {/* Data Tables */}
                <div className="mb-6">
                    <RevenueDataTables data={data} isLoading={loading} />
                </div>

                {/* Debug Info - Only in development */}
                {process.env.NODE_ENV === 'development' && false && (
                    <Card className="mt-4 border-blue-200 bg-blue-50">
                        <CardContent className="py-4">
                            <div className="space-y-2">
                                <p className="text-xs font-mono text-blue-800">
                                    🔧 Debug Info:
                                </p>
                                <p className="text-xs font-mono text-blue-800">
                                    Filters: {JSON.stringify(filters, null, 2)}
                                </p>
                                <p className="text-xs font-mono text-blue-800">
                                    Loading: {loading ? 'Yes' : 'No'}
                                </p>
                                <p className="text-xs font-mono text-blue-800">
                                    Has Data: {data ? 'Yes' : 'No'}
                                </p>
                                {data && (
                                    <p className="text-xs font-mono text-blue-800">
                                        Total Orders: {data.summary?.totalOrders || 0}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </LayoutBody>
        </Layout>
    )
}

export default SalesReportPage
