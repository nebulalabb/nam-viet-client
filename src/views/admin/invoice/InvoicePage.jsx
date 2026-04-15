import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Button } from '@/components/custom/Button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { getInvoices } from '@/stores/InvoiceSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { columns } from './components/Column'
import InvoiceDataTable from './components/InvoiceDataTable'
import ViewInvoiceDialog from './components/ViewInvoiceDialog'
import InvoiceDialog from './components/InvoiceDialog'
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

const InvoicePage = () => {
  const dispatch = useDispatch()
  const invoices = useSelector((state) => state.invoice.invoices)
  const loading = useSelector((state) => state.invoice.loading)
  const current = new Date()

  const pagination = useSelector((state) => state.invoice.pagination)

  const [searchParams, setSearchParams] = useSearchParams()
  const [viewInvoiceId, setViewInvoiceId] = useState(null)
  const [updateInvoiceId, setUpdateInvoiceId] = useState(null)
  const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(15)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)
  const [columnFilters, setColumnFilters] = useState([])


  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
  })

  // Fetch data when filters or pagination changes
  useEffect(() => {
    document.title = 'Danh sách đơn bán'

    // Extract status and user filters
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value
    const userFilter = columnFilters.find((f) => f.id === 'user')?.value

    // Convert date filters for API
    const apiFilters = {
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pageIndex + 1, // API uses 1-based indexing
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter,
      creator: userFilter
    }

    dispatch(getInvoices(apiFilters))
  }, [dispatch, filters, pageIndex, pageSize, debouncedSearch, columnFilters])

  const refreshData = () => {
    console.log('InvoicePage: refreshData called')
    // Extract status and user filters
    const statusFilter = columnFilters.find((f) => f.id === 'status')?.value
    const userFilter = columnFilters.find((f) => f.id === 'user')?.value

    const apiFilters = {
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      page: pageIndex + 1,
      limit: pageSize,
      search: debouncedSearch,
      status: statusFilter,
      creator: userFilter
    }
    dispatch(getInvoices(apiFilters))
  }

  const handleInvoiceCreated = (newInvoice) => {
    refreshData()
    if (newInvoice?.id) {
      setViewInvoiceId(newInvoice.id)
    }
  }

  // Handle ?view=invoiceId query parameter
  useEffect(() => {
    const viewParam = searchParams.get('view')
    if (viewParam) {
      const invoiceId = parseInt(viewParam, 10)
      if (!isNaN(invoiceId)) {
        setViewInvoiceId(invoiceId)
      }
    }
  }, [searchParams])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách đơn bán
            </h2>
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                setPageIndex(0) // Reset to first page on filter change
                setFilters((prev) => ({
                  ...prev,
                  fromDate: range?.from
                    ? addHours(startOfDay(range.from), 12)
                    : null,
                  toDate: range?.to
                    ? addHours(endOfDay(range.to), 0)
                    : null,
                }))
              }}
            />
            {/* Show clear filter button if any filters are active */}
            {(filters?.fromDate != null || filters?.toDate != null || search || columnFilters.length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFilters({ fromDate: null, toDate: null })
                  setSearch('')
                  setColumnFilters([])
                  setPageIndex(0)
                }}
                className="h-10 px-2 lg:px-3 whitespace-nowrap"
              >
                Bỏ lọc
                <Cross2Icon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <InvoiceDataTable
            data={invoices}
            columns={columns}
            loading={loading}
            onCreated={handleInvoiceCreated}
            onView={(id) => setViewInvoiceId(id)}
            onDeleted={refreshData}

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
            onSuccess={refreshData}
          />
        </div>

        {/* Auto-open ViewInvoiceDialog from QR code scan */}
        {viewInvoiceId && (
          <ViewInvoiceDialog
            open={!!viewInvoiceId}
            onOpenChange={(open) => {
              if (!open) {
                setViewInvoiceId(null)
                // Remove ?view param from URL
                searchParams.delete('view')
                setSearchParams(searchParams)
              }
            }}
            invoiceId={viewInvoiceId}
            showTrigger={false}
            onEdit={() => {
              setUpdateInvoiceId(viewInvoiceId)
              setViewInvoiceId(null)
              searchParams.delete('view')
              setSearchParams(searchParams)
              setTimeout(() => {
                setShowUpdateInvoiceDialog(true)
              }, 100)
            }}
            onSuccess={refreshData}
          />
        )}

        {/* Update Invoice Dialog */}
        {showUpdateInvoiceDialog && updateInvoiceId && (
          <InvoiceDialog
            open={showUpdateInvoiceDialog}
            onOpenChange={setShowUpdateInvoiceDialog}
            invoiceId={updateInvoiceId}
            showTrigger={false}
            onSuccess={refreshData}
          />
        )}
      </LayoutBody>
    </Layout>
  )
}

export default InvoicePage
