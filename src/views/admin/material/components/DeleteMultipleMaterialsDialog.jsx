import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { deleteMultipleMaterials } from '@/stores/MaterialSlice'
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
import { Loader2, Trash2 } from 'lucide-react'

export default function DeleteMultipleMaterialsDialog({ materials, onSuccess }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()

    const onDelete = async () => {
        setIsLoading(true)
        try {
            const ids = materials.map((m) => m.id)
            await dispatch(deleteMultipleMaterials(ids)).unwrap()
            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="h-8">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa {materials.length} đã chọn
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa nhiều</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa {materials.length} nguyên liệu đã chọn? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Xóa {materials.length} mục
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
