import { useState } from 'react'
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
import { deleteProduct } from '@/stores/ProductSlice'
import { AlertCircle } from 'lucide-react'

export default function DeleteProductDialog({ product, open, onOpenChange }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.product)

    const handleDelete = async () => {
        try {
            await dispatch(deleteProduct(product.id)).unwrap()
            onOpenChange(false)
        } catch (error) {
            // Error handled in Redux slice
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <DialogTitle>Xóa Sản Phẩm</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Bạn có chắc chắn muốn xóa sản phẩm <strong>{product?.productName}</strong>? Hành động này sẽ
                        không thể hoàn tác.
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
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
