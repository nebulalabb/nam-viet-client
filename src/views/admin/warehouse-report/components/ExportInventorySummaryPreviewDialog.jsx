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
import { exportGeneralInventoryToExcel } from '@/utils/export-general-inventory'
import { moneyFormat } from '@/utils/money-format'
import { IconDownload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'

const ExportInventorySummaryPreviewDialog = ({
  open,
  onOpenChange,
  data,
  filters,
  contentClassName,
  overlayClassName,
}) => {
  const totals = useMemo(() => {
    return data.reduce((acc, item) => {
      return {
        openingQty: acc.openingQty + (item.openingQuantity || 0),
        openingAmount: acc.openingAmount + (item.openingAmount || 0),
        inQty: acc.inQty + (item.quantityIn || 0),
        inAmount: acc.inAmount + (item.amountIn || 0),
        outQty: acc.outQty + (item.quantityOut || 0),
        outAmount: acc.outAmount + (item.amountOut || 0),
        closingQty: acc.closingQty + (item.closingQuantity || 0),
        closingAmount: acc.closingAmount + (item.closingAmount || 0),
      }
    }, {
      openingQty: 0, openingAmount: 0,
      inQty: 0, inAmount: 0,
      outQty: 0, outAmount: 0,
      closingQty: 0, closingAmount: 0
    })
  }, [data])

  const handleExport = () => {
    if (data) {
      exportGeneralInventoryToExcel(data, filters)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:max-w-[90vw] max-h-[90vh] flex flex-col", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xem trước báo cáo tổng hợp nhập xuất tồn</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table className="relative w-full">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead rowSpan={2} className="w-[50px] border-r">STT</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Tên hàng hóa</TableHead>
                <TableHead rowSpan={2} className="w-[80px] border-r">ĐVT</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Tồn đầu</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Nhập</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Xuất</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Tồn</TableHead>
                <TableHead rowSpan={2} className="text-right min-w-[100px]">Đơn giá</TableHead>
              </TableRow>
              <TableRow>
                {/* Tồn đầu */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Nhập */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Xuất */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Tồn */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="font-bold bg-muted/50 text-red-600 sticky top-[calc(theme(spacing.10)*2)] z-10 shadow-sm">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center">Cộng</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r">{totals.openingQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.openingAmount ? moneyFormat(totals.openingAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.inQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.inAmount ? moneyFormat(totals.inAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.outQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.outAmount ? moneyFormat(totals.outAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.closingQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.closingAmount ? moneyFormat(totals.closingAmount) : '-'}</TableCell>

                <TableCell className="text-right"></TableCell>
              </TableRow>

              {data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border-r text-center">{index + 1}</TableCell>
                  <TableCell className="border-r font-medium">{item.product?.name}</TableCell>
                  <TableCell className="border-r text-center">{item.product?.unit?.name}</TableCell>

                  {/* Opening */}
                  <TableCell className="text-right border-r">{item.openingQuantity || 0}</TableCell>
                  <TableCell className="text-right border-r">{moneyFormat(item.openingAmount || 0)}</TableCell>

                  {/* In */}
                  <TableCell className="text-right border-r">{item.quantityIn || 0}</TableCell>
                  <TableCell className="text-right border-r">{moneyFormat(item.amountIn || 0)}</TableCell>

                  {/* Out */}
                  <TableCell className="text-right border-r">{item.quantityOut || 0}</TableCell>
                  <TableCell className="text-right border-r">{moneyFormat(item.amountOut || 0)}</TableCell>

                  {/* Closing */}
                  <TableCell className="text-right border-r font-medium">{item.closingQuantity || 0}</TableCell>
                  <TableCell className="text-right border-r font-medium">{moneyFormat(item.closingAmount || 0)}</TableCell>

                  {/* Unit Price */}
                  <TableCell className="text-right">{moneyFormat(item.averageUnitPrice || 0)}</TableCell>
                </TableRow>
              ))}
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

export default ExportInventorySummaryPreviewDialog
