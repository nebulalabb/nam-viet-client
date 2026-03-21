import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, Lock, Unlock } from 'lucide-react'
import { handleExportAttendance } from '@/utils/attendance-excel-export'
import { lockAttendanceMonth, unlockAttendanceMonth } from '@/stores/AttendanceSlice'

export default function AttendanceToolbar({
    attendances = [],
    users = [],
    month, // YYYY-MM format
}) {
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)
    const { loading, statistics } = useSelector((state) => state.attendance)
    const isLocked = statistics?.isMonthLocked

    // Convert YYYY-MM to YYYYMM
    const monthFormatted = month?.replace('-', '')

    const handleExport = () => {
        handleExportAttendance(attendances, users, month)
    }

    const handleToggleLock = () => {
        if (isLocked) {
            if (window.confirm('Bạn có chắc muốn mở khóa công tháng này để cho phép chỉnh sửa?')) {
                dispatch(unlockAttendanceMonth(monthFormatted))
            }
        } else {
            if (window.confirm('Bạn có chắc muốn khóa công tháng này? Hành động này sẽ không cho phép sửa đổi dữ liệu!')) {
                dispatch(lockAttendanceMonth(monthFormatted))
            }
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={attendances.length === 0 || loading}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-green-700/80"
                title="Xuất bảng công ra Excel"
            >
                <Download className="h-4 w-4" />
                Xuất Excel
            </button>
            
            {/* Toggle Lock Month Button */}
            <button
                onClick={handleToggleLock}
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isLocked 
                        ? 'border-orange-600 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-500 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40' 
                        : 'border-red-600 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40'
                }`}
                title={isLocked ? "Mở khóa công tháng (cho phép sửa)" : "Khóa công tháng (khóa dữ liệu, không thể sửa)"}
            >
                {isLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isLocked ? 'Mở khóa công tháng' : 'Khóa công tháng'}
            </button>

            {/* Info text */}
            <div className="ml-auto text-xs text-gray-600 dark:text-gray-400">
                Tháng: <span className="font-medium">{month}</span>
            </div>
        </div>
    )
}
