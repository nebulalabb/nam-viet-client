import { useState, useEffect, useCallback, useRef } from 'react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import api from '@/utils/axios'

// Components
import FinancialFilters from './components/FinancialFilters'
import FinancialKPICards from './components/FinancialKPICards'
import FinancialCharts from './components/FinancialCharts'
import FinancialTopPartners from './components/FinancialTopPartners'
import FinancialLedgerTable from './components/FinancialLedgerTable'
import ExportFinancialLedgerPreviewDialog from './components/ExportFinancialLedgerPreviewDialog'
import ExportExcelDialog from './components/ExportExcelDialog'

const formatCurrency = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0)

const FinancialReportPage = () => {
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  // ── Filters state ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    fromDate: firstDayOfMonth.toISOString().split('T')[0],
    toDate: today.toISOString().split('T')[0],
  })

  // ── Cash book paginfo ──────────────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // ── Data ───────────────────────────────────────────────────────────────────
  const [cashBook, setCashBook] = useState(null)    // cash-book API result
  const [chartData, setChartData] = useState(null)  // old financial API for charts
  const [loading, setLoading] = useState(false)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [isPreviewPrintOpen, setIsPreviewPrintOpen] = useState(false)
  const [isExcelDialogOpen, setIsExcelDialogOpen]   = useState(false)

  // ── Fetch sổ quỹ (cash-book) ───────────────────────────────────────────────
  const fetchCashBook = useCallback(async (currentFilters, currentPage, currentPageSize) => {
    try {
      setLoading(true)
      setError(null)

      const params = {
        fromDate: currentFilters.fromDate,
        toDate: currentFilters.toDate,
        page: currentPage,
        pageSize: currentPageSize,
      }
      if (currentFilters.customerId)    params.customerId    = currentFilters.customerId
      if (currentFilters.supplierId)    params.supplierId    = currentFilters.supplierId
      if (currentFilters.createdById)   params.createdById   = currentFilters.createdById
      if (currentFilters.receiverName)  params.receiverName  = currentFilters.receiverName
      if (currentFilters.receiverTypes) params.receiverTypes = currentFilters.receiverTypes
      if (currentFilters.voucherType)   params.voucherType   = currentFilters.voucherType

      const res = await api.get('/reports/financial/cash-book', { params })
      if (res.data.success) {
        setCashBook(res.data.data)
      }
    } catch (err) {
      console.error('❌ Cash book fetch error:', err)
      setError(err.response?.data?.message || err.message || 'Lỗi khi tải sổ quỹ')
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch chart data (old endpoint) ────────────────────────────────────────
  const fetchChartData = useCallback(async (currentFilters) => {
    try {
      setChartLoading(true)
      const res = await api.get('/reports/financial', {
        params: { fromDate: currentFilters.fromDate, toDate: currentFilters.toDate },
      })
      if (res.data.success) setChartData(res.data.data)
    } catch (err) {
      console.warn('Chart data error:', err)
    } finally {
      setChartLoading(false)
    }
  }, [])

  // ── Trigger fetches when filters or page changes ───────────────────────────
  useEffect(() => {
    fetchCashBook(filters, page, pageSize)
  }, [filters, page, pageSize, fetchCashBook])

  useEffect(() => {
    fetchChartData(filters)
  }, [filters, fetchChartData])

  // When filters change reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  // ── Export — handled by ExportExcelDialog ─────────────────────────────────

  return (
    <Layout>
      <LayoutBody className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pt-6 h-[calc(100vh-var(--header-height))] pb-10">
        
        {/* Print Preview Dialog */}
        <ExportFinancialLedgerPreviewDialog
            isOpen={isPreviewPrintOpen}
            onClose={() => setIsPreviewPrintOpen(false)}
            filters={filters}
        />

        {/* Excel Export Dialog */}
        <ExportExcelDialog
            isOpen={isExcelDialogOpen}
            onClose={() => setIsExcelDialogOpen(false)}
        />

        {/* Page header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Báo cáo Tài chính</h2>
            <p className="text-muted-foreground text-sm">Sổ quỹ & tổng quan tình hình tài chính</p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPreviewPrintOpen(true)}
              className="flex items-center gap-2 bg-white text-indigo-700 border-2 border-indigo-500 hover:bg-indigo-600 hover:text-white font-medium"
            >
              <Printer className="h-4 w-4" />
              In phiếu
            </Button>
            <Button
              type="button"
              onClick={() => setIsExcelDialogOpen(true)}
              className="flex items-center gap-2 bg-white text-green-700 border-2 border-green-600 hover:bg-green-600 hover:text-white font-medium"
            >
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Lỗi khi tải dữ liệu</div>
              <div className="text-sm">{error}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <FinancialFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        {/* KPI Cards — dùng data từ cash-book API */}
        <FinancialKPICards
          openingBalance={cashBook?.openingBalance}
          totalReceipt={cashBook?.totalReceipt}
          totalPayment={cashBook?.totalPayment}
          closingBalance={cashBook?.closingBalance}
          loading={loading}
        />

        {/* Sổ quỹ chi tiết */}
        <div className="flex-1 mt-4 mb-8">
          <FinancialLedgerTable
            data={cashBook}
            loading={loading}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(ps) => { setPageSize(ps); setPage(1) }}
          />
        </div>

        {/* Charts (existing) */}
        <FinancialCharts
          data={chartData}
          isLoading={chartLoading}
        />

        {/* Bottom Row: Top Partners + Expense Pie */}
        <div className="grid gap-4 md:grid-cols-3 mb-4">
          <div className="md:col-span-2">
            <FinancialTopPartners
              data={chartData}
              isLoading={chartLoading}
            />
          </div>
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cơ cấu chi phí</CardTitle>
                <p className="text-sm text-muted-foreground">Phân bổ chi phí theo loại</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                {chartData?.paymentsByType?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={chartData.paymentsByType}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="displayName"
                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {chartData.paymentsByType.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#22c55e', '#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'][index % 6]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
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
