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

// Cấu trúc cột xuất Excel cho Unit
// A STT
// B Tên đơn vị
// C Mã đơn vị
// D Ngày tạo
// E Cập nhật

const ExportUnitView = ({
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Danh sách Đơn vị', {
      views: [{ showGridLines: true }],
    })
    const table = document.getElementById('exportUnitTable')

    worksheet.mergeCells('A1:E1')
    worksheet.getCell('A1').value = 'Báo cáo danh sách đơn vị tính'

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
      40, // B Tên đơn vị
      25, // C Mã đơn vị
      25, // D Ngày tạo
      25, // E Cập nhật
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
    a.download = `DanhSachDonViTinh.xlsx`
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
          <DialogTitle>Danh sách đơn vị tính xuất file</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <div className="overflow-x-auto rounded-lg border">
            <Table className="min-w-full" id="exportUnitTable">
              <TableHeader>
                <TableRow className="bg-secondary text-xs whitespace-nowrap">
                  <TableHead className="w-8">STT</TableHead>
                  <TableHead className="min-w-40">Tên đơn vị</TableHead>
                  <TableHead className="min-w-32">Mã đơn vị</TableHead>
                  <TableHead className="min-w-28">Ngày tạo</TableHead>
                  <TableHead className="min-w-28">Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props?.data?.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell>{indexTable++}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    <TableCell>{unit.code}</TableCell>
                    <TableCell>{dateFormat(unit.createdAt)}</TableCell>
                    <TableCell>{dateFormat(unit.updatedAt)}</TableCell>
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

export default ExportUnitView
