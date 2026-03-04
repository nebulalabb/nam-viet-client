import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getTickets, deleteTicket, updateTicket } from '@/stores/TicketSlice'
import TicketTable from './components/TicketTable'
import TicketDialog from './components/TicketDialog'
import { Button } from '@/components/custom/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, Calendar, Filter,
    Ticket as TicketIcon, CheckCircle, Clock, AlertTriangle, FileDown, Plus, X, RotateCcw
} from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'

const TicketPage = () => {
    const dispatch = useDispatch()

    const tickets = useSelector((state) => state.ticket.tickets)
    const loading = useSelector((state) => state.ticket.loading)
    const serverPagination = useSelector((state) => state.ticket.pagination)

    const [searchTerm, setSearchTerm] = useState("")

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        status: undefined,
        priority: undefined
    })

    // Dialog State
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingTicketId, setDeletingTicketId] = useState(null)

    // Effect fetch
    useEffect(() => {
        document.title = 'Phiếu Hỗ Trợ'
        const timer = setTimeout(() => {
            dispatch(getTickets({
                ...filters,
                search: searchTerm,
            }))
        }, 500)
        return () => clearTimeout(timer)
    }, [dispatch, filters, searchTerm])

    const handleResetFilters = () => {
        setSearchTerm("")
        setFilters({
            page: 1,
            limit: 20,
            status: undefined,
            priority: undefined
        })
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    // Actions
    const handleOpenCreate = () => {
        setSelectedTicket(null)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (ticket) => {
        setSelectedTicket(ticket)
        setIsDialogOpen(true)
    }

    const handleOpenDelete = (id) => {
        setDeletingTicketId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingTicketId) return;
        try {
            await dispatch(deleteTicket(deletingTicketId)).unwrap()
            setIsDeleteDialogOpen(false)
            setDeletingTicketId(null)
            dispatch(getTickets({ ...filters, search: searchTerm })) // refresh
        } catch (error) {
            console.error(error)
        }
    }

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await dispatch(updateTicket({ id: ticketId, data: { status: newStatus } })).unwrap()
            dispatch(getTickets({ ...filters, search: searchTerm })) // refresh
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    // Export Excel
    const handleExportClick = () => {
        if (!tickets || tickets.length === 0) {
            toast.error("Không có dữ liệu để xuất");
            return;
        }
        try {
            const exportData = tickets.map((ticket) => ({
                "Mã phiếu": ticket.ticketCode || ticket.code,
                "Tiêu đề": ticket.title,
                "Khách hàng": ticket.customerName || ticket.customer?.customerName || "N/A",
                "Trạng thái":
                    ticket.status === 'open' ? 'Mới' :
                        ticket.status === 'in_progress' ? 'Đang xử lý' :
                            ticket.status === 'resolved' ? 'Đã giải quyết' : 'Đóng',
                "Độ ưu tiên":
                    ticket.priority === 'urgent' ? 'Khẩn cấp' :
                        ticket.priority === 'high' ? 'Cao' :
                            ticket.priority === 'medium' ? 'Trung bình' : 'Thấp',
                "Ngày tạo": new Date(ticket.createdAt).toLocaleDateString("vi-VN"),
                "Mô tả": ticket.description || "",
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const columnWidths = [
                { wch: 15 }, { wch: 40 }, { wch: 25 }, { wch: 15 },
                { wch: 15 }, { wch: 15 }, { wch: 50 },
            ];
            worksheet["!cols"] = columnWidths;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
            const fileName = `tickets_${new Date().toISOString().split("T")[0]}.xlsx`;
            XLSX.writeFile(workbook, fileName);
            toast.success("Xuất danh sách thành công!");
        } catch (error) {
            toast.error("Lỗi khi xuất file");
            console.error(error);
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Phiếu Hỗ Trợ
                        </h2>
                        <p className="text-sm text-gray-500">Quản lý và theo dõi yêu cầu hỗ trợ từ khách hàng</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={handleExportClick} className="gap-2 h-9" disabled={tickets.length === 0}>
                            <FileDown className="h-4 w-4" /> Xuất Excel
                        </Button>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all h-9 px-4 rounded-md" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" /> Tạo phiếu mới
                        </Button>
                    </div>
                </div>

                {/* STATS (Derived from current page tickets for demo, ideally from an API summary) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <SummaryCard label="Tổng phiếu hiển thị" value={serverPagination?.total || 0} icon={TicketIcon} color="text-blue-600" />
                    <SummaryCard label="Đang xử lý" value={tickets.filter(t => t.status === 'in_progress').length} icon={Clock} color="text-orange-600" />
                    <SummaryCard label="Đã giải quyết" value={tickets.filter(t => t.status === 'resolved').length} icon={CheckCircle} color="text-green-600" />
                    <SummaryCard label="Khẩn cấp" value={tickets.filter(t => t.priority === 'urgent').length} icon={AlertTriangle} color="text-red-600" />
                </div>

                {/* FILTER BAR */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring block pl-9 pr-3"
                                placeholder="Tìm kiếm phiếu hỗ trợ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                        <div className="relative">
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:cursor-pointer"
                                value={filters.status || ""}
                                onChange={(e) => updateFilter('status', e.target.value || undefined)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="open">Mới</option>
                                <option value="in_progress">Đang xử lý</option>
                                <option value="resolved">Đã giải quyết</option>
                                <option value="closed">Đóng</option>
                            </select>
                        </div>

                        <div className="relative">
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:cursor-pointer"
                                value={filters.priority || ""}
                                onChange={(e) => updateFilter('priority', e.target.value || undefined)}
                            >
                                <option value="">Tất cả độ ưu tiên</option>
                                <option value="urgent">Khẩn cấp</option>
                                <option value="high">Cao</option>
                                <option value="medium">Trung bình</option>
                                <option value="low">Thấp</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-gray-500 hover:text-red-600 h-9">
                                <RotateCcw className="h-4 w-4 mr-2" /> Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 flex flex-col space-y-4">
                    <TicketTable
                        data={tickets}
                        isLoading={loading}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onStatusChange={handleStatusChange}
                        pagination={filters}
                        pageCount={serverPagination?.totalPages || 1}
                        rowCount={serverPagination?.total || 0}
                        onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                    />
                </div>

                <TicketDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    initialData={selectedTicket}
                    onSuccess={() => dispatch(getTickets({ ...filters, search: searchTerm }))}
                />

                {isDeleteDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa phiếu hỗ trợ</h3>
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa phiếu hỗ trợ này không? Hành động này không thể hoàn tác.</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                                <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                            </div>
                        </div>
                    </div>
                )}
            </LayoutBody>
        </Layout>
    )
}

function SummaryCard({ label, value, icon: Icon, color }) {
    return (
        <div className={`rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4 bg-white`}>
            <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
        </div>
    )
}

export default TicketPage
