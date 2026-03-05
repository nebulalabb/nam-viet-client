import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { format } from "date-fns"
import { Link } from "react-router-dom"
import { Layout, LayoutBody } from "@/components/custom/Layout"
import { getOvertimeSessions, getOvertimeStats } from "@/stores/OvertimeSlice"
import { Button } from "@/components/custom/Button"
import { Search, RotateCcw, X, Users, Clock, CheckCircle, Eye } from "lucide-react"

import CreateSessionDialog from "./components/CreateSessionDialog"
import { Badge } from "@/components/ui/badge"

function GradientCard({ title, value, icon: Icon, color }) {
    const colorMap = {
        blue: "from-blue-500 to-blue-600 shadow-blue-500/20",
        green: "from-emerald-500 to-emerald-600 shadow-emerald-500/20",
        purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
        orange: "from-orange-500 to-orange-600 shadow-orange-500/20",
    }

    const selectedClass = colorMap[color] || colorMap.blue

    return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 shadow-lg text-white ${selectedClass}`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white opacity-10 blur-xl"></div>
            <div className="relative z-10 flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium opacity-80">{title}</p>
                    <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
                </div>
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
        </div>
    )
}

function ProgressCard({ title, value, subValue, description, trend, color }) {
    const colorMap = {
        green: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", progress: "bg-emerald-500" },
        purple: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-100", progress: "bg-purple-500" },
    }

    const c = colorMap[color] || colorMap.green

    return (
        <div className={`rounded-xl border p-6 bg-white shadow-sm ${c.border}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <div className="mt-2 flex items-baseline gap-2">
                        <h3 className={`text-2xl font-bold ${c.text}`}>{value}</h3>
                        {subValue && <span className="text-sm font-medium text-gray-400">/ {subValue}</span>}
                    </div>
                </div>
                <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text}`}>
                    {trend}%
                </div>
            </div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${c.progress}`} style={{ width: `${trend}%` }} />
            </div>
            {description && <p className="mt-3 text-sm text-gray-500">{description}</p>}
        </div>
    )
}

function FinancialCard({ title, value, icon: Icon, description, color }) {
    const colorMap = {
        purple: { bg: "bg-purple-100", text: "text-purple-600" },
        blue: { bg: "bg-blue-100", text: "text-blue-600" },
    }
    const c = colorMap[color] || colorMap.blue

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${c.bg}`}>
                    <Icon className={`h-6 w-6 ${c.text}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
                </div>
            </div>
            {description && <p className="mt-4 text-sm text-gray-500">{description}</p>}
        </div>
    )
}

export default function OvertimePage() {
    const dispatch = useDispatch()

    // State from Redux
    const sessions = useSelector(state => state.overtime.sessions) || []
    const statsData = useSelector(state => state.overtime.stats)
    const meta = useSelector(state => state.overtime.meta)
    const loading = useSelector(state => state.overtime.loading)

    // Local state for filters
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm)
            setPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchTerm])

    // Fetch data
    useEffect(() => {
        document.title = "Quản lý tăng ca"
        dispatch(getOvertimeStats())
    }, [dispatch])

    useEffect(() => {
        dispatch(getOvertimeSessions({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter !== "all" ? statusFilter : undefined,
        }))
    }, [dispatch, page, limit, debouncedSearch, statusFilter])

    const handleResetFilters = () => {
        setSearchTerm("")
        setStatusFilter("all")
        setLimit(20)
        setPage(1)
    }

    const hasActiveFilters = searchTerm || statusFilter !== "all"

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Đang mở'
            case 'closed': return 'Đã đóng'
            case 'cancelled': return 'Đã hủy'
            default: return status
        }
    }

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'default' // Usually primary/blue or green
            case 'closed': return 'secondary'
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-6" fixedHeight>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Quản lý tăng ca
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Theo dõi và quản lý các phiên làm việc ngoài giờ
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <CreateSessionDialog onSuccess={() => setPage(1)} />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Sessions */}
                    <GradientCard
                        title="Tổng phiên"
                        value={statsData?.total || 0}
                        icon={Users}
                        color="blue"
                    />

                    {/* Open Sessions */}
                    <ProgressCard
                        title="Đang mở"
                        value={statsData?.open || 0}
                        subValue={statsData?.total || 0}
                        color="green"
                        trend={statsData?.total ? Math.round(((statsData?.open || 0) / statsData.total) * 100) : 0}
                        description="Phiên đang hoạt động"
                    />

                    {/* Closed Sessions */}
                    <FinancialCard
                        title="Đã đóng"
                        value={statsData?.closed || 0}
                        icon={CheckCircle}
                        color="purple"
                        description="Phiên đã hoàn thành"
                    />

                    {/* Total Hours */}
                    <GradientCard
                        title="Tổng giờ tăng ca"
                        value={statsData?.totalHours ? `${statsData.totalHours}h` : "0h"}
                        icon={Clock}
                        color="orange"
                    />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="lg:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm phiên, người tạo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block h-10 w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Trạng thái
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="block h-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="open">Đang mở</option>
                            <option value="closed">Đã đóng</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    <div className="lg:col-start-6">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Hiển thị
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="block h-10 w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value={10}>10 dòng / trang</option>
                            <option value={20}>20 dòng / trang</option>
                            <option value={50}>50 dòng / trang</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">
                            Đang lọc:
                        </span>

                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                Tìm kiếm: "{searchTerm}"
                                <button onClick={() => setSearchTerm("")} className="hover:text-blue-900 ml-1">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {statusFilter !== "all" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                Trạng thái: {getStatusLabel(statusFilter)}
                                <button onClick={() => setStatusFilter("all")} className="hover:text-amber-900 ml-1">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium ml-2"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Xóa bộ lọc
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
                    <div className="overflow-x-auto flex-1">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên phiên</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thời gian bắt đầu</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Người tạo</th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Nhân sự</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 w-10 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right"><div className="h-8 w-8 bg-gray-200 rounded animate-pulse ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{session.sessionName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(session.startTime), 'dd/MM/yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant={getStatusBadgeVariant(session.status)}>
                                                    {getStatusLabel(session.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-[200px] truncate" title={session.notes}>{session.notes || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{session.creator?.fullName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                                                {session._count?.entries || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Link to={`/overtime/${session.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="rounded-full bg-gray-100 p-3 mb-3">
                                                    <Search className="h-6 w-6 text-gray-400" />
                                                </div>
                                                <p className="text-base font-medium text-gray-900">Không tìm thấy phiên tăng ca nào</p>
                                                <p className="text-sm mt-1">Vui lòng thử điều chỉnh bộ lọc hoặc tạo phiên mới.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination controls */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} variant="outline" size="sm">Trước</Button>
                                <Button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} variant="outline" size="sm">Tiếp</Button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến <span className="font-medium">{Math.min(page * limit, meta.total)}</span> trong số <span className="font-medium">{meta.total}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Trước</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        <button
                                            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                            disabled={page === meta.totalPages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
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
