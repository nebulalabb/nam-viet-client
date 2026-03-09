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
import { importPurchaseOrder } from '@/stores/PurchaseOrderSlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
import ExcelJS from 'exceljs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format, parse, isValid } from 'date-fns'

const ImportPurchaseOrderDialog = ({
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
    // Try to parse string date if needed. Assume Excel returns Date object or typical string.
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

        // Mapping:
        // 1. Mã nhóm đơn mua (purchaseNo)
        // 2. Mã đơn đối tác (externalOrderCode)
        // 3. Ngày đặt hàng (*)
        // 4. Ngày dự kiến nhận hàng (*)
        // 5. Ghi chú
        // 6. Tên nhà cung cấp (*)
        // 7. SĐT nhà cung cấp
        // 8. Email nhà cung cấp
        // 9. Địa chỉ nhà cung cấp
        // 10. Mã số thuế NCC
        // 11. Người đại diện NCC
        // 12. Mã sản phẩm (*)
        // 13. Số lượng (*)
        // 14. Mã đơn vị (*)
        // 15. Đơn giá (*)
        // 16. Chiết khấu (%)

        rows.push({
          rowNumber,
          purchaseNo: String(getVal(1)),
          externalOrderCode: String(getVal(2)),
          orderDate: getDateVal(3),
          expectedDeliveryDate: getDateVal(4),
          note: String(getVal(5)),
          supplierName: String(getVal(6)),
          supplierPhone: String(getVal(7)),
          supplierEmail: String(getVal(8)),
          supplierAddress: String(getVal(9)),
          supplierTax: String(getVal(10)),
          supplierRep: String(getVal(11)),
          productCode: String(getVal(12)),
          quantity: Number(getVal(13)) || 0,
          unitCode: String(getVal(14)),
          unitPrice: Number(getVal(15)) || 0,
          discountRate: Number(getVal(16)) || 0,
        })
      })

      if (rows.length === 0) {
        toast.warning('Không tìm thấy dữ liệu hợp lệ trong file Excel')
        return
      }

      // Grouping Logic:
      // Group by: purchaseNo
      const ordersMap = new Map()

      rows.forEach(row => {
        if (!row.purchaseNo) return

        const key = row.purchaseNo

        if (!ordersMap.has(key)) {
          ordersMap.set(key, {

            externalOrderCode: row.externalOrderCode,
            orderDate: row.orderDate,
            expectedDeliveryDate: row.expectedDeliveryDate,
            note: row.note,
            supplierCode: '', // Not provided in 16 columns
            supplierTax: row.supplierTax,
            supplierInfo: {
              name: row.supplierName,
              phone: row.supplierPhone,
              email: row.supplierEmail,
              address: row.supplierAddress,
              representative: row.supplierRep
            },
            items: [],
          })
        }

        const order = ordersMap.get(key)

        if (row.productCode) {
          order.items.push({
            productCode: row.productCode,
            productName: '', // Not provided in 16 columns, backend likely looks it up
            quantity: row.quantity,
            unitPrice: row.unitPrice,
            discountRate: row.discountRate,
            unitCode: row.unitCode
          })
        }
      })

      const payload = {
        items: Array.from(ordersMap.values())
      }

      if (payload.items.length === 0) {
        toast.warning('Không tạo được đơn hàng nào từ dữ liệu.')
        return
      }

      const response = await dispatch(importPurchaseOrder(payload)).unwrap()

      const { counts, success, failed } = response.data || {}

      if (counts?.failed > 0) {
        const sanitizedErrors = failed.map(err => ({
          row: err.row,
          errors: [{
            field: 'Lỗi',
            message: err.error
          }]
        }))
        setErrorList(sanitizedErrors)

        if (counts.success > 0) {
          toast.warning(`Import hoàn tất: ${counts.success} thành công, ${counts.failed} thất bại`)
        } else {
          toast.error(`Import thất bại: ${counts.failed} lỗi`)
        }
      } else {
        toast.success(`Đã import thành công ${counts?.success || payload.items.length} đơn hàng`)
        onOpenChange(false)
        setFile(null)
      }

    } catch (error) {
      console.error('Import error:', error)
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
          // If backend returns row index, we might not map exactly if we grouped.
          // Just display what backend says.
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
      const response = await api.get('/purchase-orders/import-template?type=excel', {
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'purchase_order_import_template.xlsx')
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
          <DialogTitle>Import Excel Đơn Đặt Hàng</DialogTitle>
          <DialogDescription>
            Chọn file Excel chứa danh sách đơn đặt hàng.
            <br />
            <span className="text-xs text-muted-foreground">Hệ thống sẽ gom nhóm các dòng cùng Mã NCC + Mã đơn hàng thành 1 đơn.</span>
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

export default ImportPurchaseOrderDialog
