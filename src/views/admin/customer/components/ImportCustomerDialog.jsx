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
import { importCustomer } from '@/stores/CustomerSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'

const ImportCustomerDialog = ({
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
        'Loại khách hàng',  // 1
        'Khách hàng',       // 2
        'Số điện thoại',    // 3
        'Địa chỉ',          // 4
        'Địa chỉ email',    // 5
        'Tên công ty',      // 6
        'Mã số thuế',       // 7
        'CMND/CCCD',        // 8
        'Ngày cấp',         // 9
        'Nơi cấp',          // 10
        'Ghi chú',          // 11
        'Phân loại KH',     // 12
        'Giới tính',        // 13
        'Trạng thái',       // 14
        'Hạn mức nợ'        // 15
      ]

      const headerRow = worksheet.getRow(1)
      const actualHeaders = []
      headerRow.eachCell((cell, colNumber) => {
        actualHeaders.push(String(cell.value || '').trim())
      })

      // 1. Signature Check
      if (actualHeaders.length > EXPECTED_HEADERS.length + 2) {
        throw new Error('File Excel chứa quá nhiều cột lạ. Vui lòng sử dụng file mẫu.')
      }

      // 2. Strict Header Compare
      for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
        const expected = EXPECTED_HEADERS[i].toLowerCase()
        const actual = (actualHeaders[i] || '').toLowerCase()

        // Use 'includes' to allow minor differences (e.g. "Tên khách hàng *" vs "Tên khách hàng")
        if (!actual.includes(expected)) {
          throw new Error(`Cột thứ ${i + 1} ("${EXPECTED_HEADERS[i]}") bị thiếu hoặc không đúng định dạng.`)
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

        // Handle Date parsing
        const getDateVal = (idx) => {
          const val = row.getCell(idx).value
          if (val instanceof Date) {
            return format(val, 'yyyy-MM-dd')
          }
          return val ? String(val) : null
        }

        // Mapping based on new template:
        const item = {
          customerType: String(getVal(1) || 'individual').trim(),
          name: String(getVal(2)).trim(),
          phone: String(getVal(3)).trim(),
          address: String(getVal(4)).trim(),
          email: String(getVal(5)).trim(),
          represent: String(getVal(6)).trim(),
          taxCode: String(getVal(7)).trim(),
          identityCard: String(getVal(8)).trim(),
          identityDate: getDateVal(9),
          identityPlace: String(getVal(10)).trim(),
          note: String(getVal(11)).trim(),
          classification: String(getVal(12)).trim(),
          gender: String(getVal(13)).trim() === 'Nam' ? 'male' : String(getVal(13)).trim() === 'Nữ' ? 'female' : 'other',
          status: String(getVal(14)).trim() === 'Khóa' ? 'inactive' : 'active',
          creditLimit: getVal(15) ? Number(getVal(15)) : 0,
        }

        // Clean up empty strings to null
        if (item.taxCode === 'null' || item.taxCode === '') item.taxCode = null
        if (item.identityCard === 'null' || item.identityCard === '') item.identityCard = null

        // Required Field Validation: Name
        if (!item.name) {
          validationErrors.push({
            row: rowNumber,
            errors: [{ field: 'Tên khách hàng', message: 'Bắt buộc nhập' }]
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
      await dispatch(importCustomer(payload)).unwrap()

      toast.success(`Đã import thành công ${items.length} khách hàng`)
      onOpenChange(false)
      setFile(null)

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
      const response = await api.get('/customers/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'customer_import_template.xlsx')
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
          <DialogTitle>Import Excel Khách Hàng</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách khách hàng để nhập liệu.
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

export default ImportCustomerDialog
