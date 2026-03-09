import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getPurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getColumns } from './components/Column'
import PurchaseOrderDataTable from './components/PurchaseOrderDataTable'
import PurchaseOrderDialog from './components/PurchaseOrderDialog'
import ViewPurchaseOrderDialog from './components/ViewPurchaseOrderDialog'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  format,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'
import { useDebounce } from '@/hooks/useDebounce'

const PurchaseOrderPage = () => {
  const dispatch = useDispatch()
  const purchaseOrders = useSelector((state) => state.purchaseOrder.purchaseOrders)
  const loading = useSelector((state) => state.purchaseOrder.loading)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  // Pagination state
  const pagination = useSelector((state) => state.purchaseOrder.pagination)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const [viewPurchaseOrderId, setViewPurchaseOrderId] = useState(null)
  const [updatePurchaseOrderId, setUpdatePurchaseOrderId] = useState(null)
  const [showUpdatePurchaseOrderDialog, setShowUpdatePurchaseOrderDialog] = useState(false)

  const [columnFilters, setColumnFilters] = useState([])

  const columns = useMemo(() => getColumns(setViewPurchaseOrderId), [])

  useEffect(() => {
    document.title = 'Danh sách đơn đặt hàng'
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value
    const userFilter = columnFilters.find((f) => f.id === 'user')?.value
    const sourceTypeFilter = columnFilters.find((f) => f.id === 'sourceType')?.value

    const apiFilters = {
      ...filters,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter,
      creator: userFilter,
      type: sourceTypeFilter?.[0] ?? undefined,
    }
    dispatch(getPurchaseOrders(apiFilters))
  }, [dispatch, filters, pageIndex, pageSize, debouncedSearch, columnFilters])

  const handlePurchaseOrderCreated = (newPurchaseOrder) => {
    if (newPurchaseOrder?.id) {
      setViewPurchaseOrderId(newPurchaseOrder.id)
      setViewPurchaseOrderId(newPurchaseOrder.id)
      // Refresh the list as Create Action in Slice might only refresh my-purchase-orders
      const apiFilters = {
        ...filters,
        fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
        toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
        page: pageIndex + 1,
        limit: pageSize,
        search: debouncedSearch
      }
      dispatch(getPurchaseOrders(apiFilters))
    }
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách đơn đặt hàng
            </h2>
          </div>
          <div className="w-full sm:w-auto">
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setPageIndex(0) // Reset to first page
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
          {purchaseOrders && (
            <PurchaseOrderDataTable
              data={purchaseOrders}
              columns={columns}
              loading={loading}
              onCreated={handlePurchaseOrderCreated}
              onView={setViewPurchaseOrderId}
              // Server-side pagination props
              pageCount={pagination?.last_page || 1}
              pagination={{
                pageIndex,
                pageSize,
              }}
              onPaginationChange={({ pageIndex, pageSize }) => {
                setPageIndex(pageIndex)
                setPageSize(pageSize)
              }}
              onSearchChange={(value) => {
                setSearch(value)
                setPageIndex(0) // Reset to first page on search
              }}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
          )}
        </div>

        {/* Auto-open ViewPurchaseOrderDialog from creation */}
        {viewPurchaseOrderId && (
          <ViewPurchaseOrderDialog
            open={!!viewPurchaseOrderId}
            onOpenChange={(open) => {
              if (!open) {
                setViewPurchaseOrderId(null)
              }
            }}
            purchaseOrderId={viewPurchaseOrderId}
            showTrigger={false}
            onEdit={() => {
              setUpdatePurchaseOrderId(viewPurchaseOrderId)
              setViewPurchaseOrderId(null)
              setTimeout(() => {
                setShowUpdatePurchaseOrderDialog(true)
              }, 100)
            }}
            onRefresh={() => dispatch(getPurchaseOrders(filters))}
          />
        )}

        {/* Update Purchase Order Dialog */}
        {showUpdatePurchaseOrderDialog && updatePurchaseOrderId && (
          <PurchaseOrderDialog
            open={showUpdatePurchaseOrderDialog}
            onOpenChange={setShowUpdatePurchaseOrderDialog}
            purchaseOrderId={updatePurchaseOrderId}
            showTrigger={false}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default PurchaseOrderPage
