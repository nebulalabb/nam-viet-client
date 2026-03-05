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
import { importProduct } from '@/stores/ProductSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'

const ImportProductDialog = ({
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

      const items = []

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return

        const getVal = (idx) => {
          const val = row.getCell(idx).value
          return val?.text || val || ''
        }
        const getNum = (idx) => {
          const val = row.getCell(idx).value
          return Number(val) || 0
        }
        const getUnitConversions = (idx) => {
          const val = getVal(idx)
          if (!val) return []
          try {
            // Try standard JSON first
            return JSON.parse(val)
          } catch (e) {
            // Fallback for comma separated key:value format like "Chỉ:10,Phân:10"
            try {
              const conversions = []
              const pairs = val.split(',')
              for (const pair of pairs) {
                const [unitCode, factorStr] = pair.split(':')
                if (unitCode && factorStr) {
                  conversions.push({
                    unitCode: unitCode.trim(),
                    conversionFactor: parseFloat(factorStr.trim()) || 1
                  })
                }
              }
              return conversions
            } catch (err) {
              console.warn('Error parsing unitConversions at row', rowNumber, val)
              return []
            }
          }
        }

        let effectiveDate = row.getCell(11).value
        if (effectiveDate instanceof Date) {
          effectiveDate = format(effectiveDate, 'yyyy-MM-dd')
        } else {
          effectiveDate = String(effectiveDate || '')
        }

        const item = {
          code: String(getVal(1)),
          name: String(getVal(2)),
          basePrice: getNum(3),
          price: getNum(4),
          categoryCode: String(getVal(5)),
          unitCode: String(getVal(6)),
          supplierCode: String(getVal(7)),
          type: String(getVal(8) || 'physical'),
          description: String(getVal(9)),
          note: String(getVal(10)),
          effectiveDate: effectiveDate,
          unitConversions: getUnitConversions(12)
        }

        // Only skip completely empty rows. If they have at least one of these critical fields, push to items.
        if (item.code || item.name || item.categoryCode || item.supplierCode) {
          items.push(item)
        }
      })

      // if (items.length === 0) {
      //   toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
      //   return
      // }

      const payload = { items }
      const response = await dispatch(importProduct(payload)).unwrap()

      // Handle structured response even on success (200 OK)
      if (response?.data?.counts && (response.data.counts.failed > 0 || response.data.failed?.length > 0)) {
        const failedItems = response.data.failed || []
        const formattedErrors = failedItems.map((item) => ({
          row: item.row,
          errors: item.error
            ? item.error.split(';').map((e) => ({
              field: 'Lỗi',
              message: e.trim(),
            }))
            : [{ field: 'Lỗi', message: 'Lỗi không xác định' }],
        }))

        setErrorList(formattedErrors)
        toast.warning(
          response.message ||
          `Import hoàn tất với ${response.data.counts.failed} lỗi`,
        )
      } else {
        toast.success(
          response.message || `Đã import thành công ${items.length} sản phẩm`,
        )
        onOpenChange(false)
        setFile(null)
      }

    } catch (error) {
      console.error('Import error:', error)

      // Handle structured import errors
      // Handle structured import errors
      let importErrors = null

      // Check for backend structured errors (errors array)
      if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Transform flat errors to grouped errors
        const flatErrors = error.response.data.errors;
        const groupedErrors = {};

        flatErrors.forEach(err => {
          if (!groupedErrors[err.row]) {
            groupedErrors[err.row] = { row: err.row, errors: [] };
          }
          groupedErrors[err.row].errors.push({
            field: err.field,
            message: err.message
          });
        });

        importErrors = Object.values(groupedErrors);
      }
      // Fallback for previous error structures if any
      else if (error?.message?.importErrors && Array.isArray(error.message.importErrors)) {
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
          // If message is object (and not handled above), stringify it safely
          try {
            msg = JSON.stringify(error.message)
          } catch (e) {
            msg = 'Lỗi không xác định (Object)'
          }
        }

        // Final safety Check
        if (typeof msg !== 'string') msg = 'Lỗi không xác định'

        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/product/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'product_import_template.xlsx')
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
          <DialogTitle>Import Excel Sản Phẩm</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách sản phẩm để nhập liệu.
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
            <Button type="button" variant="outline" onClick={() => { setFile(null); setErrorList(null); }}>
              Đóng
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

export default ImportProductDialog
