import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Eye, Search, RotateCcw, X, Users, Clock, CheckCircle } from 'lucide-react'

import { getOvertimeSessions, getOvertimeStats } from '@/stores/OvertimeSlice'
import { useDebounce } from '@/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import CreateSessionDialog from './components/CreateSessionDialog'
import Pagination from '@/components/Pagination'

// Simplified Card Components based on Attendance usage
function StatCard({ title, value, icon, color, description, trend, subValue }) {
    const Icon = icon
    const colorClasses = {
        green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
        orange: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
    }
    const iconClass = colorClasses[color] || colorClasses.blue

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconClass}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                        {subValue && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">/ {subValue}</span>
                        )}
                    </div>
                </div>
            </div>
            {(description || trend !== undefined) && (
                <div className="mt-4 flex items-center justify-between text-sm">
                    {description && <span className="text-gray-500 dark:text-gray-400">{description}</span>}
                    {trend !== undefined && (
                        <span className={`font-medium ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                            {trend}%
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

export default function OvertimePage() {
    const dispatch = useDispatch()
    const { sessions, stats, loading } = useSelector((state) => state.overtime)

    // Filters State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)
    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 400)
    const [statusFilter, setStatusFilter] = useState('all')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Ensure we handle array or paginated response
    const sessionList = Array.isArray(sessions) ? sessions : (sessions?.data || [])
    const meta = sessions?.meta || { total: sessionList.length, totalPages: Math.ceil(sessionList.length / limit) }

    // Fetch Data
    useEffect(() => {
        dispatch(getOvertimeSessions({
            page,
            limit,
            search: debouncedSearch,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }))
    }, [dispatch, page, limit, debouncedSearch, statusFilter])

    useEffect(() => {
        dispatch(getOvertimeStats())
    }, [dispatch])

    // Handle Page Change
    const handlePageChange = (newPage) => {
        setPage(newPage)
    }

    // Reset Filters
    const handleResetFilters = () => {
        setSearchTerm('')
        setStatusFilter('all')
        setLimit(20)
        setPage(1)
    }

    const hasActiveFilters = searchTerm || statusFilter !== 'all'

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Đang mở'
            case 'closed': return 'Đã đóng'
            case 'cancelled': return 'Đã hủy'
            default: return status
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'success'
            case 'closed': return 'secondary'
            case 'cancelled': return 'destructive'
            default: return 'default'
        }
    }

    return (
        <div className="space-y-6 p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Quản lý tăng ca
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Theo dõi và quản lý các phiên làm việc ngoài giờ
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Mở phiên tăng ca
                    </button>
                    <CreateSessionDialog
                        isOpen={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng phiên"
                    value={stats?.total || 0}
                    icon={Users}
                    color="blue"
                />
                <StatCard
                    title="Đang mở"
                    value={stats?.open || 0}
                    subValue={stats?.total || 0}
                    icon={CheckCircle}
                    color="green"
                    trend={stats?.total ? Math.round((stats.open / stats.total) * 100) : 0}
                    description="Phiên đang hoạt động"
                />
                <StatCard
                    title="Đã đóng"
                    value={stats?.closed || 0}
                    icon={CheckCircle}
                    color="purple"
                    description="Phiên đã hoàn thành"
                />
                <StatCard
                    title="Tổng giờ tăng ca"
                    value={stats?.totalHours ? `${stats.totalHours.toFixed(1)}h` : '0h'}
                    icon={Clock}
                    color="orange"
                />
            </div>

            {/* Main Content Card (Filters & Table) */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tìm kiếm
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm phiên, người tạo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Trạng thái
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="open">Đang mở</option>
                            <option value="closed">Đã đóng</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Limit Selector */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Hiển thị
                        </label>
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value={10}>10 / trang</option>
                            <option value={20}>20 / trang</option>
                            <option value={50}>50 / trang</option>
                        </select>
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Bộ lọc:
                            </span>

                            {searchTerm && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                    🔍 "{searchTerm}"
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}

                            {statusFilter !== 'all' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                    Trạng thái: {getStatusLabel(statusFilter)}
                                    <button
                                        onClick={() => setStatusFilter('all')}
                                        className="ml-1 hover:text-amber-900 dark:hover:text-amber-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </span>
                            )}

                            <button
                                onClick={handleResetFilters}
                                className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <RotateCcw className="h-3 w-3" />
                                Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Tên phiên</th>
                                    <th className="px-6 py-3 font-medium">Thời gian bắt đầu</th>
                                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                                    <th className="px-6 py-3 font-medium">Ghi chú</th>
                                    <th className="px-6 py-3 font-medium">Người tạo</th>
                                    <th className="px-6 py-3 font-medium">Nhân sự</th>
                                    <th className="px-6 py-3 text-right font-medium">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                {loading ? (
                                    // Loading State
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4"><div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                            <td className="px-6 py-4"><div className="ml-auto h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div></td>
                                        </tr>
                                    ))
                                ) : sessionList.length > 0 ? (
                                    sessionList.map((session) => (
                                        <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {session.sessionName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {format(new Date(session.startTime), 'dd/MM/yyyy HH:mm')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusColor(session.status)}>
                                                    {getStatusLabel(session.status)}
                                                </Badge>
                                            </td>
                                            <td className="max-w-[200px] truncate px-6 py-4 text-gray-700 dark:text-gray-300" title={session.notes}>
                                                {session.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {session.creator?.fullName}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                {session._count?.entries || 0} nhân viên
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/overtime/${session.id}`}
                                                    className="inline-flex rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                    title="Chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <Search className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                                                <p>Không tìm thấy phiên tăng ca nào.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {meta && meta.total > 0 && (
                    <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Hiển thị <span className="font-medium text-gray-900 dark:text-white">{(page - 1) * limit + 1}-{Math.min(page * limit, meta.total)}</span> của <span className="font-medium text-gray-900 dark:text-white">{meta.total}</span>
                        </div>
                        <Pagination
                            currentPage={page}
                            totalPages={meta.totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
