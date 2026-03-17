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
    const [showRequestLeave, setShowRequestLeave] = useState(false)
    const [editDialogRecord, setEditDialogRecord] = useState(null)
    const [openUserCombobox, setOpenUserCombobox] = useState(false)

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
            const dateStr = new Date(att.date).toISOString().split('T')[0]
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
        <div className="space-y-6 h-full overflow-y-auto pb-10 pr-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chấm công</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Quản lý và theo dõi chấm công nhân viên
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowRequestLeave(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <Calendar className="h-4 w-4" />
                        Xin nghỉ phép
                    </button>

                    {/* QR Code Button - usually for admins/managers */}
                    <button
                        onClick={() => setShowQRDialog(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        <QrCode className="h-4 w-4" />
                        Tạo QR
                    </button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'matrix'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Grid3x3 className="h-4 w-4" />
                            Bảng công
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'calendar'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Lịch
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <List className="h-4 w-4" />
                            Danh sách
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <ClassicCard
                        title="Ngày Có Mặt"
                        value={statistics?.presentDays || 0}
                        icon={UserCheck}
                        color="green"
                        description="Nhân viên đã chấm công"
                    />

                    <ClassicCard
                        title="Ngày Vắng"
                        value={statistics?.absentDays || 0}
                        icon={UserX}
                        color="red"
                        description="Nhân viên vắng mặt"
                    />

                    <ClassicCard
                        title="Tổng Giờ Công"
                        value={`${(statistics?.totalWorkHours || 0).toFixed(1)}h`}
                        icon={Clock}
                        color="blue"
                        description="Tính trong kỳ"
                    />

                    <ClassicCard
                        title="TB Giờ/Ngày"
                        value={`${(statistics?.averageWorkHours || 0).toFixed(1)}h`}
                        icon={TrendingUp}
                        color="purple"
                        description="Bình quân mỗi ngày"
                    />
                </div>
            )}

            {/* Daily Stats Card */}
            <DailyStatsCard
                attendances={attendances}
                users={users}
                selectedDate={selectedDate || undefined}
            />

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Tổng quan
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab('approvals')}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'approvals'
                            ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Cần duyệt
                        </div>
                    </button>
                </div>
            </div>
{/* fix */}
            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Filters - Moved to vertical layout with better card styling */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {/* Month Selector Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <label htmlFor="month" className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                📅 Chọn tháng xem chấm công
                            </label>
                            <MonthPicker 
                                value={selectedMonth}
                                onChange={setSelectedMonth}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Dữ liệu chấm công sẽ được hiển thị theo tháng được chọn.
                            </p>
                        </div>

                        {/* User Selector Combobox Card */}
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                👤 Chọn nhân viên
                            </label>
                            <Popover open={openUserCombobox} onOpenChange={setOpenUserCombobox}>
                                <PopoverTrigger asChild>
                                    <button
                                        role="combobox"
                                        aria-expanded={openUserCombobox}
                                        className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-base font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:bg-gray-800"
                                    >
                                        <span className="truncate">
                                            {selectedUserId === 'me'
                                                ? 'Của tôi'
                                                : selectedUserId === 'all'
                                                    ? 'Tất cả nhân viên'
                                                    : users.find((user) => user.id === selectedUserId)?.fullName || 'Chọn nhân viên...'}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full min-w-[300px] p-0" align="start">
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
                                                            <span className="text-xs text-gray-500">{user.employeeCode}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Lọc danh sách công theo từng cá nhân.
                            </p>
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
                        <AttendanceMonthlyMatrix
                            attendances={attendances}
                            users={displayedUsers}
                            month={selectedMonth}
                            onCellClick={(userId, date) => {
                                setSelectedDate(date)
                                setViewMode('list')
                            }}
                        />
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <AttendanceCalendar
                            attendances={attendances}
                            month={selectedMonth}
                            onMonthChange={setSelectedMonth}
                            onDateClick={handleDateClick}
                        />
                    )}

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                            {selectedDate && (
                                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span>Hiển thị dữ liệu cho ngày:{' '}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {new Date(selectedDate).toLocaleDateString('vi-VN')}
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
                                                Giờ vào
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Giờ ra
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Giờ công
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
                                                    colSpan={7}
                                                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Không có dữ liệu chấm công
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAttendances.map((attendance) => (
                                                <tr
                                                    key={attendance.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                        {new Date(attendance.date).toLocaleDateString('vi-VN')}
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
                        </div>
                    )}
                </div>
            )}

            {/* Approvals Tab */}
            {activeTab === 'approvals' && (
                <AttendanceApprovalsTab
                    attendances={attendanceList}
                    users={users}
                    isLoading={loading}
                    onApprove={handleApproveLeave}
                    onReject={handleRejectLeave}
                />
            )}

            {/* QR Code Dialog */}
            <GenerateQRDialog isOpen={showQRDialog} onClose={() => setShowQRDialog(false)} />

            <RequestLeaveDialog isOpen={showRequestLeave} onClose={() => setShowRequestLeave(false)} />

            {/* Edit Attendance Dialog */}
            <AttendanceEditDialog 
                isOpen={!!editDialogRecord} 
                onClose={() => setEditDialogRecord(null)} 
                attendance={editDialogRecord}
                onSuccess={loadData}
            />
        </div>
    )
}
