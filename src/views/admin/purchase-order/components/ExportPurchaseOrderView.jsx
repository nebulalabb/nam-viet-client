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

// ─── Cấu trúc cột (21 cột) ──────────────────────────────────────────────────
// A  STT
// B  Mã ĐĐH
// C  Mã HĐ/NCC          ← MỚI
// D  NCC
// E  SĐT
// F  Địa chỉ
// G  Người tạo
// H  Tên nguyên liệu
// I  SL
// J  ĐVT
// K  Giá
// L  Thành tiền
// M  Tổng đơn           ← merge
// N  Thuế               ← merge
// O  Giảm giá           ← merge
// P  Công nợ            ← merge
// Q  Thanh toán         ← merge
// R  DS phiếu nhập      ← merge
// S  Trạng thái         ← merge
// T  Ngày đặt hàng      ← MỚI + merge
// U  Ngày tạo           ← merge

const STATUS_MAP = {
  draft: 'Nháp',
  ordered: 'Đã đặt',
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  partial: 'Nhập một phần',
}

const getStatusLabel = (status) => STATUS_MAP[status] ?? status ?? ''

const ExportPurchaseOrderView = ({
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
    const worksheet = workbook.addWorksheet('Chi tiết đơn mua hàng', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportPOTable')

    // === THÔNG TIN CÔNG TY (Row 1 – richText nhiều dòng) === //
    const phoneEmail = []
    if (phone) phoneEmail.push(`SĐT: ${phone}`)
    if (email) phoneEmail.push(`Email: ${email}`)


    worksheet.mergeCells('A1:X1')
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
    worksheet.mergeCells('A2:X2')
    worksheet.getCell('A2').value =
      `Báo cáo danh sách đơn mua hàng từ ${fromDate} đến ${toDate}`

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
          cell.font = { name: 'Times New Roman', size: 12 }
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
    }
    worksheet.getRow(2).height = 26

    // In trang
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
    // row 1 height đã set ở trên khi tạo company cell

    // ── Độ rộng cột (24 cột) ──────────────────────────────────────────────
    const customColumnWidths = [
      6,  // A – STT
      22, // B – Mã ĐĐH
      22, // C – Mã HĐ/NCC
      28, // D – NCC
      14, // E – SĐT
      35, // F – Địa chỉ
      20, // G – Người tạo
      30, // H – Tên nguyên liệu
      8,  // I – SL
      10, // J – ĐVT
      18, // K – Giá
      18, // L – Thành tiền
      12, // M – Thuế (%)
      18, // N – Tiền Thuế
      12, // O – Giảm giá (%)
      18, // P – Tiền giảm giá
      20, // Q – Tổng dòng
      18, // R – Tổng đơn
      20, // S – Công nợ
      22, // T – Thanh toán
      28, // U – DS phiếu nhập
      18, // V – Trạng thái
      18, // W – Ngày đặt hàng
      20, // X – Ngày tạo
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // ── Căn trái ──────────────────────────────────────────────────────────
    // B=2,C=3,D=4,E=5,F=6,G=7,H=8,J=10
    const alignLeftCols = [2, 3, 4, 5, 6, 7, 8, 10]
    alignLeftCols.forEach((colIdx) => {
      worksheet.getColumn(colIdx).alignment = {
        vertical: 'top',
        horizontal: 'left',
        wrapText: true,
      }
    })

      // Căn giữa ngang và trên dọc: STT (col 1), SL (col 9), Trạng thái (col 22)
      ;[1, 9, 22].forEach((colIdx) => {
        worksheet.getColumn(colIdx).eachCell({ includeEmpty: true }, (cell, rowNumber) => {
          if (rowNumber > 3) {
            cell.alignment = { vertical: 'top', horizontal: 'center', wrapText: false }
          }
        })
      })
    // Khôi phục alignment cho thông tin công ty (A1) và tiêu đề (A2)
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'left' }
    // ── Format số (I=9, K=11, L=12, N=14, P=16, Q=17, R=18, S=19) ─────────────
    // Format số: I=9,K=11,L=12,N=14,P=16,Q=17,R=18,S=19
    const numberCols = [9, 11, 12, 14, 16, 17, 18, 19]
    numberCols.forEach((colIdx) => {
      const col = worksheet.getColumn(colIdx)
      col.eachCell((cell, rowNumber) => {
        if (typeof cell.value === 'string' && rowNumber > 3) {
          // Xóa dấu chấm (hàng nghìn) và đổi dấu phẩy (thập phân) thành dấu chấm cho parseFloat
          const rawString = cell.value.replace(/\./g, '').replace(/,/g, '.')
          const numValue = parseFloat(rawString)
          if (!isNaN(numValue)) cell.value = numValue
        }
      })
      col.numFmt = '#,##0'
    })

    // ── Header row style ─────────────────────────────────────────────────
    worksheet.getRow(3).eachCell({ includeEmpty: true }, (cell) => {
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
    worksheet.getRow(3).height = 36

    // ── Xuất file ────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Báo cáo đơn mua hàng từ ${fromDate} đến ${toDate}.xlsx`
    document.body.appendChild(a)
    a.click()
    onOpenChange(false)
    props.closeExport?.()
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
          <DialogTitle>Danh sách đơn mua hàng</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportPOTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Mã ĐĐH</TableHead>
                  {/* ── CỘT MỚI ── */}
                  <TableHead className="min-w-36">Mã HĐ/NCC</TableHead>
                  <TableHead className="min-w-40">NCC/KH</TableHead>
                  <TableHead className="min-w-16">SĐT</TableHead>
                  <TableHead className="min-w-40">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-28">Tên nguyên liệu</TableHead>
                  <TableHead className="min-w-16">SL</TableHead>
                  <TableHead className="min-w-16">ĐVT</TableHead>
                  <TableHead className="min-w-32">Giá</TableHead>
                  <TableHead className="min-w-32">Thành tiền</TableHead>
                  {/* 4 cột mới */}
                  <TableHead className="min-w-24">Thuế (%)</TableHead>
                  <TableHead className="min-w-28">Tiền Thuế</TableHead>
                  <TableHead className="min-w-24">Giảm giá (%)</TableHead>
                  <TableHead className="min-w-28">Tiền giảm giá</TableHead>
                  <TableHead className="min-w-32">Tổng dòng</TableHead>
                  <TableHead className="min-w-32">Tổng đơn</TableHead>
                  <TableHead className="min-w-32">Công nợ</TableHead>
                  <TableHead className="min-w-36">Thanh toán</TableHead>
                  <TableHead className="min-w-40">DS phiếu nhập</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  {/* ── CỘT MỚI ── */}
                  <TableHead className="min-w-28">Ngày đặt hàng</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data.map((order) => {
                  const items = order.items || []
                  return items.map((item, itemIndex) => {
                    const paidAmount = parseFloat(order.paidAmount || 0)
                    const totalAmount = parseFloat(order.totalAmount || 0)
                    const debt = totalAmount - paidAmount

                    return (
                      <TableRow key={`${order.id}-${item.id ?? itemIndex}`}>
                        {/* A – STT */}
                        <TableCell>{indexTable++}</TableCell>
                        {/* B – Mã ĐĐH */}
                        <TableCell>{order.code}</TableCell>
                        {/* C – Mã HĐ/NCC ← MỚI */}
                        <TableCell>
                          {order.purchaseContract?.code ?? '—'}
                        </TableCell>
                        {/* D – NCC/KH */}
                        <TableCell>{order.supplier?.name ?? order.customer?.name ?? '—'}</TableCell>
                        {/* E – SĐT */}
                        <TableCell>{order.supplier?.phone ?? order.customer?.phone ?? '—'}</TableCell>
                        {/* F – Địa chỉ */}
                        <TableCell>{order.supplier?.address ?? order.customer?.address ?? ''}</TableCell>
                        {/* G – Người tạo */}
                        <TableCell>
                          {order.createdByUser?.fullName ??
                            order.user?.fullName ??
                            order.createdBy}
                        </TableCell>
                        {/* H – Tên nguyên liệu */}
                        <TableCell>
                          {item.productName ?? item.product?.name}
                        </TableCell>
                        {/* I – SL */}
                        <TableCell>
                          {moneyFormat(item.quantity, false)}
                        </TableCell>
                        {/* J – ĐVT */}
                        <TableCell>
                          {item.unitName ?? item.unit?.name}
                        </TableCell>
                        {/* K – Giá */}
                        <TableCell>
                          {moneyFormat(item.unitPrice, false)}
                        </TableCell>
                        {/* L – Thành tiền */}
                        <TableCell>
                          {moneyFormat(
                            item.quantity * item.unitPrice,
                            false
                          )}
                        </TableCell>
                        {/* M – Thuế (%) */}
                        <TableCell>
                          {item.taxRate != null
                            ? `${item.taxRate}%`
                            : item.taxes?.length > 0
                              ? item.taxes.map(t => `${t.percentage}%`).join(', ')
                              : '—'}
                        </TableCell>
                        {/* N – Tiền Thuế */}
                        <TableCell>
                          {moneyFormat(item.taxAmount ?? item.tax_amount ?? 0, false)}
                        </TableCell>
                        {/* O – Giảm giá (%) */}
                        <TableCell>
                          {item.discountRate != null
                            ? `${item.discountRate}%`
                            : '—'}
                        </TableCell>
                        {/* P – Tiền giảm giá */}
                        <TableCell>
                          {moneyFormat(item.discountAmount ?? item.discount ?? 0, false)}
                        </TableCell>
                        {/* Q – Tổng dòng */}
                        <TableCell>
                          {moneyFormat(item.totalAmount ?? 0, false)}
                        </TableCell>
                        {/* R – Tổng đơn */}
                        <TableCell>
                          {moneyFormat(order.totalAmount, false)}
                        </TableCell>
                        {/* R – Công nợ */}
                        <TableCell>
                          {order.paymentStatus === 'paid'
                            ? 0
                            : moneyFormat(debt, false)}
                        </TableCell>
                        {/* Q – Thanh toán */}
                        <TableCell>
                          {order.paymentStatus === 'paid'
                            ? 'Đã T.Toán'
                            : order.paymentStatus === 'partial'
                              ? `T.T 1 phần (${moneyFormat(paidAmount, false)})`
                              : 'Chưa T.Toán'}
                        </TableCell>
                        {/* R – DS phiếu nhập */}
                        <TableCell>
                          {order.warehouseReceipts?.length > 0
                            ? order.warehouseReceipts
                              .map((wr) => wr.code)
                              .join(', ')
                            : 'Không có'}
                        </TableCell>
                        {/* S – Trạng thái */}
                        <TableCell>{getStatusLabel(order.status)}</TableCell>
                        {/* T – Ngày đặt hàng ← MỚI */}
                        <TableCell>
                          {order.orderDate
                            ? dateFormat(order.orderDate, false)
                            : '—'}
                        </TableCell>
                        {/* U – Ngày tạo */}
                        <TableCell>
                          {dateFormat(order.createdAt, false)}
                        </TableCell>
                      </TableRow>
                    )
                  })
                })}
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

export default ExportPurchaseOrderView