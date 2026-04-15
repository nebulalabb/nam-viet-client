import { useState, useEffect, useCallback } from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { useDispatch } from 'react-redux'
import { checkWarehousesInventory, deleteMultipleWarehouses, getWarehouses } from '@/stores/WarehouseSlice'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    IconAlertTriangle,
    IconPackage,
    IconTrash,
    IconX,
} from '@tabler/icons-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'

export function DeleteMultipleWarehousesDialog({
    open,
    onOpenChange,
    onConfirm,
    count,
    selectedRows = [],
}) {
    const dispatch = useDispatch()
    const [step, setStep] = useState('idle') // idle | checking | hasInventory | hasTransactions | noInventory
    const [inventoryData, setInventoryData] = useState([])
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setStep('checking')
            setLoading(true)
            checkInventory()
        } else {
            setStep('idle')
            setInventoryData([])
            setLoading(false)
            setDeleting(false)
        }
    }, [open])

    const checkInventory = useCallback(async () => {
        try {
            const ids = selectedRows.map((row) => row.original.id)
            const result = await dispatch(checkWarehousesInventory(ids)).unwrap()
            const data = result.data || []
            setInventoryData(data)

            const hasInventory = data.some((w) => w.hasInventory)
            const hasTransactions = data.some((w) => w.hasTransactions)
            setStep(hasInventory ? 'hasInventory' : (hasTransactions ? 'hasTransactions' : 'noInventory'))
        } catch (error) {
            toast.error('Không thể kiểm tra tồn kho: ' + (error?.message || 'Lỗi không xác định'))
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }, [dispatch, selectedRows, onOpenChange])

    const handleForceDelete = async () => {
        setDeleting(true)
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(deleteMultipleWarehouses({ ids, force: true })).unwrap()
            toast.success(`Đã xóa thành công ${ids.length} kho hàng (bao gồm dữ liệu liên quan)`)
            dispatch(getWarehouses({ page: 1, limit: 10 }))
            onConfirm?.()
            onOpenChange(false)
        } catch (error) {
            toast.error(error?.message || 'Xóa kho thất bại')
        } finally {
            setDeleting(false)
        }
    }

    const handleNormalDelete = async () => {
        setDeleting(true)
        try {
            const ids = selectedRows.map((row) => row.original.id)
            await dispatch(deleteMultipleWarehouses({ ids, force: false })).unwrap()
            toast.success(`Đã xóa thành công ${ids.length} kho hàng`)
            dispatch(getWarehouses({ page: 1, limit: 10 }))
            onConfirm?.()
            onOpenChange(false)
        } catch (error) {
            toast.error(error?.message || 'Xóa kho thất bại')
        } finally {
            setDeleting(false)
        }
    }

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num)
    }

    const formatCurrency = (num) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
    }

    // Step: Checking inventory (loading)
    if (loading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                            Đang kiểm tra tồn kho...
                        </DialogTitle>
                        <DialogDescription>
                            Hệ thống đang kiểm tra tồn kho cho {count} kho đã chọn.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )
    }

    // Step: Has inventory - show warning with details
    if (step === 'hasInventory') {
        const warehousesWithInventory = inventoryData.filter((w) => w.hasInventory)
        const warehousesWithoutInventory = inventoryData.filter((w) => !w.hasInventory)

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
                    <DialogHeader className="pb-2 border-b">
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <IconAlertTriangle className="h-6 w-6 text-amber-500" />
                            Cảnh báo: Kho có sản phẩm tồn kho!
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground pt-1">
                            Có <span className="font-semibold text-amber-600">{warehousesWithInventory.length}</span> kho
                            trong số <span className="font-semibold">{inventoryData.length}</span> kho đã chọn đang
                            <span className="font-semibold text-red-500"> còn sản phẩm tồn kho</span>.
                            {warehousesWithoutInventory.length > 0 && (
                                <>
                                    {' '}{warehousesWithoutInventory.length} kho không có tồn kho.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 -mr-4 min-h-0 max-h-[50vh]">
                        <div className="space-y-2 py-3">
                            {/* Warehouses WITH inventory */}
                            <Accordion type="multiple" className="w-full" defaultValue={warehousesWithInventory.map(w => `wh-${w.id}`)}>
                                {warehousesWithInventory.map((warehouse) => {
                                    const totalValue = warehouse.inventoryItems.reduce(
                                        (sum, item) => sum + item.quantity * item.basePrice,
                                        0
                                    )
                                    const totalQty = warehouse.inventoryItems.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                    )

                                    return (
                                        <AccordionItem
                                            key={warehouse.id}
                                            value={`wh-${warehouse.id}`}
                                            className="border border-amber-200 rounded-lg mb-2 bg-amber-50/50 overflow-hidden"
                                        >
                                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-amber-50">
                                                <div className="flex items-center gap-3 w-full mr-2">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                                                        <IconPackage className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col items-start text-left flex-1 min-w-0">
                                                        <div className="font-semibold text-sm truncate w-full">
                                                            {warehouse.warehouseName}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Mã: {warehouse.warehouseCode}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 shrink-0">
                                                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                                                            {warehouse.inventoryItems.length} sản phẩm
                                                        </Badge>
                                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
                                                            SL: {formatNumber(totalQty)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-3">
                                                <div className="rounded-md border bg-white overflow-hidden">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-muted/50 border-b">
                                                                <th className="text-left px-3 py-2 font-medium text-xs">Mã SP</th>
                                                                <th className="text-left px-3 py-2 font-medium text-xs">Tên sản phẩm</th>
                                                                <th className="text-right px-3 py-2 font-medium text-xs">Tồn kho</th>
                                                                <th className="text-right px-3 py-2 font-medium text-xs">Đơn giá</th>
                                                                <th className="text-right px-3 py-2 font-medium text-xs">Thành tiền</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {warehouse.inventoryItems.map((item, idx) => (
                                                                <tr
                                                                    key={item.productId}
                                                                    className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
                                                                >
                                                                    <td className="px-3 py-1.5 text-xs font-mono text-muted-foreground">
                                                                        {item.productCode}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-xs max-w-[180px] truncate">
                                                                        {item.productName}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-xs text-right font-semibold text-red-600">
                                                                        {formatNumber(item.quantity)}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-xs text-right text-muted-foreground">
                                                                        {formatCurrency(item.basePrice)}
                                                                    </td>
                                                                    <td className="px-3 py-1.5 text-xs text-right font-medium">
                                                                        {formatCurrency(item.quantity * item.basePrice)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-muted/30 border-t font-semibold">
                                                                <td colSpan={2} className="px-3 py-2 text-xs">Tổng cộng</td>
                                                                <td className="px-3 py-2 text-xs text-right text-red-600">
                                                                    {formatNumber(totalQty)}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-right"></td>
                                                                <td className="px-3 py-2 text-xs text-right text-red-600">
                                                                    {formatCurrency(totalValue)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>

                            {/* Warehouses WITHOUT inventory */}
                            {warehousesWithoutInventory.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                        Kho không có tồn kho ({warehousesWithoutInventory.length}):
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {warehousesWithoutInventory.map((w) => (
                                            <Badge key={w.id} variant="secondary" className="text-xs">
                                                {w.warehouseName}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="border-t pt-3 space-y-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700 font-medium flex items-center gap-1.5">
                                <IconAlertTriangle className="h-4 w-4 shrink-0" />
                                Nếu tiếp tục xóa, toàn bộ số lượng tồn kho sẽ bị xóa vĩnh viễn khỏi hệ thống.
                            </p>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={deleting}
                            >
                                <IconX className="mr-2 h-4 w-4" />
                                Hủy bỏ
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleForceDelete}
                                loading={deleting}
                            >
                                <IconTrash className="mr-2 h-4 w-4" />
                                Xác nhận xóa tất cả
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Step: Has transactions - show warning
    if (step === 'hasTransactions') {
        const warehousesWithTransactions = inventoryData.filter((w) => w.hasTransactions)

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="flex items-center gap-2 text-amber-600">
                            <IconAlertTriangle className="h-6 w-6 text-amber-500" />
                            Cảnh báo: Kho có lịch sử giao dịch!
                        </DialogTitle>
                        <DialogDescription className="text-sm pt-1">
                            Có <span className="font-semibold text-amber-600">{warehousesWithTransactions.length}</span> kho
                            đang có <span className="font-semibold">lịch sử giao dịch, nhập/xuất hoặc hóa đơn</span> liên quan.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 my-2">
                        <p className="text-sm text-red-700 font-medium leading-relaxed">
                            Việc xóa các kho này sẽ <span className="font-bold underline">XÓA VĨNH VIỄN</span> toàn bộ
                            lịch sử giao dịch tồn kho, luân chuyển và các hóa đơn liên đới. Bạn có chắc chắn muốn buộc xóa (Force Delete)?
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={deleting}
                        >
                            Hủy bỏ
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleForceDelete}
                            loading={deleting}
                        >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Xác nhận buộc xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    // Step: No inventory and no transactions - simple confirmation
    if (step === 'noInventory') {
        return (
            <AlertDialog open={open} onOpenChange={onOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn đang chuẩn bị xóa{' '}
                            <span className="font-semibold text-foreground">{count}</span> kho hàng đã chọn.
                            Các kho này hiện không có sản phẩm tồn kho hay lịch sử giao dịch.
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => onOpenChange(false)} disabled={deleting}>
                            Hủy
                        </AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleNormalDelete}
                            loading={deleting}
                        >
                            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                            Xóa
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )
    }

    return null
}
