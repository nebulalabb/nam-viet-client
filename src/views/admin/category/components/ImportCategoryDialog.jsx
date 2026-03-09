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
import { importCategories } from '@/stores/CategorySlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'

const ImportCategoryDialog = ({
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
        'STT',
        'Tên danh mục (*)',
        'Mã danh mục (*)',
        'Đường dẫn (*)',
        'Danh mục cha',
        'Mô tả',
        'Trạng thái (*)'
      ]

      const headerRow = worksheet.getRow(7)
      const actualHeaders = []
      headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= EXPECTED_HEADERS.length) {
          actualHeaders.push(String(cell.value || '').trim())
        }
      })

      for (let i = 0; i < EXPECTED_HEADERS.length; i++) {
        const expected = EXPECTED_HEADERS[i].split(' ')[0].toLowerCase()
        const actual = (actualHeaders[i] || '').toLowerCase()
        if (!actual.includes(expected)) {
          throw new Error(`Cột thứ ${i + 1} ("${EXPECTED_HEADERS[i]}") bị thiếu hoặc không đúng định dạng. Cột hiện tại: "${actualHeaders[i] || 'Trống'}"`)
        }
      }
      // --- STRICT VALIDATION END ---

      const items = []
      const validationErrors = []

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= 7) return // Skip rows up to 7 (6 instructions + 1 header)

        const getVal = (idx) => {
          const val = row.getCell(idx).value
          return val?.text || val || ''
        }

        // Mapping based on headers: 
        // 1: STT, 2: name, 3: code, 4: slug, 5: parentName, 6: description, 7: status
        const item = {
          categoryName: String(getVal(2)).trim(),
          categoryCode: String(getVal(3)).trim(),
          slug: String(getVal(4)).trim(),
          parentName: String(getVal(5)).trim(),
          description: String(getVal(6)).trim(),
          status: String(getVal(7)).trim() || 'Hoạt động',
        }

        const rowErrors = []
        if (!item.categoryName) rowErrors.push({ field: 'Tên danh mục', message: 'Bắt buộc nhập' })
        if (!item.categoryCode) rowErrors.push({ field: 'Mã danh mục', message: 'Bắt buộc nhập' })
        if (!item.slug) rowErrors.push({ field: 'Đường dẫn', message: 'Bắt buộc nhập' })

        if (rowErrors.length > 0) {
          validationErrors.push({
            row: rowNumber,
            errors: rowErrors
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
      await dispatch(importCategories(payload)).unwrap()

      toast.success(`Đã import thành công ${items.length} danh mục`)
      onOpenChange(false)
      setFile(null)

    } catch (error) {
      console.error('Import error:', error)

      let importErrors = null

      if (error?.message?.importErrors && Array.isArray(error.message.importErrors)) {
        importErrors = error.message.importErrors
      } else if (error?.importErrors && Array.isArray(error.importErrors)) {
        importErrors = error.importErrors
      } else if (error?.response?.data?.message?.importErrors && Array.isArray(error.response.data.message.importErrors)) {
        importErrors = error.response.data.message.importErrors
      } else if (error?.message?.errors && Array.isArray(error.message.errors)) {
        importErrors = error.message.errors;
      } else if (error?.errors && Array.isArray(error.errors)) {
        importErrors = error.errors;
      }

      if (importErrors && importErrors.length > 0) {
        const sanitizedErrors = importErrors.map(err => ({
          row: err.row,
          errors: Array.isArray(err.errors) ? err.errors.map(e => ({
            field: String(e.field || ''),
            message: String(e.message || 'Lỗi không xác định')
          })) : [{ field: 'Chi tiết', message: String(err.message || 'Lỗi không xác định') }]
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
      const response = await api.get('/categories/import-template', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'Template_Import_Danh_Muc.xlsx')
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
          <DialogTitle>Import Excel Danh Mục</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách danh mục để nhập liệu.
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

export default ImportCategoryDialog
