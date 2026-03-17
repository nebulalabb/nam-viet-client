import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format } from 'date-fns'
import { X, Loader2, Users, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import { getOvertimeSessionDetail, clearSessionDetail, deleteOvertimeSession } from '@/stores/OvertimeSlice'
import { Badge } from '@/components/ui/badge'
import EditSessionDialog from './EditSessionDialog'

export default function SessionDetailsDialog({ isOpen, onClose, sessionId }) {
    const dispatch = useDispatch()
    const { sessionDetail, loading } = useSelector((state) => state.overtime)
    const [isEditOpen, setIsEditOpen] = React.useState(false)

    useEffect(() => {
        if (isOpen && sessionId) {
            dispatch(getOvertimeSessionDetail(sessionId))
        }
    }, [dispatch, isOpen, sessionId])

    const handleClose = () => {
        dispatch(clearSessionDetail())
        onClose()
    }

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa phiên tăng ca này không? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.')) {
            try {
                await dispatch(deleteOvertimeSession(sessionId)).unwrap()
                handleClose()
            } catch (error) {
                console.error('Lỗi khi xóa phiên tăng ca:', error)
            }
        }
    }

    if (!isOpen) return null

    const getStatusLabel = (status) => {
        switch (status) {
            case 'open': return 'Đang mở'
            case 'closed': return 'Đã đóng'
            case 'cancelled': return 'Đã hủy'
            default: return status
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'success'
            case 'closed': return 'secondary'
            case 'cancelled': return 'destructive'
            default: return 'default'
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="flex w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800" style={{ maxHeight: '90vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Chi tiết phiên tăng ca
                        </h2>
                        {sessionDetail && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {sessionDetail.sessionName}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {sessionDetail?.status === 'open' && (
                            <button
                                onClick={() => setIsEditOpen(true)}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                            >
                                <Edit2 className="mr-1.5 h-4 w-4" />
                                Sửa phiếu
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-colors"
                            title="Xóa phiên tăng ca"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading && !sessionDetail ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : !sessionDetail ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                            <AlertCircle className="mb-2 h-10 w-10 text-gray-400" />
                            <p>Không thể tải thông tin phiên tăng ca.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* General Info */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Thông tin chung</h3>
                                    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Trạng thái</dt>
                                            <dd className="mt-1">
                                                <Badge variant={getStatusColor(sessionDetail.status)}>
                                                    {getStatusLabel(sessionDetail.status)}
                                                </Badge>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Người tạo</dt>
                                            <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                                                {sessionDetail.creator?.fullName || 'N/A'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời gian bắt đầu</dt>
                                            <dd className="mt-1 inline-flex items-center text-sm font-medium text-gray-900 dark:text-white">
                                                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                                                {sessionDetail.startTime ? format(new Date(sessionDetail.startTime), 'dd/MM/yyyy HH:mm') : '-'}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Thời gian kết thúc</dt>
                                            <dd className="mt-1 inline-flex items-center text-sm font-medium text-gray-900 dark:text-white">
                                                <Clock className="mr-1.5 h-4 w-4 text-gray-400" />
                                                {sessionDetail.endTime ? format(new Date(sessionDetail.endTime), 'dd/MM/yyyy HH:mm') : '-'}
                                            </dd>
                                        </div>
                                        <div className="sm:col-span-2">
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Ghi chú</dt>
                                            <dd className="mt-1 text-sm text-gray-900 dark:text-white pb-2 border-b dark:border-gray-700">{sessionDetail.notes || '-'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Entries list */}
                            <div>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <Users className="inline-block mr-2 h-4 w-4" />
                                        Danh sách nhân viên tham gia
                                    </h3>
                                    <Badge variant="outline">{sessionDetail.entries?.length || 0} nhân sự</Badge>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                                            <tr>
                                                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nhân viên</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Thời gian</th>
                                                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Số giờ thực tế</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                            {sessionDetail.entries && sessionDetail.entries.length > 0 ? (
                                                sessionDetail.entries.map((entry) => (
                                                    <tr key={entry.id} className="bg-white dark:bg-gray-900">
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium text-gray-900 dark:text-white">{entry.user?.fullName}</p>
                                                            <p className="text-xs text-gray-500">{entry.user?.employeeCode}</p>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                                                            <div className="flex flex-col gap-1">
                                                                <span>Bắt đầu: {entry.startTime ? format(new Date(entry.startTime), 'HH:mm dd/MM/yyyy') : '-'}</span>
                                                                <span>Kết thúc: {entry.endTime ? format(new Date(entry.endTime), 'HH:mm dd/MM/yyyy') : '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                            {Number(entry.actualHours).toFixed(2)}h
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                                                        Chưa có nhân viên nào trong phiên này.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            <EditSessionDialog 
                isOpen={isEditOpen} 
                onClose={() => setIsEditOpen(false)} 
                selectedSession={sessionDetail} 
            />
        </div>
    )
}
