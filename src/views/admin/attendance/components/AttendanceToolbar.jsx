import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Download, Upload, Lock } from 'lucide-react'
import { handleExportAttendance } from '@/utils/attendance-excel-export'
import { importAttendance, lockAttendanceMonth } from '@/stores/AttendanceSlice'

export default function AttendanceToolbar({
    attendances = [],
    users = [],
    month, // YYYY-MM format
}) {
    const dispatch = useDispatch()
    const fileInputRef = useRef(null)
    const { loading } = useSelector((state) => state.attendance)

    // Convert YYYY-MM to YYYYMM
    const monthFormatted = month?.replace('-', '')

    const handleExport = () => {
        handleExportAttendance(attendances, users, month)
    }

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            dispatch(importAttendance(file))
        }
        // Reset input so the same file can be selected again if needed
        e.target.value = null
    }

    const handleLockMonth = () => {
        if (
            window.confirm(
                'Bạn có chắc muốn chốt công tháng này? Hành động này không thể hoàn tác!'
            )
        ) {
            dispatch(lockAttendanceMonth(monthFormatted))
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

            {/* Import Button */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                onClick={handleImportClick}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
                title="Nhập dữ liệu từ máy chấm công (Excel/CSV)"
            >
                <Upload className="h-4 w-4" />
                Nhập dữ liệu
            </button>

            {/* Lock Month Button */}
            <button
                onClick={handleLockMonth}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed dark:border-red-500 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title="Chốt công tháng (khóa dữ liệu, không thể sửa)"
            >
                <Lock className="h-4 w-4" />
                Chốt công tháng
            </button>

            {/* Info text */}
            <div className="ml-auto text-xs text-gray-600 dark:text-gray-400">
                Tháng: <span className="font-medium">{month}</span>
            </div>
        </div>
    )
}
