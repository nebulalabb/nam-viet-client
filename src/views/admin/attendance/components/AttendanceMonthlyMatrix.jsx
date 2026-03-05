import React, { useMemo } from "react"

export default function AttendanceMonthlyMatrix({
    attendances = [],
    users = [],
    month,
    onCellClick,
}) {
    const [year, monthNum] = month.split("-").map(Number)
    const daysInMonth = new Date(year, monthNum, 0).getDate()

    const attendanceMap = useMemo(() => {
        const map = new Map()
        attendances.forEach((att) => {
            map.set(`${att.userId}-${att.date}`, att)
        })
        return map
    }, [attendances])

    const getStatusSymbol = (status, hasOT) => {
        if (hasOT) return { symbol: "OT", bg: "bg-purple-100", text: "text-purple-700" }

        const statusMap = {
            present: { symbol: "X", bg: "bg-green-100", text: "text-green-700" },
            late: { symbol: "M", bg: "bg-orange-100", text: "text-orange-700" },
            leave: { symbol: "P", bg: "bg-yellow-100", text: "text-yellow-700" },
            absent: { symbol: "KP", bg: "bg-red-100", text: "text-red-700" },
            work_from_home: { symbol: "WFH", bg: "bg-blue-100", text: "text-blue-700" },
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
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-green-100 text-xs font-bold text-green-700">X</span>
                    <span className="text-xs text-gray-600">Đủ công</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-orange-100 text-xs font-bold text-orange-700">M</span>
                    <span className="text-xs text-gray-600">Đi muộn</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-yellow-100 text-xs font-bold text-yellow-700">P</span>
                    <span className="text-xs text-gray-600">Nghỉ phép</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-red-100 text-xs font-bold text-red-700">KP</span>
                    <span className="text-xs text-gray-600">Không phép</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-100 text-xs font-bold text-purple-700">OT</span>
                    <span className="text-xs text-gray-600">Tăng ca</span>
                </div>
            </div>

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-600 truncate min-w-[150px]">
                            Nhân viên
                        </th>
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                            <th key={day} className="border-l border-gray-200 px-2 py-3 text-center text-xs font-semibold text-gray-600">
                                <div className="text-xs">{day}</div>
                            </th>
                        ))}
                        <th className="border-l border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                            Tổng công
                        </th>
                        <th className="border-l border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600">
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
                            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb]">
                                    <div className="flex items-center gap-2">
                                        <div className="truncate w-full max-w-[150px]">
                                            <p className="font-medium truncate">{user.fullName}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.employeeCode}</p>
                                        </div>
                                    </div>
                                </td>

                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                    const dateStr = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                                    const attendance = attendanceMap.get(`${user.id}-${dateStr}`)
                                    const hasOT = attendance && attendance.overtimeHours && attendance.overtimeHours > 0
                                    const status = attendance?.status || "absent"
                                    const statusInfo = getStatusSymbol(status, !!hasOT)

                                    return (
                                        <td key={day} className="border-l border-gray-200 px-1 py-2 text-center">
                                            <button
                                                onClick={() => handleCellClick(user.id, dateStr)}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition-all hover:scale-110 ${attendance
                                                        ? `${statusInfo.bg} ${statusInfo.text}`
                                                        : "bg-gray-100 text-gray-400"
                                                    }`}
                                                title={attendance ? `${attendance.checkInTime || "—"} → ${attendance.checkOutTime || "—"}` : "Không có dữ liệu"}
                                            >
                                                {attendance ? statusInfo.symbol : "-"}
                                            </button>
                                        </td>
                                    )
                                })}

                                <td className="border-l border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                                    {totalWorkHours.toFixed(1)}h
                                </td>
                                <td className="border-l border-gray-200 px-4 py-3 text-sm font-semibold text-purple-600 whitespace-nowrap">
                                    {totalOT > 0 ? `${totalOT.toFixed(1)}h` : "—"}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {users.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu nhân viên
                </div>
            )}
        </div>
    )
}
