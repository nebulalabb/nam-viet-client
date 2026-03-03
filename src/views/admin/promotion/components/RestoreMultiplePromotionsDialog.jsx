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
import { restoreMultiplePromotions } from '@/stores/PromotionSlice'
import { useDispatch, useSelector } from 'react-redux'

const RestoreMultiplePromotionsDialog = ({ open, onOpenChange, selectedRows, table }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)

    const restoreMultiple = async () => {
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(restoreMultiplePromotions(ids)).unwrap()
            table.toggleAllRowsSelected(false)
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Khôi phục nhiều khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn khôi phục <strong>{selectedRows.length}</strong> chương trình khuyến mãi đã chọn không?
                        Các khuyến mãi sau khi khôi phục sẽ chuyển về trạng thái <strong>Chờ duyệt</strong>.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:space-x-0 mt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={restoreMultiple}
                        loading={loading}
                    >
                        Khôi phục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RestoreMultiplePromotionsDialog
