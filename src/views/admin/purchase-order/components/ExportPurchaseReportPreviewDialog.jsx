
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { exportPurchaseReportToExcel } from '@/utils/export-purchase-report'
import { moneyFormat } from '@/utils/money-format'
import { IconDownload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

const ExportPurchaseReportPreviewDialog = ({
  open,
  onOpenChange,
  data,
  filters,
  contentClassName,
  overlayClassName,
}) => {
  const totals = useMemo(() => {
    return (data || []).reduce((acc, item) => {
      const totalPurchase = Number(item.totalPurchase) || 0
      const totalPaid = Number(item.totalPaid) || 0
      const unpaid = totalPurchase - totalPaid
      return {
        orderCount: acc.orderCount + (Number(item.orderCount) || 0),
        totalPurchase: acc.totalPurchase + totalPurchase,
        totalPaid: acc.totalPaid + totalPaid,
        unpaid: acc.unpaid + unpaid,
      }
    }, {
      orderCount: 0,
      totalPurchase: 0,
      totalPaid: 0,
      unpaid: 0,
    })
  }, [data])

  const handleExport = () => {
    if (data) {
      exportPurchaseReportToExcel(data, filters)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:max-w-[80vw] max-h-[90vh] flex flex-col", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xem trước báo cáo tiền mua</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table className="relative w-full">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead className="w-[50px] border-r">STT</TableHead>
                <TableHead className="w-[120px] border-r text-center">Ngày</TableHead>
                <TableHead className="w-[100px] border-r text-center">Số đơn mua</TableHead>
                <TableHead className="border-r text-right">Tiền mua</TableHead>
                <TableHead className="border-r text-right">Đã thanh toán</TableHead>
                <TableHead className="text-right">Chưa thanh toán</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="font-bold bg-muted/50 text-red-600 sticky top-[calc(theme(spacing.10))] z-10 shadow-sm">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center">Cộng</TableCell>
                <TableCell className="border-r text-center">{totals.orderCount}</TableCell>
                <TableCell className="border-r text-right">{moneyFormat(totals.totalPurchase)}</TableCell>
                <TableCell className="border-r text-right">{moneyFormat(totals.totalPaid)}</TableCell>
                <TableCell className="text-right">{moneyFormat(totals.unpaid)}</TableCell>
              </TableRow>

              {data?.map((item, index) => {
                const totalPurchase = Number(item.totalPurchase) || 0
                const totalPaid = Number(item.totalPaid) || 0
                const unpaid = totalPurchase - totalPaid

                return (
                  <TableRow key={index}>
                    <TableCell className="border-r text-center">{index + 1}</TableCell>
                    <TableCell className="border-r text-center">
                      {new Date(item.period).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell className="border-r text-center">{item.orderCount}</TableCell>
                    <TableCell className="border-r text-right">{moneyFormat(totalPurchase)}</TableCell>
                    <TableCell className="border-r text-right text-green-600">{moneyFormat(totalPaid)}</TableCell>
                    <TableCell className="text-right text-red-600">{moneyFormat(unpaid)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        <DialogFooter className="flex gap-2">
          <div className="flex-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
              <IconDownload className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportPurchaseReportPreviewDialog
