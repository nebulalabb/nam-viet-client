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
import { exportDetailedLedgerToExcel } from '@/utils/export-detailed-ledger'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { IconDownload } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const ExportInventoryDetailPreviewDialog = ({
  open,
  onOpenChange,
  data,
  openingBalance,
  filters,
  productName,
  contentClassName,
  overlayClassName,
}) => {
  const handleExport = () => {
    if (data) {
      exportDetailedLedgerToExcel(data, { productName, openingBalance }, filters)
      onOpenChange(false)
    }
  }

  // Calculate totals
  const totalInQty = data?.reduce((sum, item) => sum + (parseFloat(item.qtyIn) || 0), 0) || 0
  const totalInAmount = data?.reduce((sum, item) => sum + (parseFloat(item.amountIn) || 0), 0) || 0
  const totalOutQty = data?.reduce((sum, item) => sum + (parseFloat(item.qtyOut) || 0), 0) || 0
  const totalOutAmount = data?.reduce((sum, item) => sum + (parseFloat(item.amountOut) || 0), 0) || 0
  
  const lastBalanceQty = data?.length > 0 ? data[data.length - 1].balanceQty : (openingBalance?.quantity || 0)
  const lastBalanceAmount = data?.length > 0 ? data[data.length - 1].balanceAmount : (openingBalance?.amount || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("md:max-w-[95vw] max-h-[95vh] flex flex-col", contentClassName)} overlayClassName={overlayClassName}>
        <DialogHeader>
          <DialogTitle>Xem trước sổ chi tiết vật tư - {productName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table className="relative w-full min-w-[1000px]">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead colSpan={2} className="text-center border-r border-b">Chứng từ</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Đối tượng (Diễn giải)</TableHead>
                <TableHead rowSpan={2} className="w-[60px] border-r">ĐVT</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Nhập trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Xuất trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-b">Tồn cuối kỳ</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[100px] border-r">Số</TableHead>
                <TableHead className="w-[100px] border-r">Ngày</TableHead>

                {/* Nhập */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Xuất */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Tồn */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right min-w-[100px]">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Dư đầu */}
              <TableRow className="bg-muted/30">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r font-bold">Dư đầu kỳ</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r font-bold">
                  {openingBalance?.quantity ? parseFloat(openingBalance.quantity) : 0}
                </TableCell>
                <TableCell className="text-right border-r">
                   {openingBalance?.quantity && parseFloat(openingBalance.quantity) !== 0 
                     ? moneyFormat(parseFloat(openingBalance.amount) / parseFloat(openingBalance.quantity)) 
                     : moneyFormat(0)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {openingBalance?.amount ? moneyFormat(openingBalance.amount) : moneyFormat(0)}
                </TableCell>
              </TableRow>

              {data?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="border-r font-medium text-blue-600 font-mono text-xs">{item.documentCode}</TableCell>
                  <TableCell className="border-r whitespace-nowrap">{dateFormat(item.postingDate)}</TableCell>
                  <TableCell className="border-r text-sm">{item.objectName || item.description}</TableCell>
                  <TableCell className="border-r text-center">{item.unit?.name}</TableCell>

                  {/* Nhập */}
                  <TableCell className="text-right border-r font-medium text-green-600">
                    {parseFloat(item.qtyIn) > 0 ? parseFloat(item.qtyIn) : ''}
                  </TableCell>
                  <TableCell className="text-right border-r text-xs">
                    {parseFloat(item.qtyIn) > 0 ? moneyFormat(item.unitCost) : ''}
                  </TableCell>
                  <TableCell className="text-right border-r text-sm">
                    {parseFloat(item.amountIn) > 0 ? moneyFormat(item.amountIn) : ''}
                  </TableCell>

                  {/* Xuất */}
                  <TableCell className="text-right border-r font-medium text-orange-600">
                    {parseFloat(item.qtyOut) > 0 ? parseFloat(item.qtyOut) : ''}
                  </TableCell>
                  <TableCell className="text-right border-r text-xs">
                    {parseFloat(item.qtyOut) > 0 ? moneyFormat(item.unitCost) : ''}
                  </TableCell>
                  <TableCell className="text-right border-r text-sm">
                    {parseFloat(item.amountOut) > 0 ? moneyFormat(item.amountOut) : ''}
                  </TableCell>

                  {/* Tồn */}
                  <TableCell className="text-right border-r font-bold">{parseFloat(item.balanceQty)}</TableCell>
                  <TableCell className="text-right border-r text-xs">{moneyFormat(item.unitCost)}</TableCell>
                  <TableCell className="text-right font-bold text-primary">{moneyFormat(item.balanceAmount)}</TableCell>
                </TableRow>
              ))}

              {/* Cộng */}
              <TableRow className="font-bold bg-muted/50 border-t-2">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center uppercase">Cộng phát sinh</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r text-green-600">{totalInQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-green-700">{moneyFormat(totalInAmount)}</TableCell>

                <TableCell className="text-right border-r text-orange-600">{totalOutQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-orange-700">{moneyFormat(totalOutAmount)}</TableCell>

                <TableCell className="text-right border-r">{lastBalanceQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right text-primary">{moneyFormat(lastBalanceAmount)}</TableCell>
              </TableRow>
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

export default ExportInventoryDetailPreviewDialog
