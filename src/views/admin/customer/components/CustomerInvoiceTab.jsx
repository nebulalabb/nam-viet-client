import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dateFormat } from '@/utils/date-format'
import { CustomerDetailPagination } from './CustomerDetailPagination'
import { getCustomerInvoices } from '@/stores/CustomerSlice'
import { useDispatch } from 'react-redux'
import { statuses, invoiceTypes } from '../data'
import Can from '@/utils/can'
import { toast } from 'sonner'
import { ViewInvoiceDialog } from './ViewInvoiceDialog'

const InvoiceHistoryTab = ({ customerId, dateFrom, dateTo, status }) => {
  const dispatch = useDispatch()
  const [invoices, setInvoices] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalItems, setTotalItems] = useState(0)
  const [summary, setSummary] = useState({ subTotal: 0, amount: 0 })
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)

  useEffect(() => {
    setPage(1)
  }, [dateFrom, dateTo, status])

  useEffect(() => {
    if (!customerId) return

    const params = {
      customerId,
      page,
      limit,
      order: [['createdAt', 'DESC']],
    }

    if (dateFrom) params.dateFrom = new Date(dateFrom).toISOString()
    if (dateTo) params.dateTo = new Date(dateTo).toISOString()
    if (status) params.status = status

    dispatch(getCustomerInvoices(params)).unwrap()
      .then((res) => {
        setInvoices(res.invoices || [])
        setTotalItems(res.total || 0)
        setSummary(
          res.summary || { subTotal: 0, amount: 0, pendingSubtotal: 0 },
        )
      })
      .catch((err) => console.error('Error fetching invoices', err))
  }, [customerId, page, limit, dateFrom, dateTo, status])

  const handleOpenInvoice = (invoiceId) => {
    setSelectedInvoiceId(invoiceId)
    setShowViewInvoiceDialog(true)
  }

  const getInvoiceTypeLabel = (type) => {
    const t = invoiceTypes.find((it) => it.value === type)
    return t?.label || type || 'Không rõ'
  }

  return (
    <>
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <span className="mr-4">
            Tổng doanh thu:{' '}
            <strong>{summary?.subTotal?.toLocaleString()}đ</strong>
          </span>
          <span>
            Tổng đã thanh toán:{' '}
            <strong>
              {(
                parseInt(summary?.amount) - parseInt(summary?.pendingSubtotal)
              ).toLocaleString()}
              đ
            </strong>
          </span>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-secondary text-xs">
              <TableHead className="w-8">TT</TableHead>
              <TableHead className="min-w-36">Mã hóa đơn</TableHead>
              <TableHead className="min-w-28">Ngày</TableHead>
              <TableHead className="min-w-28">Loại</TableHead>
              <TableHead className="min-w-28">Trạng thái</TableHead>
              <TableHead className="min-w-28">Tạm tính</TableHead>
              <TableHead className="min-w-28">Thuế</TableHead>
              <TableHead className="min-w-28">Tổng tiền</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length > 0 ? (
              invoices.map((inv, idx) => (
                <TableRow key={inv.id}>
                  <TableCell>{(page - 1) * limit + idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    <div
                      onClick={() => handleOpenInvoice(inv.id)}
                      className="inline-block cursor-pointer text-primary hover:underline"
                    >
                      {inv.code}
                    </div>
                  </TableCell>
                  <TableCell>{dateFormat(inv.date)}</TableCell>
                  <TableCell className="text-xs">
                    {getInvoiceTypeLabel(inv.type)}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {(() => {
                      const s = statuses.find((st) => st.value === inv.status)
                      return s ? (
                        <>
                          <s.icon className={`h-4 w-4 ${s.color}`} />
                          <span className={`text-sm font-medium ${s.color}`}>
                            {s.label}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Không rõ</span>
                      )
                    })()}
                  </TableCell>
                  <TableCell>{inv.subTotal.toLocaleString()}đ</TableCell>
                  <TableCell>{inv.taxAmount.toLocaleString()}đ</TableCell>
                  <TableCell>{inv.amount.toLocaleString()}đ</TableCell>
                  <TableCell>{inv.note || '-'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  Không có đơn bán
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <CustomerDetailPagination
            page={page}
            limit={limit}
            totalItems={totalItems}
            totalPages={Math.ceil(totalItems / limit)}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </div>
      </div>

      <ViewInvoiceDialog
        open={showViewInvoiceDialog}
        onOpenChange={setShowViewInvoiceDialog}
        invoiceId={selectedInvoiceId}
      />
      {/* Temporarily disabled UpdateInvoiceDialog as the Invoice module is not ported yet */}
    </>
  )
}

export default InvoiceHistoryTab
