import React, { useState, useEffect } from 'react'
import { X, QrCode, Download, Printer, Calendar, Timer, ArrowRightLeft } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import { toast } from 'sonner'
import api from '@/utils/axios'

// We use basic basic formatting since we are not strictly adhering to date-fns vi locale unless imported
const formatDate = (dateString) => {
    if (!dateString) return ''
    const parts = dateString.split('-')
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateString
}

export default function GenerateQRDialog({ isOpen, onClose }) {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [shift, setShift] = useState('all_day')
    const [type, setType] = useState('check_in')
    const [generatedQR, setGeneratedQR] = useState(null)
    const [loading, setLoading] = useState(false)

    // Set default dates (today to end of month)
    useEffect(() => {
        if (isOpen && !startDate) {
            const today = new Date()
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

            const yyyy = today.getFullYear()
            const mm = String(today.getMonth() + 1).padStart(2, '0')
            const dd = String(today.getDate()).padStart(2, '0')

            const endMm = String(endOfMonth.getMonth() + 1).padStart(2, '0')
            const endDd = String(endOfMonth.getDate()).padStart(2, '0')

            setStartDate(`${yyyy}-${mm}-${dd}`)
            setEndDate(`${endOfMonth.getFullYear()}-${endMm}-${endDd}`)
        }
    }, [isOpen, startDate])

    const handleGenerate = async () => {
        if (!startDate || !endDate) return

        try {
            setLoading(true)
            const response = await api.post('/attendance/qr/generate', {
                startDate,
                endDate,
                shift,
                type,
            })
            setGeneratedQR(response.data.data)
            toast.success('Tạo QR code thành công')
        } catch (error) {
            console.error('Failed to generate QR:', error)
            toast.error(error?.response?.data?.message || 'Không thể tạo QR code')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = () => {
        if (!generatedQR?.qrCode) return

        const link = document.createElement('a')
        link.href = generatedQR.qrCode
        link.download = `QR-Attendance-${startDate}-to-${endDate}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrint = () => {
        if (!generatedQR?.qrCode) return

        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code Chấm Công</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              color: #1f2937;
            }
            .date-range {
              font-size: 16px;
              color: #6b7280;
              margin-bottom: 30px;
            }
            img {
              max-width: 400px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
            }
            .instructions {
              margin-top: 30px;
              font-size: 14px;
              color: #6b7280;
              max-width: 500px;
            }
            @media print {
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>QR Code Chấm Công</h1>
            <div class="date-range">
              Hiệu lực: ${formatDate(startDate)} - ${formatDate(endDate)}
            </div>
            <img src="${generatedQR.qrCode}" alt="QR Code" />
            <div class="instructions">
              <p><strong>Hướng dẫn sử dụng:</strong></p>
              <p>1. Quét mã QR này bằng camera điện thoại</p>
              <p>2. Hệ thống sẽ tự động chấm công cho bạn</p>
              <p>3. Mã QR chỉ hiệu lực trong khoảng thời gian đã chỉ định</p>
            </div>
          </div>
        </body>
      </html>
    `)

        printWindow.document.close()
        printWindow.focus()

        setTimeout(() => {
            printWindow.print()
        }, 250)
    }

    const handleClose = () => {
        setGeneratedQR(null)
        setStartDate('')
        setEndDate('')
        setShift('all_day')
        setType('check_in')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
            <div className="animate-in fade-in zoom-in w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl duration-200 dark:bg-gray-900">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
                            <QrCode className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Tạo QR Code Chấm Công
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tạo mã QR để nhân viên quét và chấm công tự động
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        type="button"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {!generatedQR ? (
                    // Form to generate QR
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Start Date */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4" />
                                    Từ ngày
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="h-4 w-4" />
                                    Đến ngày
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            {/* Shift Selection */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Timer className="h-4 w-4" />
                                    Ca làm việc
                                </label>
                                <select
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="all_day">Cả ngày</option>
                                    <option value="morning">Ca Sáng (06:00 - 08:30)</option>
                                    <option value="afternoon">Ca Chiều (13:30 - 14:30)</option>
                                </select>
                            </div>

                            {/* Type Selection */}
                            <div>
                                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <ArrowRightLeft className="h-4 w-4" />
                                    Loại chấm công
                                </label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="check_in">Chấm công Vào (Check-in)</option>
                                    <option value="check_out">Chấm công Ra (Check-out)</option>
                                </select>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Lưu ý:</strong> QR code sẽ chỉ hiệu lực trong khoảng thời gian và ca
                                làm việc đã chọn.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleGenerate}
                                loading={loading}
                                disabled={!startDate || !endDate || loading}
                            >
                                <QrCode className="h-4 w-4" />
                                Tạo QR Code
                            </Button>
                        </div>
                    </div>
                ) : (
                    // Display generated QR
                    <div className="space-y-6">
                        {/* QR Code Display */}
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-600 dark:bg-gray-800/50">
                            <img
                                src={generatedQR.qrCode}
                                alt="QR Code"
                                className="h-64 w-64 rounded-lg border-4 border-white shadow-lg dark:border-gray-700"
                            />
                            <div className="mt-4 text-center">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Hiệu lực từ{' '}
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {formatDate(startDate)}
                                    </span>{' '}
                                    đến{' '}
                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                        {formatDate(endDate)}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {generatedQR.shift === 'morning'
                                        ? 'Ca Sáng (06:00 - 08:30)'
                                        : generatedQR.shift === 'afternoon'
                                            ? 'Ca Chiều (13:30 - 14:30)'
                                            : 'Cả ngày'}
                                    {' • '}
                                    {generatedQR.type === 'check_out' ? 'Check-out' : 'Check-in'}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Số lần sử dụng: {generatedQR.usageCount || 0}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button type="button" variant="outline" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                                Tải xuống
                            </Button>
                            <Button type="button" variant="outline" onClick={handlePrint}>
                                <Printer className="h-4 w-4" />
                                In QR Code
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={() => setGeneratedQR(null)}
                            >
                                Tạo QR mới
                            </Button>
                        </div>

                        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
                            <p className="text-sm text-green-800 dark:text-green-300">
                                ✅ QR code đã được tạo thành công! Bạn có thể tải xuống hoặc in ra để nhân
                                viên quét.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
