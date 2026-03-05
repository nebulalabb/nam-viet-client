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
import { useDispatch, useSelector } from 'react-redux'
import { approvePromotion } from '@/stores/PromotionSlice'
import { useState } from 'react'

const ApprovePromotionDialog = ({ promotion, open, onOpenChange }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)
    const [notes, setNotes] = useState('')

    const handleApprove = async () => {
        try {
            await dispatch(
                approvePromotion({
                    id: promotion.id,
                    data: { notes }
                })
            ).unwrap()
            onOpenChange?.(false)
        } catch (error) {
            console.error('Failed to approve promotion:', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Duyệt khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn duyệt chương trình khuyến mãi <strong>{promotion?.promotionCode}</strong> không?
                        Khuyến mãi sau khi duyệt sẽ chuyển sang trạng thái "Đang hoạt động" và có thể được sử dụng.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Ghi chú (Tùy chọn)
                        </label>
                        <Textarea
                            placeholder="Nhập ghi chú duyệt..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Hủy
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleApprove}
                        loading={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Xác nhận Duyệt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ApprovePromotionDialog
