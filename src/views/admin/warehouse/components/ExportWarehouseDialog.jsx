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
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { IconPresentationAnalytics } from '@tabler/icons-react'
import ExportWarehouseView from './ExportWarehouseView'

const ExportWarehouseDialog = ({
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
            const url = '/warehouses'
            const { data } = await api.get(url, {
                params: {
                    limit: Number(limit),
                    page: 1
                },
            })

            const warehouses = data.data?.data || data.data || []

            if (!warehouses.length) {
                toast.warning('Danh sách kho hàng trống')
                return
            }

            setExportData(warehouses)
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
            <DialogContent className="md:h-auto md:w-[320px] z-[100095]" overlayClassName="z-[100094]">
                <DialogHeader>
                    <DialogTitle>Xuất báo cáo kho hàng</DialogTitle>
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
                <ExportWarehouseView
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

export default ExportWarehouseDialog
