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
import { Textarea } from '@/components/ui/textarea'
import { cancelMultiplePromotions } from '@/stores/PromotionSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'

const CancelMultiplePromotionsDialog = ({ open, onOpenChange, selectedRows, table }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)
    const [reason, setReason] = useState('')

    const cancelMultiple = async () => {
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(cancelMultiplePromotions({ ids, reason })).unwrap()
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
                    <DialogTitle>Hủy nhiều khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn hủy <strong>{selectedRows.length}</strong> chương trình khuyến mãi đã chọn không?
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Lý do hủy (Tùy chọn)
                        </label>
                        <Textarea
                            placeholder="Nhập lý do hủy..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={cancelMultiple}
                        loading={loading}
                    >
                        Xác nhận Hủy
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CancelMultiplePromotionsDialog
