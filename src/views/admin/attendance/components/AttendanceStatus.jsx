import React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Home, UserX } from "lucide-react"

const STATUS_COLORS = {
    present: "success",
    absent: "destructive",
    late: "warning",
    leave: "secondary",
    work_from_home: "default",
}

const STATUS_LABELS = {
    present: "Có mặt",
    absent: "Vắng mặt",
    late: "Đi muộn",
    leave: "Nghỉ phép",
    work_from_home: "WFH",
}

const LEAVE_TYPE_LABELS = {
    none: "Không phải nghỉ",
    annual: "Nghỉ phép năm",
    sick: "Nghỉ ốm",
    unpaid: "Nghỉ không lương",
    other: "Khác",
}

export default function AttendanceStatusBadge({ status, showIcon = false }) {
    const StatusIcon = {
        present: CheckCircle,
        absent: XCircle,
        late: Clock,
        leave: UserX,
        work_from_home: Home,
    }[status] || CheckCircle

    return (
        <Badge variant={STATUS_COLORS[status] || "default"}>
            {showIcon && <StatusIcon className="mr-1 h-3 w-3 inline-block" />}
            {STATUS_LABELS[status] || "Không xác định"}
        </Badge>
    )
}

export function LeaveTypeDisplay({ leaveType }) {
    if (!leaveType || leaveType === "none") {
        return <span className="text-gray-400">—</span>
    }

    const colors = {
        annual: "text-blue-600",
        sick: "text-red-600",
        unpaid: "text-gray-600",
        other: "text-purple-600",
    }

    return (
        <span className={`text-sm font-medium ${colors[leaveType] || "text-gray-600"}`}>
            {LEAVE_TYPE_LABELS[leaveType]}
        </span>
    )
}

export function TimeDisplay({ time, label }) {
    if (!time) {
        return <span className="text-gray-400">—</span>
    }

    const formattedTime = time.substring(0, 5)

    return (
        <div className="flex items-center gap-1">
            {label && <span className="text-xs text-gray-500">{label}:</span>}
            <span className="font-medium text-gray-900">{formattedTime}</span>
        </div>
    )
}

export function WorkHoursDisplay({ hours, standard = 8 }) {
    if (hours === undefined || hours === null) {
        return <span className="text-gray-400">—</span>
    }

    const isUndertime = hours < standard
    const isOvertime = hours > standard

    let colorClass = "text-gray-900"
    if (isUndertime) colorClass = "text-yellow-600"
    if (isOvertime) colorClass = "text-green-600"

    return (
        <div className="flex items-center gap-2">
            <span className={`font-medium ${colorClass}`}>{hours.toFixed(1)}h</span>
            {hours !== standard && (
                <span className="text-xs text-gray-500">
                    ({isOvertime ? "+" : ""}
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
        <Badge variant="success">
            +{hours.toFixed(1)}h OT
        </Badge>
    )
}

export function CheckStatusIndicator({ hasCheckedIn, hasCheckedOut }) {
    if (!hasCheckedIn) {
        return (
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="h-2 w-2 rounded-full bg-gray-400" />
                Chưa chấm công
            </div>
        )
    }

    if (hasCheckedIn && !hasCheckedOut) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                Đang làm việc
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Đã hoàn thành
        </div>
    )
}

export function AttendanceSummary({ checkInTime, checkOutTime, workHours, status }) {
    return (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Chấm công hôm nay</h4>
                <AttendanceStatusBadge status={status} />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Giờ vào:</span>
                    <TimeDisplay time={checkInTime} />
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Giờ ra:</span>
                    <TimeDisplay time={checkOutTime} />
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-2">
                    <span className="text-sm font-medium text-gray-900">Giờ công:</span>
                    <WorkHoursDisplay hours={workHours} />
                </div>
            </div>
        </div>
    )
}

export function LocationDisplay({ location, type }) {
    if (!location) {
        return <span className="text-gray-400">—</span>
    }

    const label = type === "check-in" ? "Vị trí vào" : "Vị trí ra"

    return (
        <div className="text-sm">
            <span className="text-gray-500">{label}: </span>
            <span className="text-gray-900">{location}</span>
        </div>
    )
}
