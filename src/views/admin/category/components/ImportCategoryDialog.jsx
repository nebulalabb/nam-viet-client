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
import { importCategory } from '@/stores/CategorySlice'
import { FileSpreadsheet, Download, AlertCircle } from 'lucide-react'
import api from '@/utils/axios'
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
            // Create FormData to send the file directly to the backend
            const formData = new FormData()
            formData.append('file', file)

            // Assuming the importCategory thunk accepts FormData
            const response = await dispatch(importCategory(formData)).unwrap()

            toast.success(`Đã import thành công danh mục. Tóm tắt: Thêm mới ${response?.summary?.created || 0} - Cập nhật ${response?.summary?.updated || 0}`)
            onOpenChange(false)
            setFile(null)

        } catch (error) {
            console.error('Import error:', error)

            // Handle structured errors from backend (e.g. { error: 'Validation failed', details: [...] })
            if (error?.details && Array.isArray(error.details)) {
                // Backend returned specific row errors
                const sanitizedErrors = error.details.map(err => ({
                    row: err.row,
                    errors: [{ field: 'Dữ liệu', message: err.error }]
                }))
                setErrorList(sanitizedErrors)
                toast.error('Import thất bại do lỗi dữ liệu. Vui lòng kiểm tra chi tiết.')
            } else {
                // Generic error message
                let msg = 'Có lỗi xảy ra khi import, vui lòng thử lại.'
                if (typeof error === 'string') {
                    msg = error
                } else if (error?.error) {
                    msg = error.error
                } else if (error?.message) {
                    msg = error.message
                }
                toast.error(msg)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadTemplate = async () => {
        try {
            // If we implement an export template endpoint later
            // const response = await api.get('/categories/import-template', {
            //   responseType: 'blob',
            // })
            // const url = window.URL.createObjectURL(new Blob([response.data]))
            // const link = document.createElement('a')
            // link.href = url
            // link.setAttribute('download', 'category_import_template.xlsx')
            // document.body.appendChild(link)
            // link.click()
            // window.URL.revokeObjectURL(url)

            toast.info('Tính năng tải file mẫu đang được phát triển.')
        } catch (error) {
            console.error('Download template error:', error)
            toast.error('Tải file mẫu thất bại')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className="sm:max-w-[600px] z-[100095]" overlayClassName="z-[100094]">
                <DialogHeader>
                    <DialogTitle>Import Excel Danh Mục</DialogTitle>
                    <DialogDescription>
                        Chọn file Excel chứa danh sách danh mục để nhập liệu.
                        <br />
                        <span className="text-xs text-muted-foreground">Vui lòng đảm bảo file đúng định dạng. Cột Tên danh mục là bắt buộc.</span>
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
                        <Label htmlFor="category-file" className="text-right">
                            File Excel
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="category-file"
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
                        Tải lên và Import
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ImportCategoryDialog
