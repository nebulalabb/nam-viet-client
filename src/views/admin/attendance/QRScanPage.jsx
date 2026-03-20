import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, QrCode } from 'lucide-react'
import api from '@/utils/axios'

let isScanning = false;

const QRScanPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const qrData = searchParams.get('qrData')

        if (!qrData || isScanning) return
        isScanning = true

        if (!qrData) {
            toast.error('Dữ liệu mã QR không hợp lệ.')
            navigate('/dashboard')
            isScanning = false
            return
        }

        const hasToken = !!localStorage.getItem('accessToken')

        if (!hasToken) {
            localStorage.setItem('pending_qr_scan', qrData)
            toast.info('Vui lòng đăng nhập để thực hiện chấm công.')
            navigate('/?redirect=/attendance/scan')
            isScanning = false
            return
        }

        const handleScan = async () => {
            try {
                const response = await api.post('/attendance/qr/scan', {
                    qrData,
                    location: 'Scan from mobile browser',
                })
                
                toast.success(response.data.message || 'Chấm công thành công')
            } catch (error) {
                console.error('Scan error:', error)
                toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi chấm công')
            } finally {
                isScanning = false
                localStorage.removeItem('pending_qr_scan')
                setTimeout(() => {
                    navigate('/attendance', { replace: true })
                }, 1500)
            }
        }

        handleScan()
    }, [navigate, searchParams])

    return (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-100px)] p-4">
            <Card className="flex max-w-sm flex-col items-center p-8 space-y-4 text-center">
                <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/20 animate-pulse">
                    <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Đang xử lý chấm công...
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Vui lòng đợi trong giây lát, hệ thống đang ghi nhận thông tin chấm công của bạn.
                </p>
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mt-4" />
            </Card>
        </div>
    )
}

export default QRScanPage
