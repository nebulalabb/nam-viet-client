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
import { IconTrash } from '@tabler/icons-react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteUser } from '@/stores/UserSlice'

const DeleteEmployeeDialog = ({ open, onOpenChange, user, showTrigger = true, ...props }) => {
    const loading = useSelector((state) => state.user.loading)
    const dispatch = useDispatch()

    const onDelete = async () => {
        try {
            await dispatch(deleteUser(user.id)).unwrap()
            onOpenChange?.(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <IconTrash className="h-4 w-4 text-red-600" />
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Bạn có chắc chắn muốn xóa nhân viên này?</DialogTitle>
                    <DialogDescription>
                        Hành động này không thể hoàn tác. Dữ liệu nhân viên{' '}
                        <b className="text-primary">{user?.fullName}</b> sẽ bị xóa khỏi hệ thống.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button variant="outline">Hủy bỏ</Button>
                    </DialogClose>
                    <Button variant="destructive" onClick={onDelete} loading={loading}>
                        Xác nhận xóa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteEmployeeDialog
