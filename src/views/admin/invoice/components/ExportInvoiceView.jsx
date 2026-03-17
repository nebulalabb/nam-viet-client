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
import { useDispatch } from 'react-redux'
import { getSetting } from '@/stores/SettingSlice'

const ExportInvoiceView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const dispatch = useDispatch()
  const fromDate = dateFormat(props.fromDate)
  const toDate = dateFormat(props.toDate)

  const handleExport = async () => {
    // Lấy thông tin công ty
    const response = await dispatch(getSetting('general_information'))
    const { brandName, address, phone, email } = response?.payload?.payload || {}

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Chi tiết hóa đơn', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportTable')

    // === THÔNG TIN CÔNG TY (Row 1 – richText nhiều dòng) === //
    const phoneEmail = []
    if (phone) phoneEmail.push(`SĐT: ${phone}`)
    if (email) phoneEmail.push(`Email: ${email}`)


    worksheet.mergeCells('A1:AC1')
    const companyCell = worksheet.getCell('A1')
    companyCell.value = {
      richText: [
        {
          font: { name: 'Times New Roman', size: 13, bold: true },
          text: brandName ? brandName.toUpperCase() : 'TÊN CÔNG TY',
        },
        {
          font: { name: 'Times New Roman', size: 11 },
          text: address ? `\nĐịa chỉ: ${address}` : '\nĐịa chỉ:',
        },
        {
          font: { name: 'Times New Roman', size: 11 },
          text: phoneEmail.length > 0 ? `\n${phoneEmail.join(' - ')}` : '',
        },
      ],
    }
    companyCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    worksheet.getRow(1).height = 72

    // === TIÊU ĐỀ BÁO CÁO (Row 2) === //
    worksheet.mergeCells('A2:AC2')
    worksheet.getCell('A2').value =
      `Báo cáo danh sách đơn bán từ ${fromDate} đến ${toDate}`

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
        excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
          cell.font = {
            name: 'Times New Roman',
            size: 12,
          }
          cell.alignment = {
            vertical: 'top',
            horizontal: 'right',
            wrapText: true,
          }
        })
      }
    })

    // Style tiêu đề báo cáo (row 2)
    worksheet.getCell('A2').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }
    worksheet.getCell('A2').alignment = {
      vertical: 'middle',
      horizontal: 'left',
      wrapText: true,
    }
    worksheet.getRow(2).height = 26

    worksheet.pageSetup = {
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
      orientation: 'landscape',
      paperSize: 9,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    }
    // row 1 height đã set ở trên khi tạo company cell

    // Chỉnh độ rộng của từng cột
    const customColumnWidths = [
      6,  // A  STT
      22, // B  Mã HĐ
      22, // C  Mã HĐ/Bán
      18, // D  TT HĐ Bán
      25, // E  Khách Hàng
      15, // F  SĐT
      35, // G  Địa chỉ
      20, // H  Người tạo
      30, // I  Sản phẩm
      8,  // J  SL
      10, // K  ĐVT
      15, // L  Giá
      15, // M  Thành tiền
      12, // N  Thuế (%)
      15, // O  Tiền Thuế
      12, // P  Giảm giá (%)
      15, // Q  Tiền giảm giá
      15, // R  Tổng dòng
      15, // S  Tổng cộng
      20, // T  Công nợ
      22, // U  Thanh toán
      28, // V  DS phiếu xuất
      15, // W  Trạng thái
      20, // X  Ngày HĐ
      20, // Y  Ngày tạo
      20, // Z  Giá trị BL
      20, // AA Ngày BL
      20, // AB Còn lại sau BL
      30, // AC Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // B=2,C=3,E=5,F=6,G=7,H=8,I=9(TênSP),K=11,U=21(ThanhToán),AC=29
    const customColumnsAlignment = [2, 3, 5, 6, 7, 8, 9, 11, 21, 29]
    // SL(10),Giá(12),Thành tiền(13),Tiền Thuế(15),Tiền GG(17),Tổng dòng(18),Tổng cộng(19),CN(20),Giá trị BL(26),Còn lại(28)
    const customColumnConvertToNumber = [10, 12, 13, 15, 17, 18, 19, 20, 26, 28]

    customColumnsAlignment.forEach((column) => {
      // Canh trái các cột
      worksheet.getColumn(column).alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      }
    })

      // Căn giữa ngang, nhưng căn trên dọc: STT(1), TT HĐ Bán(4), SL(10), Trạng thái(23)
      ;[1, 4, 10, 23].forEach((colIdx) => {
        worksheet.getColumn(colIdx).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber > 3) {
            cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: false }
          }
        })
      })
    // Khôi phục alignment cho thông tin công ty (A1) và tiêu đề (A2)
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    // Chuyển thành số
    customColumnConvertToNumber.forEach((column) => {
      const col = worksheet.getColumn(column)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 3) {
          // Remove dots (thousands separator in VN) before parsing
          const numValue = parseFloat(cell.value.replace(/\./g, '').replace(/,/g, '.'))

          if (!isNaN(numValue)) {
            cell.value = numValue // Chuyển thành số
          }
        }
      })
      col.numFmt = '#,##0'
    })

    // Định dạng header cột (row 3)
    worksheet.getRow(3).eachCell({ includeEmpty: true }, (cell) => {
      cell.font = {
        name: 'Times New Roman',
        size: 12,
        bold: true,
      }
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      }
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
    })
    worksheet.getRow(3).height = 36

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo chi tiết hóa đơn từ ${fromDate} đến ${toDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    // Tắt model preview và date-picker
    onOpenChange()
    props.closeExport()
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

      <DialogContent className="md:h-auto md:max-w-full">
        <DialogHeader>
          <DialogTitle>Danh sách đơn bán</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id={'exportTable'}>
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã HĐ</TableHead>
                  <TableHead className="min-w-36">Mã HĐ/Bán</TableHead>
                  <TableHead className="min-w-28">TT HĐ Bán</TableHead>
                  <TableHead className="min-w-40">Khách Hàng</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Tên sản phẩm</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-32">Giá</TableHead>
                  <TableHead className="min-w-32">Thành tiền</TableHead>
                  {/* 4 cột mới */}
                  <TableHead className="min-w-24">Thuế (%)</TableHead>
                  <TableHead className="min-w-28">Tiền Thuế</TableHead>
                  <TableHead className="min-w-24">Giảm giá (%)</TableHead>
                  <TableHead className="min-w-28">Tiền giảm giá</TableHead>
                  {/* Merge */}
                  <TableHead className="min-w-32">Tổng dòng</TableHead>
                  <TableHead className="min-w-32">Tổng cộng</TableHead>
                  <TableHead className="min-w-32">Công nợ</TableHead>
                  <TableHead className="min-w-36">Thanh toán</TableHead>
                  <TableHead className="min-w-40">DS phiếu xuất</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-28">Ngày HĐ</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                  <TableHead className="min-w-32">Giá trị BL</TableHead>
                  <TableHead className="min-w-28">Ngày BL</TableHead>
                  <TableHead className="min-w-32">Còn lại sau BL</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((invoice) =>
                  invoice.invoiceItems.map((invoiceItem) => (
                    <TableRow key={`${invoice.id}-${invoiceItem.id}`}>
                      <TableCell>{indexTable++}</TableCell>
                      <TableCell>{invoice.orderCode || invoice.code}</TableCell>
                      <TableCell>{invoice.salesContract?.code ?? '—'}</TableCell>
                      <TableCell>{
                        invoice.salesContract?.status === 'draft' ? 'Nháp' :
                          invoice.salesContract?.status === 'confirmed' ? 'Chờ giao' :
                            invoice.salesContract?.status === 'completed' ? 'Hoàn thành' :
                              invoice.salesContract?.status === 'cancelled' ? 'Đã hủy' :
                                invoice.salesContract?.status === 'liquidated' ? 'Đã thanh lý' :
                                  invoice.salesContract?.status ?? '—'
                      }</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell>{invoice.customerPhone}</TableCell>
                      <TableCell>{invoice.customerAddress}</TableCell>
                      <TableCell>{invoice.user?.fullName}</TableCell>
                      <TableCell>{invoiceItem.productName}</TableCell>
                      <TableCell>{moneyFormat(invoiceItem.quantity, false)}</TableCell>
                      <TableCell>{invoiceItem.unitName}</TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.price, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoiceItem.price * invoiceItem.quantity, false)}
                      </TableCell>
                      {/* Thuế (%) */}
                      <TableCell>
                        {invoiceItem.taxRate != null
                          ? `${invoiceItem.taxRate}%`
                          : invoiceItem.taxes?.length > 0
                            ? invoiceItem.taxes.map(t => `${t.percentage}%`).join(', ')
                            : '—'}
                      </TableCell>
                      {/* Tiền Thuế */}
                      <TableCell>
                        {moneyFormat(invoiceItem.taxAmount ?? invoiceItem.tax_amount ?? 0, false)}
                      </TableCell>
                      {/* Giảm giá (%) */}
                      <TableCell>
                        {invoiceItem.discountRate != null
                          ? `${invoiceItem.discountRate}%`
                          : '—'}
                      </TableCell>
                      {/* Tiền giảm giá */}
                      <TableCell>
                        {moneyFormat(invoiceItem.discountAmount ?? invoiceItem.discount ?? 0, false)}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(
                          (Number(invoiceItem.totalAmount || 0)),
                          false
                        )}
                      </TableCell>
                      <TableCell>
                        {moneyFormat(invoice.totalAmount || invoice.amount, false)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const paymentStatus = invoice.paymentStatus
                          const totalAmount = parseFloat(invoice.totalAmount || invoice.amount || 0)
                          const paidAmount = parseFloat(invoice.paidAmount || 0)
                          const remainingAmount = totalAmount - paidAmount

                          if (paymentStatus === 'paid') return 0
                          if (remainingAmount <= 0) return 0
                          return moneyFormat(remainingAmount, false)
                        })()}
                      </TableCell>
                      <TableCell>
                        {invoice.paymentStatus === 'paid'
                          ? 'Đã T.Toán'
                          : invoice.paymentStatus === 'partial'
                            ? `T.T 1 phần (${moneyFormat(invoice.paidAmount || 0, false)})`
                            : 'Chưa T.Toán'}
                      </TableCell>
                      <TableCell>
                        {invoice.warehouseReceipts?.length > 0
                          ? invoice.warehouseReceipts.map((wr) => wr.code).join(', ')
                          : invoice.salesContract?.warehouseReceipts?.length > 0
                            ? invoice.salesContract?.warehouseReceipts?.map((wr) => wr.code).join(', ')
                            : 'Không có'}
                      </TableCell>
                      <TableCell>
                        {invoice.status === 'delivered'
                          ? 'Hoàn thành'
                          : invoice.status === 'accepted'
                            ? 'Đã xác nhận'
                            : invoice.status === 'pending'
                              ? 'Chờ xác nhận'
                              : invoice.status === 'rejected'
                                ? 'Từ chối'
                                : invoice.status === 'cancelled'
                                  ? 'Đã hủy'
                                  : invoice.status}
                      </TableCell>
                      <TableCell>
                        {invoice.invoiceDate ? dateFormat(invoice.invoiceDate, false) : '—'}
                      </TableCell>
                      <TableCell>
                        {dateFormat(invoiceItem.createdAt, false)}
                      </TableCell>
                      <TableCell>{invoice.salesContract?.liquidationValue != null ? moneyFormat(invoice.salesContract.liquidationValue, false) : '—'}</TableCell>
                      <TableCell>{invoice.salesContract?.liquidationDate ? dateFormat(invoice.salesContract.liquidationDate, false) : '—'}</TableCell>
                      <TableCell>{invoice.salesContract?.liquidationRemainingAmount != null ? moneyFormat(invoice.salesContract.liquidationRemainingAmount, false) : '—'}</TableCell>
                      <TableCell>{invoice.note || invoiceItem.note}</TableCell>
                    </TableRow>
                  )),
                )}
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
            Xuất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportInvoiceView
