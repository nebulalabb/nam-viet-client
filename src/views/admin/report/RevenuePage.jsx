import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import api from '@/utils/axios'
import RevenueKPICards from './components/RevenueKPICards'
import RevenueFilters from './components/RevenueFilters'
import RevenueCharts from './components/RevenueCharts'
import RevenueDataTables from './components/RevenueDataTables'
import { Download } from 'lucide-react'

const RevenuePage = () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [hasAppliedFilter, setHasAppliedFilter] = useState(false)
    const [filters, setFilters] = useState(null)

    const fetchData = async (filterParams) => {
        setLoading(true)
        setError(null)
        try {
            const response = await api.get('/reports/revenue', {
                params: {
                    fromDate: filterParams.fromDate,
                    toDate: filterParams.toDate,
                    groupBy: filterParams.groupBy || 'day'
                }
            })
            console.log('✅ API Response:', response.data)
            setData(response.data.data)
            setHasAppliedFilter(true)
        } catch (err) {
            console.error('❌ API Error:', err)
            setError(err.response?.data?.error?.message || err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (filterParams) => {
        setFilters(filterParams)
        fetchData(filterParams)
    }

    const handleExport = async () => {
        try {
            const params = {}
            if (filters) {
                params.fromDate = filters.fromDate
                params.toDate = filters.toDate
                if (filters.groupBy) params.groupBy = filters.groupBy
            }

            const response = await api.get('/reports/revenue/export', {
                params,
                responseType: 'blob'
            })

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `BaoCaoDoanhThu_${new Date().toISOString().split('T')[0]}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export error:', err)
            alert('Không thể xuất file Excel. Vui lòng thử lại.')
        }
    }

    // Auto load data on mount with default 30 days
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

        const defaultFilters = {
            fromDate: thirtyDaysAgo,
            toDate: today,
            groupBy: 'day'
        }
        setFilters(defaultFilters)
        fetchData(defaultFilters)
    }, []) // Run once on mount

    return (
        <Layout>
            <LayoutBody className="flex flex-col overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Báo cáo Doanh thu</h2>
                        <p className="text-muted-foreground">
                            Phân tích chi tiết doanh thu và hiệu suất kinh doanh
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

                {/* Filters */}
                <div>
                    <RevenueFilters onFilterChange={handleFilterChange} />
                </div>

                {error && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-600"></div>
                                <p className="text-red-700 dark:text-red-400 font-medium">Lỗi: {error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="relative">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-green-600 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900"></div>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                {!loading && data && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-green-600"></div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉ số Tổng quan</h3>
                        </div>
                        <RevenueKPICards data={data} isLoading={loading} />
                    </div>
                )}

                {/* Data Tables */}
                {!loading && data && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-purple-600"></div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chi tiết Dữ liệu</h3>
                        </div>
                        <RevenueDataTables data={data} isLoading={loading} />
                    </div>
                )}

                {/* Charts */}
                {!loading && data && (
                    <div className="space-y-3 pb-8">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-green-600"></div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Biểu đồ Trực quan</h3>
                        </div>
                        <RevenueCharts data={data} isLoading={loading} />
                    </div>
                )}

                {/* No Data State */}
                {!loading && !hasAppliedFilter && (
                    <Card className="border-dashed border-2 dark:bg-gray-800 dark:border-gray-700">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                Vui lòng chọn khoảng thời gian và nhấn "Áp dụng" để xem báo cáo
                            </p>
                        </CardContent>
                    </Card>
                )}
            </LayoutBody>
        </Layout>
    )
}

export default RevenuePage
