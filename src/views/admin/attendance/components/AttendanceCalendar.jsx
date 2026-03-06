import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function AttendanceCalendar({
    attendances = [],
    month, // YYYY-MM
    onMonthChange,
    onDateClick,
}) {
    const [year, monthNum] = month.split('-').map(Number)

    // Get days in month
    const daysInMonth = new Date(year, monthNum, 0).getDate()
    const firstDayOfMonth = new Date(year, monthNum - 1, 1).getDay()

    // Create calendar grid
    const calendarDays = []

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    // Map attendance by date
    const attendanceByDate = useMemo(() => {
        const map = new Map()
        attendances.forEach((att) => {
            map.set(att.date, att)
        })
        return map
    }, [attendances])

    const handlePrevMonth = () => {
        const date = new Date(year, monthNum - 2, 1)
        onMonthChange(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        )
    }

    const handleNextMonth = () => {
        const date = new Date(year, monthNum, 1)
        onMonthChange(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        )
    }

    const getDateString = (day) => {
        return `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }

    const getStatusColor = (status) => {
        const colors = {
            present: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            absent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            work_from_home: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        }
        return colors[status] || ''
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
        return dayOfWeek === 0 || dayOfWeek === 6 // Sunday or Saturday
    }

    return (
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                <button
                    onClick={handlePrevMonth}
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tháng {monthNum}/{year}
                </h3>

                <button
                    onClick={handleNextMonth}
                    className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {/* Day Headers */}
                <div className="mb-2 grid grid-cols-7 gap-1">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, index) => (
                        <div
                            key={day}
                            className={`text-center text-sm font-medium ${index === 0 || index === 6
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="aspect-square" />
                        }

                        const dateString = getDateString(day)
                        const attendance = attendanceByDate.get(dateString)
                        const today = isToday(day)
                        const weekend = isWeekend(day)

                        return (
                            <button
                                key={day}
                                onClick={() => onDateClick && onDateClick(dateString, attendance)}
                                className={`group relative aspect-square rounded-lg border p-2 text-sm transition-colors ${today
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                                    } ${attendance ? getStatusColor(attendance.status) : ''}`}
                            >
                                {/* Day Number */}
                                <div
                                    className={`text-center font-medium ${today
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : weekend
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {day}
                                </div>

                                {/* Work Hours Indicator */}
                                {attendance?.workHours !== undefined && attendance.workHours > 0 && (
                                    <div className="mt-1 text-center text-xs font-medium">
                                        {attendance.workHours.toFixed(1)}h
                                    </div>
                                )}

                                {/* Status Dot */}
                                {attendance && (
                                    <div className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-current" />
                                )}

                                {/* Hover Tooltip */}
                                {attendance && (
                                    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
                                        <div className="text-gray-900 dark:text-white">
                                            {attendance.checkInTime?.substring(0, 5)} -{' '}
                                            {attendance.checkOutTime?.substring(0, 5) || '?'}
                                        </div>
                                        {attendance.workHours && (
                                            <div className="text-gray-600 dark:text-gray-400">
                                                {attendance.workHours.toFixed(1)} giờ
                                            </div>
                                        )}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="border-t border-gray-200 p-4 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Có mặt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500" />
                        <span className="text-gray-600 dark:text-gray-400">Đi muộn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-gray-600 dark:text-gray-400">Nghỉ phép</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-purple-500" />
                        <span className="text-gray-600 dark:text-gray-400">WFH</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <span className="text-gray-600 dark:text-gray-400">Vắng mặt</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
