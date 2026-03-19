import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Eye, Search, RotateCcw, X, Users, Clock, CheckCircle, PlusIcon } from 'lucide-react'

import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getOvertimeSessions, getOvertimeStats } from '@/stores/OvertimeSlice'
import { useDebounce } from '@/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'
import CreateSessionDialog from './components/CreateSessionDialog'
import SessionDetailsDialog from './components/SessionDetailsDialog'
import CustomPagination from '@/components/CustomPagination'

// Component render
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
    const [selectedSessionId, setSelectedSessionId] = useState(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Quản lý tăng ca
                        </h2>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 flex flex-col space-y-4">
                    {/* Toolbar */}
                    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Tìm phiên, người tạo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex h-8 w-[150px] lg:w-[250px] rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-8 w-[150px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="open">Đang mở</option>
                                <option value="closed">Đã đóng</option>
                                <option value="cancelled">Đã hủy</option>
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="inline-flex h-8 items-center justify-center rounded-md px-2 lg:px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    Đặt lại
                                    <X className="ml-2 h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                             <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="flex h-8 w-[110px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value={10}>10 / trang</option>
                                <option value={20}>20 / trang</option>
                                <option value={50}>50 / trang</option>
                            </select>

                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-green-600 px-3 text-sm font-medium text-white shadow hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700"
                            >
                                <PlusIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                                Mở phiên
                            </button>
                            <CreateSessionDialog
                                isOpen={isCreateOpen}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        </div>
                    </div>

                {/* Table Section */}
                <div className="flex-1 overflow-auto rounded-md border border-gray-200 dark:border-gray-700">
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
                                                <button
                                                    onClick={() => {
                                                        setSelectedSessionId(session.id)
                                                        setIsDetailsOpen(true)
                                                    }}
                                                    className="inline-flex rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                                    title="Chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
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
                    <CustomPagination 
                        totalItems={meta.total}
                        currentPage={page}
                        pageSize={limit}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                    />
                )}
                </div>

                <SessionDetailsDialog 
                    isOpen={isDetailsOpen} 
                    onClose={() => setIsDetailsOpen(false)} 
                    sessionId={selectedSessionId} 
                />
            </LayoutBody>
        </Layout>
    )
}
