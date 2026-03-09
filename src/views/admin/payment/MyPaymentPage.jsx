import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getMyPayments } from '@/stores/PaymentSlice'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PaymentDataTable } from './components/PaymentDataTable'
import { columns } from './components/Column'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
  format
} from 'date-fns'
import { DateRange } from '@/components/custom/DateRange.jsx'

const MyPaymentPage = () => {
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const fullName = authUserWithRoleHasPermissions?.fullName
  const dispatch = useDispatch()
  const payments = useSelector((state) => state.payment.payments)
  const loading = useSelector((state) => state.payment.loading)
  const pagination = useSelector((state) => state.payment.pagination)
  const current = new Date()

  // Filters state
  const [filters, setFilters] = useState({
    fromDate: addHours(startOfDay(startOfMonth(current)), 12),
    toDate: addHours(endOfDay(endOfMonth(current)), 0),
  })

  // Pagination state
  const [pageParams, setPageParams] = useState({
    page: 1,
    limit: 20
  })

  useEffect(() => {
    document.title = 'Danh sách phiếu chi của tôi'
    dispatch(getMyPayments({
      ...filters,
      fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
      ...pageParams
    }))
  }, [dispatch, filters, pageParams])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 -mx-4 px-1 flex flex-col sm:mx-0 sm:px-0 sm:flex-row sm:items-center justify-between gap-2">
          <div className="w-full sm:w-auto">
            <h2 className="text-2xl font-bold tracking-tight break-words">
              Danh sách phiếu chi của tôi: {fullName}
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
                setPageParams(prev => ({ ...prev, page: 1 }))
              }}
            />
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-1 sm:px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {payments && (
            <PaymentDataTable
              data={payments}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setPageParams(prev => ({ ...prev, page }))}
              onPageSizeChange={(limit) => setPageParams(prev => ({ ...prev, limit, page: 1 }))}
              isMyPayment={true}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default MyPaymentPage
