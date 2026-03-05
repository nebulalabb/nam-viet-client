import React, { useMemo } from "react"
import { Users, UserCheck, UserX, Clock } from "lucide-react"

export default function DailyStatsCard({
    attendances = [],
    users = [],
    selectedDate,
}) {
    const stats = useMemo(() => {
        const today = selectedDate || new Date().toISOString().split("T")[0]
        const todayAttendances = attendances.filter((att) => att.date === today)

        return {
            totalUsers: users.length,
            presentCount: todayAttendances.filter((att) => att.status === "present").length,
            absentCount: todayAttendances.filter((att) => att.status === "absent").length,
            lateCount: todayAttendances.filter((att) => att.status === "late").length,
            leaveCount: todayAttendances.filter((att) => att.status === "leave").length,
        }
    }, [attendances, users, selectedDate])

    const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : new Date().toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                    Thống kê hôm nay
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                    {formattedDate}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {/* Total Users */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">
                            Tổng nhân sự
                        </p>
                        <p className="mt-0.5 text-xl font-bold text-gray-900">
                            {stats.totalUsers}
                        </p>
                    </div>
                </div>

                {/* Present */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                        <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">
                            Hiện diện
                        </p>
                        <p className="mt-0.5 text-xl font-bold text-green-600">
                            {stats.presentCount}
                        </p>
                    </div>
                </div>

                {/* Absent + Leave */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <UserX className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">
                            Vắng/Nghỉ
                        </p>
                        <p className="mt-0.5 text-xl font-bold text-red-600">
                            {stats.absentCount + stats.leaveCount}
                        </p>
                    </div>
                </div>

                {/* Late */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500">
                            Đi muộn
                        </p>
                        <p className="mt-0.5 text-xl font-bold text-yellow-600">
                            {stats.lateCount}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
