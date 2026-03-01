import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { types } from '../data'

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

// Cấu trúc cột xuất Excel cho Customer
// A STT
// B Tên khách hàng
// C Mã KH
// D Số điện thoại
// E Email
// F CMND/CCCD
// G Ngày cấp
// H Nơi cấp
// I Địa chỉ
// J Người đại diện
// K Mã số thuế
// L Loại khách hàng
// M Số lượng đơn
// N Người tạo
// O Ngày tạo
// P Ghi chú

const ExportCustomerView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Danh sách Khách hàng', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportCustomerTable')

    worksheet.mergeCells('A1:P1')
    worksheet.getCell('A1').value = 'Báo cáo danh sách khách hàng'

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
            horizontal: 'left',
            wrapText: true,
          }
        })
      }
    })

    // Tiêu đề file
    worksheet.getCell('A1').font = {
      name: 'Times New Roman',
      size: 14,
      bold: true,
    }
    worksheet.getCell('A1').alignment = {
      vertical: 'middle',
      horizontal: 'center',
    }

    // Thiết lập in
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

    // Độ rộng cột
    const customColumnWidths = [
      6,  // A STT
      35, // B Tên KH
      15, // C Mã KH
      15, // D SDT
      25, // E Email
      15, // F CMND/CCCD
      15, // G Ngày cấp
      20, // H Nơi cấp
      40, // I Địa chỉ
      25, // J Người đại diện
      15, // K Mã số thuế
      20, // L Loại khách hàng
      12, // M Số lượng đơn
      25, // N Người tạo
      18, // O Ngày tạo
      30, // P Ghi chú
    ]
    worksheet.columns.forEach((column, index) => {
      column.width = customColumnWidths[index] || 15
    })

    // Header row style
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
    worksheet.getRow(2).height = 24

    // Xuất file
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DanhSachKhachHang.xlsx`
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

      <DialogContent className="md:h-auto md:max-w-[70vw] z-[100100]" overlayClassName="z-[100099]">
        <DialogHeader>
          <DialogTitle>Danh sách khách hàng xuất file</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportCustomerTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs whitespace-nowrap">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Tên khách hàng</TableHead>
                  <TableHead className="min-w-28">Mã KH</TableHead>
                  <TableHead className="min-w-32">Số điện thoại</TableHead>
                  <TableHead className="min-w-40">Email</TableHead>
                  <TableHead className="min-w-32">CMND/CCCD</TableHead>
                  <TableHead className="min-w-28">Ngày cấp</TableHead>
                  <TableHead className="min-w-32">Nơi cấp</TableHead>
                  <TableHead className="min-w-64">Địa chỉ</TableHead>
                  <TableHead className="min-w-40">Người đại diện</TableHead>
                  <TableHead className="min-w-32">Mã số thuế</TableHead>
                  <TableHead className="min-w-40">Loại khách hàng</TableHead>
                  <TableHead className="min-w-28 text-center">SL đơn</TableHead>
                  <TableHead className="min-w-40">Người tạo</TableHead>
                  <TableHead className="min-w-32">Ngày tạo</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data?.map((customer) => {
                  const typeLabel = types.find((t) => t.value === customer.customerType)?.label || '—'
                  return (
                    <TableRow key={customer.id}>
                      <TableCell>{indexTable++}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.code}</TableCell>
                      <TableCell>{customer.phone || '—'}</TableCell>
                      <TableCell>{customer.email || '—'}</TableCell>
                      <TableCell>{customer.identityCard || '—'}</TableCell>
                      <TableCell>{customer.identityDate ? dateFormat(customer.identityDate, true) : '—'}</TableCell>
                      <TableCell>{customer.identityPlace || '—'}</TableCell>
                      <TableCell>{customer.address || '—'}</TableCell>
                      <TableCell>{customer.represent || '—'}</TableCell>
                      <TableCell>{customer.taxCode || '—'}</TableCell>
                      <TableCell>{typeLabel}</TableCell>
                      <TableCell className="text-center">{customer.invoiceCount || 0}</TableCell>
                      <TableCell>{customer.creator?.fullName || '—'}</TableCell>
                      <TableCell>{dateFormat(customer.createdAt, true)}</TableCell>
                      <TableCell>{customer.note || '—'}</TableCell>
                    </TableRow>
                  )
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
            Xuất Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportCustomerView
