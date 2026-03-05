import React, { useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function AttendanceCalendar({
    attendances = [],
    month,
    onMonthChange,
    onDateClick,
}) {
    const [year, monthNum] = month.split("-").map(Number)

    const daysInMonth = new Date(year, monthNum, 0).getDate()
    const firstDayOfMonth = new Date(year, monthNum - 1, 1).getDay()

    const calendarDays = useMemo(() => {
        const days = []
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(null)
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(day)
        }
        return days
    }, [firstDayOfMonth, daysInMonth])

    const attendanceByDate = useMemo(() => {
        const map = new Map()
        attendances.forEach((att) => {
            map.set(att.date, att)
        })
        return map
    }, [attendances])

    const handlePrevMonth = () => {
        const date = new Date(year, monthNum - 2, 1)
        onMonthChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
    }

    const handleNextMonth = () => {
        const date = new Date(year, monthNum, 1)
        onMonthChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
    }

    const getDateString = (day) => {
        return `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }

    const getStatusColor = (status) => {
        const colors = {
            present: "bg-green-100 text-green-800",
            absent: "bg-red-100 text-red-800",
            late: "bg-yellow-100 text-yellow-800",
            leave: "bg-blue-100 text-blue-800",
            work_from_home: "bg-purple-100 text-purple-800",
        }
        return colors[status] || ""
    }

    const isToday = (day) => {
        const today = new Date()
        return (
            today.getFullYear() === year &&
            today.getMonth() + 1 === monthNum &&
            today.getDate() === day
        )
    }

    const isWeekend = (day) => {
        const date = new Date(year, monthNum - 1, day)
        const dayOfWeek = date.getDay()
        return dayOfWeek === 0 || dayOfWeek === 6
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
                <button
                    onClick={handlePrevMonth}
                    className="rounded-lg p-2 hover:bg-gray-200 transition-colors"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900">
                    Tháng {monthNum}/{year}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="rounded-lg p-2 hover:bg-gray-200 transition-colors"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            <div className="p-4">
                {/* Day Headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day, index) => (
                        <div
                            key={day}
                            className={`text-center py-2 text-sm font-semibold rounded ${index === 0 || index === 6
                                    ? "text-red-600 bg-red-50"
                                    : "text-gray-700 bg-gray-100"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="min-h-[80px]" />
                        }

                        const dateString = getDateString(day)
                        const attendance = attendanceByDate.get(dateString)
                        const today = isToday(day)
                        const weekend = isWeekend(day)

                        return (
                            <button
                                key={day}
                                onClick={() => onDateClick?.(dateString, attendance)}
                                className={`group relative min-h-[80px] rounded-lg border p-2 text-sm transition-colors text-left flex flex-col items-start justify-start ${today
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                    } ${attendance ? getStatusColor(attendance.status) : "bg-white"}`}
                            >
                                <div
                                    className={`font-semibold text-base mb-1 w-full flex justify-between items-center ${today
                                            ? "text-blue-600"
                                            : weekend
                                                ? "text-red-500"
                                                : "text-gray-700"
                                        }`}
                                >
                                    {day}
                                    {today && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">HNAY</span>}
                                </div>

                                {attendance?.workHours !== undefined && attendance.workHours > 0 && (
                                    <div className="text-xs font-medium opacity-80 mt-auto">
                                        {attendance.workHours.toFixed(1)}h công
                                    </div>
                                )}

                                {attendance && (
                                    <div className="text-xs opacity-75 truncate max-w-full">
                                        {attendance.checkInTime?.substring(0, 5)} - {attendance.checkOutTime?.substring(0, 5) || "..."}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-gray-600">Có mặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-gray-600">Đi muộn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600">Nghỉ phép</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                        <span className="text-gray-600">WFH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-gray-600">Vắng mặt</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
