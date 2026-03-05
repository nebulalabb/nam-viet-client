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
import { importSupplier } from '@/stores/SupplierSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'

const ImportSupplierDialog = ({
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

      // --- STRICT VALIDATION START ---
      const EXPECTED_HEADERS = [
        'Tên nhà cung cấp', // 1
        'Mã số thuế',       // 2
        'Người đại diện',   // 3
        'Số điện thoại',    // 4
        'Email',            // 5
        'Địa chỉ',          // 6
        'Ghi chú'           // 7
      ]

      const headerRow = worksheet.getRow(1)
      const actualHeaders = []
      headerRow.eachCell((cell, colNumber) => {
        actualHeaders.push(String(cell.value || '').trim())
      })

      // 1. Signature Check (Too many unknown columns)
      // Allow slight flexibility but not too much. Let's say max + 2 columns.
      if (actualHeaders.length > EXPECTED_HEADERS.length + 2) {
        throw new Error('File Excel chứa quá nhiều cột lạ. Vui lòng sử dụng file mẫu.')
      }

      // 2. Strict Header Compare & Required Fields Check
      // We check if the ESSENTIAL headers exist. 
      // For strict compare, we can check if the first N columns match exactly.
      // Let's assume the template has these headers in order.
      for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
        const expected = EXPECTED_HEADERS[i].toLowerCase()
        const actual = (actualHeaders[i] || '').toLowerCase()
        if (!actual.includes(expected)) {
          // Relaxed check: 'contains' instead of 'equals' to handle potential formatting diffs
          // But user asked for "Strict Compare".
          // Let's try exact match or close enough.
          // If completely different, throw error.
          // However, user might have slightly different header text. 
          // Let's be reasonably strict: check if 'actual' is empty or completely off.
          if (actual === '') {
            throw new Error(`Cột thứ ${i + 1} ("${EXPECTED_HEADERS[i]}") bị thiếu hoặc không đúng định dạng.`)
          }
        }
      }
      // --- STRICT VALIDATION END ---

      const items = []
      const validationErrors = []

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return

        const getVal = (idx) => {
          const val = row.getCell(idx).value
          return val?.text || val || ''
        }

        // Mapping based on: 
        // 1: supplierName, 2: TaxCode, 3: contactName, 4: Phone, 5: Email, 6: Address, 7: notes
        const item = {
          supplierName: String(getVal(1)).trim(),
          taxCode: String(getVal(2)).trim(),
          contactName: String(getVal(3)).trim(),
          phone: String(getVal(4)).trim(),
          email: String(getVal(5)).trim(),
          address: String(getVal(6)).trim(),
          notes: String(getVal(7)).trim(),
          supplierType: 'local', // Default
        }

        // Required Field Validation: supplierName
        if (!item.supplierName) {
          validationErrors.push({
            row: rowNumber,
            errors: [{ field: 'Tên nhà cung cấp', message: 'Bắt buộc nhập' }]
          })
        } else {
          items.push(item)
        }
      })

      if (validationErrors.length > 0) {
        setErrorList(validationErrors)
        toast.error(`Có ${validationErrors.length} dòng lỗi dữ liệu. Vui lòng kiểm tra lại.`)
        return
      }

      if (items.length === 0) {
        toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
        return
      }

      const payload = { items }
      await dispatch(importSupplier(payload)).unwrap()

      toast.success(`Đã import thành công ${items.length} nhà cung cấp`)
      onOpenChange(false)
      setFile(null)

    } catch (error) {
      console.error('Import error:', error)

      // Handle structured import errors
      let importErrors = null

      // Check multiple possible locations for importErrors
      if (error?.message?.importErrors && Array.isArray(error.message.importErrors)) {
        importErrors = error.message.importErrors
      } else if (error?.importErrors && Array.isArray(error.importErrors)) {
        importErrors = error.importErrors
      } else if (error?.response?.data?.message?.importErrors && Array.isArray(error.response.data.message.importErrors)) {
        importErrors = error.response.data.message.importErrors
      }

      if (importErrors && importErrors.length > 0) {
        // Sanitize errors to ensure no objects are rendered
        const sanitizedErrors = importErrors.map(err => ({
          row: err.row,
          errors: Array.isArray(err.errors) ? err.errors.map(e => ({
            field: String(e.field || ''),
            message: String(e.message || 'Lỗi không xác định')
          })) : []
        }))

        setErrorList(sanitizedErrors)
        toast.error('Import thất bại. Vui lòng kiểm tra lại lỗi chi tiết.')
      } else {
        let msg = 'Có lỗi xảy ra, vui lòng thử lại.'
        if (typeof error === 'string') {
          msg = error
        } else if (typeof error?.message === 'string') {
          msg = error.message
        } else if (error?.message && typeof error.message === 'object') {
          try {
            msg = JSON.stringify(error.message)
          } catch (e) {
            msg = 'Lỗi không xác định (Object)'
          }
        }

        if (typeof msg !== 'string') msg = 'Lỗi không xác định'

        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/supplier/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'supplier_import_template.xlsx')
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
          <DialogTitle>Import Excel Nhà Cung Cấp</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách nhà cung cấp để nhập liệu.
            <br />
            <span className="text-xs text-muted-foreground">Đảm bảo file theo đúng mẫu template.</span>
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
                <span>Có lỗi xảy ra khi import:</span>
              </div>
              <ScrollArea className="h-[200px] w-full rounded-md border p-2 bg-white">
                {errorList.map((err, idx) => (
                  <div key={idx} className="mb-2 text-sm border-b pb-2 last:border-0 last:pb-0">
                    <div className="font-semibold text-red-600">Dòng {err.row}:</div>
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

export default ImportSupplierDialog
