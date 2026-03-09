import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import InvoiceDataTable from './components/InvoiceDataTable'
import ViewInvoiceDialog from './components/ViewInvoiceDialog'
import { getMyInvoices } from '@/stores/InvoiceSlice'
import { columns } from './components/Column'
import { useDebounce } from '@/hooks/useDebounce'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  format,
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const MyInvoicePage = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const dispatch = useDispatch()
  const invoices = useSelector((state) => state.invoice.invoices)
  const loading = useSelector((state) => state.invoice.loading)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  // State for ViewInvoiceDialog
  const [viewInvoiceId, setViewInvoiceId] = useState(null)

  const pagination = useSelector((state) => state.invoice.pagination)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [columnFilters, setColumnFilters] = useState([])

  useEffect(() => {
    document.title = `Đơn bán - ${fullName}`

    // Extract status filter
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value

    dispatch(getMyInvoices({
      ...filters,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter,
    }))
  }, [fullName, dispatch, filters, pageIndex, pageSize, debouncedSearch, columnFilters])

  const refreshData = () => {
    // Extract status filter
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value

    dispatch(getMyInvoices({
      ...filters,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter,
    }))
  }

  // Reset page when search changes
  useEffect(() => {
    setPageIndex(0)
  }, [debouncedSearch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách đơn bán: {fullName}
            </h2>
          </div>
          <div className="w-full sm:w-auto">
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
                // Reset to page 1 on filter change
                setPageIndex(0)
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {invoices && (
            <InvoiceDataTable
              data={invoices}
              columns={columns}
              loading={loading}
              isMyInvoice={true}
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
              onView={(id) => setViewInvoiceId(id)}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              onCreated={refreshData}
            />
          )}

          {/* View Dialog */}
          {viewInvoiceId && (
            <ViewInvoiceDialog
              open={!!viewInvoiceId}
              onOpenChange={(open) => {
                if (!open) setViewInvoiceId(null)
              }}
              invoiceId={viewInvoiceId}
              showTrigger={false}
              onSuccess={refreshData}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyInvoicePage
