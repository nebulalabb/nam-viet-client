import React from "react"
import { Download, Upload, Lock } from "lucide-react"

export default function AttendanceToolbar({
    attendances = [],
    users = [],
    month,
    isLoading = false,
    onExport,
    onImport,
    onLockMonth,
    isLocking = false,
    isImporting = false
}) {
    const monthFormatted = month?.replace("-", "")

    const handleExport = () => {
        if (onExport) onExport(attendances, users, month)
    }

    const handleImportClick = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".xlsx,.xls,.csv"
        input.onchange = (e) => {
            const file = e.target.files?.[0]
            if (file && onImport) {
                onImport(file)
            }
        }
        input.click()
    }

    const handleLockMonth = () => {
        if (
            window.confirm("Bạn có chắc muốn chốt công tháng này? Hành động này không thể hoàn tác!")
        ) {
            if (onLockMonth) onLockMonth(monthFormatted)
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {/* Export Button */}
            <button
                onClick={handleExport}
                disabled={attendances.length === 0 || isLoading || isLocking || isImporting}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                title="Xuất bảng công ra Excel"
            >
                <Download className="h-4 w-4" />
                Xuất Excel
            </button>

            {/* Import Button */}
            {/* <button
        onClick={handleImportClick}
        disabled={isLoading || isLocking || isImporting}
        className="inline-flex items-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Nhập dữ liệu (Excel/CSV)"
      >
        <Upload className="h-4 w-4" />
        {isImporting ? "Đang nhập..." : "Nhập dữ liệu"}
      </button> */}

            {/* Lock Month Button */}
            <button
                onClick={handleLockMonth}
                disabled={isLoading || isLocking || isImporting}
                className="inline-flex items-center gap-2 rounded-lg border border-red-600 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Chốt công tháng (khóa dữ liệu, không thể sửa)"
            >
                <Lock className="h-4 w-4" />
                {isLocking ? "Đang xử lý..." : "Chốt công tháng"}
            </button>

            {/* Info text */}
            <div className="text-sm text-gray-600 ml-auto flex items-center bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <span className="mr-2">Tháng:</span>
                <span className="font-bold text-gray-900">{month}</span>
            </div>
        </div>
    )
}
