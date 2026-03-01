import React, { useState, useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'

export function ConfirmSyncDialog({ isOpen, onClose, onConfirm, year }) {
    const [countdown, setCountdown] = useState(10)

    useEffect(() => {
        let timer
        if (isOpen) {
            setCountdown(10)
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isOpen])

    const handleConfirm = () => {
        if (countdown === 0) {
            onConfirm()
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Cảnh báo bảo trì hệ thống
                    </DialogTitle>
                    <DialogDescription className="pt-2 text-gray-700">
                        Bạn sắp thực hiện tính lại công nợ toàn bộ hệ thống cho năm <strong>{year}</strong>.
                        Quá trình này sẽ tốn rất nhiều tài nguyên, có thể gây chậm hệ thống trong ít phút và không thể hoàn tác.
                        <br /><br />
                        Vui lòng chờ để nút xác nhận được mở khóa.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Hủy bỏ
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={countdown > 0}
                        className="w-[140px]"
                    >
                        {countdown > 0 ? `Xác nhận (${countdown}s)` : 'Xác nhận'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
