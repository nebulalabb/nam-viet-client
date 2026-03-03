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
import { approveMultiplePromotions } from '@/stores/PromotionSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'

const ApproveMultiplePromotionsDialog = ({ open, onOpenChange, selectedRows, table }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)
    const [notes, setNotes] = useState('')

    const approveMultiple = async () => {
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(approveMultiplePromotions({ ids, notes })).unwrap()
            table.toggleAllRowsSelected(false)
            setNotes('')
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Duyệt nhiều khuyến mãi</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn duyệt <strong>{selectedRows.length}</strong> chương trình khuyến mãi đã chọn không?
                        Các khuyến mãi sau khi duyệt sẽ chuyển sang trạng thái <strong>Đang hoạt động</strong>.
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

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Đóng
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={approveMultiple}
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

export default ApproveMultiplePromotionsDialog
