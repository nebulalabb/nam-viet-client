import React, { useMemo } from 'react'
import { Check, X, Calendar, AlertCircle } from 'lucide-react'

export default function AttendanceApprovalsTab({
    attendances = [],
    users = [],
    isLoading = false,
    onApprove,
    onReject,
}) {
    // Filter pending approvals: status = 'leave' OR overtimeHours > 0 AND approvedBy = null
    const pendingApprovals = useMemo(() => {
        return attendances.filter(
            (att) =>
                (att.status === 'leave' ||
                    (att.overtimeHours && att.overtimeHours > 0)) &&
                !att.approvedBy
        )
    }, [attendances])

    // Map users for quick lookup
    const userMap = useMemo(() => {
        const map = new Map()
        users.forEach((user) => {
            map.set(user.id, user)
        })
        return map
    }, [users])

    const getLeaveTypeLabel = (leaveType) => {
        const labels = {
            none: 'Không phải nghỉ',
            annual: 'Nghỉ phép năm',
            sick: 'Nghỉ ốm',
            unpaid: 'Nghỉ không lương',
            other: 'Khác',
        }
        return labels[leaveType || 'none'] || leaveType || '—'
    }


    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
        )
    }

    if (pendingApprovals.length === 0) {
        return (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-600 dark:bg-gray-800/50">
                <CheckCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    Không có yêu cầu cần duyệt
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Tất cả các đơn xin nghỉ và tăng ca đều đã được xử lý
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {pendingApprovals.map((approval) => {
                const user = userMap.get(approval.userId)

                return (
                    <div
                        key={approval.id}
                        className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20"
                    >
                        <div className="flex items-start justify-between gap-4">
                            {/* Left: Info */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-3 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {user?.fullName || 'Nhân viên không xác định'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user?.employeeCode}
                                        </p>
                                    </div>
                                </div>

                                <div className="ml-13 space-y-2">
                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                                        <span>
                                            {new Date(approval.date).toLocaleDateString('vi-VN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    </div>

                                    {/* Approval Type Badge */}
                                    <div className="flex flex-wrap gap-2">
                                        {(approval.status === 'leave' ||
                                            (approval.leaveType && approval.leaveType !== 'none')) && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {getLeaveTypeLabel(approval.leaveType)}
                                                </span>
                                            )}
                                        {approval.overtimeHours > 0 && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                Tăng ca: {approval.overtimeHours.toFixed(1)}h
                                            </span>
                                        )}
                                    </div>

                                    {/* Notes/Reason */}
                                    {approval.notes && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">Lý do:</span> {approval.notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Right: Actions */}
                            <div className="flex flex-shrink-0 gap-2">
                                <button
                                    onClick={() => onApprove && onApprove(approval.id)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 dark:hover:bg-green-700/80"
                                    title="Phê duyệt"
                                >
                                    <Check className="h-4 w-4" />
                                    <span className="hidden sm:inline">Duyệt</span>
                                </button>
                                <button
                                    onClick={() => onReject && onReject(approval.id)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                                    title="Từ chối"
                                >
                                    <X className="h-4 w-4" />
                                    <span className="hidden sm:inline">Từ chối</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

// Helper icon
function CheckCircle(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    )
}
