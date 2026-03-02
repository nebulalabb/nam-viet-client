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
// C Tên nhà cung cấp
// D Người liên hệ
// E Số điện thoại
// F Email
// G Địa chỉ
// H Loại NCC
// I Mã số thuế
// J Điều khoản thanh toán
// K Ghi chú
// L Trang thái
// M Công nợ hiện tại
// N Người tạo
// O Ngày tạo

const ExportSupplierView = ({
    open,
    onOpenChange,
    showTrigger = true,
    ...props
}) => {
    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Danh sách Nhà cung cấp', {
            views: [{ showGridLines: true }],
        })
        const table = document.getElementById('exportSupplierTable')

        worksheet.mergeCells('A1:O1')
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
            15, // B Mã NCC
            35, // C Tên NCC
            25, // D Người LH
            15, // E SDT
            25, // F Email
            40, // G Địa chỉ
            15, // H Loại NCC
            15, // I MST
            20, // J Điều khoản TT
            30, // K Ghi chú
            15, // L Trạng thái
            20, // M Công nợ
            25, // N Người tạo
            18, // O Ngày tạo
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

            <DialogContent className="md:h-auto md:max-w-[70vw] z-[100100]" overlayClassName="z-[100099]">
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
                                    <TableHead className="min-w-40">Tên nhà cung cấp</TableHead>
                                    <TableHead className="min-w-40">Người liên hệ</TableHead>
                                    <TableHead className="min-w-32">Số điện thoại</TableHead>
                                    <TableHead className="min-w-40">Email</TableHead>
                                    <TableHead className="min-w-64">Địa chỉ</TableHead>
                                    <TableHead className="min-w-32">Loại NCC</TableHead>
                                    <TableHead className="min-w-32">Mã số thuế</TableHead>
                                    <TableHead className="min-w-40">Điều khoản thanh toán</TableHead>
                                    <TableHead className="min-w-40">Ghi chú</TableHead>
                                    <TableHead className="min-w-32 text-center">Trạng thái</TableHead>
                                    <TableHead className="min-w-40 text-right">Tổng nợ</TableHead>
                                    <TableHead className="min-w-40">Người tạo</TableHead>
                                    <TableHead className="min-w-32">Ngày tạo</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {props?.data?.map((supplier) => {
                                    const typeLabel = supplier.supplierType === 'local' ? 'Trong nước' : supplier.supplierType
                                    const formatCurrency = (val) => val ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val) : '0 ₫'

                                    return (
                                        <TableRow key={supplier.id}>
                                            <TableCell>{indexTable++}</TableCell>
                                            <TableCell>{supplier.supplierCode}</TableCell>
                                            <TableCell>{supplier.supplierName}</TableCell>
                                            <TableCell>{supplier.contactName || '—'}</TableCell>
                                            <TableCell>{supplier.phone || '—'}</TableCell>
                                            <TableCell>{supplier.email || '—'}</TableCell>
                                            <TableCell>{supplier.address || '—'}</TableCell>
                                            <TableCell>{typeLabel}</TableCell>
                                            <TableCell>{supplier.taxCode || '—'}</TableCell>
                                            <TableCell>{supplier.paymentTerms || '—'}</TableCell>
                                            <TableCell>{supplier.notes || '—'}</TableCell>
                                            <TableCell className="text-center">{supplier.status === 'active' ? 'Hoạt động' : 'Khóa'}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(supplier.totalPayable)}</TableCell>
                                            <TableCell>{supplier.creator?.fullName || '—'}</TableCell>
                                            <TableCell>{dateFormat(supplier.createdAt, true)}</TableCell>
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

export default ExportSupplierView
