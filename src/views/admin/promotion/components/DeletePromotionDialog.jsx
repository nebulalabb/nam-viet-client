import { Button } from '@/components/custom/Button'
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
import { cancelPromotion, deletePromotion } from '@/stores/PromotionSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

const DeletePromotionDialog = ({ promotion, isDeleteAction = false, showTrigger = true, contentClassName, overlayClassName, onOpenChange, ...props }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.promotion.loading)
    const [reason, setReason] = useState('')

    const destroy = async (id) => {
        if (!isDeleteAction && reason.trim().length > 500) {
            toast.error('Lý do hủy không được vượt quá 500 ký tự')
            return
        }
        try {
            if (isDeleteAction) {
                await dispatch(deletePromotion(id)).unwrap()
            } else {
                await dispatch(cancelPromotion({ id, data: { reason: reason.trim() } })).unwrap()
            }
            setReason('')
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog {...props} onOpenChange={onOpenChange}>
            {showTrigger ? (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                    </Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className={contentClassName} overlayClassName={overlayClassName}>
                <DialogHeader>
                    <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
                    <DialogDescription>
                        Chương trình khuyến mãi:{' '}
                        <strong>{promotion.promotionName}</strong> sẽ bị {isDeleteAction ? 'xóa' : 'hủy'}. Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                {!isDeleteAction && (
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">
                                Lý do hủy (Tùy chọn)
                            </label>
                            <Textarea
                                placeholder="Nhập lý do hủy khuyến mãi..."
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button variant="outline">Đóng</Button>
                    </DialogClose>
                    <Button
                        variant="destructive"
                        onClick={() => destroy(promotion.id)}
                        loading={loading}
                    >
                        {isDeleteAction ? 'Xóa Khuyến Mãi' : 'Hủy Khuyến Mãi'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeletePromotionDialog
