import React, { useState, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Layout, LayoutBody } from "@/components/custom/Layout"
import { getAttendances, getMyAttendances, getAttendanceStatistics, approveLeave, updateAttendance } from "@/stores/AttendanceSlice"
import { getUsers } from "@/stores/UserSlice"

import AttendanceCalendar from "./components/AttendanceCalendar"
import AttendanceMonthlyMatrix from "./components/AttendanceMonthlyMatrix"
import DailyStatsCard from "./components/DailyStatsCard"
import AttendanceApprovalsTab from "./components/AttendanceApprovalsTab"
import AttendanceToolbar from "./components/AttendanceToolbar"
import GenerateQRDialog from "./components/GenerateQRDialog"
import RequestLeaveDialog from "./components/RequestLeaveDialog"
import AttendanceStatusBadge, { TimeDisplay, WorkHoursDisplay } from "./components/AttendanceStatus"
import { Button } from "@/components/custom/Button"
import { Calendar, List, Grid3x3, CheckCircle2, QrCode, Plus } from "lucide-react"

export default function AttendancePage() {
    const dispatch = useDispatch()

    // State from Redux
    const users = useSelector(state => state.user.users) || []
    const attendances = useSelector(state => state.attendance.attendances) || []
    const myAttendances = useSelector(state => state.attendance.myAttendances) || []
    const statistics = useSelector(state => state.attendance.statistics)
    const loading = useSelector(state => state.attendance.loading)

    // Local state
    const [viewMode, setViewMode] = useState("matrix") // matrix, calendar, list
    const [activeTab, setActiveTab] = useState("overview") // overview, approvals
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    })
    const [selectedUserId, setSelectedUserId] = useState("me") // "me" or user ID
    const [selectedDate, setSelectedDate] = useState(null)

    // Dialog state
    const [showQRDialog, setShowQRDialog] = useState(false)
    const [showRequestLeave, setShowRequestLeave] = useState(false)

    // Fetch data
    useEffect(() => {
        document.title = "Chấm công"
        dispatch(getUsers({ status: "active", limit: 100 }))
    }, [dispatch])

    useEffect(() => {
        const monthFormatted = selectedMonth.replace("-", "") // YYYYMM
        if (selectedUserId === "me") {
            dispatch(getMyAttendances({ month: monthFormatted, limit: 100 }))
        } else {
            dispatch(getAttendances({
                month: monthFormatted,
                userId: selectedUserId !== "all" ? selectedUserId : undefined,
                limit: 100
            }))
        }
        dispatch(getAttendanceStatistics({ month: monthFormatted }))
    }, [dispatch, selectedMonth, selectedUserId])

    const isMyView = selectedUserId === "me"
    const currentAttendances = isMyView ? myAttendances : attendances

    const filteredAttendances = useMemo(() => {
        if (!selectedDate || viewMode !== "list") return currentAttendances
        return currentAttendances.filter((att) => att.date === selectedDate)
    }, [currentAttendances, selectedDate, viewMode])

    const handleDateClick = (date, attendance) => {
        setSelectedDate(date)
        setViewMode("list")
    }

    const handleApproveLeave = async (id) => {
        await dispatch(approveLeave({ id, data: { status: 'approved' } }))
        // Refresh data
        const monthFormatted = selectedMonth.replace("-", "")
        dispatch(getAttendances({ month: monthFormatted, limit: 100 }))
    }

    const handleRejectLeave = async (id) => {
        await dispatch(approveLeave({ id, data: { status: 'rejected' } }))
        // Refresh data
        const monthFormatted = selectedMonth.replace("-", "")
        dispatch(getAttendances({ month: monthFormatted, limit: 100 }))
    }

    const handleExport = (att, usrs, month) => {
        // Placeholder for actual export logic if needed in React
        console.log("Exporting", att.length, month)
        alert("Chức năng xuất Excel đang được tích hợp")
    }

    const handleLockMonth = (monthFormatted) => {
        console.log("Locking month", monthFormatted)
        alert("Chức năng chốt công đang được tích hợp")
    }

    const displayUsers = isMyView
        ? [{ id: 0, fullName: "Của tôi", employeeCode: "ME" }]
        : users

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-4" fixedHeight>

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            Chấm công
                        </h2>
                        <p className="text-sm text-gray-500">
                            Quản lý và theo dõi chấm công nhân viên
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setShowRequestLeave(true)}
                            variant="outline"
                            className="gap-2 h-9"
                        >
                            <Plus className="h-4 w-4" />
                            Xin nghỉ phép
                        </Button>

                        <Button
                            onClick={() => setShowQRDialog(true)}
                            className="gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <QrCode className="h-4 w-4" />
                            Tạo QR
                        </Button>

                        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("matrix")}
                                className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "matrix" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                <Grid3x3 className="h-4 w-4" /> Bảng công
                            </button>
                            <button
                                onClick={() => setViewMode("calendar")}
                                className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                <Calendar className="h-4 w-4" /> Lịch
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                    }`}
                            >
                                <List className="h-4 w-4" /> Danh sách
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS & QUICK VIEW */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-1 border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Tổng giờ làm</span>
                            <span className="font-bold text-lg">{statistics?.totalWorkHours?.toFixed(1) || "0.0"}h</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Ngày có mặt</span>
                            <span className="font-bold text-lg text-green-600">{statistics?.presentDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500">Ngày vắng</span>
                            <span className="font-bold text-lg text-red-600">{statistics?.absentDays || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Trung bình/ngày</span>
                            <span className="font-bold text-lg text-blue-600">{statistics?.averageWorkHours?.toFixed(1) || "0.0"}h</span>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <DailyStatsCard
                            attendances={currentAttendances}
                            users={displayUsers}
                            selectedDate={selectedDate || undefined}
                        />
                    </div>
                </div>

                {/* TABS */}
                <div className="border-b border-gray-200">
                    <div className="flex -mb-px px-2 space-x-6">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "overview"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> Tổng quan
                            </div>
                        </button>

                        <button
                            onClick={() => setActiveTab("approvals")}
                            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "approvals"
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" /> Cần duyệt
                            </div>
                        </button>
                    </div>
                </div>

                {/* TAB CONTENTS */}
                <div className="flex-1 overflow-auto -mx-4 px-4 pb-4">
                    {activeTab === "overview" && (
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tháng</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Nhân viên</label>
                                    <select
                                        value={selectedUserId}
                                        onChange={(e) => setSelectedUserId(e.target.value === "me" || e.target.value === "all" ? e.target.value : Number(e.target.value))}
                                        className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors"
                                    >
                                        <option value="me">Của tôi (Cá nhân)</option>
                                        <option value="all">Tất cả nhân viên</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.fullName} ({user.employeeCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!isMyView && (
                                <AttendanceToolbar
                                    attendances={currentAttendances}
                                    users={users}
                                    month={selectedMonth}
                                    onExport={handleExport}
                                    onLockMonth={handleLockMonth}
                                />
                            )}

                            {viewMode === "matrix" && (
                                <AttendanceMonthlyMatrix
                                    attendances={currentAttendances}
                                    users={displayUsers}
                                    month={selectedMonth}
                                    onCellClick={(userId, date) => {
                                        setSelectedDate(date)
                                        setViewMode("list")
                                    }}
                                />
                            )}

                            {viewMode === "calendar" && (
                                <AttendanceCalendar
                                    attendances={currentAttendances}
                                    month={selectedMonth}
                                    onMonthChange={setSelectedMonth}
                                    onDateClick={handleDateClick}
                                />
                            )}

                            {viewMode === "list" && (
                                <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
                                    {selectedDate && (
                                        <div className="border-b border-gray-200 bg-blue-50 p-3 flex justify-between items-center">
                                            <p className="text-sm text-blue-800">
                                                Hiển thị dữ liệu cho ngày: <span className="font-bold">{new Date(selectedDate).toLocaleDateString("vi-VN")}</span>
                                            </p>
                                            <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)} className="h-8 bg-white">
                                                Xem tất cả
                                            </Button>
                                        </div>
                                    )}

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3">Ngày</th>
                                                    {!isMyView && <th className="px-4 py-3">Nhân viên</th>}
                                                    <th className="px-4 py-3">Giờ vào</th>
                                                    <th className="px-4 py-3">Giờ ra</th>
                                                    <th className="px-4 py-3">Giờ công</th>
                                                    <th className="px-4 py-3">Trạng thái</th>
                                                    <th className="px-4 py-3 text-right">Ghi chú</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAttendances.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={isMyView ? 6 : 7} className="px-4 py-12 text-center text-gray-500">
                                                            Không có dữ liệu chấm công
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredAttendances.map((att) => (
                                                        <tr key={att.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="px-4 py-3">{new Date(att.date).toLocaleDateString("vi-VN")}</td>
                                                            {!isMyView && (
                                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                                    {users.find(u => u.id === att.userId)?.fullName || `User #${att.userId}`}
                                                                </td>
                                                            )}
                                                            <td className="px-4 py-3"><TimeDisplay time={att.checkInTime} /></td>
                                                            <td className="px-4 py-3"><TimeDisplay time={att.checkOutTime} /></td>
                                                            <td className="px-4 py-3"><WorkHoursDisplay hours={att.workHours} /></td>
                                                            <td className="px-4 py-3"><AttendanceStatusBadge status={att.status} /></td>
                                                            <td className="px-4 py-3 text-right text-gray-500 max-w-[150px] truncate" title={att.notes}>{att.notes || "—"}</td>
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

                    {activeTab === "approvals" && (
                        <AttendanceApprovalsTab
                            attendances={attendances}
                            users={users}
                            onApprove={handleApproveLeave}
                            onReject={handleRejectLeave}
                        />
                    )}
                </div>

            </LayoutBody>

            {/* DIALOGS */}
            <GenerateQRDialog
                isOpen={showQRDialog}
                onClose={() => setShowQRDialog(false)}
            />

            <RequestLeaveDialog
                isOpen={showRequestLeave}
                onClose={() => setShowRequestLeave(false)}
            />
        </Layout>
    )
}
