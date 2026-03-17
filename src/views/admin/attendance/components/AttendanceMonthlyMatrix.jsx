import React, { useMemo } from 'react'

export default function AttendanceMonthlyMatrix({
    attendances = [],
    users = [],
    month, // YYYY-MM format
    onCellClick,
}) {
    attendances = Array.isArray(attendances) ? attendances : []
    users = Array.isArray(users) ? users : []

    // Parse month YYYY-MM
    const [year, monthNum] = month.split('-').map(Number)
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    // Map attendances by userId and date for quick lookup
    const attendanceMap = useMemo(() => {
        const map = new Map()
        attendances.forEach((att) => {
            if (!att.date) return
            const dateStr = new Date(att.date).toISOString().split('T')[0]
            map.set(`${att.userId}-${dateStr}`, att)
        })
        return map
    }, [attendances])

    // Get status symbol and color
    const getStatusSymbol = (status, hasOT) => {
        if (hasOT)
            return {
                symbol: 'OT',
                bg: 'bg-purple-100',
                text: 'text-purple-700',
                dark: 'dark:bg-purple-900/30 dark:text-purple-400',
            }

        const statusMap = {
            present: {
                symbol: 'X',
                bg: 'bg-green-100',
                text: 'text-green-700',
                dark: 'dark:bg-green-900/30 dark:text-green-400',
            },
            late: {
                symbol: 'M',
                bg: 'bg-orange-100',
                text: 'text-orange-700',
                dark: 'dark:bg-orange-900/30 dark:text-orange-400',
            },
            leave: {
                symbol: 'P',
                bg: 'bg-yellow-100',
                text: 'text-yellow-700',
                dark: 'dark:bg-yellow-900/30 dark:text-yellow-400',
            },
            absent: {
                symbol: 'KP',
                bg: 'bg-red-100',
                text: 'text-red-700',
                dark: 'dark:bg-red-900/30 dark:text-red-400',
            },
            work_from_home: {
                symbol: 'WFH',
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                dark: 'dark:bg-blue-900/30 dark:text-blue-400',
            },
        }
        return statusMap[status] || statusMap.absent
    }

    const handleCellClick = (userId, date) => {
        const key = `${userId}-${date}`
        const attendance = attendanceMap.get(key)
        if (onCellClick) {
            onCellClick(userId, date, attendance)
        }
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 border-b border-gray-200 px-6 py-3 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        X
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Đủ công</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        M
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Đi muộn</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-yellow-100 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        P
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Nghỉ phép</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        KP
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Không phép</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        OT
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Tăng ca</span>
                </div>
            </div>

            {/* Table */}
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                        <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:bg-gray-900 dark:text-gray-400">
                            Nhân viên
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                            <th
                                key={day}
                                className="border-l border-gray-200 px-2 py-3 text-center text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-400"
                            >
                                <div className="text-xs">{day}</div>
                            </th>
                        ))}
                        <th className="border-l border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            Tổng công
                        </th>
                        <th className="border-l border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            OT
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        const userAttendances = attendances.filter((att) => att.userId === user.id)
                        const totalWorkHours = userAttendances.reduce((sum, att) => sum + (att.workHours || 0), 0)
                        const totalOT = userAttendances.reduce((sum, att) => sum + (att.overtimeHours || 0), 0)

                        return (
                            <tr
                                key={user.id}
                                className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                            >
                                {/* User Name */}
                                <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <p className="font-medium">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {user.employeeCode}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Daily cells */}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                    const attendance = attendanceMap.get(`${user.id}-${dateStr}`)
                                    const hasOT = attendance && attendance.overtimeHours && attendance.overtimeHours > 0
                                    const status = attendance?.status || 'absent'
                                    const statusInfo = getStatusSymbol(status, !!hasOT)

                                    return (
                                        <td
                                            key={day}
                                            className="border-l border-gray-200 px-2 py-3 text-center dark:border-gray-700"
                                        >
                                            <button
                                                onClick={() => handleCellClick(user.id, dateStr)}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-all hover:scale-110 ${attendance
                                                    ? `${statusInfo.bg} ${statusInfo.text} ${statusInfo.dark}`
                                                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                                                    }`}
                                                title={
                                                    attendance
                                                        ? `${attendance.checkInTime || '—'} → ${attendance.checkOutTime || '—'}`
                                                        : 'Không có dữ liệu'
                                                }
                                            >
                                                {attendance ? statusInfo.symbol : '-'}
                                            </button>
                                        </td>
                                    )
                                })}

                                {/* Total work hours */}
                                <td className="border-l border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
                                    {totalWorkHours.toFixed(1)}h
                                </td>

                                {/* Total OT */}
                                <td className="border-l border-gray-200 px-4 py-3 text-sm font-semibold text-purple-600 dark:border-gray-700 dark:text-purple-400">
                                    {totalOT > 0 ? `${totalOT.toFixed(1)}h` : '—'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {users.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Không có nhân viên nào
                </div>
            )}
        </div>
    )
}
