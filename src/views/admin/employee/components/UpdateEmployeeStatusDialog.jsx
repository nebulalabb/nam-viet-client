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
import { useDispatch, useSelector } from 'react-redux'
import { updateUserStatus } from '@/stores/UserSlice'

const UpdateEmployeeStatusDialog = ({ open, onOpenChange, user, showTrigger = true, ...props }) => {
    const loading = useSelector((state) => state.user.loading)
    const dispatch = useDispatch()

    const onUpdateStatus = async () => {
        try {
            // Toggle status between active and inactive/suspended
            const newStatus = user.status === 'active' ? 'inactive' : 'active'
            await dispatch(updateUserStatus({ id: user.id, data: { status: newStatus } })).unwrap()
            onOpenChange?.(false)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Cập nhật trạng thái</Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn chuyển trạng thái nhân viên{' '}
                        <b className="text-primary">{user?.fullName}</b> thành{' '}
                        <b className={user?.status === 'active' ? 'text-orange-600' : 'text-green-600'}>
                            {user?.status === 'active' ? 'Không hoạt động' : 'Hoạt động'}
                        </b>?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button variant="outline">Hủy bỏ</Button>
                    </DialogClose>
                    <Button onClick={onUpdateStatus} loading={loading}>
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateEmployeeStatusDialog
