import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState, useRef } from 'react'
import { getDebts, exportDebtList, syncFullBatch, syncSnapBatch } from '@/stores/DebtSlice'
import DebtReconciliationTable from './components/DebtReconciliationTable'
import { ViewDebtReconciliationDialog } from './components/ViewDebtReconciliationDialog'
import { ConfirmSyncDialog } from './components/ConfirmSyncDialog'
import IntegrityWidget from './components/IntegrityWidget'
import { Button } from '@/components/custom/Button'
import { formatCurrency } from '@/utils/number-format'
import { exportDebtToExcel } from '@/utils/list-debt-excel-export' // We will implement or copy this next
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, Calendar, Filter, RefreshCcw,
    Users, UserCog, MapPin, Activity,
    ArrowUpRight, ArrowDownLeft, Scale, DollarSign, AlertTriangle, Info, FileDown, ShieldAlert, Layers
} from 'lucide-react'

const CustomerDebtPage = () => {
    const dispatch = useDispatch()

    const debts = useSelector((state) => state.debt.debts)
    const loading = useSelector((state) => state.debt.loading)
    const serverPagination = useSelector((state) => state.debt.pagination)

    const [searchTerm, setSearchTerm] = useState("")
    const [addressTerm, setAddressTerm] = useState("")

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
        year: new Date().getFullYear(),
        type: 'customer',
        status: undefined,
        assignedUserId: undefined,
        address: undefined
    })

    // Dialog State
    const [viewData, setViewData] = useState({ id: null, type: 'customer', year: new Date().getFullYear() })
    const [isViewOpen, setIsViewOpen] = useState(false)
    const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

    const handleView = (id, type, year) => {
        setViewData({ id: Number(id), type, year: Number(year) })
        setIsViewOpen(true)
    }

    // Effect fetch
    useEffect(() => {
        document.title = 'Tổng hợp công nợ'
        const timer = setTimeout(() => {
            dispatch(getDebts({
                ...filters,
                search: searchTerm,
                address: addressTerm
            }))
        }, 500) // simple debounce
        return () => clearTimeout(timer)
    }, [dispatch, filters, searchTerm, addressTerm])

    const handleResetFilters = () => {
        setSearchTerm("")
        setAddressTerm("")
        setFilters({
            page: 1,
            limit: 20,
            year: new Date().getFullYear(),
            type: 'customer',
            status: undefined,
            assignedUserId: undefined,
            address: undefined
        })
    }

    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const finalSummary = serverPagination?.summary || {
        opening: 0, increase: 0, returnAmount: 0, adjustmentAmount: 0, payment: 0, closing: 0
    }

    const isDebtVal = finalSummary.closing > 1000
    const isOverpaid = finalSummary.closing < -1000
    const absClosing = Math.abs(finalSummary.closing)

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Tổng hợp công nợ
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-md transition-all h-9 px-4 rounded-md">
                                    <FileDown className="h-4 w-4" /> Xuất Excel
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                    dispatch(exportDebtList({ year: filters.year || new Date().getFullYear(), type: 'all' })).unwrap().then((data) => {
                                        if (data && data.length > 0) {
                                            exportDebtToExcel(data, filters.year || new Date().getFullYear(), 'all')
                                        }
                                    })
                                }}>
                                    Chung toàn bộ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    dispatch(exportDebtList({ year: filters.year || new Date().getFullYear(), type: 'customer' })).unwrap().then((data) => {
                                        if (data && data.length > 0) {
                                            exportDebtToExcel(data, filters.year || new Date().getFullYear(), 'customer')
                                        }
                                    })
                                }}>
                                    Chỉ khách hàng
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                    dispatch(exportDebtList({ year: filters.year || new Date().getFullYear(), type: 'supplier' })).unwrap().then((data) => {
                                        if (data && data.length > 0) {
                                            exportDebtToExcel(data, filters.year || new Date().getFullYear(), 'supplier')
                                        }
                                    })
                                }}>
                                    Chỉ nhà cung cấp
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="destructive" onClick={() => setIsSyncDialogOpen(true)} className="gap-2 h-9">
                            <ShieldAlert className="h-4 w-4" /> Tính lại toàn bộ
                        </Button>
                        <Button variant="outline" onClick={() => dispatch(syncSnapBatch({ year: filters.year || new Date().getFullYear() }))} className="bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2 h-9">
                            <Layers className="h-4 w-4" /> Tính lại công nợ kỳ
                        </Button>
                    </div>
                </div>

                <IntegrityWidget year={filters.year || new Date().getFullYear()} />

                {/* FINANCIAL STRIP */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 ml-1 italic">
                        <Info className="h-3.5 w-3.5" /> Thống kê
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <SummaryCard label="Nợ đầu kỳ" value={finalSummary.opening} icon={Activity} color="text-gray-600" />
                        <SummaryCard label="Tổng mua (+)" value={finalSummary.increase} icon={ArrowUpRight} color="text-blue-600" />
                        <SummaryCard label="Tổng trả hàng (-)" value={finalSummary.returnAmount} icon={ArrowDownLeft} color="text-indigo-600" />
                        <SummaryCard label="Điều chỉnh" value={finalSummary.adjustmentAmount} icon={Scale} color="text-purple-600" />
                        <SummaryCard label="Tổng thanh toán (-)" value={finalSummary.payment} icon={DollarSign} color="text-green-600" />

                        <div className={`col-span-2 md:col-span-1 lg:col-span-1 rounded-xl border p-4 shadow-sm flex flex-col justify-center ${isOverpaid ? 'border-teal-200 bg-teal-50' : 'border-red-200 bg-red-50'}`}>
                            <div className={`flex items-center gap-2 text-xs font-bold uppercase mb-1 ${isOverpaid ? 'text-teal-700' : 'text-red-600'}`}>
                                <AlertTriangle className="h-4 w-4" />
                                {isOverpaid ? 'Khách trả trước' : 'Nợ phải thu'}
                            </div>
                            <div className={`text-xl font-extrabold tracking-tight ${isOverpaid ? 'text-teal-800' : 'text-red-700'}`}>
                                {formatCurrency(absClosing)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-[180px] relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 block w-full pl-9 pr-8"
                                placeholder="Năm"
                                value={filters.year || ""}
                                onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
                            />
                        </div>

                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 block w-full pl-9 pr-3"
                                placeholder="Tìm kiếm theo Mã, Tên, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleResetFilters} className="border-dashed text-gray-500 hover:text-red-600 hover:border-red-200 px-4 h-9">
                                <Filter className="h-4 w-4 mr-2" /> Xóa lọc
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-100">
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <select
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm hover:cursor-pointer pl-9 pr-3"
                                value={filters.type || ""}
                                onChange={(e) => updateFilter('type', e.target.value || undefined)}
                            >
                                <option value="">Tất cả đối tượng</option>
                                <option value="customer">Khách hàng</option>
                                <option value="supplier">Nhà cung cấp</option>
                            </select>
                        </div>

                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Nhập địa chỉ..."
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 pl-9 pr-3"
                                value={addressTerm}
                                onChange={(e) => setAddressTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute left-3 top-3.5 h-2 w-2 rounded-full bg-gray-400" />
                            <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:cursor-pointer pl-9 pr-3"
                                value={filters.status || ""}
                                onChange={(e) => updateFilter('status', e.target.value || undefined)}
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="unpaid">🔴 Đang nợ</option>
                                <option value="paid">🟢 Đã trả hết</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 flex flex-col space-y-4">
                    <DebtReconciliationTable
                        data={debts}
                        isLoading={loading}
                        onView={handleView}
                        pagination={filters}
                        pageCount={serverPagination?.totalPages || 1}
                        rowCount={serverPagination?.total || 0}
                        onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                    />
                </div>

                {isViewOpen && (
                    <ViewDebtReconciliationDialog
                        isOpen={isViewOpen}
                        onClose={() => setIsViewOpen(false)}
                        id={viewData.id}
                        type={viewData.type}
                        year={viewData.year}
                    />
                )}

                {isSyncDialogOpen && (
                    <ConfirmSyncDialog
                        isOpen={isSyncDialogOpen}
                        onClose={() => setIsSyncDialogOpen(false)}
                        onConfirm={() => dispatch(syncFullBatch({ year: filters.year || new Date().getFullYear() }))}
                        year={filters.year || new Date().getFullYear()}
                    />
                )}
            </LayoutBody>
        </Layout>
    )
}

function SummaryCard({ label, value, icon: Icon, color }) {
    return (
        <div className={`rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-center bg-white`}>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 uppercase tracking-wide">
                <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
            </p>
            <p className={`mt-1.5 text-lg font-bold ${color}`}>
                {formatCurrency(value)}
            </p>
        </div>
    )
}

export default CustomerDebtPage