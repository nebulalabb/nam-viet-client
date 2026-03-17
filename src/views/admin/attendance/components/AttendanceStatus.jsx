import React from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Home, UserX } from 'lucide-react'

const STATUS_COLORS = {
    present: 'green',
    absent: 'red',
    late: 'yellow',
    leave: 'blue',
    work_from_home: 'purple',
}

const STATUS_LABELS = {
    present: 'Có mặt',
    absent: 'Vắng mặt',
    late: 'Đi muộn',
    leave: 'Nghỉ phép',
    work_from_home: 'WFH',
}

const LEAVE_TYPE_LABELS = {
    none: 'Không phải nghỉ',
    annual: 'Nghỉ phép năm',
    sick: 'Nghỉ ốm',
    unpaid: 'Nghỉ không lương',
    other: 'Khác',
}

export default function AttendanceStatusBadge({ status, showIcon = false }) {
    if (!status) return null

    const StatusIcon = {
        present: CheckCircle,
        absent: XCircle,
        late: Clock,
        leave: UserX,
        work_from_home: Home,
    }[status]

    // Convert string 'green' mapping to Tailwind variants if needed, or if your Badge accepts it:
    // Standard ui/badge from shadcn usually takes variant="default"|"secondary"|"destructive"|"outline"
    // Assuming your project has custom colors in Badge or we apply it manually:
    const variantMap = {
        green: 'success', // or custom tailwind class
        red: 'destructive',
        yellow: 'warning',
        blue: 'default',
        purple: 'secondary',
    }

    const badgeColor = STATUS_COLORS[status]
    const variant = variantMap[badgeColor] || 'default'

    return (
        <Badge variant={variant} className="whitespace-nowrap">
            {showIcon && StatusIcon && <StatusIcon className="mr-1 h-3 w-3" />}
            {STATUS_LABELS[status]}
        </Badge>
    )
}

export function LeaveTypeDisplay({ leaveType }) {
    if (!leaveType || leaveType === 'none') {
        return <span className="text-gray-400 dark:text-gray-500">—</span>
    }

    const colors = {
        annual: 'text-blue-600 dark:text-blue-400',
        sick: 'text-red-600 dark:text-red-400',
        unpaid: 'text-gray-600 dark:text-gray-400',
        other: 'text-purple-600 dark:text-purple-400',
    }

    return (
        <span className={`text-sm font-medium ${colors[leaveType] || colors.other}`}>
            {LEAVE_TYPE_LABELS[leaveType]}
        </span>
    )
}

export function TimeDisplay({ time, label }) {
    if (!time) {
        return <span className="text-gray-400 dark:text-gray-500">—</span>
    }

    let formattedTime = time;
    if (typeof time === 'string' && time.includes('T')) {
        const date = new Date(time);
        formattedTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (typeof time === 'string' && time.length >= 5) {
        // HH:mm:ss format fallback
        formattedTime = time.substring(0, 5);
    }

    return (
        <div className="flex items-center gap-1">
            {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}:</span>}
            <span className="font-medium text-gray-900 dark:text-white">{formattedTime}</span>
        </div>
    )
}

export function WorkHoursDisplay({ hours, standard = 8 }) {
    if (hours === undefined || hours === null) {
        return <span className="text-gray-400 dark:text-gray-500">—</span>
    }

    const isUndertime = hours < standard
    const isOvertime = hours > standard

    let colorClass = 'text-gray-900 dark:text-white'
    if (isUndertime) colorClass = 'text-yellow-600 dark:text-yellow-400'
    if (isOvertime) colorClass = 'text-green-600 dark:text-green-400'

    return (
        <div className="flex items-center gap-2">
            <span className={`font-medium ${colorClass}`}>{hours.toFixed(1)}h</span>
            {hours !== standard && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({isOvertime ? '+' : ''}
                    {(hours - standard).toFixed(1)}h)
                </span>
            )}
        </div>
    )
}

export function OvertimeBadge({ hours }) {
    if (!hours || hours === 0) {
        return null
    }

    return (
        <Badge variant="success" className="whitespace-nowrap">
            +{hours.toFixed(1)}h OT
        </Badge>
    )
}

export function CheckStatusIndicator({ hasCheckedIn, hasCheckedOut }) {
    if (!hasCheckedIn) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                Chưa chấm công
            </div>
        )
    }

    if (hasCheckedIn && !hasCheckedOut) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Đang làm việc
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Đã hoàn thành
        </div>
    )
}

export function AttendanceSummary({ checkInTime, checkOutTime, workHours, status }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">Chấm công hôm nay</h4>
                <AttendanceStatusBadge status={status} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Giờ vào:</span>
                    <TimeDisplay time={checkInTime} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Giờ ra:</span>
                    <TimeDisplay time={checkOutTime} />
                </div>

                <div className="border-t border-gray-200 pt-2 flex items-center justify-between dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Giờ công:</span>
                    <WorkHoursDisplay hours={workHours} />
                </div>
            </div>
        </div>
    )
}

export function LocationDisplay({ location, type }) {
    if (!location) {
        return <span className="text-gray-400 dark:text-gray-500">—</span>
    }

    const label = type === 'check-in' ? 'Vị trí vào' : 'Vị trí ra'

    return (
        <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">{label}: </span>
            <span className="text-gray-900 dark:text-white">{location}</span>
        </div>
    )
}
