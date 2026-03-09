import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import { approveTransaction, cancelTransaction, getStockTransactions, getStockTransactionById } from '@/stores/StockTransactionSlice'
import { ImportDetailDialog } from './ImportDetailDialog'

export function ImportRowActions({ row }) {
    const transaction = row.original
    const dispatch = useDispatch()
    const { actionLoading } = useSelector((s) => s.stockTransaction)

    const [showDetail, setShowDetail] = useState(false)
    const [detailData, setDetailData] = useState(null)
    const [showApprove, setShowApprove] = useState(false)
    const [showCancel, setShowCancel] = useState(false)
    const [cancelReason, setCancelReason] = useState('')

    const canApprove = transaction.status === 'draft' || transaction.status === 'pending'
    const canCancel = transaction.status === 'draft' || transaction.status === 'pending'

    const refresh = () =>
        dispatch(getStockTransactions({ transactionType: 'import', limit: 20, page: 1 }))

    const handleViewDetail = async () => {
        const result = await dispatch(getStockTransactionById(transaction.id)).unwrap()
        setDetailData(result)
        setShowDetail(true)
    }

    const handleApprove = async () => {
        await dispatch(approveTransaction({ id: transaction.id, notes: '' })).unwrap()
        refresh()
        setShowApprove(false)
    }

    const handleCancel = async () => {
        if (!cancelReason.trim()) return
        await dispatch(cancelTransaction({ id: transaction.id, reason: cancelReason })).unwrap()
        refresh()
        setShowCancel(false)
        setCancelReason('')
    }

    return (
        <>
            <ImportDetailDialog transaction={detailData} open={showDetail} onOpenChange={setShowDetail} />

            {/* Approve confirm */}
            <AlertDialog open={showApprove} onOpenChange={setShowApprove}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Duyệt phiếu nhập kho?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Phiếu <b>{transaction.transactionCode || `#${transaction.id}`}</b> sẽ được ghi sổ và tồn kho sẽ được cập nhật.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={handleApprove} disabled={actionLoading}>
                            {actionLoading ? 'Đang duyệt...' : 'Duyệt'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cancel confirm */}
            <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hủy phiếu nhập kho?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Phiếu sẽ được đánh dấu đã hủy và vẫn lưu trong lịch sử.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="px-6 pb-2">
                        <Input
                            placeholder="Lý do hủy (bắt buộc)..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Đóng</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancel}
                            disabled={actionLoading || !cancelReason.trim()}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {actionLoading ? 'Đang hủy...' : 'Xác nhận hủy'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[170px]">
                    <DropdownMenuItem onClick={handleViewDetail}>
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        Xem chi tiết
                    </DropdownMenuItem>

                    {canApprove && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowApprove(true)} className="text-green-700 focus:text-green-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Duyệt phiếu
                            </DropdownMenuItem>
                        </>
                    )}

                    {canCancel && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setShowCancel(true)} className="text-destructive focus:text-destructive">
                                <XCircle className="mr-2 h-4 w-4" />
                                Hủy phiếu
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
