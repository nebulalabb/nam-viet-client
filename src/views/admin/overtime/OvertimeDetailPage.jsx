import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { format } from "date-fns"
import { Layout, LayoutBody } from "@/components/custom/Layout"
import { getOvertimeSession, closeSession, removeEmployeeFromSession, clearCurrentSession } from "@/stores/OvertimeSlice"
import { Button } from "@/components/custom/Button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, Lock, Trash2, Users, Loader2 } from "lucide-react"

import AddEmployeeDialog from "./components/AddEmployeeDialog"

export default function OvertimeDetailPage() {
    const { id } = useParams()
    const dispatch = useDispatch()

    const sessionId = Number(id)

    const session = useSelector(state => state.overtime.currentSession)
    const loading = useSelector(state => state.overtime.loading)

    const [closing, setClosing] = useState(false)

    // Fetch session
    useEffect(() => {
        dispatch(getOvertimeSession(sessionId))
        return () => {
            dispatch(clearCurrentSession())
        }
    }, [dispatch, sessionId])

    useEffect(() => {
        if (session) {
            document.title = `Tăng ca: ${session.sessionName}`
        } else {
            document.title = "Chi tiết tăng ca"
        }
    }, [session])

    const handleRemoveEmployee = async (userId) => {
        if (!window.confirm('Bạn có chắc muốn xóa nhân viên này khỏi phiên?')) return
        dispatch(removeEmployeeFromSession({ sessionId, userId }))
    }

    const handleCloseSession = async () => {
        if (!window.confirm('Bạn có chắc muốn đóng phiên này? Giờ công sẽ được tính toán.')) return

        setClosing(true)
        try {
            await dispatch(closeSession({ sessionId, endTime: new Date().toISOString() })).unwrap()
        } finally {
            setClosing(false)
        }
    }

    if (loading && !session) {
        return (
            <Layout>
                <LayoutBody className="flex items-center justify-center" fixedHeight>
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                        <p className="text-gray-500">Đang tải thông tin phiên tăng ca...</p>
                    </div>
                </LayoutBody>
            </Layout>
        )
    }

    if (!session) {
        return (
            <Layout>
                <LayoutBody>
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2">
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-900">Không tìm thấy dữ liệu</h3>
                            <p className="text-sm">Phiên tăng ca không tồn tại hoặc đã bị xóa.</p>
                        </div>
                    </div>
                    <Button variant="outline" className="mt-4" asChild>
                        <Link to="/overtime">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Về danh sách
                        </Link>
                    </Button>
                </LayoutBody>
            </Layout>
        )
    }

    const existingUserIds = session.entries?.map((e) => e.userId) || []

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Đang mở'
            case 'closed': return 'Đã đóng'
            case 'cancelled': return 'Đã hủy'
            default: return status
        }
    }

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'default' // Usually primary/blue or green
            case 'closed': return 'secondary'
            case 'cancelled': return 'destructive'
            default: return 'outline'
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col space-y-6" fixedHeight>

                {/* Header Section */}
                <div className="flex flex-col gap-4">
                    <div>
                        <Link
                            to="/overtime"
                            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                        >
                            <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </div>
                            Quay lại danh sách
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                {session.sessionName}
                            </h1>
                            <div className="mt-2 flex items-center text-sm text-gray-500 gap-4">
                                <div className="flex items-center">
                                    <span className="font-medium mr-1 text-gray-700">Tạo bởi:</span> {session.creator?.fullName || 'Hệ thống'}
                                </div>
                                <div className="h-1 w-1 rounded-full bg-gray-300"></div>
                                <div>
                                    ID: #{session.id}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <Badge variant={getStatusBadgeVariant(session.status)} className="px-3 py-1 text-sm font-medium">
                                {getStatusLabel(session.status)}
                            </Badge>

                            <div className="flex gap-4">
                                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                                    {format(new Date(session.startTime), 'dd/MM/yyyy')}
                                </div>
                                <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                                    {format(new Date(session.startTime), 'HH:mm')}
                                    {session.endTime && ` - ${format(new Date(session.endTime), 'HH:mm')}`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid gap-6 flex-1">

                    {/* Notes */}
                    {session.notes && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
                            <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wider mb-2">Ghi chú</h3>
                            <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">
                                {session.notes}
                            </p>
                        </div>
                    )}

                    {/* Employee List */}
                    <div className="flex-1 flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    Danh sách nhân viên ({session.entries?.length || 0})
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Nhân viên tham gia phiên tăng ca này.
                                </p>
                            </div>

                            <div className="flex gap-2">
                                {session.status === 'open' && (
                                    <>
                                        <AddEmployeeDialog
                                            sessionId={sessionId}
                                            existingUserIds={existingUserIds}
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={handleCloseSession}
                                            disabled={closing}
                                            className="gap-2 shadow-sm"
                                        >
                                            {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                            Đóng phiên (Tính lương)
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-white sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Mã NV</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Họ tên</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Chức vụ</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Giờ bắt đầu</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Giờ kết thúc</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">Số giờ (h)</th>
                                        <th className="px-6 py-3 w-16 bg-gray-50/50"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {session.entries?.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{entry.user.employeeCode}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {entry.user.fullName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {entry.user.role?.roleName || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {entry.startTime
                                                    ? format(new Date(entry.startTime), 'HH:mm')
                                                    : <span className="text-gray-400 italic">{format(new Date(session.startTime), 'HH:mm')} (Phiên)</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {entry.endTime
                                                    ? format(new Date(entry.endTime), 'HH:mm')
                                                    : session.endTime
                                                        ? <span className="text-gray-400 italic">{format(new Date(session.endTime), 'HH:mm')} (Phiên)</span>
                                                        : <span className="text-yellow-600">Đang chạy</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded bg-blue-50 text-blue-700 font-bold text-center">
                                                    {Number(entry.actualHours || 0).toFixed(1)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {session.status === 'open' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleRemoveEmployee(entry.userId)}
                                                        title="Xóa nhân viên"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!session.entries || session.entries.length === 0) && (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="rounded-full bg-gray-100 p-3 mb-3">
                                                        <Users className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                    <p className="text-base font-medium text-gray-900">Chưa có nhân viên nào</p>
                                                    <p className="text-sm mt-1">Bấm "Thêm nhân viên" để chọn người tham gia phiên tăng ca này.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </LayoutBody>
        </Layout>
    )
}
