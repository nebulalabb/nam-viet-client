import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { WarehouseReceiptDataTable } from './components/WarehouseReceiptDataTable'
import { getColumns } from './components/Column'
import ViewWarehouseReceiptDialog from './components/ViewWarehouseReceiptDialog'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  format
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'
import { useDebounce } from '@/hooks/useDebounce'
import Can from '@/utils/can'

const WarehouseInPage = () => {
  const dispatch = useDispatch()
  const warehouseReceipts = useSelector(
    (state) => state.warehouseReceipt.warehouseReceipts,
  )
  const paginationMeta = useSelector(
    (state) => state.warehouseReceipt.pagination,
  )
  const loading = useSelector((state) => state.warehouseReceipt.loading)

  const current = new Date()

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 30,
  })

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  const [columnFilters, setColumnFilters] = useState([])

  // Filter only warehouse-in receipts (receiptType = 1)
  const warehouseInReceipts = Array.isArray(warehouseReceipts)
    ? warehouseReceipts
    : warehouseReceipts?.data || []

  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const handleView = useCallback((receipt) => {
    setSelectedReceiptId(receipt.id)
    setShowViewDialog(true)
  }, [])

  const refreshData = useCallback(() => {
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value

    const formattedFilters = {
      ...filters,
      search: debouncedSearch,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      status: statusFilter,
    }
    dispatch(getWarehouseReceipts({ ...formattedFilters, receiptType: 1 }))
  }, [dispatch, filters, debouncedSearch, pagination, columnFilters])

  const columns = useMemo(() => getColumns(handleView, 'import', refreshData), [handleView, refreshData])

  useEffect(() => {
    document.title = 'Danh sách phiếu nhập kho'
    refreshData()
  }, [refreshData])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách phiếu nhập kho
            </h2>
          </div>
          <div>
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  fromDate: range?.from
                    ? addHours(startOfDay(range.from), 12)
                    : addHours(startOfDay(startOfMonth(current)), 12),
                  toDate: range?.to
                    ? addHours(endOfDay(range.to), 0)
                    : addHours(endOfDay(endOfMonth(current)), 0),
                }))
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {warehouseInReceipts && (
            <WarehouseReceiptDataTable
              data={warehouseInReceipts}
              columns={columns}
              loading={loading}
              onRefresh={refreshData}
              onSearchChange={(value) => setSearch(value)}
              pagination={pagination}
              onPaginationChange={setPagination}
              pageCount={paginationMeta?.last_page ?? -1}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
          )}
        </div>

        {showViewDialog && (
          <ViewWarehouseReceiptDialog
            open={showViewDialog}
            onOpenChange={setShowViewDialog}
            receiptId={selectedReceiptId}
            showTrigger={false}
            onSuccess={refreshData}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default WarehouseInPage
