import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { IconDownload } from '@tabler/icons-react'
import { dateFormat } from '@/utils/date-format'
import { useState } from 'react'

const ExportTaxView = ({ open, onOpenChange, data, closeExport }) => {
  const [isExporting, setIsExporting] = useState(false)

  const formatExportData = (taxes) => {
    return taxes.map((tax) => ({
      ID: tax.id,
      Tên_loại_thuế: tax.title || '',
      Tỷ_lệ_phần_trăm: tax.percentage ? `${tax.percentage}%` : '0%',
      Trạng_thái: tax.status === 'published' ? 'Đang hoạt động' : 'Ngừng hoạt động',
      Người_tạo: tax.creator?.fullName || '',
      Ngày_tạo: dateFormat(tax.createdAt),
      Ngày_cập_nhật: dateFormat(tax.updatedAt),
    }))
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const formattedData = formatExportData(data)
      const worksheet = XLSX.utils.json_to_sheet(formattedData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Thuế')

      // Auto-size columns
      const maxWidths = {}
      formattedData.forEach((row) => {
        Object.keys(row).forEach((key) => {
          const value = String(row[key])
          maxWidths[key] = Math.max(maxWidths[key] || 10, value.length)
        })
      })

      worksheet['!cols'] = Object.keys(formattedData[0]).map((key) => ({
        wch: Math.min(maxWidths[key] + 2, 50), // Cap width at 50 chars
      }))

      XLSX.writeFile(workbook, `Danh_sach_thue_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success('Xuất file Excel thành công')
      onOpenChange(false)
      closeExport()
    } catch (error) {
      console.log('Export error: ', error)
      toast.error('Có lỗi xảy ra khi xuất file')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl z-[100100]" overlayClassName="z-[100099]">
        <DialogHeader>
          <DialogTitle>Xem trước dữ liệu xuất Excel ({data.length} bản ghi)</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Tên loại thuế</TableHead>
                <TableHead>Tỷ lệ (%)</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Người tạo</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.percentage}%</TableCell>
                  <TableCell>
                    {row.status === 'published' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </TableCell>
                  <TableCell>{row.creator?.fullName || ''}</TableCell>
                  <TableCell>{dateFormat(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {data.length > 50 && (
            <div className="text-center p-4 text-sm text-muted-foreground bg-muted/50">
              Chỉ hiển thị 50 bản ghi đầu tiên để xem trước...
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0 pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Hủy
            </Button>
          </DialogClose>
          <Button onClick={handleExportExcel} loading={isExporting}>
            <IconDownload className="mr-2 h-4 w-4" />
            Tải xuống Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ExportTaxView
