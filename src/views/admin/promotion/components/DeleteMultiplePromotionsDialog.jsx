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
import { deleteMultiplePromotions } from '@/stores/PromotionSlice'
import { useDispatch, useSelector } from 'react-redux'

const DeleteMultiplePromotionsDialog = ({ open, onOpenChange, selectedRows, table }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)

    const destroyMultiple = async () => {
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(deleteMultiplePromotions(ids)).unwrap()
            table.toggleAllRowsSelected(false)
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
                    <DialogDescription>
                        <strong>{selectedRows.length}</strong> chương trình khuyến mãi sẽ bị xóa. Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={destroyMultiple}
                        loading={loading}
                    >
                        Xóa Khuyến Mãi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteMultiplePromotionsDialog
