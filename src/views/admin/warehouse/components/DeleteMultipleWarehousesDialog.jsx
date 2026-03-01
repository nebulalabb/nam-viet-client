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
import { TrashIcon } from '@radix-ui/react-icons'

export function DeleteMultipleWarehousesDialog({
    open,
    onOpenChange,
    onConfirm,
    count,
}) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn xóa hàng loạt?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này sẽ tạm khóa{' '}
                        <span className="font-medium text-foreground">{count}</span> kho hàng
                        đã chọn. Bạn vẫn có thể khôi phục lại trong tương lai nếu cần.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>
                        Hủy
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            onConfirm()
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                        Xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
