import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import ViewReceiptDialog from '../../receipt/components/ViewReceiptDialog'
import ViewPaymentDialog from '../../payment/components/ViewPaymentDialog'
import api from '@/utils/axios'

const moneyFmt = (v) =>
  new Intl.NumberFormat('vi-VN').format(v || 0)

const RECEIPT_TYPE_LABELS = {
  sales: 'Thu bán hàng',
  debt_collection: 'Thu nợ',
  refund: 'Hoàn trả',
}

const PAYMENT_TYPE_LABELS = {
  supplier_payment: 'Chi nhà cung cấp',
  salary: 'Chi lương',
  operating_cost: 'Chi phí khác',
  refund: 'Hoàn tiền',
  other: 'Chi khác',
}

const FinancialLedgerTable = ({ data, loading, page, pageSize, onPageChange, onPageSizeChange, filters }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const transactions = data?.transactions || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  if (loading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="divide-y p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="rounded-xl border bg-white dark:bg-gray-900 shadow-sm mt-4">
        <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
          <span className="font-semibold text-sm">Sổ quỹ chi tiết</span>
        </div>
        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <p className="text-sm">Không có dữ liệu trong kỳ này</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {selectedReceipt && (
        <ViewReceiptDialog
          open={!!selectedReceipt}
          onOpenChange={(o) => !o && setSelectedReceipt(null)}
          receiptId={selectedReceipt}
          showTrigger={false}
        />
      )}
      {selectedPayment && (
        <ViewPaymentDialog
          open={!!selectedPayment}
          onOpenChange={(o) => !o && setSelectedPayment(null)}
          paymentId={selectedPayment}
          showTrigger={false}
        />
      )}

      <div className="rounded-xl border bg-white dark:bg-gray-900 overflow-hidden shadow-sm mt-4">
        {/* Header */}
        <div className="px-4 py-2 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hiển thị</span>
            <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
              <SelectTrigger className="h-8 w-16 text-xs bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map(n => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border-b">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 border-b text-xs text-muted-foreground font-bold whitespace-nowrap">
                <th className="px-3 py-3 border-r text-center w-10">STT</th>
                <th className="px-3 py-3 border-r text-left">MÃ</th>
                <th className="px-3 py-3 border-r text-center w-28">PHIẾU NGÀY</th>
                <th className="px-3 py-3 border-r text-center">LOẠI</th>
                <th className="px-3 py-3 border-r text-left min-w-[200px]">NHÀ CUNG CẤP/KHÁCH HÀNG</th>
                <th className="px-3 py-3 border-r text-left min-w-[120px]">ĐỊA CHỈ</th>
                <th className="px-3 py-3 border-r text-left min-w-[250px]">NỘI DUNG</th>
                <th className="px-3 py-3 border-r text-right font-bold w-28">GIÁ TRỊ</th>
                <th className="px-3 py-3 border-r text-left w-32">NV NỘP TIỀN</th>
                <th className="px-3 py-3 border-r text-left w-32">PHỤ TRÁCH BỞI</th>
                <th className="px-3 py-3 border-r text-left w-24">TỈNH/THÀNH</th>
                <th className="px-3 py-3 text-right font-bold w-32 text-blue-800">TỒN QUỸ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {transactions.map((tx, idx) => {
                const globalIdx = (page - 1) * pageSize + idx + 1
                const txDate = tx.datetime ? new Date(tx.datetime) : null
                
                // Loại label (Fallback về loại phiếu nếu ko map được)
                const typeLabel = tx.isReceipt
                  ? (RECEIPT_TYPE_LABELS[tx.voucherType] || 'Thu khác')
                  : (PAYMENT_TYPE_LABELS[tx.voucherType] || 'Chi khác')

                // Type Badge color styling
                const typeColorClass = tx.isReceipt 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-teal-600 hover:bg-teal-700'

                // Amount coloring
                const amountColorClass = tx.isReceipt 
                  ? 'text-green-600' 
                  : 'text-red-500'

                const amountText = tx.isReceipt 
                  ? `+ ${moneyFmt(tx.amount)}` 
                  : `- ${moneyFmt(tx.amount)}`

                const rb = tx.runningBalance || 0
                const rbColorClass = rb >= 0 ? 'text-blue-700' : 'text-red-600'


                return (
                  <tr key={`${tx.type}-${tx.id}`} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors odd:bg-white even:bg-gray-50/50">
                    <td className="px-3 py-2 text-center text-muted-foreground text-xs align-top pt-3">{globalIdx}</td>

                    <td className="px-3 py-2 align-top pt-3">
                      <button
                        className="font-semibold text-red-600 hover:underline text-xs"
                        onClick={() => {
                          if (tx.type === 'receipt') setSelectedReceipt(tx.id)
                          else setSelectedPayment(tx.id)
                        }}
                      >
                        {tx.code}
                      </button>
                    </td>

                    <td className="px-3 py-2 text-center whitespace-nowrap text-xs text-muted-foreground align-top pt-3">
                      {txDate ? (
                        <>
                          <div className="font-medium text-gray-800">{format(txDate, 'dd/MM/yyyy')}</div>
                          <div className="text-gray-500">{format(txDate, 'HH:mm')}</div>
                        </>
                      ) : '—'}
                    </td>

                    <td className="px-3 py-2 text-center align-top pt-3">
                      <Badge className={`text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded shadow-sm border-0 ${typeColorClass}`}>
                        {typeLabel}
                      </Badge>
                    </td>

                    <td className="px-3 py-2 align-top pt-3">
                      <div className="font-bold text-xs text-gray-800 dark:text-gray-200">
                        {tx.partyName?.toUpperCase() || ''}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-xs text-gray-600 truncate max-w-[150px] align-top pt-3" title={tx.address}>
                        {tx.address || ''}
                    </td>

                    <td className="px-3 py-2 text-xs align-top pt-3">
                      <div className="font-bold uppercase text-gray-800 mb-1 leading-tight">{typeLabel.toUpperCase()}</div>
                      <div className="text-gray-500 truncate max-w-[250px]" title={tx.content}>{tx.content || ''}</div>
                    </td>

                    <td className={`px-3 py-2 text-right font-semibold text-sm whitespace-nowrap align-top pt-3 ${amountColorClass}`}>
                      {amountText}
                    </td>

                    <td className="px-3 py-2 text-left text-xs uppercase font-medium text-gray-600 truncate max-w-[120px] align-top pt-3">
                      {tx.creator?.fullName || ''}
                    </td>
                    
                    <td className="px-3 py-2 text-left text-xs text-gray-600 align-top pt-3">
                      {tx.creator?.fullName || ''}
                    </td>

                    <td className="px-3 py-2 text-left text-xs text-gray-600 align-top pt-3">
                      {tx.province || 'Thành phố Hồ Chí Minh'}
                    </td>

                    <td className={`px-3 py-2 text-right font-bold text-sm whitespace-nowrap align-top pt-3 ${rbColorClass}`}>
                      {moneyFmt(Math.abs(rb))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-white flex items-center justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm px-2 text-gray-500">
              Trang {page} / {totalPages || 1}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FinancialLedgerTable
