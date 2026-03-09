
import { DateRange } from '@/components/custom/DateRange'
import EmptyState from '@/components/custom/EmptyState'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPurchaseSummary } from '@/stores/ReportSlice'
import { moneyFormat } from '@/utils/money-format'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import ExportPurchaseReportPreviewDialog from './components/ExportPurchaseReportPreviewDialog'

const PurchaseReportPage = () => {
  const dispatch = useDispatch()
  const { purchaseSummary: data, loading } = useSelector(
    (state) => state.report,
  )
  const [showExportPreview, setShowExportPreview] = useState(false)

  const current = new Date()
  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })

  useEffect(() => {
    dispatch(
      getPurchaseSummary({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      }),
    )
  }, [dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-4 px-1 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Báo cáo tiền mua</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex-1">
              <DateRange
                defaultValue={{
                  from: filters?.fromDate,
                  to: filters?.toDate,
                }}
                onChange={(range) => {
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: range?.from || startOfMonth(current),
                    toDate: range?.to || endOfMonth(current),
                  }))
                }}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full sm:w-auto mt-2 sm:mt-0"
              onClick={() => setShowExportPreview(true)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Báo Cáo
            </Button>
          </div>
        </div>

        {showExportPreview && (
          <ExportPurchaseReportPreviewDialog
            open={showExportPreview}
            onOpenChange={setShowExportPreview}
            data={data?.data}
            filters={filters}
          />
        )}

        <div className="-mx-4 px-1 sm:px-4 flex-1 overflow-auto space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
            <SummaryCard
              title="Tổng đơn mua"
              value={data?.totals?.totalOrders}
              loading={loading}
            />
            <SummaryCard
              title="Tổng tiền mua"
              value={data?.totals?.grandTotalPurchase}
              isMoney
              loading={loading}
            />
            <SummaryCard
              title="Đã thanh toán"
              value={data?.totals?.grandTotalPaid}
              isMoney
              loading={loading}
              className="text-green-600"
            />
            <SummaryCard
              title="Chưa thanh toán"
              value={data?.totals?.grandTotalUnpaid}
              isMoney
              loading={loading}
              className="text-red-600"
            />
          </div>

          {/* Daily Sales Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-secondary">
                <TableRow>
                  <TableHead className="w-[150px]">Ngày</TableHead>
                  <TableHead className="text-center">Số đơn mua</TableHead>
                  <TableHead className="text-right">Tiền mua</TableHead>
                  <TableHead className="text-right">Đã thanh toán</TableHead>
                  <TableHead className="text-right">Chưa thanh toán</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="mx-auto h-4 w-[50px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-4 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="ml-auto h-4 w-[100px]" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.data && data.data.length > 0 ? (
                  data.data.map((item, index) => {
                    const totalPurchase = Number(item.totalPurchase) || 0
                    const totalPaid = Number(item.totalPaid) || 0
                    const unpaid = totalPurchase - totalPaid

                    return (
                      <TableRow key={index}>
                        <TableCell>
                          {format(new Date(item.period), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.orderCount}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {moneyFormat(totalPurchase)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {moneyFormat(totalPaid)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {moneyFormat(unpaid)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      <EmptyState />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

const SummaryCard = ({ title, value, isMoney = false, loading = false, className = '' }) => {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow">
      <div className="p-6 pt-6">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
          {title}
        </h3>
        {loading ? (
          <Skeleton className="h-8 w-[100px] mt-2" />
        ) : (
          <div className={`text-2xl font-bold mt-2 ${className}`}>
            {isMoney ? moneyFormat(Number(value) || 0) : (value || 0)}
          </div>
        )}
      </div>
    </div>
  )
}

export default PurchaseReportPage
