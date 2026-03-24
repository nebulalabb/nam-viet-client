import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getDebts, getMonthlyDebtObjects, exportDebtList, syncFullBatch, syncSnapBatch } from '@/stores/DebtSlice'
import DebtReconciliationTable from './components/DebtReconciliationTable'
import { ViewDebtReconciliationDialog } from './components/ViewDebtReconciliationDialog'
import { ConfirmSyncDialog } from './components/ConfirmSyncDialog'
import IntegrityWidget from './components/IntegrityWidget'
import { Button } from '@/components/custom/Button'
import { formatCurrency } from '@/utils/number-format'
import { exportDebtToExcel } from '@/utils/list-debt-excel-export'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search, Calendar, Filter,
    Users, MapPin,
    FileDown, ShieldAlert, Layers
} from 'lucide-react'

const CustomerDebtPage = () => {
    const dispatch = useDispatch()

    const debts = useSelector((state) => state.debt.debts)
    const loading = useSelector((state) => state.debt.loading)
    const serverPagination = useSelector((state) => state.debt.pagination)
    const monthlyObjectsData = useSelector((state) => state.debt.monthlyObjectsData)
    const monthlyObjectsLoading = useSelector((state) => state.debt.monthlyObjectsLoading)
    const monthlyObjectsPagination = useSelector((state) => state.debt.monthlyObjectsPagination)

    // Auth: lấy role để phân quyền
    const authUser = useSelector((state) => state.auth?.authUserWithRoleHasPermissions)
    const isAdmin = authUser?.role?.roleKey === 'admin'

    const [searchTerm, setSearchTerm] = useState("")
    const [addressTerm, setAddressTerm] = useState("")
    // Tab: "aggregate" (Tổng hợp) hoặc "monthly" (Theo tháng)
    const [activeTab, setActiveTab] = useState(isAdmin ? 'aggregate' : 'monthly')

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

    // Sync activeTab khi isAdmin thay đổi
    useEffect(() => {
        if (!isAdmin && activeTab === 'aggregate') {
            setActiveTab('monthly')
        }
    }, [isAdmin])

    // Effect fetch cho tab Tổng hợp
    useEffect(() => {
        if (activeTab !== 'aggregate') return
        document.title = 'Tổng hợp công nợ'
        const timer = setTimeout(() => {
            dispatch(getDebts({
                ...filters,
                search: searchTerm,
                address: addressTerm
            }))
        }, 500)
        return () => clearTimeout(timer)
    }, [dispatch, filters, searchTerm, addressTerm, activeTab])

    // Effect fetch cho tab Theo tháng (giống Tổng hợp nhưng tính theo tháng hiện tại)
    useEffect(() => {
        if (activeTab !== 'monthly') return
        document.title = 'Công nợ theo tháng'
        const monthNow = new Date().getMonth() + 1
        dispatch(getMonthlyDebtObjects({
            year: filters.year || new Date().getFullYear(),
            month: monthNow,
            type: filters.type,
            // Phân quyền theo người phụ trách
            assignedUserId: !isAdmin ? authUser?.id : undefined,
            page: filters.page,
            limit: filters.limit,
        }))
    }, [dispatch, filters.year, filters.type, filters.page, filters.limit, activeTab, isAdmin, authUser?.id])

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
        opening: 0, increase: 0, returnAmount: 0, payment: 0, closing: 0
    }

    const closingLabel =
        filters.type === 'supplier'
            ? 'NỢ CẦN TRẢ'
            : (!filters.type ? 'NỢ CẦN THU / NỢ CẦN TRẢ' : 'NỢ CẦN THU')

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {activeTab === 'aggregate' ? 'Tổng hợp công nợ' : 'Công nợ theo tháng'}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isAdmin && activeTab === 'aggregate' && (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                {activeTab === 'aggregate' && isAdmin && (
                    <IntegrityWidget year={filters.year || new Date().getFullYear()} />
                )}

                {/* FINANCIAL STRIP — chỉ hiện ở tab Tổng hợp */}
                {activeTab === 'aggregate' && (
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden mb-2">
                        <div className="grid grid-cols-5 divide-x divide-gray-200">
                            <StripCell label="NỢ ĐẦU KỲ" value={finalSummary.opening} />
                            <StripCell label="TỔNG MUA" value={finalSummary.increase} color="text-blue-600" />
                            <StripCell label="TRẢ HÀNG" value={finalSummary.returnAmount} color="text-indigo-600" />
                            <StripCell label="THANH TOÁN" value={finalSummary.payment} color="text-green-600" />
                            <StripCell label={closingLabel} value={finalSummary.closing} color="text-red-600" highlight />
                        </div>
                    </div>
                )}

                {/* TAB TOGGLE */}
                <div className="flex gap-1 mb-2 bg-gray-100 p-1 rounded-lg w-fit">
                    {isAdmin && (
                        <button
                            onClick={() => setActiveTab('aggregate')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'aggregate'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Tổng hợp
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('monthly')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'monthly'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Theo tháng
                    </button>
                </div>

                {/* FILTER BAR — Tổng hợp */}
                {activeTab === 'aggregate' && (
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
                )}

                {/* FILTER BAR — Theo tháng (đơn giản hơn) */}
                {activeTab === 'monthly' && (
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-2">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="w-[180px] relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="number"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pl-9 pr-8"
                                    placeholder="Năm"
                                    value={filters.year || ""}
                                    onChange={(e) => updateFilter('year', e.target.value ? Number(e.target.value) : undefined)}
                                />
                            </div>
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
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT */}
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 flex flex-col space-y-4">
                    {activeTab === 'aggregate' ? (
                        <DebtReconciliationTable
                            data={debts}
                            isLoading={loading}
                            onView={handleView}
                            pagination={filters}
                            pageCount={serverPagination?.totalPages || 1}
                            rowCount={serverPagination?.total || 0}
                            onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                        />
                    ) : (
                        <DebtReconciliationTable
                            data={monthlyObjectsData}
                            isLoading={monthlyObjectsLoading}
                            onView={handleView}
                            pagination={filters}
                            pageCount={monthlyObjectsPagination?.totalPages || 1}
                            rowCount={monthlyObjectsPagination?.total || 0}
                            onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                        />
                    )}
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

function StripCell({ label, value, color = "text-gray-800", highlight = false }) {
    return (
        <div className={`px-6 py-3 text-center ${highlight ? 'bg-gray-50' : ''}`}>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                {label}
            </p>
            <p className={`text-lg font-bold ${color}`}>
                {formatCurrency(value)}
            </p>
        </div>
    )
}

export default CustomerDebtPage