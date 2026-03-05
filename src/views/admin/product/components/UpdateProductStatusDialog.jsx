import { useDispatch, useSelector } from 'react-redux'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updateProduct } from '@/stores/ProductSlice'

export default function UpdateProductStatusDialog({
    product,
    open,
    onOpenChange,
    newStatus,
}) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.product)

    const handleUpdateStatus = async () => {
        try {
            // In the product service, status update is part of the regular update endpoint PUT /products/:id
            await dispatch(updateProduct({ id: product.id, data: { status: newStatus } })).unwrap()
            onOpenChange(false)
        } catch (error) {
            // handled
        }
    }

    const statusLabels = {
        active: 'Đang bán',
        inactive: 'Ngừng bán',
        discontinued: 'Bỏ mẫu'
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cập Nhật Trạng Thái</DialogTitle>
                    <DialogDescription className="pt-4">
                        Bạn có chắc muốn chuyển trạng thái sản phẩm <strong>{product?.productName}</strong> sang{' '}
                        <strong>{statusLabels[newStatus]}</strong>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleUpdateStatus} disabled={loading}>
                        {loading ? 'Đang cập nhật...' : 'Xác nhận'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
