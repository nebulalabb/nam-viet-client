import { Button } from '@/components/custom/Button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

import { useState } from 'react'
import api from '@/utils/axios'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { IconPresentationAnalytics } from '@tabler/icons-react'
import ExportCategoryView from './ExportCategoryView'

const ExportCategoryDialog = ({
    open,
    onOpenChange,
    showTrigger = true,
    ...props
}) => {
    const [showExportReview, setShowExportReview] = useState(false)
    const [exportData, setExportData] = useState([])
    const [limit, setLimit] = useState('1000')
    const [loading, setLoading] = useState(false)

    const handleReviewExport = async () => {
        setLoading(true)
        try {
            const url = '/categories'
            const { data } = await api.get(url, {
                params: {
                    limit: Number(limit),
                    page: 1
                },
            })

            const categories = data.data?.data || data.data || []

            if (!categories.length) {
                toast.warning('Danh sách danh mục trống')
                return
            }

            setExportData(categories)
            setShowExportReview(true)
        } catch (error) {
            console.log('Export fetch error: ', error)
            toast.error('Có lỗi xảy ra khi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

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

            <DialogContent className="md:h-auto md:w-[320px] z-[100095]" overlayClassName="z-[100094]">
                <DialogHeader>
                    <DialogTitle>Xuất báo cáo danh mục</DialogTitle>
                    <DialogDescription>
                        Chọn số lượng bản ghi để xuất file
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] p-1">
                    <div className="space-y-2">
                        <p className="text-sm text-foreground font-medium">Số lượng dòng</p>
                        <Select value={limit} onValueChange={setLimit}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn số lượng" />
                            </SelectTrigger>
                            <SelectContent className="z-[100100]">
                                <SelectItem value="100">100 dòng mới nhất</SelectItem>
                                <SelectItem value="500">500 dòng mới nhất</SelectItem>
                                <SelectItem value="1000">1000 dòng mới nhất</SelectItem>
                                <SelectItem value="10000">Tất cả (tối đa 10,000)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Hủy
                        </Button>
                    </DialogClose>
                    <Button onClick={handleReviewExport} loading={loading}>
                        <IconPresentationAnalytics className="mr-2 h-4 w-4" />
                        Xem trước
                    </Button>
                </DialogFooter>
            </DialogContent>

            {showExportReview && (
                <ExportCategoryView
                    open={showExportReview}
                    onOpenChange={setShowExportReview}
                    showTrigger={false}
                    data={exportData}
                    closeExport={() => onOpenChange(false)}
                />
            )}
        </Dialog>
    )
}

export default ExportCategoryDialog
