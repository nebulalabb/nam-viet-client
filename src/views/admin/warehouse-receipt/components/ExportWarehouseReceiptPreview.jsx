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
import { exportWarehouseReceiptToExcel } from '@/utils/export-warehouse-receipt'
import { moneyFormat } from '@/utils/money-format'
import { IconDownload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const ExportWarehouseReceiptPreview = ({
  open,
  onOpenChange,
  receipt,
  contentClassName,
  overlayClassName,
}) => {
  const handleExport = () => {
    if (receipt) {
      exportWarehouseReceiptToExcel(receipt)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:max-w-4xl", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>
            Chi tiết phiếu {receipt?.receiptType === 1 ? 'nhập kho' : 'xuất kho'}: {receipt?.code}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">STT</TableHead>
                <TableHead>Mã SP</TableHead>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>ĐVT</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Đơn giá</TableHead>
                <TableHead className="text-right">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipt?.details?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.productCode}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.unitName}</TableCell>
                  <TableCell className="text-right">
                    {parseFloat(item.qtyActual || 0).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    {moneyFormat(item.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {moneyFormat(item.totalAmount)}
                  </TableCell>
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
            <Button onClick={handleExport}>
              <IconDownload className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportWarehouseReceiptPreview
