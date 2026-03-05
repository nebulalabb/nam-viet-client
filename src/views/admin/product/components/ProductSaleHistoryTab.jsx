import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import api from '@/utils/axios'
import Pagination from '@/components/custom/Pagination'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { Calendar as CalendarIcon, User, FileText } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DatePicker } from '@/components/custom/DatePicker'

const SaleHistoryColGroup = () => (
  <colgroup>
    <col className="w-[140px]" />
    <col className="w-[160px]" />
    <col />
    <col className="w-[100px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
    <col className="w-[120px]" />
  </colgroup>
)

const DateFilterPicker = ({ value, onChange, placeholder, disabled }) => {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-8 text-xs bg-background',
            !value && 'text-muted-foreground'
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5" />
          {value ? dateFormat(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100021]" align="start">
        <DatePicker
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={(date) => {
            if (date) {
              // Format manually to YYYY-MM-DD to avoid timezone shifts
              const year = date.getFullYear()
              const month = String(date.getMonth() + 1).padStart(2, '0')
              const day = String(date.getDate()).padStart(2, '0')
              onChange(`${year}-${month}-${day}`)
            } else {
              onChange('')
            }
            setOpen(false)
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

const ProductSaleHistoryTab = ({ productId }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [totalsByUnit, setTotalsByUnit] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const totalsText = useMemo(() => {
    if (!Array.isArray(totalsByUnit) || totalsByUnit.length === 0) return ''
    return totalsByUnit
      .map((x) => `${x.total} ${x.unitName}`)
      .filter(Boolean)
      .join(' • ')
  }, [totalsByUnit])

  const fetchData = async ({
    pageParam = page,
    fromDateParam = fromDate,
    toDateParam = toDate,
  } = {}) => {
    if (!productId) return

    setLoading(true)
    try {
      const response = await api.get(`/product/${productId}/sale-history`, {
        params: {
          page: pageParam,
          limit,
          fromDate: fromDateParam || undefined,
          toDate: toDateParam || undefined,
        },
      })

      const resData = response.data.data
      setData(resData.data)
      setPagination(resData.pagination)
      setTotalsByUnit(
        Array.isArray(resData.totalsByUnit) ? resData.totalsByUnit : [],
      )
    } catch (error) {
      console.error('Lỗi lấy lịch sử bán:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, fromDate, toDate, productId])

  const handleFilter = () => {
    setPage(1)
  }

  const handleClearFilter = () => {
    setFromDate('')
    setToDate('')
    setPage(1)
  }

  return (
    <div className="min-h-[450px] space-y-4 md:min-h-[460px]">
      <div className={cn(
        "flex flex-wrap items-end gap-3",
        isMobile && "grid grid-cols-2 gap-2"
      )}>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Từ ngày</span>
          <DateFilterPicker
            value={fromDate}
            onChange={setFromDate}
            placeholder="Chọn ngày"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">Đến ngày</span>
          <DateFilterPicker
            value={toDate}
            onChange={setToDate}
            placeholder="Chọn ngày"
          />
        </div>

        <div className={cn("flex gap-2", isMobile && "col-span-2")}>
          <Button onClick={handleFilter} size="sm" className="h-8 text-xs">Lọc</Button>
          {(fromDate || toDate) && (
            <Button variant="outline" onClick={handleClearFilter} size="sm" className="h-8 text-xs">
              Xóa
            </Button>
          )}

          {/* Total Summary - Compact on mobile */}
          <div className="ml-auto flex items-center gap-2 rounded-md border bg-background px-3 py-1 text-xs h-8">
            <span className="text-muted-foreground hidden sm:inline">Tổng:</span>
            {loading ? (
              <span className="text-muted-foreground">...</span>
            ) : totalsText ? (
              <span className="font-medium text-primary">{totalsText}</span>
            ) : (
              <span className="text-muted-foreground">0</span>
            )}
          </div>
        </div>
      </div>


      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Chưa có lịch sử bán
        </div>
      ) : isMobile ? (
        // MOBILE VIEW
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {data.map((item) => {
            const customer = item?.invoice?.customer || {}
            return (
              <div key={item.id} className="rounded-lg border bg-card p-3 shadow-sm space-y-3 text-sm">
                {/* Header: Date & Invoice */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    <span>{dateFormat(item.createdAt, true)}</span>
                  </div>
                  <div className="font-mono font-bold bg-muted px-2 py-0.5 rounded text-xs">
                    {item?.invoice?.code}
                  </div>
                </div>

                {/* Customer */}
                <div className="flex gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-medium truncate">{customer?.name || '—'}</div>
                    {customer?.phone && (
                      <div className="text-xs text-muted-foreground">{customer.phone}</div>
                    )}
                  </div>
                </div>

                {/* Product Details Grid */}
                <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-2 rounded">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Đơn giá</span>
                    <span className="font-medium">{moneyFormat(item.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Số lượng</span>
                    <span className="font-medium">{item.quantity} {item.unitName}</span>
                  </div>
                  {item.taxAmount > 0 && (
                    <div className="col-span-2 flex justify-between border-t border-dashed border-muted-foreground/20 pt-1 mt-1">
                      <span className="text-xs text-muted-foreground">Thuế</span>
                      <span>{moneyFormat(item.taxAmount)}</span>
                    </div>
                  )}
                  <div className="col-span-2 flex justify-between items-center border-t border-muted-foreground/20 pt-2 mt-1">
                    <span className="font-semibold text-muted-foreground">Thành tiền</span>
                    <span className="font-bold text-primary text-base">{moneyFormat(item.total)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // DESKTOP VIEW
        <div className="rounded-md border">
          <Table className="table-fixed">
            <SaleHistoryColGroup />
            <TableHeader>
              <TableRow className="bg-secondary text-xs">
                <TableHead>Ngày bán</TableHead>
                <TableHead>Hóa đơn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">ĐVT</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead className="text-right">Thuế</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          <div className="max-h-[400px] min-h-[400px] overflow-y-auto">
            <Table className="table-fixed">
              <SaleHistoryColGroup />
              <TableBody>
                {data.map((item) => {
                  const customer = item?.invoice?.customer || {}
                  const name = customer?.name
                  const phone = customer?.phone
                  const email = customer?.email
                  const address = customer?.address
                  const taxCode = customer?.taxCode

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="align-top">
                        {dateFormat(item.createdAt, true)}
                      </TableCell>

                      <TableCell className="font-mono align-top text-xs">
                        {item?.invoice?.code}
                      </TableCell>

                      <TableCell className="whitespace-normal align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="break-words font-medium">
                            {name || '—'}
                          </span>

                          {phone ? (
                            <span className="break-words text-xs text-primary">
                              {phone}
                            </span>
                          ) : null}

                          {taxCode ? (
                            <span className="break-words text-xs text-muted-foreground">
                              MST: {taxCode}
                            </span>
                          ) : null}

                          {email ? (
                            <span className="break-words text-xs text-muted-foreground">
                              {email}
                            </span>
                          ) : null}

                          {address ? (
                            <span className="break-words text-xs text-muted-foreground">
                              {address}
                            </span>
                          ) : null}

                          {!phone && !email && !address ? (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          ) : null}
                        </div>
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {item.quantity}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {item.unitName}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {moneyFormat(item.price)}
                      </TableCell>

                      <TableCell className="text-right align-top">
                        {moneyFormat(item.taxAmount)}
                      </TableCell>

                      <TableCell className="text-right align-top font-semibold text-primary">
                        {moneyFormat(item.total)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          totalItems={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}

export default ProductSaleHistoryTab
