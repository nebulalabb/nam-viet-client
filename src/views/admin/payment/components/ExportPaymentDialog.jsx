import { Button } from '@/components/custom/Button'
import { DateRange } from '@/components/custom/DateRange'
import { endOfDay, endOfMonth, startOfDay, startOfMonth, format } from 'date-fns'
import { useState } from 'react'
import api from '@/utils/axios'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import ExportPaymentView from './ExportPaymentView'
import { IconPresentationAnalytics } from '@tabler/icons-react'

const ExportPaymentDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  isMyPayment = false,
  ...props
}) => {
  const current = new Date()
  const [showExportReview, setShowExportReview] = useState(false)
  const [exportData, setExportData] = useState([])
  const [filters, setFilters] = useState({
    fromDate: startOfDay(startOfMonth(current)),
    toDate: endOfDay(endOfMonth(current)),
  })
  const [loading, setLoading] = useState(false)

  const handleReviewExport = async () => {
    setLoading(true)
    try {
      const url = isMyPayment ? '/payment-vouchers/my-payment-vouchers' : '/payment-vouchers'

      const { data } = await api.get(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          voucherType: 'payment_out',
          fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
          toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
          limit: 1000,
          page: 1
        },
      })

      const list = data?.data?.data || data?.data || []

      if (!list.length) {
        toast.warning('Danh sách phiếu chi trống')
        return
      }
      setExportData(list)
      setShowExportReview(true)
    } catch (error) {
      console.log('Export fetch error: ', error)
      toast.error('Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:w-[320px]">
        <DialogHeader>
          <DialogTitle>Xuất báo cáo phiếu chi</DialogTitle>
          <DialogDescription>
            Chọn từ ngày đến ngày để xuất file
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div>
            <DateRange
              defaultValue={{
                from: filters?.fromDate,
                to: filters?.toDate,
              }}
              onChange={(range) => {
                const fromDate = range?.from
                  ? startOfDay(range.from)
                  : startOfDay(startOfMonth(current))
                const toDate = range?.to
                  ? endOfDay(range.to)
                  : endOfDay(endOfMonth(current))

                setFilters((prev) => ({
                  ...prev,
                  fromDate,
                  toDate,
                }))
              }}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={loading}>
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleReviewExport} loading={loading}>
            <IconPresentationAnalytics className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
        </DialogFooter>
      </DialogContent>

      {showExportReview && (
        <ExportPaymentView
          open={showExportReview}
          onOpenChange={setShowExportReview}
          showTrigger={false}
          data={exportData}
          fromDate={filters.fromDate}
          toDate={filters.toDate}
          closeExport={onOpenChange}
        />
      )}
    </Dialog>
  )
}

export default ExportPaymentDialog
