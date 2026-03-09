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
import ExportInvoiceView from './ExportInvoiceView'
import { IconPresentationAnalytics } from '@tabler/icons-react'

const ExportInvoiceDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const current = new Date()
  const [showExportReview, setShowExportReview] = useState(false)
  const [exportData, setExportData] = useState([])
  const [filters, setFilters] = useState({
    fromDate: startOfDay(startOfMonth(current)),
    toDate: endOfDay(endOfMonth(current)),
  })
  const isMyInvoice = props.isMyInvoice
  const handleReviewExportInvoice = async () => {
    // Gọi api lấy thông tin hóa đơn từ filters.fromDate đến filters.toDate
    try {
      // Kiểm tra page hiện tại là hóa đơn hay hóa đơn của tôi
      const url = isMyInvoice ? '/invoice/by-user' : '/invoice'

      const { data } = await api.get(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
          toDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
          limit: 1000 // Get all records for export
        },
      })

      // Robust extraction similar to slice
      const list = data?.data?.data || data?.data || []

      if (!list.length) {
        toast.warning('Danh sách đơn bán trống')
        return
      }
      setExportData(list)
      setShowExportReview(true)
    } catch (error) {
      console.log('Submit error: ', error)
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
          <DialogTitle>Xuất file excel hóa đơn</DialogTitle>
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
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleReviewExportInvoice}>
            <IconPresentationAnalytics className="mr-2 h-4 w-4" />
            Xem trước
          </Button>
        </DialogFooter>
      </DialogContent>

      {showExportReview && (
        <ExportInvoiceView
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

export default ExportInvoiceDialog
