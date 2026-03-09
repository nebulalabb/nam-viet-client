import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyReceipts } from '@/stores/ReceiptSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ReceiptDataTable } from './components/ReceiptDataTable'
import { columns } from './components/Column'
import { useState } from 'react'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  format
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const MyReceiptPage = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const dispatch = useDispatch()
  const receipts = useSelector((state) => state.receipt.receipts)
  const loading = useSelector((state) => state.receipt.loading)
  const pagination = useSelector((state) => state.receipt.pagination)

  const current = new Date()

  const [filters, setFilters] = useState({
    search: '',
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
    page: 1,
    limit: 20
  })

  useEffect(() => {
    document.title = `Phiếu thu - ${fullName}`
    dispatch(getMyReceipts({
      ...filters,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
    }))
  }, [fullName, dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách phiếu thu: {fullName}
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
                  page: 1, // Reset page on date change
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
          {receipts && (
            <ReceiptDataTable
              data={receipts}
              columns={columns}
              loading={loading}
              isMyReceipt={true}
              pagination={pagination}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              onPageSizeChange={(limit) => setFilters(prev => ({ ...prev, limit, page: 1 }))}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyReceiptPage
