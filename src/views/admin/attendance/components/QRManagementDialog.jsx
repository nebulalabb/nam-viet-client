import React, { useState, useEffect, useCallback } from 'react'
import { X, QrCode, Eye, Trash2, Ban, Loader2, Download, Printer, ChevronLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import api from '@/utils/axios'

const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('vi-VN')
}

const getShiftLabel = (shift) => {
    switch (shift) {
        case 'morning': return 'Ca Sáng'
        case 'afternoon': return 'Ca Chiều'
        case 'all_day': return 'Cả ngày'
        default: return shift
    }
}

const getTypeLabel = (type) => {
    switch (type) {
        case 'check_in': return 'Check-in'
        case 'check_out': return 'Check-out'
        default: return type
    }
}

export default function QRManagementDialog({ isOpen, onClose }) {
    const [qrList, setQrList] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [meta, setMeta] = useState(null)
    const [selectedQR, setSelectedQR] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)

    const fetchQRList = useCallback(async () => {
        try {
            setLoading(true)
            const response = await api.get('/attendance/qr', { params: { page, limit: 10 } })
            setQrList(response.data.data || [])
            setMeta(response.data.meta || null)
        } catch (error) {
            toast.error('Không thể tải danh sách QR')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        if (isOpen) {
            fetchQRList()
        }
    }, [isOpen, fetchQRList])

    const handleViewDetail = async (id) => {
        try {
            setDetailLoading(true)
            const response = await api.get(`/attendance/qr/${id}`)
            setSelectedQR(response.data.data)
        } catch (error) {
            toast.error('Không thể tải chi tiết QR')
        } finally {
            setDetailLoading(false)
        }
    }

    const handleDeactivate = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa QR code này?')) return
        try {
            await api.put(`/attendance/qr/${id}/deactivate`)
            toast.success('Đã vô hiệu hóa QR code')
            fetchQRList()
            if (selectedQR?.id === id) setSelectedQR(null)
        } catch (error) {
            toast.error(error?.response?.data?.error?.message || 'Không thể vô hiệu hóa QR')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa QR code này?')) return
        try {
            await api.delete(`/attendance/qr/${id}`)
            toast.success('Đã xóa QR code')
            fetchQRList()
            if (selectedQR?.id === id) setSelectedQR(null)
        } catch (error) {
            toast.error(error?.response?.data?.error?.message || 'Không thể xóa QR')
        }
    }

    const handleDownload = () => {
        if (!selectedQR?.qrCode) return
        const link = document.createElement('a')
        link.href = selectedQR.qrCode
        link.download = `QR-${selectedQR.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrint = () => {
        if (!selectedQR?.qrCode) return
        const printWindow = window.open('', '_blank')
        if (!printWindow) return
        printWindow.document.write(`
            <!DOCTYPE html><html><head><title>QR Code Chấm Công</title>
            <style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;font-family:Arial,sans-serif}
            .container{text-align:center;padding:40px}h1{font-size:24px;margin-bottom:10px;color:#1f2937}
            .info{font-size:16px;color:#6b7280;margin-bottom:30px}
            img{max-width:400px;border:2px solid #e5e7eb;border-radius:8px;padding:20px}</style></head>
            <body><div class="container"><h1>QR Code Chấm Công</h1>
            <div class="info">Hiệu lực: ${formatDate(selectedQR.startDate)} - ${formatDate(selectedQR.endDate)}<br/>
            ${getShiftLabel(selectedQR.shift)} • ${getTypeLabel(selectedQR.type)}</div>
            <img src="${selectedQR.qrCode}" alt="QR Code" /></div></body></html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => printWindow.print(), 250)
    }

    const handleClose = () => {
        setSelectedQR(null)
        setPage(1)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="animate-in fade-in zoom-in w-full max-w-3xl rounded-lg bg-white shadow-xl duration-200 dark:bg-gray-900" style={{ maxHeight: '85vh' }}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        {selectedQR && (
                            <button
                                onClick={() => setSelectedQR(null)}
                                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft className="h-5 w-5 text-gray-500" />
                            </button>
                        )}
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                            <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {selectedQR ? 'Chi tiết QR Code' : 'Quản lý QR Code'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {selectedQR ? `ID: ${selectedQR.id}` : `Tổng: ${meta?.total || 0} mã QR`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!selectedQR && (
                            <button
                                onClick={fetchQRList}
                                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Tải lại"
                            >
                                <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(85vh - 80px)' }}>
                    {selectedQR ? (
                        /* ===== Detail View ===== */
                        <div className="space-y-6">
                            {detailLoading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <>
                                    {/* QR Code Display */}
                                    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-600 dark:bg-gray-800/50">
                                        {selectedQR.qrCode ? (
                                            <img
                                                src={selectedQR.qrCode}
                                                alt="QR Code"
                                                className="h-56 w-56 rounded-lg border-4 border-white shadow-lg dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="flex h-56 w-56 items-center justify-center rounded-lg border-4 border-white bg-gray-200 dark:border-gray-700 dark:bg-gray-700">
                                                <QrCode className="h-16 w-16 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="mt-4 text-center">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Hiệu lực từ{' '}
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatDate(selectedQR.startDate)}
                                                </span>{' '}
                                                đến{' '}
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatDate(selectedQR.endDate)}
                                                </span>
                                            </p>
                                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                {getShiftLabel(selectedQR.shift)} • {getTypeLabel(selectedQR.type)}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                Số lần sử dụng: {selectedQR.usageCount || 0}
                                            </p>
                                            <div className="mt-2">
                                                <Badge variant={selectedQR.isActive ? 'success' : 'destructive'}>
                                                    {selectedQR.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {selectedQR.qrCode && (
                                            <>
                                                <Button type="button" variant="outline" onClick={handleDownload}>
                                                    <Download className="h-4 w-4" />
                                                    Tải xuống
                                                </Button>
                                                <Button type="button" variant="outline" onClick={handlePrint}>
                                                    <Printer className="h-4 w-4" />
                                                    In QR Code
                                                </Button>
                                            </>
                                        )}
                                        {selectedQR.isActive && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                                onClick={() => handleDeactivate(selectedQR.id)}
                                            >
                                                <Ban className="h-4 w-4" />
                                                Vô hiệu hóa
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="text-red-600 border-red-300 hover:bg-red-50"
                                            onClick={() => handleDelete(selectedQR.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Xóa
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        /* ===== List View ===== */
                        <div className="space-y-4">
                            {loading ? (
                                <div className="flex h-40 items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                </div>
                            ) : qrList.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                                    <QrCode className="mb-3 h-12 w-12 opacity-40" />
                                    <p className="text-sm">Chưa có mã QR nào được tạo</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800/50">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Hiệu lực</th>
                                                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Ca / Loại</th>
                                                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Trạng thái</th>
                                                    <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Sử dụng</th>
                                                    <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Hành động</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {qrList.map((qr) => (
                                                    <tr key={qr.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50">
                                                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-gray-500">Từ: {formatDate(qr.startDate)}</span>
                                                                <span className="text-xs text-gray-500">Đến: {formatDate(qr.endDate)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                                            <div className="flex flex-col">
                                                                <span className="text-xs">{getShiftLabel(qr.shift)}</span>
                                                                <span className="text-xs text-gray-500">{getTypeLabel(qr.type)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant={qr.isActive ? 'success' : 'destructive'} className="text-xs">
                                                                {qr.isActive ? 'Hoạt động' : 'Vô hiệu'}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">
                                                            {qr.usageCount || 0} lần
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleViewDetail(qr.id)}
                                                                    className="rounded-md p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                                                    title="Chi tiết"
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </button>
                                                                {qr.isActive && (
                                                                    <button
                                                                        onClick={() => handleDeactivate(qr.id)}
                                                                        className="rounded-md p-1.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                                                        title="Vô hiệu hóa"
                                                                    >
                                                                        <Ban className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(qr.id)}
                                                                    className="rounded-md p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                                    title="Xóa"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {meta && meta.totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 pt-2">
                                            <button
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page <= 1}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
                                            >
                                                Trước
                                            </button>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Trang {page} / {meta.totalPages}
                                            </span>
                                            <button
                                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                                disabled={page >= meta.totalPages}
                                                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-400"
                                            >
                                                Sau
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
