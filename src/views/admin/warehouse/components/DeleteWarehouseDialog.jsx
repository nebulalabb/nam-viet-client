import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDispatch, useSelector } from 'react-redux'
import { deleteWarehouse, getWarehouses } from '@/stores/WarehouseSlice'
import { toast } from 'sonner'
import { Button } from '@/components/custom/Button'

const DeleteWarehouseDialog = ({ warehouse, open, onOpenChange }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.warehouse.loading)

    const handleDelete = async () => {
        try {
            await dispatch(deleteWarehouse(warehouse.id)).unwrap()
            toast.success('Xóa kho hàng thành công')
            dispatch(getWarehouses({ page: 1, limit: 10 }))
            onOpenChange?.(false)
        } catch (error) {
            toast.error(error.message || 'Xóa kho hàng thất bại')
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ tạm khóa kho hàng "<strong>{warehouse?.warehouseName}</strong>".
                        Bạn vẫn có thể khôi phục lại trong tương lai nếu cần.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline" disabled={loading}>
                            Hủy
                        </Button>
                    </AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        loading={loading}
                    >
                        Tiếp tục xóa
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteWarehouseDialog
