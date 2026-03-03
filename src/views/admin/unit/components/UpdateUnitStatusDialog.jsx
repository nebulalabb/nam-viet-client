import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { updateUnitStatus } from '@/stores/UnitSlice'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function UpdateUnitStatusDialog({
    unit,
    open,
    onOpenChange,
}) {
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()

    const newStatus = unit?.status === 'active' ? 'inactive' : 'active'
    const actionText = unit?.status === 'active' ? 'ngừng hoạt động' : 'kích hoạt'

    const onUpdate = async () => {
        setIsLoading(true)
        try {
            await dispatch(
                updateUnitStatus({
                    id: unit.id,
                    status: newStatus,
                })
            ).unwrap()
            onOpenChange(false)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn {actionText} đơn vị tính{' '}
                        <span className="font-bold">{unit?.unitName}</span>?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button onClick={onUpdate} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xác nhận
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
