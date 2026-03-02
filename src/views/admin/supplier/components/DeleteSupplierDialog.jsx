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
import { deleteSupplier } from '@/stores/SupplierSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import { useDispatch, useSelector } from 'react-redux'

const DeleteSupplierDialog = ({ supplier, showTrigger = true, contentClassName, overlayClassName, ...props }) => {
    const dispatch = useDispatch()
    const loading = useSelector((state) => state.supplier.loading)

    const destroy = async (id) => {
        try {
            await dispatch(deleteSupplier(id)).unwrap()
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    return (
        <Dialog {...props}>
            {showTrigger ? (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <TrashIcon className="mr-2 size-4 text-red-500" aria-hidden="true" />
                    </Button>
                </DialogTrigger>
            ) : null}
            <DialogContent className={contentClassName} overlayClassName={overlayClassName}>
                <DialogHeader>
                    <DialogTitle>Bạn chắc chắn thực hiện hành động này?</DialogTitle>
                    <DialogDescription>
                        Hành động này không thể hoàn tác. Nhà cung cấp:{' '}
                        <strong>{supplier?.supplierName || supplier?.supplierCode}</strong> sẽ bị xóa khỏi hệ thống.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:space-x-0 pt-4">
                    <DialogClose asChild>
                        <Button variant="outline">Hủy</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            onClick={() => destroy(supplier.id)}
                            loading={loading}
                        >
                            Tiếp tục
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteSupplierDialog
