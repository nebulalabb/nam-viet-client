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
import { useDispatch, useSelector } from 'react-redux'
import { restorePromotion } from '@/stores/PromotionSlice'

const RestorePromotionDialog = ({ promotion, open, onOpenChange }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)

    const handleRestore = async () => {
        try {
            await dispatch(restorePromotion(promotion.id)).unwrap()
            onOpenChange?.(false)
        } catch (error) {
            console.error('Failed to restore promotion:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Khôi phục khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn khôi phục chương trình khuyến mãi <strong>{promotion?.promotionCode}</strong> không?
                        Khuyến mãi sau khi khôi phục sẽ chuyển về trạng thái <strong>Chờ duyệt</strong>.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Đóng
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleRestore}
                        loading={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Khôi phục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RestorePromotionDialog
