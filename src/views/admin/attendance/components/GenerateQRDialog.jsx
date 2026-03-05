import React, { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { QrCode, Download, Printer, Calendar, Timer, ArrowRightLeft } from "lucide-react"
import { generateQR } from "@/stores/AttendanceSlice"

export default function GenerateQRDialog({ isOpen, onClose }) {
    const dispatch = useDispatch()
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [shift, setShift] = useState("all_day")
    const [type, setType] = useState("check_in")
    const [qrData, setQrData] = useState(null)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        if (isOpen && !startDate) {
            const today = new Date()
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

            setStartDate(today.toISOString().split("T")[0])
            setEndDate(endOfMonth.toISOString().split("T")[0])
        }
        if (!isOpen) {
            setQrData(null)
        }
    }, [isOpen])

    const handleGenerate = async () => {
        if (!startDate || !endDate) return

        setIsGenerating(true)
        try {
            const response = await dispatch(generateQR({
                startDate,
                endDate,
                shift,
                type,
            })).unwrap()
            setQrData(response)
        } catch (error) {
            console.error("Failed to generate QR:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleDownload = () => {
        if (!qrData?.qrCode) return

        const link = document.createElement("a")
        link.href = qrData.qrCode
        link.download = `QR-Attendance-${startDate}-to-${endDate}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handlePrint = () => {
        if (!qrData?.qrCode) return

        const printWindow = window.open("", "_blank")
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
              Hiệu lực: ${new Date(startDate).toLocaleDateString("vi-VN")} - ${new Date(endDate).toLocaleDateString("vi-VN")}
            </div>
            <img src="${qrData.qrCode}" alt="QR Code" />
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
        setQrData(null)
        setStartDate("")
        setEndDate("")
        setShift("all_day")
        setType("check_in")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                            <QrCode className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">
                                Tạo QR Code Chấm Công
                            </DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Tạo mã QR để nhân viên quét và chấm công tự động
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {!qrData ? (
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Từ ngày
                                </Label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Đến ngày
                                </Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Timer className="h-4 w-4" /> Ca làm việc
                                </Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={shift}
                                    onChange={(e) => setShift(e.target.value)}
                                >
                                    <option value="all_day">Cả ngày</option>
                                    <option value="morning">Ca Sáng</option>
                                    <option value="afternoon">Ca Chiều</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <ArrowRightLeft className="h-4 w-4" /> Loại chấm công
                                </Label>
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <option value="check_in">Chấm công Vào (Check-in)</option>
                                    <option value="check_out">Chấm công Ra (Check-out)</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button onClick={handleGenerate} disabled={!startDate || !endDate || isGenerating} className="bg-blue-600 hover:bg-blue-700 text-white">
                                <QrCode className="h-4 w-4 mr-2" />
                                {isGenerating ? "Đang tạo..." : "Tạo QR Code"}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
                            <img
                                src={qrData.qrCode}
                                alt="QR Code"
                                className="h-64 w-64 rounded-lg border-4 border-white shadow-md bg-white p-2"
                            />
                            <div className="mt-4 text-center">
                                <p className="text-sm font-medium text-gray-700">
                                    Hiệu lực từ{" "}
                                    <span className="font-semibold text-blue-600">
                                        {new Date(startDate).toLocaleDateString("vi-VN")}
                                    </span>{" "}
                                    đến{" "}
                                    <span className="font-semibold text-blue-600">
                                        {new Date(endDate).toLocaleDateString("vi-VN")}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    {qrData.shift === "morning" ? "Ca Sáng" : qrData.shift === "afternoon" ? "Ca Chiều" : "Cả ngày"}
                                    {" • "}
                                    {qrData.type === "check_out" ? "Check-out" : "Check-in"}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3">
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" /> Tải xuống
                            </Button>
                            <Button variant="outline" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" /> In QR Code
                            </Button>
                            <Button onClick={() => setQrData(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Tạo QR mới
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
