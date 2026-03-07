import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import ExcelJS from 'exceljs'
import { IconDownload } from '@tabler/icons-react'

const getPaymentMethodLabel = (method) => {
  switch (method) {
    case 'cash':
      return 'Tiền mặt'
    case 'transfer':
      return 'Chuyển khoản'
    case 'card':
      return 'Quẹt thẻ'
    default:
      return method ?? ''
  }
}

const getPaymentStatusLabel = (status) => {
  switch (status) {
    case 'completed':
      return 'Hoàn thành'
    case 'draft':
      return 'Nháp'
    case 'canceled':
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status ?? ''
  }
}

const ExportReceiptView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const fromDate = dateFormat(props.fromDate)
  const toDate = dateFormat(props.toDate)

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Danh sách phiếu thu', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportReceiptTable')

    worksheet.mergeCells('A1:Q1')
    worksheet.getCell('A1').value =
      `Báo cáo danh sách phiếu thu từ ${fromDate} đến ${toDate}`

    const rows = table.querySelectorAll('tr')
    const data = []

    rows.forEach((row) => {
      const rowData = []
      row.querySelectorAll('td, th').forEach((cell) => {
        rowData.push(cell.innerText.trim())
      })
      data.push(rowData)
    })

    data.forEach((row, rowIndex) => {
      const excelRow = worksheet.addRow(row)
      if (rowIndex > 0) {
        excelRow.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
          cell.font = { name: 'Times New Roman', size: 12 }
          cell.alignment = {
            vertical: 'top',
            horizontal: 'left',
            wrapText: true,
          }
        })
      }
    })

    worksheet.getCell('A1').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }

    worksheet.pageSetup = {
      margins: {
        left: 0.5, right: 0.5, top: 0.75, bottom: 0.75,
        header: 0.3, footer: 0.3,
      },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    worksheet.getRow(1).height = 30

    // Cột:
    // A STT
    // B Mã phiếu
    // C Hợp đồng bán
    // D Hóa đơn bán
    // E Loại KH/NCC
    // F Người nộp
    // G SĐT
    // H Địa chỉ
    // I Lý do
    // J Hình thức
    // K Ngân hàng
    // L Tên TK
    // M Số TK
    // N Số tiền
    // O Ngày thanh toán
    // P Trạng thái
    // Q Ghi chú
    const customColumnWidths = [
      6,  // A STT
      22, // B Mã phiếu
      20, // C HĐ Bán
      20, // D Hóa đơn Bán
      15, // E Loại
      30, // F Người nộp
      15, // G SĐT
      35, // H Địa chỉ
      30, // I Lý do
      15, // J Hình thức
      25, // K Ngân hàng
      25, // L Tên TK
      20, // M Số TK
      18, // N Số tiền
      20, // O Ngày thanh toán
      15, // P Trạng thái
      30, // Q Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // Số tiền format (Cột N: 14)
    const numberCols = [14]
    numberCols.forEach((colIdx) => {
      const col = worksheet.getColumn(colIdx)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 2) {
          const rawString = cell.value.replace(/\./g, '').replace(/,/g, '.')
          const numValue = parseFloat(rawString)
          if (!isNaN(numValue)) cell.value = numValue
        }
      })
      col.numFmt = '#,##0'
      worksheet.getColumn(colIdx).alignment = { horizontal: 'right', vertical: 'top' }
    })

    // STT (Cột 1) alignment center
    worksheet.getColumn(1).alignment = { horizontal: 'center', vertical: 'top' }

    // Header array
    worksheet.getRow(2).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = { name: 'Times New Roman', size: 12, bold: true }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      }
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      }
    })
    worksheet.getRow(2).height = 30

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo chi tiết phiếu thu từ ${fromDate} đến ${toDate}.xlsx`
    document.body.appendChild(a)
    a.click()

    onOpenChange(false)
    props.closeExport && props.closeExport(false)
  }

  let indexTable = 1

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

      <DialogContent className="md:h-auto md:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Xem trước dữ liệu hóa đơn thu</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportReceiptTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã phiếu</TableHead>
                  <TableHead className="min-w-32">Mã HĐ/Bán</TableHead>
                  <TableHead className="min-w-32">Mã Hóa đơn</TableHead>
                  <TableHead className="min-w-28">Loại</TableHead>
                  <TableHead className="min-w-40">Người nộp</TableHead>
                  <TableHead className="min-w-28">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Lý do</TableHead>
                  <TableHead className="min-w-28">Hình thức</TableHead>
                  <TableHead className="min-w-40">Ngân hàng</TableHead>
                  <TableHead className="min-w-40">Tên tài khoản</TableHead>
                  <TableHead className="min-w-40">Số tài khoản</TableHead>
                  <TableHead className="min-w-32">Số tiền thu</TableHead>
                  <TableHead className="min-w-32">Ngày thanh toán</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{indexTable++}</TableCell>
                    <TableCell>{receipt.code}</TableCell>
                    <TableCell>{receipt.salesContract?.code ?? '—'}</TableCell>
                    <TableCell>{receipt.invoice?.code ?? '—'}</TableCell>
                    <TableCell>
                      {receipt.receiverType === 'customer' ? 'Khách hàng' :
                        receipt.receiverType === 'supplier' ? 'Nhà cung cấp' :
                          receipt.receiverType === 'user' ? 'Nhân viên' : 'Khác'}
                    </TableCell>
                    <TableCell>{receipt.receiver?.name ?? receipt.receiver?.fullName ?? '—'}</TableCell>
                    <TableCell>{receipt.receiver?.phone ?? '—'}</TableCell>
                    <TableCell>{receipt.receiver?.address ?? '—'}</TableCell>
                    <TableCell>{receipt.reason ?? '—'}</TableCell>
                    <TableCell>{getPaymentMethodLabel(receipt.paymentMethod)}</TableCell>
                    <TableCell>{receipt.bankName ?? '—'}</TableCell>
                    <TableCell>{receipt.bankAccountName ?? '—'}</TableCell>
                    <TableCell>{receipt.bankAccountNumber ?? '—'}</TableCell>
                    <TableCell>{moneyFormat(receipt.amount, false)}</TableCell>
                    <TableCell>{receipt.paymentDate ? dateFormat(receipt.paymentDate, false) : '—'}</TableCell>
                    <TableCell>{getPaymentStatusLabel(receipt.status)}</TableCell>
                    <TableCell>{receipt.note ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            Xuất Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportReceiptView
