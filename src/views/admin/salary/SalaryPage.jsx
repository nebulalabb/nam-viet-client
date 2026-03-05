import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import { Layout, LayoutBody } from "@/components/custom/Layout"
import {
    getSalaries,
    getSalarySummary,
    approveSalary,
    deleteSalary
} from "@/stores/SalarySlice"
import { fetchUsers } from "@/stores/UserSlice"
import { fetchRoles } from "@/stores/RoleSlice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/custom/Button"
import {
    Search,
    RotateCcw,
    X,
    Calculator,
    CheckCircle,
    Banknote,
    Clock,
    Eye,
    Trash2,
    FileText
} from "lucide-react"

import {
    SalaryStatusBadge,
    PostedStatus,
    MonthDisplay,
    formatCurrency,
    SalarySummaryCard
} from "./components/SalaryStatus"

export default function SalaryPage() {
    const dispatch = useDispatch()

    // State from Redux
    const salaries = useSelector(state => state.salary.salaries) || []
    const statsData = useSelector(state => state.salary.stats)
    const meta = useSelector(state => state.salary.meta)
    const loading = useSelector(state => state.salary.loading)

    const users = useSelector(state => state.user.users) || []
    const roles = useSelector(state => state.role.roles) || []

    // Local state for filters
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [roleFilter, setRoleFilter] = useState(0)
    const [userFilter, setUserFilter] = useState(0)

    // Use simple basic string for month filtering 'YYYYMM' format on HTML input month
    const [monthFilter, setMonthFilter] = useState(() => {
        const date = new Date()
        return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
    })

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch initial base data
    useEffect(() => {
        document.title = "Quản lý lương"
        dispatch(getSalarySummary())
        if (users.length === 0) dispatch(fetchUsers({ limit: 1000 }))
        if (roles.length === 0) dispatch(fetchRoles())
    }, [dispatch])

    // Fetch main list
    useEffect(() => {
        dispatch(getSalaries({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter,
            month: monthFilter,
            userId: userFilter === 0 ? undefined : userFilter,
            roleId: roleFilter === 0 ? undefined : roleFilter
        }))
    }, [dispatch, page, limit, debouncedSearch, statusFilter, monthFilter, userFilter, roleFilter])

    const handleResetFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setRoleFilter(0)
        setUserFilter(0)
        const date = new Date()
        setMonthFilter(`${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`)
        setLimit(20)
        setPage(1)
    }

    const handleApprove = async (id) => {
        if (!window.confirm("Xác nhận phê duyệt bảng lương này?")) return;
        dispatch(approveSalary({ id }))
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Xác nhận xóa bảng lương này? Hành động này không thể hoàn tác!")) return;
        dispatch(deleteSalary(id))
    }

    const hasActiveFilters = searchTerm || statusFilter !== "all" || roleFilter !== 0 || userFilter !== 0 || monthFilter;

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Chờ duyệt'
            case 'approved': return 'Đã duyệt'
            case 'paid': return 'Đã thanh toán'
            default: return status
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-6 bg-gray-50/30" fixedHeight>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">
                            Bảng lương nhân sự
                        </h2>
                        <p className="mt-2 text-sm text-gray-500 font-medium">
                            Quản lý danh sách trả lương, thống kê quỹ lương và duyệt chi
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/salary/calculate">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                                <Calculator className="h-5 w-5 mr-2" /> Tính lương
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <SalarySummaryCard
                        title="Chờ Duyệt"
                        amount={statsData?.pending || 0}
                        icon={<Clock className="w-8 h-8" />}
                        color="yellow"
                    />
                    <SalarySummaryCard
                        title="Đã duyệt"
                        amount={statsData?.approved || 0}
                        icon={<CheckCircle className="w-8 h-8" />}
                        color="blue"
                    />
                    <SalarySummaryCard
                        title="Đã thanh toán"
                        amount={statsData?.paid || 0}
                        icon={<Banknote className="w-8 h-8" />}
                        color="green"
                    />
                    <SalarySummaryCard
                        title="Quỹ lương tổng"
                        amount={statsData?.totalAmount || 0}
                        icon={<Banknote className="w-8 h-8" />}
                        color="purple"
                    />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">

                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Tìm kiếm nhân viên
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tên, mã NV..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-10 pr-3 text-sm placeholder-gray-400 font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Kỳ tính lương
                        </label>
                        <input
                            type="month"
                            value={monthFilter ? `${monthFilter.substring(0, 4)}-${monthFilter.substring(4, 6)}` : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) setMonthFilter(val.replace('-', ''));
                                else setMonthFilter('');
                            }}
                            className="block h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Nhân viên
                        </label>
                        <select
                            value={userFilter}
                            onChange={(e) => {
                                setUserFilter(Number(e.target.value));
                                setPage(1);
                            }}
                            className="block h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value={0}>Tất cả MNV</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Trạng thái
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="block h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value="all">Tất cả</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="paid">Đã thanh toán</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Phân trang
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="block h-11 w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 px-3 text-sm font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            <option value={10}>10 dòng</option>
                            <option value={20}>20 dòng</option>
                            <option value={50}>50 dòng</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-gray-600">Lọc theo:</span>

                        {searchTerm && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                                Từ khóa "{searchTerm}"
                                <button onClick={() => setSearchTerm("")} className="hover:text-blue-900 inline-flex">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}

                        {userFilter !== 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700">
                                NV: {users.find(u => u.id === userFilter)?.fullName}
                                <button onClick={() => setUserFilter(0)} className="hover:text-indigo-900 inline-flex">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}

                        {monthFilter !== "" && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 border border-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
                                Tháng: {monthFilter.substring(4, 6)}/{monthFilter.substring(0, 4)}
                                <button onClick={() => setMonthFilter("")} className="hover:text-purple-900 inline-flex">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}

                        {statusFilter !== "all" && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                                {getStatusLabel(statusFilter)}
                                <button onClick={() => setStatusFilter("all")} className="hover:text-amber-900 inline-flex">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:bg-red-50 bg-white border border-red-100 rounded-lg px-3 py-1.5 font-bold ml-2 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" /> Thùng rác
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Nhân viên</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Kỳ lương</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Lương cơ bản</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Các khoản cộng</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Khấu trừ</th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-600 uppercase tracking-widest">Tổng nhận</th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-black text-gray-600 uppercase tracking-widest">Trạng thái</th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-600 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse mx-auto"></div></td>
                                            <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-gray-100 rounded animate-pulse ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : salaries.length > 0 ? (
                                    salaries.map((salary) => (
                                        <tr key={salary.id} className="hover:bg-blue-50/40 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{salary.user?.fullName}</div>
                                                <div className="text-xs text-gray-500 font-medium">{salary.user?.employeeCode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <MonthDisplay month={salary.month} className="text-gray-700" />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600">
                                                {formatCurrency(salary.basicSalary)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                                                {formatCurrency((salary.allowance || 0) + (salary.overtimePay || 0) + (salary.bonus || 0) + (salary.commission || 0))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500">
                                                {formatCurrency((salary.deduction || 0) + (salary.advance || 0))}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-base font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                                                    {formatCurrency(salary.totalSalary)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <SalaryStatusBadge status={salary.status} />
                                                    <PostedStatus isPosted={salary.isPosted} />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex gap-1 justify-end">
                                                    {/* Note: In a full app we'd have a detail view, but for now we skip creating it unless absolutely requested */}
                                                    {/* <Link to={`/salary/${salary.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                                <Eye className="h-4 w-4" />
                            </Button>
                            </Link> */}

                                                    {salary.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-gray-400 hover:text-green-600 hover:bg-green-50"
                                                                onClick={() => handleApprove(salary.id)}
                                                                title="Phê duyệt"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => handleDelete(salary.id)}
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 mb-4">
                                                    <FileText className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <p className="text-lg font-black text-gray-900">Không có bảng lương nào</p>
                                                <p className="text-sm font-medium mt-1 text-gray-500">Thử điều chỉnh bộ lọc hoặc tạo bảng lương mới.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination controls */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-6 py-4">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm" className="font-bold border-gray-300">Trước</Button>
                                <Button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} variant="outline" size="sm" className="font-bold border-gray-300">Tiếp</Button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Hiển thị <span className="font-black text-gray-900">{(page - 1) * limit + 1}</span> đến <span className="font-black text-gray-900">{Math.min(page * limit, meta.total)}</span> trong số <span className="font-black text-gray-900">{meta.total}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative items-center rounded-l-lg px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 inline-flex"
                                        >
                                            <span className="sr-only">Trước</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                            disabled={page === meta.totalPages}
                                            className="relative items-center rounded-r-lg px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 inline-flex"
                                        >
                                            <span className="sr-only">Tiếp</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </LayoutBody>
        </Layout>
    )
}
