import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'

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

// Cấu trúc cột xuất Excel cho Supplier
// A STT
// B Mã NCC
// C Tên NCC
// D Mã số thuế
// E Người đại diện
// F Số điện thoại
// G Email
// H Địa chỉ
// I Công nợ
// J Trạng thái
// K Người tạo
// L Ghi chú
// M Ngày tạo

const ExportSupplierView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Danh sách NCC', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportSupplierTable')

    worksheet.mergeCells('A1:M1')
    worksheet.getCell('A1').value = 'Báo cáo danh sách nhà cung cấp'

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
      20, // B Mã NCC
      35, // C Tên NCC
      18, // D Mã số thuế
      25, // E Người đại diện
      18, // F Số điện thoại
      25, // G Email
      40, // H Địa chỉ
      20, // I Công nợ
      18, // J Trạng thái
      25, // K Người tạo
      35, // L Ghi chú
      20, // M Ngày tạo
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
    a.download = `DanhSachNhaCungCap.xlsx`
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

      <DialogContent className="md:h-auto md:max-w-full z-[100100]" overlayClassName="z-[100099]">
        <DialogHeader>
          <DialogTitle>Danh sách nhà cung cấp xuất file</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportSupplierTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs whitespace-nowrap">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-28">Mã NCC</TableHead>
                  <TableHead className="min-w-40">Tên NCC</TableHead>
                  <TableHead className="min-w-28">Mã số thuế</TableHead>
                  <TableHead className="min-w-32">Người đại diện</TableHead>
                  <TableHead className="min-w-28">Số điện thoại</TableHead>
                  <TableHead className="min-w-40">Email</TableHead>
                  <TableHead className="min-w-56">Địa chỉ</TableHead>
                  <TableHead className="min-w-32">Công nợ</TableHead>
                  <TableHead className="min-w-28">Trạng thái</TableHead>
                  <TableHead className="min-w-32">Người tạo</TableHead>
                  <TableHead className="min-w-40">Ghi chú</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data?.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{indexTable++}</TableCell>
                    <TableCell>{supplier.supplierCode}</TableCell>
                    <TableCell>{supplier.supplierName}</TableCell>
                    <TableCell>{supplier.taxCode}</TableCell>
                    <TableCell>{supplier.contactName}</TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.address}</TableCell>
                    <TableCell>{supplier.debt ? supplier.debt.toLocaleString('vi-VN') : 0}</TableCell>
                    <TableCell>
                      {supplier.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                    </TableCell>
                    <TableCell>{supplier.creator?.fullName || '—'}</TableCell>
                    <TableCell>{supplier.notes}</TableCell>
                    <TableCell>{dateFormat(supplier.createdAt)}</TableCell>
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

export default ExportSupplierView
