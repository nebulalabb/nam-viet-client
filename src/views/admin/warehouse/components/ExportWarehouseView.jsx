import { Button } from '@/components/custom/Button'
import { dateFormat } from '@/utils/date-format'
import { warehouseTypes, warehouseStatuses } from '../data'

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
} from '@/components/ui/dialog'
import ExcelJS from 'exceljs'
import { IconDownload } from '@tabler/icons-react'

const ExportWarehouseView = ({
    open,
    onOpenChange,
    showTrigger = true,
    ...props
}) => {
    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Danh sách Kho hàng', {
            views: [{ showGridLines: true }],
        })
        const table = document.getElementById('exportWarehouseTable')

        worksheet.mergeCells('A1:K1')
        worksheet.getCell('A1').value = 'Báo cáo danh sách kho hàng'

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
            15, // B Mã kho
            35, // C Tên kho
            20, // D Loại kho
            15, // E Sức chứa
            20, // F Quản lý
            20, // G Tỉnh/Thành
            20, // H Khu vực
            40, // I Địa chỉ chi tiết
            15, // J Trạng thái
            20, // K Ngày tạo
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
        a.download = `DanhSachKhoHang.xlsx`
        document.body.appendChild(a)
        a.click()
        onOpenChange(false)
        props.closeExport?.()
    }

    let indexTable = 1

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className="md:h-auto md:max-w-[70vw] z-[100100]" overlayClassName="z-[100099]">
                <DialogHeader>
                    <DialogTitle>Danh sách kho hàng xuất file</DialogTitle>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
                    <div className="overflow-x-auto rounded-lg border">
                        <Table className="min-w-full" id="exportWarehouseTable">
                            <TableHeader>
                                <TableRow className="bg-secondary text-xs whitespace-nowrap">
                                    <TableHead className="w-8">STT</TableHead>
                                    <TableHead className="min-w-28">Mã kho</TableHead>
                                    <TableHead className="min-w-40">Tên kho</TableHead>
                                    <TableHead className="min-w-32">Loại kho</TableHead>
                                    <TableHead className="min-w-28">Sức chứa</TableHead>
                                    <TableHead className="min-w-32">Quản lý</TableHead>
                                    <TableHead className="min-w-32">Tỉnh/Thành</TableHead>
                                    <TableHead className="min-w-32">Khu vực</TableHead>
                                    <TableHead className="min-w-64">Địa chỉ chi tiết</TableHead>
                                    <TableHead className="min-w-28">Trạng thái</TableHead>
                                    <TableHead className="min-w-32">Ngày tạo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {props?.data?.map((warehouse) => {
                                    const typeLabel = warehouseTypes.find((t) => t.value === warehouse.warehouseType)?.label || '—'
                                    const statusLabel = warehouseStatuses.find((t) => t.value === warehouse.status)?.label || '—'
                                    return (
                                        <TableRow key={warehouse.id}>
                                            <TableCell>{indexTable++}</TableCell>
                                            <TableCell>{warehouse.warehouseCode || '—'}</TableCell>
                                            <TableCell>{warehouse.warehouseName || '—'}</TableCell>
                                            <TableCell>{typeLabel}</TableCell>
                                            <TableCell>{warehouse.capacity || 'Không giới hạn'}</TableCell>
                                            <TableCell>{warehouse.manager?.fullName || 'Chưa định'}</TableCell>
                                            <TableCell>{warehouse.city || '—'}</TableCell>
                                            <TableCell>{warehouse.region || '—'}</TableCell>
                                            <TableCell>{warehouse.address || '—'}</TableCell>
                                            <TableCell>{statusLabel}</TableCell>
                                            <TableCell>{dateFormat(warehouse.createdAt, true)}</TableCell>
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

export default ExportWarehouseView
