import React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/custom/Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit2, Trash2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

const statusConfig = {
    open: { label: 'Mới', variant: 'default' },
    in_progress: { label: 'Đang xử lý', variant: 'warning' },
    resolved: { label: 'Đã giải quyết', variant: 'success' },
    closed: { label: 'Đóng', variant: 'secondary' },
    pending: { label: 'Chờ', variant: 'outline' } // fallback
};

const priorityConfig = {
    low: { label: 'Thấp', variant: 'secondary' },
    medium: { label: 'Trung bình', variant: 'default' },
    high: { label: 'Cao', variant: 'warning' },
    urgent: { label: 'Khẩn cấp', variant: 'destructive' },
};

export const TicketTable = ({
    data,
    isLoading,
    onEdit,
    onDelete,
    onStatusChange,
    pagination,
    pageCount,
    rowCount,
    onPaginationChange
}) => {
    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-md border">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-md border text-gray-500 bg-white">
                <p className="text-sm">Không tìm thấy phiếu hỗ trợ nào</p>
            </div>
        )
    }

    // Pagination logic helpers
    const getPageNumbers = () => {
        const pages = []
        const maxVisible = 5
        let start = Math.max(1, pagination.page - Math.floor(maxVisible / 2))
        let end = Math.min(pageCount, start + maxVisible - 1)

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1)
        }

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        return { pages, start, end }
    }

    const { pages, start, end } = getPageNumbers()

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white overflow-hidden shadow-sm pt-2">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-semibold text-gray-700">Mã phiếu</TableHead>
                            <TableHead className="font-semibold text-gray-700">Tiêu đề</TableHead>
                            <TableHead className="font-semibold text-gray-700">Khách hàng</TableHead>
                            <TableHead className="font-semibold text-gray-700">Người xử lý</TableHead>
                            <TableHead className="font-semibold text-gray-700">Độ ưu tiên</TableHead>
                            <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
                            <TableHead className="font-semibold text-gray-700">Ngày tạo</TableHead>
                            <TableHead className="text-right font-semibold text-gray-700">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((ticket) => {
                            const customerName = ticket.customer?.customerName || ticket.customerName || "N/A"
                            const assignedToName = ticket.assignedTo?.fullName || ticket.assignedToName || "Chưa phân công"
                            const statusObj = statusConfig[ticket.status] || statusConfig.pending
                            const priorityObj = priorityConfig[ticket.priority] || priorityConfig.medium

                            return (
                                <TableRow key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium text-indigo-600">
                                        {ticket.ticketCode || ticket.code}
                                    </TableCell>
                                    <TableCell>
                                        <div className="max-w-[200px] truncate font-medium" title={ticket.title}>
                                            {ticket.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{customerName}</TableCell>
                                    <TableCell className="text-gray-600">{assignedToName}</TableCell>
                                    <TableCell>
                                        <Badge variant={priorityObj.variant}>{priorityObj.label}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusObj.variant}>{statusObj.label}</Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500">
                                        {new Date(ticket.createdAt).toLocaleDateString("vi-VN")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 text-xs font-medium text-blue-600 border-blue-300"
                                                    >
                                                        Cập nhật trạng thái
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {Object.entries(statusConfig).filter(([key]) => key !== 'pending').map(([key, value]) => (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            onClick={() => onStatusChange(ticket.id, key)}
                                                            className={ticket.status === key ? "bg-blue-50 text-blue-600 focus:bg-blue-50 focus:text-blue-600 font-medium" : ""}
                                                        >
                                                            {value.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => onEdit(ticket)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => onDelete(ticket.id)}
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pageCount > 1 && (
                <div className="flex items-center justify-between px-2">
                    <div className="text-sm text-gray-500">
                        Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                        <span className="font-medium">{Math.min(pagination.page * pagination.limit, rowCount)}</span> trong tổng số{' '}
                        <span className="font-medium">{rowCount}</span> kết quả
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={() => pagination.page > 1 && onPaginationChange({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page <= 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {start > 1 && (
                            <>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPaginationChange({ ...pagination, page: 1 })}>1</Button>
                                {start > 2 && <Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled><MoreHorizontal className="h-4 w-4" /></Button>}
                            </>
                        )}

                        {pages.map(p => (
                            <Button
                                key={p}
                                variant={pagination.page === p ? "default" : "outline"}
                                size="sm"
                                className={`h-8 w-8 p-0 ${pagination.page === p ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}
                                onClick={() => onPaginationChange({ ...pagination, page: p })}
                            >
                                {p}
                            </Button>
                        ))}

                        {end < pageCount && (
                            <>
                                {end < pageCount - 1 && <Button variant="ghost" size="icon" className="h-8 w-8 p-0" disabled><MoreHorizontal className="h-4 w-4" /></Button>}
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPaginationChange({ ...pagination, page: pageCount })}>{pageCount}</Button>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 p-0"
                            onClick={() => pagination.page < pageCount && onPaginationChange({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page >= pageCount}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TicketTable
