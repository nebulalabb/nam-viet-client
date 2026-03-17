import { useState, useEffect } from 'react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '@/utils/axios'

// Import components
import FinancialFilters from './components/FinancialFilters'
import FinancialKPICards from './components/FinancialKPICards'
import FinancialCharts from './components/FinancialCharts'
import FinancialTopPartners from './components/FinancialTopPartners'

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value || 0)
}

const FinancialReportPage = () => {
    // Calculate default date range (current month)
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const fromDate = firstDayOfMonth.toISOString().split('T')[0]
    const toDate = today.toISOString().split('T')[0]

    // State management
    const [filters, setFilters] = useState({
        fromDate,
        toDate
    })

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Fetch financial report data
    const fetchFinancialReport = async () => {
        try {
            setLoading(true)
            setError(null)

            const params = {
                fromDate: filters.fromDate,
                toDate: filters.toDate
            }

            const response = await api.get('/reports/financial', { params })

            if (response.data.success) {
                const reportData = response.data.data

                const validatedData = {
                    period: reportData.period || { fromDate: filters.fromDate, toDate: filters.toDate, days: 0 },
                    kpi: reportData.kpi || {
                        totalReceipts: 0,
                        totalPayments: 0,
                        netCashFlow: 0,
                        openingBalance: 0,
                        closingBalance: 0,
                        receiptGrowth: 0,
                        paymentGrowth: 0,
                        cashFlowGrowth: 0
                    },
                    profitLoss: reportData.profitLoss || {
                        lines: [],
                        totalRevenue: 0,
                        totalExpenses: 0,
                        netProfit: 0
                    },
                    receiptsByType: reportData.receiptsByType || [],
                    paymentsByType: reportData.paymentsByType || [],
                    cashLedger: reportData.cashLedger || [],
                    topCustomers: reportData.topCustomers || [],
                    topSuppliers: reportData.topSuppliers || []
                }

                setData(validatedData)
            }
        } catch (err) {
            console.error('❌ Error fetching financial report:', err)
            setError(err.response?.data?.message || err.message || 'Lỗi khi tải báo cáo tài chính')
        } finally {
            setLoading(false)
        }
    }

    // Fetch data when filters change
    useEffect(() => {
        fetchFinancialReport()
    }, [filters.fromDate, filters.toDate])

    // Export to Excel
    const handleExport = async () => {
        try {
            const params = {
                fromDate: filters.fromDate,
                toDate: filters.toDate
            }

            const response = await api.get('/reports/financial/export', {
                params,
                responseType: 'blob'
            })

            // Nếu server trả JSON/HTML thay vì file Excel thì không lưu thành .xlsx — tránh mở file báo lỗi
            const contentType = (response.headers?.['content-type'] || '').toLowerCase()
            const isExcel = contentType.includes('spreadsheet') || contentType.includes('octet-stream')
            if (!isExcel) {
                const text = await response.data.text()
                if (contentType.includes('application/json')) {
                    try {
                        const json = JSON.parse(text)
                        const msg = json?.message || json?.error?.message || 'Không thể xuất file Excel. Vui lòng thử lại.'
                        alert(msg)
                    } catch {
                        alert('Không thể xuất file Excel. Vui lòng thử lại.')
                    }
                } else {
                    alert('Không thể xuất file Excel. Máy chủ trả về dữ liệu không đúng định dạng. Kiểm tra URL API hoặc khởi động lại server.')
                }
                return
            }

            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `BaoCaoTaiChinh_${filters.fromDate}_${filters.toDate}.xlsx`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Export error:', err)
            let message = 'Không thể xuất file Excel. Vui lòng thử lại.'
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text()
                    const json = JSON.parse(text)
                    message = json?.message || json?.error || message
                } catch (_) {}
            } else if (err.response?.data?.message) {
                message = err.response.data.message
            } else if (err.message) {
                message = err.message
            }
            alert(message)
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col overflow-y-auto">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Báo cáo Tài chính</h2>
                        <p className="text-muted-foreground">
                            Tổng quan tình hình tài chính doanh nghiệp
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

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="font-semibold mb-1">Lỗi khi tải dữ liệu</div>
                            <div className="text-sm">{error}</div>
                            {error.includes('403') && (
                                <div className="text-sm mt-2">
                                    💡 Lỗi 403 Forbidden: Bạn chưa có quyền truy cập.
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Filters */}
                <FinancialFilters 
                    filters={filters}
                    onFilterChange={setFilters}
                    loading={loading}
                />

                {/* KPI Cards */}
                <FinancialKPICards 
                    kpi={data?.kpi}
                    loading={loading}
                />

                {/* Cash Flow Chart - Full Width */}
                <FinancialCharts 
                    data={data}
                    isLoading={loading}
                />

                {/* Bottom Row: Top Partners (Left) + Expense Chart (Right) */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Top Partners - Takes 2 columns */}
                    <div className="md:col-span-2">
                        <FinancialTopPartners 
                            data={data}
                            isLoading={loading}
                        />
                    </div>
                    
                    {/* Expense Chart - Right side */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Cơ cấu chi phí</CardTitle>
                                <p className="text-sm text-muted-foreground">Phân bổ chi phí theo loại</p>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                {data?.paymentsByType?.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie
                                                data={data.paymentsByType}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="amount"
                                                nameKey="displayName"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            >
                                                {data.paymentsByType.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#22c55e', '#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'][index % 6]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        Không có dữ liệu
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default FinancialReportPage
