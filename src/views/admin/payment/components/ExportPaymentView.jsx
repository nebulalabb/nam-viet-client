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
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status ?? ''
  }
}

const ExportPaymentView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const fromDate = dateFormat(props.fromDate)
  const toDate = dateFormat(props.toDate)

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Danh sách phiếu chi', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportPaymentTable')

    worksheet.mergeCells('A1:O1')
    worksheet.getCell('A1').value =
      `Báo cáo danh sách phiếu chi từ ${fromDate} đến ${toDate}`

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
    // C Loại KH/NCC
    // D Người nhận
    // E SĐT
    // F Địa chỉ
    // G Lý do
    // H Hình thức
    // I Ngân hàng
    // J Tên TK
    // K Số TK
    // L Số tiền
    // M Ngày thanh toán
    // N Trạng thái
    // O Ghi chú
    const customColumnWidths = [
      6,  // A STT
      22, // B Mã phiếu
      15, // C Loại
      30, // D Người nhận
      15, // E SĐT
      35, // F Địa chỉ
      30, // G Lý do
      15, // H Hình thức
      25, // I Ngân hàng
      25, // J Tên TK
      20, // K Số TK
      18, // L Số tiền
      20, // M Ngày thanh toán
      15, // N Trạng thái
      30, // O Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // Số tiền format (Cột L: 12)
    const numberCols = [12]
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
    a.download = `Báo cáo chi tiết phiếu chi từ ${fromDate} đến ${toDate}.xlsx`
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
          <DialogTitle>Xem trước dữ liệu hóa đơn chi</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportPaymentTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã phiếu</TableHead>
                  <TableHead className="min-w-28">Loại</TableHead>
                  <TableHead className="min-w-40">Người nhận</TableHead>
                  <TableHead className="min-w-28">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Lý do</TableHead>
                  <TableHead className="min-w-28">Hình thức</TableHead>
                  <TableHead className="min-w-40">Ngân hàng</TableHead>
                  <TableHead className="min-w-40">Tên tài khoản</TableHead>
                  <TableHead className="min-w-40">Số tài khoản</TableHead>
                  <TableHead className="min-w-32">Số tiền chi</TableHead>
                  <TableHead className="min-w-32">Ngày thanh toán</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{indexTable++}</TableCell>
                    <TableCell>{payment.code}</TableCell>
                    <TableCell>
                      {payment.receiverType === 'supplier' ? 'Nhà cung cấp' :
                        payment.receiverType === 'customer' ? 'Khách hàng' :
                          payment.receiverType === 'user' ? 'Nhân viên' : 'Khác'}
                    </TableCell>
                    <TableCell>{payment.receiver?.name ?? payment.receiver?.fullName ?? '—'}</TableCell>
                    <TableCell>{payment.receiver?.phone ?? '—'}</TableCell>
                    <TableCell>{payment.receiver?.address ?? '—'}</TableCell>
                    <TableCell>{payment.reason ?? '—'}</TableCell>
                    <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                    <TableCell>{payment.bankName ?? '—'}</TableCell>
                    <TableCell>{payment.bankAccountName ?? '—'}</TableCell>
                    <TableCell>{payment.bankAccountNumber ?? '—'}</TableCell>
                    <TableCell>{moneyFormat(payment.amount, false)}</TableCell>
                    <TableCell>{payment.paymentDate ? dateFormat(payment.paymentDate, false) : '—'}</TableCell>
                    <TableCell>{getPaymentStatusLabel(payment.status)}</TableCell>
                    <TableCell>{payment.note ?? '—'}</TableCell>
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

export default ExportPaymentView
