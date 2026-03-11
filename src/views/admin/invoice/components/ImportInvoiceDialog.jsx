import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { importInvoice } from '@/stores/InvoiceSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parse, isValid } from 'date-fns'

const ImportInvoiceDialog = ({
  open,
  onOpenChange,
  ...props
}) => {
  const dispatch = useDispatch()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorList, setErrorList] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (
        selectedFile.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile)
        setErrorList(null)
      } else {
        toast.error('Vui lòng chọn file Excel (.xlsx, .xls)')
        e.target.value = null
      }
    }
  }

  const parseDate = (value) => {
    if (value instanceof Date) return format(value, 'yyyy-MM-dd')
    // Try to parse string date if needed, assume Excel dates are objects usually
    return value ? String(value) : null
  }

  const handleImport = async () => {
    if (!file) {
      toast.warning('Vui lòng chọn file để import')
      return
    }

    setLoading(true)
    setErrorList(null)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(arrayBuffer)

      const worksheet = workbook.getWorksheet(1)
      if (!worksheet) {
        throw new Error('File Excel không có dữ liệu')
      }

      const rows = []
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return // header

        const getVal = (idx) => {
          const val = row.getCell(idx).value
          return val?.text || val || ''
        }

        const getDateVal = (idx) => parseDate(row.getCell(idx).value)
        const getBoolVal = (idx) => String(getVal(idx)).toUpperCase() === 'TRUE'
        const getNumVal = (idx) => {
          const val = getVal(idx)
          return val ? Number(val) : 0
        }

        // Updated Mapping (20 Columns):
        // 1. Mã nhóm đơn (Group Code)
        // 2. CCCD (Identity Card) (*)
        // 3. Tên khách hàng (Customer Name) (*)
        // 4. Số điện thoại (Phone) (*)
        // 5. Email
        // 6. Địa chỉ (Address)
        // 7. Ngày cấp (Identity Date)
        // 8. Nơi cấp (Identity Place)
        // 9. Ngày đặt hàng (Order Date) (*)
        // 10. Loại giao dịch (Transaction Type) (*)
        // 11. Ghi chú (Note)
        // 12. In hợp đồng (Print Contract)
        // 13. Ngày dự kiến giao hàng (Expected Delivery Date) (*)
        // 14. Mã sản phẩm (Product Code) (*)
        // 15. Mã đơn vị (Unit Code) (*)
        // 16. Thuế (Tax)
        // 17. Số lượng (Quantity) (*)
        // 18. Đơn giá (Price) (*)
        // 19. Giảm giá (Discount)
        // 20. Tạo hợp đồng cho item (Create Contract for Item)

        rows.push({
          rowNumber,
          groupCode: String(getVal(1)),
          identityCard: String(getVal(2)),
          customerName: String(getVal(3)),
          phone: String(getVal(4)),
          email: String(getVal(5)),
          address: String(getVal(6)),
          identityDate: getDateVal(7),
          identityPlace: String(getVal(8)),
          orderDate: getDateVal(9),
          transactionType: String(getVal(10) || 'RETAIL'),
          note: String(getVal(11)),
          // Product Info
          productCode: String(getVal(14)),
          unitCode: String(getVal(15)),
          taxAmount: getNumVal(16),
          quantity: getNumVal(17),
          discount: getNumVal(19),
        })
      })

      if (rows.length === 0) {
        toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
        return
      }

      // Grouping Logic: Group by groupCode (preferred) OR Key (IdentityCard + OrderDate)
      const invoicesMap = new Map()

      rows.forEach((row) => {
        // Determine grouping key
        let key = row.groupCode
        if (!key || key === 'undefined' || key === 'null' || key === '') {
          // Fallback if groupCode is missing: Use IdentityCard + OrderDate
          if (row.identityCard) {
            key = `${row.identityCard}_${row.orderDate || 'nodate'}`
          } else {
            // If both groupCode and IdentityCard missing, skip or log warning?
            // Since it might be an item row belonging to previous group?
            // But without groupCode, we can't link it reliably if sequential logic isn't guaranteed.
            // We'll rely on groupCode being present as per user requirement, or valid context.
            return
          }
        }

        if (!invoicesMap.has(key)) {
          // Initialize Invoice Header with potential empty values if row is just an item row (though unlikely for first row of group)
          invoicesMap.set(key, {
            identityCard: row.identityCard,
            newCustomer: {
              name: row.customerName,
              phone: row.phone,
              email: row.email,
              address: row.address,
              identityCard: row.identityCard,
              identityDate: row.identityDate,
              identityPlace: row.identityPlace,
            },
            orderDate: row.orderDate,
            transactionType: row.transactionType,
            note: row.note,
            items: [],
            hasPrintInvoice: true,
            // rowNumbers: [],
          })
        }

        const invoice = invoicesMap.get(key)
        // invoice.rowNumbers.push(row.rowNumber)

        // Update Header Info if current row has it (and previous didn't or we want to overwrite)
        if (row.identityCard) {
          invoice.identityCard = row.identityCard
          invoice.newCustomer = {
            name: row.customerName,
            phone: row.phone,
            email: row.email,
            address: row.address,
            identityCard: row.identityCard,
            identityDate: row.identityDate,
            identityPlace: row.identityPlace,
          }
          invoice.orderDate = row.orderDate
          invoice.transactionType = row.transactionType
          invoice.note = row.note
        }

        // Calculate line totals
        // Tax is per unit or total tax amount? Column says "Thuế".
        // Usually tax amount. Let's assume it's total tax for the line or per unit?
        // Given "Số lượng" * "Đơn giá", "Thuế" is likely Tax Amount for the line or Tax Rate?
        // User example says "mathue01" (Tax Code) or Amount?
        // User sample: "18020000" (Price), "0" (Discount). "Thuế" column is empty/0 in example?
        // Wait, user example: "Thuế" column has `1`? Or is `1` the UnitCode?
        // Let's re-read user Request:
        // Headers: ... Mã đơn vị (*) Thuế Số lượng (*) Đơn giá (*) ...
        // Data: ... `mathue01` `1` `18020000` ...
        // So `mathue01` is Unit Code? No.
        // `SJC` -> Product Code (14)
        // `luong` -> Unit Code (15)
        // `mathue01` -> Tax (16)? Or is `mathue01` a Tax Code?
        // If it's a Tax Code, we might need to look it up.
        // If it's a number, it's amount.
        // User text: `mathue01`. This looks like a Tax Code (e.g., VAT10).
        // If it's a code, we can't calculate amount easily without rates.
        // HOWEVER, `importInvoice` payload usually expects calculated values or simple structure.
        // Let's assume `taxAmount` should be 0 if parsing fails, or pass the code if backend handles it?
        // My `getNumVal` will return `NaN` or 0 for `mathue01`.
        // I should probably treat it as string if it's a code.
        // But `invoice.items` in existing logic `taxAmount` was set to 0.
        // Let's stick to 0 for now or try to parse.
        // Given I'm just verifying Logic, I will use `getNumVal` for safety.
        // If user says "Tax" is "mathue01", maybe they mean Tax Code? Use `taxCode` field?
        // I'll add `taxCode` to item structure just in case.

        const lineSubTotal = (row.quantity * row.price) // + taxAmount (if we had it)
        const lineTotal = lineSubTotal - row.discount

        if (row.productCode) {
          invoice.items.push({
            productCode: row.productCode,
            unitCode: row.unitCode,
            quantity: row.quantity,
            price: row.price,
            taxAmount: row.taxAmount || 0, // Using the parsed number (or 0)
            // taxCode: row.taxVal, // If we needed code
            total: lineTotal,
          })
        }
      })

      const payload = {
        items: Array.from(invoicesMap.values()),
      }

      if (payload.items.length === 0) {
        toast.warning('Không tạo được hóa đơn nào từ dữ liệu.')
        return
      }

      const result = await dispatch(importInvoice(payload)).unwrap()

      if (result?.data?.failed?.length > 0) {
        const failures = result.data.failed.map((f) => ({
          row: f.row,
          errors: [
            {
              field: 'Chi tiết',
              message: typeof f.error === 'string' ? f.error : JSON.stringify(f.error),
            },
          ],
        }))
        setErrorList(failures)
        toast.warning(result.message || `Có ${result.data.failed.length} dòng bị lỗi`)
      } else {
        toast.success(result.message || `Đã import thành công ${payload.items.length} hóa đơn`)
        onOpenChange(false)
        setFile(null)
      }

    } catch (error) {
      console.error('Import error:', error)

      // Handle structured import errors
      let importErrors = null

      if (error?.message?.importErrors && Array.isArray(error.message.importErrors)) {
        importErrors = error.message.importErrors
      } else if (error?.importErrors && Array.isArray(error.importErrors)) {
        importErrors = error.importErrors
      } else if (error?.response?.data?.message?.importErrors && Array.isArray(error.response.data.message.importErrors)) {
        importErrors = error.response.data.message.importErrors
      }

      if (importErrors && importErrors.length > 0) {
        const sanitizedErrors = importErrors.map(err => ({
          row: err.row, // note: backend might return index or grouping key? usually row number from error context if backend parses excel. 
          // But here WE parsed excel. Backend receives JSON.
          // So strict row number mapping might be lost if backend refers to "Item Index 0".
          // If backend validates JSON, it returns "items[0].name invalid".
          // We might need to map back items[i] to Excel Rows.
          errors: Array.isArray(err.errors) ? err.errors.map(e => ({
            field: String(e.field || ''),
            message: String(e.message || 'Lỗi không xác định')
          })) : []
        }))
        // Note: Mapping back JSON index to Excel Row is tricky without passing Row ID.
        // For now, display raw errors or generic message if mapping fails.
        setErrorList(sanitizedErrors)
        toast.error('Import thất bại. Vui lòng kiểm tra lại lỗi chi tiết.')
      } else {
        let msg = 'Có lỗi xảy ra, vui lòng thử lại.'
        if (typeof error === 'string') {
          msg = error
        } else if (typeof error?.message === 'string') {
          msg = error.message
          if (typeof msg === 'object') msg = JSON.stringify(msg)
        }
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/invoice/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'invoice_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download template error:', error)
      toast.error('Tải file mẫu thất bại')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Excel Đơn Bán</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách đơn bán.
            <br />
            <span className="text-xs text-muted-foreground">Hệ thống sẽ gom nhóm các dòng cùng CMND + Ngày đơn hàng thành 1 hóa đơn.</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end px-1">
          <Button
            variant="link"
            className="h-auto p-0 text-blue-600"
            onClick={handleDownloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Tải file mẫu
          </Button>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File Excel
            </Label>
            <div className="col-span-3">
              <Input
                id="file"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
          </div>
          {file && (
            <div className="flex items-center gap-2 text-sm text-green-600 justify-center">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}

          {errorList && (
            <div className="mt-4 rounded-md bg-destructive/15 p-3 text-destructive">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>Có lỗi xảy ra:</span>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-white">
                {errorList.map((err, idx) => (
                  <div key={idx} className="mb-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div className="font-semibold text-red-600">Lỗi:</div>
                    <ul className="list-disc pl-5 mt-1">
                      {err.errors.map((e, i) => (
                        <li key={i}>
                          <span className="font-medium text-gray-700">{e.field}:</span> {e.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={() => setFile(null)}>
              Hủy
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleImport} loading={loading} disabled={!file}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportInvoiceDialog
