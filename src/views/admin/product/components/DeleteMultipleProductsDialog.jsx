import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { deleteProduct, getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'

export default function DeleteMultipleProductsDialog({ products, onSuccess }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()

    const handleDelete = async () => {
        setLoading(true)
        try {
            // Vì backend chưa có api bulk-delete cho product, ta dùng vòng lặp tạm thời
            const ids = products.map(p => p.id)
            for (const id of ids) {
                await dispatch(deleteProduct(id)).unwrap()
            }
            toast.success(`Đã xóa ${ids.length} sản phẩm thành công`)
            dispatch(getProducts())
            onSuccess?.()
            setOpen(false)
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa sản phẩm')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8 lg:flex">
                    <Trash className="mr-2 h-4 w-4" />
                    Xóa ({products.length})
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Xóa Sản Phẩm Hàng Loạt</DialogTitle>
                    <DialogDescription className="pt-4">
                        Bạn có chắc chắn muốn xóa <strong>{products.length}</strong> sản phẩm đã chọn?
                        Hành động này sẽ không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
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
