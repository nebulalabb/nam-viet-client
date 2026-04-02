import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getDebts, getMonthlyDebtObjects, exportDebtList, syncFullBatch, syncSnapBatch, toggleBlacklist, extendDebt } from '@/stores/DebtSlice'
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

    const handleToggleBlacklist = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái danh sách đen của khách hàng này?')) {
            try {
                await dispatch(toggleBlacklist({ id, type: 'customer' })).unwrap();
                dispatch(getDebts({
                    ...filters,
                    search: searchTerm,
                    address: addressTerm,
                    blacklist: activeTab === 'blacklist' ? 'true' : 'false'
                }))
            } catch (err) {}
        }
    }

    const handleExtendDebt = async (id) => {
        if (window.confirm('Gia hạn kiểm tra nợ thêm 1 năm cho khách hàng này?')) {
            try {
                await dispatch(extendDebt({ id, type: 'customer' })).unwrap();
                dispatch(getDebts({
                    ...filters,
                    search: searchTerm,
                    address: addressTerm,
                    blacklist: activeTab === 'blacklist' ? 'true' : 'false'
                }))
            } catch (err) {}
        }
    }

    // Sync activeTab khi isAdmin thay đổi
    useEffect(() => {
        if (!isAdmin && activeTab === 'aggregate') {
            setActiveTab('monthly')
        }
    }, [isAdmin])

    // Effect fetch cho tab Tổng hợp & Blacklist
    useEffect(() => {
        if (activeTab !== 'aggregate' && activeTab !== 'blacklist') return
        document.title = activeTab === 'blacklist' ? 'Danh sách đen' : 'Tổng hợp công nợ'
        const timer = setTimeout(() => {
            dispatch(getDebts({
                ...filters,
                search: searchTerm,
                address: addressTerm,
                blacklist: activeTab === 'blacklist' ? 'true' : 'false'
            }))
        }, 500)
        return () => clearTimeout(timer)
    }, [dispatch, filters, searchTerm, addressTerm, activeTab])

    // Effect fetch cho tab Theo tháng (giống Tổng hợp nhưng tính theo tháng hiện tại)
    useEffect(() => {
        const monthNow = new Date().getMonth() + 1
        dispatch(getMonthlyDebtObjects({
            year: filters.year || new Date().getFullYear(),
            month: monthNow,
            type: filters.type,
            // Phân quyền theo người phụ trách
            assignedUserId: !isAdmin ? authUser?.id : undefined,
            page: activeTab === 'monthly' ? filters.page : 1,
            limit: activeTab === 'monthly' ? filters.limit : 1,
            search: searchTerm,
            address: addressTerm
        }))
    }, [dispatch, filters.year, filters.type, activeTab === 'monthly' ? filters.page : 1, activeTab === 'monthly' ? filters.limit : 1, isAdmin, authUser?.id, searchTerm, addressTerm])

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

    const monthlySummary = monthlyObjectsPagination?.summary || {
        opening: 0, increase: 0, returnAmount: 0, payment: 0, closing: 0
    }

    const closingLabel =
        filters.type === 'supplier'
            ? 'NỢ CẦN TRẢ'
            : (!filters.type ? 'NỢ CẦN THU / NỢ CẦN TRẢ' : 'NỢ CẦN THU')
    
    const monthNow = new Date().getMonth() + 1;

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>

                {/* HEADER */}
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            {activeTab === 'aggregate' ? 'Tổng hợp công nợ' : activeTab === 'blacklist' ? 'Danh sách đen' : 'Công nợ theo tháng'}
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

                {/* activeTab === 'aggregate' && isAdmin && (
                    <IntegrityWidget year={filters.year || new Date().getFullYear()} />
                ) */}

                {/* FINANCIAL STRIP — Luôn hiển thị, phân quyền bên trong */}
                <div className={`grid grid-cols-1 ${isAdmin && activeTab === 'aggregate' ? 'md:grid-cols-2' : ''} gap-4 mb-3`}>
                    {/* Khối 1: Cả năm — CHỈ ADMIN \u0026 ở tab Tổng hợp */}
                    {isAdmin && activeTab === 'aggregate' && (
                        <div className="rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden relative">
                            <div className="bg-blue-50 text-blue-800 text-xs font-bold px-4 py-2 border-b border-blue-100 flex justify-between items-center">
                                <span>TỔNG HỢP NĂM {filters.year || new Date().getFullYear()}</span>
                                <span className="bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">Toàn kỳ</span>
                            </div>
                            <div className="grid grid-cols-5 divide-x divide-blue-50 py-2">
                                <StripCell label="NỢ ĐẦU KỲ" value={finalSummary.opening} />
                                <StripCell label="TỔNG MUA" value={finalSummary.increase} color="text-blue-600" />
                                <StripCell label="TRẢ HÀNG" value={finalSummary.returnAmount} color="text-indigo-600" />
                                <StripCell label="THANH TOÁN" value={finalSummary.payment} color="text-green-600" />
                                <StripCell label={closingLabel} value={finalSummary.closing} color="text-red-600" highlight />
                            </div>
                        </div>
                    )}

                    {/* Khối Tổng Hợp Danh Sách Đen */}
                    {isAdmin && activeTab === 'blacklist' && (
                        <div className="rounded-xl border border-gray-800 bg-gray-900 shadow-sm overflow-hidden relative text-white">
                            <div className="bg-gray-800 text-gray-200 text-xs font-bold px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                                <span>TỔNG HỢP CÔNG NỢ ĐEN</span>
                                <span className="bg-gray-700 px-2 py-0.5 rounded-full text-[10px]">Treo/Khó đòi</span>
                            </div>
                            <div className="grid grid-cols-5 divide-x divide-gray-700 py-2">
                                <StripCell label="NỢ ĐẦU KỲ" value={finalSummary.opening} color="text-gray-300" />
                                <StripCell label="TỔNG MUA" value={finalSummary.increase} color="text-gray-300" />
                                <StripCell label="TRẢ HÀNG" value={finalSummary.returnAmount} color="text-gray-300" />
                                <StripCell label="THANH TOÁN" value={finalSummary.payment} color="text-gray-300" />
                                <StripCell label="CÔNG NỢ ĐEN" value={finalSummary.closing} color="text-red-400" highlight />
                            </div>
                        </div>
                    )}

                    {/* Khối 2: Tháng hiện tại — tất cả đều thấy (hiển thị ở cả 2 tab) */}
                    <div className="rounded-xl border border-green-200 bg-white shadow-sm overflow-hidden relative">
                        <div className="bg-green-50 text-green-800 text-xs font-bold px-4 py-2 border-b border-green-100 flex justify-between items-center">
                            <span>TỔNG HỢP THÁNG {monthNow}/{filters.year || new Date().getFullYear()}</span>
                            <span className="bg-green-100 px-2 py-0.5 rounded-full text-[10px]">hiện tại</span>
                        </div>
                        <div className="grid grid-cols-5 divide-x divide-green-50 py-2">
                            <StripCell label="NỢ ĐẦU KỲ" value={monthlySummary.opening} />
                            <StripCell label="TỔNG MUA" value={monthlySummary.increase} color="text-blue-600" />
                            <StripCell label="TRẢ HÀNG" value={monthlySummary.returnAmount} color="text-indigo-600" />
                            <StripCell label="THANH TOÁN" value={monthlySummary.payment} color="text-green-600" />
                            <StripCell label={closingLabel} value={monthlySummary.closing} color="text-red-600" highlight />
                        </div>
                    </div>
                </div>


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
                    {isAdmin && (
                        <button
                            onClick={() => { setActiveTab('blacklist'); updateFilter('type', 'customer') }}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'blacklist'
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Danh sách đen
                        </button>
                    )}
                </div>

                {/* FILTER BAR — Tổng hợp & Blacklist */}
                {(activeTab === 'aggregate' || activeTab === 'blacklist') && (
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
                    {activeTab === 'aggregate' || activeTab === 'blacklist' ? (
                        <DebtReconciliationTable
                            data={debts}
                            isLoading={loading}
                            onView={handleView}
                            pagination={filters}
                            pageCount={serverPagination?.totalPages || 1}
                            rowCount={serverPagination?.total || 0}
                            onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                            onToggleBlacklist={isAdmin ? handleToggleBlacklist : null}
                            onExtendDebt={isAdmin ? handleExtendDebt : null}
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
        <div className={`px-1 md:px-2 lg:px-4 py-2 text-center flex flex-col justify-center ${highlight ? 'bg-gray-50/80' : ''}`}>
            <p className="text-[9px] md:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {label}
            </p>
            <p className={`text-xs sm:text-sm md:text-base font-bold ${color}`}>
                {formatCurrency(value)}
            </p>
        </div>
    )
}

export default CustomerDebtPage