import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMyAttendance, getAttendanceList, getAttendanceStatistics, approveLeave, rejectLeave } from '@/stores/AttendanceSlice'
import { getUsers } from '@/stores/UserSlice'
import AttendanceCalendar from './components/AttendanceCalendar'
import AttendanceMonthlyMatrix from './components/AttendanceMonthlyMatrix'
import DailyStatsCard from './components/DailyStatsCard'
import AttendanceApprovalsTab from './components/AttendanceApprovalsTab'
import AttendanceToolbar from './components/AttendanceToolbar'
import GenerateQRDialog from './components/GenerateQRDialog'
import QRManagementDialog from './components/QRManagementDialog'
import RequestLeaveDialog from './components/RequestLeaveDialog'
import AttendanceEditDialog from './components/AttendanceEditDialog'
import AttendanceStatusBadge, {
    TimeDisplay,
    WorkHoursDisplay,
    LeaveTypeDisplay,
} from './components/AttendanceStatus'
import { MonthPicker } from './components/MonthPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { cn } from '@/lib/utils'
import {
    Calendar,
    List,
    Clock,
    TrendingUp,
    UserCheck,
    UserX,
    Grid3x3,
    CheckCircle2,
    QrCode,
    Edit2,
    ChevronsUpDown,
    Check
} from 'lucide-react'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import CustomPagination from '@/components/CustomPagination'

// Simple ClassicCard component since we couldn't find the exact one from Next.js
function ClassicCard({ title, value, icon, color, description }) {
    const Icon = icon
    const colorClasses = {
        green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
        red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
        blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
        purple: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
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
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
            </div>
            {description && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">{description}</div>
            )}
        </div>
    )
}

export default function AttendancePage() {
    const dispatch = useDispatch()

    const [viewMode, setViewMode] = useState('matrix')
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    })
    const [selectedUserId, setSelectedUserId] = useState('me')
    const [selectedDate, setSelectedDate] = useState(null)
    const [showQRDialog, setShowQRDialog] = useState(false)
    const [showQRManagement, setShowQRManagement] = useState(false)
    const [showRequestLeave, setShowRequestLeave] = useState(false)
    const [openUserCombobox, setOpenUserCombobox] = useState(false)
    const [editDialogRecord, setEditDialogRecord] = useState(null)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(20)

    useEffect(() => {
        setPage(1)
    }, [viewMode])

    const { attendanceList, myAttendance, statistics, loading } = useSelector((state) => state.attendance)
    const { users } = useSelector((state) => state.user)
    const authUser = useSelector((state) => state.auth?.authUserWithRoleHasPermissions)

    const isMyView = selectedUserId === 'me'
    const isAllView = selectedUserId === 'all'
    const monthFormatted = selectedMonth.replace('-', '') // YYYY-MM -> YYYYMM

    const displayedUsers = useMemo(() => {
        if (isMyView) return authUser ? [authUser] : [{ id: 0, fullName: 'Của tôi' }]
        if (isAllView) return users
        return users.filter(u => u.id === selectedUserId)
    }, [isMyView, isAllView, users, authUser, selectedUserId])

    // Initial fetch
    useEffect(() => {
        dispatch(getUsers({ status: 'active' }))
    }, [dispatch])

    // Fetching data logic wrapped in useCallback so we can trigger it manually
    const loadData = useCallback(() => {
        if (isMyView) {
            dispatch(getMyAttendance({ month: monthFormatted }))
        } else if (isAllView) {
            dispatch(getAttendanceList({ month: monthFormatted }))
        } else {
            dispatch(getAttendanceList({ userId: selectedUserId, month: monthFormatted }))
        }
        dispatch(getAttendanceStatistics({ 
            month: monthFormatted,
            userId: (isMyView || isAllView) ? undefined : selectedUserId 
        }))
    }, [dispatch, isMyView, isAllView, monthFormatted, selectedUserId])

    useEffect(() => {
        loadData()
    }, [loadData])

    const rawAttendances = isMyView ? myAttendance : attendanceList
    const attendances = Array.isArray(rawAttendances) ? rawAttendances : []

    // Filter attendances by selected date if in list view
    const filteredAttendances = useMemo(() => {
        if (!selectedDate || viewMode !== 'list') return attendances
        return attendances.filter((att) => {
            if (!att.date) return false
            const d = new Date(att.date)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            return dateStr === selectedDate
        })
    }, [attendances, selectedDate, viewMode])

    const handleDateClick = (date) => {
        setSelectedDate(date)
        setViewMode('list')
    }

    const handleApproveLeave = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn duyệt yêu cầu này?')) {
            dispatch(approveLeave(id))
        }
    }

    const handleRejectLeave = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
            dispatch(rejectLeave(id))
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Chấm công
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowRequestLeave(true)}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Xin nghỉ phép
                        </button>

                        <button
                            onClick={() => setShowQRDialog(true)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow focus-visible:outline-none focus-visible:ring-1 hover:bg-blue-700 focus-visible:ring-blue-700"
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Tạo QR
                        </button>

                        <button
                            onClick={() => setShowQRManagement(true)}
                            className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Quản lý QR
                        </button>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 flex flex-col space-y-4">
                    {/* View Modes */}
                    <div className="border-b border-gray-200 dark:border-gray-700 flex justify-start items-center p-2 gap-2">
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'matrix' ? 'bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                        >
                            <Grid3x3 className="h-4 w-4" />
                            Bảng công
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'calendar' ? 'bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                        >
                            <Calendar className="h-4 w-4" />
                            Lịch
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-muted shadow-sm text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                        >
                            <List className="h-4 w-4" />
                            Danh sách
                        </button>
                    </div>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                    {/* Filters - Compact Toolbar */}
                    <div className="flex w-full items-center space-x-2 overflow-auto p-1">
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Tháng:</span>
                                <div className="w-[140px]">
                                    <MonthPicker 
                                        value={selectedMonth}
                                        onChange={setSelectedMonth}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Nhân viên:</span>
                                <div className="w-[200px]">
                                    <Popover open={openUserCombobox} onOpenChange={setOpenUserCombobox}>
                                        <PopoverTrigger asChild>
                                            <button
                                                role="combobox"
                                                aria-expanded={openUserCombobox}
                                                className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                            >
                                                <span className="truncate">
                                                    {selectedUserId === 'me'
                                                        ? 'Của tôi'
                                                        : selectedUserId === 'all'
                                                            ? 'Tuyển chọn nhân viên'
                                                            : users.find((user) => user.id === selectedUserId)?.fullName || 'Chọn NV...'}
                                                </span>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Gõ tên hoặc mã nhân viên..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                                                    <CommandGroup>
                                                        <CommandItem
                                                            value="Của tôi"
                                                            onSelect={() => {
                                                                setSelectedUserId('me')
                                                                setOpenUserCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    selectedUserId === 'me' ? 'opacity-100' : 'opacity-0'
                                                                )}
                                                            />
                                                            Của tôi
                                                        </CommandItem>
                                                        <CommandItem
                                                            value="Tất cả nhân viên"
                                                            onSelect={() => {
                                                                setSelectedUserId('all')
                                                                setOpenUserCombobox(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    'mr-2 h-4 w-4',
                                                                    selectedUserId === 'all' ? 'opacity-100' : 'opacity-0'
                                                                )}
                                                            />
                                                            Tất cả nhân viên
                                                        </CommandItem>
                                                        {users.map((user) => (
                                                            <CommandItem
                                                                key={user.id}
                                                                value={user.fullName + ' ' + user.employeeCode}
                                                                onSelect={() => {
                                                                    setSelectedUserId(user.id)
                                                                    setOpenUserCombobox(false)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{user.fullName}</span>
                                                                    <span className="text-xs text-muted-foreground">{user.employeeCode}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <AttendanceToolbar
                        attendances={attendances}
                        users={displayedUsers}
                        month={selectedMonth}
                    />

                    {/* Matrix View */}
                    {viewMode === 'matrix' && (
                        <div className="flex-1 overflow-auto flex flex-col">
                            <div className="flex-1 overflow-auto rounded-md border text-sm bg-white dark:bg-gray-900">
                                <AttendanceMonthlyMatrix
                                    attendances={attendances}
                                    users={displayedUsers.slice((page - 1) * limit, page * limit)}
                                    month={selectedMonth}
                                    onCellClick={(userId, date) => {
                                        setSelectedDate(date)
                                        setViewMode('list')
                                    }}
                                />
                            </div>
                            <CustomPagination 
                                totalItems={displayedUsers.length}
                                currentPage={page}
                                pageSize={limit}
                                onPageChange={setPage}
                                onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                            />
                        </div>
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="flex-1 overflow-auto rounded-md border text-sm bg-white dark:bg-gray-900">
                            <AttendanceCalendar
                                attendances={attendances}
                                month={selectedMonth}
                                onMonthChange={setSelectedMonth}
                                onDateClick={handleDateClick}
                            />
                        </div>
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="flex-1 overflow-auto flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                            {selectedDate && (
                                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span>Hiển thị dữ liệu cho ngày:{' '}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {(() => {
                                                    const [y, m, d] = selectedDate.split('-');
                                                    return `${d}/${m}/${y}`;
                                                })()}
                                            </span>
                                        </span>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                        >
                                            Xem tất cả
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button
                                            onClick={() => {
                                                setSelectedDate(null)
                                                setViewMode('matrix')
                                            }}
                                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 dark:text-gray-400 dark:hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                            Quay lại Bảng
                                        </button>
                                    </p>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Ngày
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Nhân viên
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Giờ vào
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Giờ ra
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Giờ công
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                OT
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Trạng thái
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Loại nghỉ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Ghi chú
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                                        {filteredAttendances.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={9}
                                                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Không có dữ liệu chấm công
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAttendances.slice((page - 1) * limit, page * limit).map((attendance) => (
                                                <tr
                                                    key={attendance.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {new Date(attendance.date).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {(() => {
                                                            const user = users.find(u => u.id === attendance.userId);
                                                            return user ? <div className="flex flex-col"><span>{user.fullName}</span><span className="text-xs text-gray-500">{user.employeeCode}</span></div> : '—';
                                                        })()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <TimeDisplay time={attendance.checkInTime} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <TimeDisplay time={attendance.checkOutTime} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <WorkHoursDisplay hours={attendance.workHours} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        {attendance.overtimeHours && attendance.overtimeHours > 0 ? (
                                                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                                                {Number(attendance.overtimeHours).toFixed(1)}h
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <AttendanceStatusBadge status={attendance.status} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <LeaveTypeDisplay leaveType={attendance.leaveType} />
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate max-w-[150px] block" title={attendance.notes || ''}>
                                                                {attendance.notes || '—'}
                                                            </span>
                                                            {/* Chỉ có Admin/Quản lý hoặc role phù hợp mới thấy nút sửa */}
                                                            {authUser?.role?.roleKey === 'admin' && (
                                                                <button
                                                                    onClick={() => setEditDialogRecord(attendance)}
                                                                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                                    title="Sửa chấm công"
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <CustomPagination 
                                totalItems={filteredAttendances.length}
                                currentPage={page}
                                pageSize={limit}
                                onPageChange={setPage}
                                onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                            />
                        </div>
                    )}
                </div>

            {/* QR Code Dialog */}
            <GenerateQRDialog isOpen={showQRDialog} onClose={() => setShowQRDialog(false)} />

            <QRManagementDialog isOpen={showQRManagement} onClose={() => setShowQRManagement(false)} />

            <RequestLeaveDialog isOpen={showRequestLeave} onClose={() => setShowRequestLeave(false)} />

            {/* Edit Attendance Dialog */}
            <AttendanceEditDialog 
                isOpen={!!editDialogRecord} 
                onClose={() => setEditDialogRecord(null)} 
                attendance={editDialogRecord}
                onSuccess={loadData}
            />
            </div>
            </LayoutBody>
        </Layout>
    )
}
