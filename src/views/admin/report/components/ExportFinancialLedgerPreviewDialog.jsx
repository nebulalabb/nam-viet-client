import React, { useRef, useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Loader2 } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import FinancialLedgerPrintTemplate from './FinancialLedgerPrintTemplate'
import api from '@/utils/axios'

const ExportFinancialLedgerPreviewDialog = ({
    isOpen,
    onClose,
    filters
}) => {
    const printRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [printData, setPrintData] = useState([])
    const [setting, setSetting] = useState(null)

    useEffect(() => {
        if (!isOpen) return

        async function fetchData() {
            try {
                setLoading(true)
                const params = {
                    fromDate: filters?.fromDate,
                    toDate: filters?.toDate,
                    page: 1,
                    pageSize: 9999,
                }
                if (filters?.customerId) params.customerId = filters.customerId
                if (filters?.supplierId) params.supplierId = filters.supplierId
                if (filters?.voucherType) params.voucherType = filters.voucherType

                const [cashRes, settingRes] = await Promise.all([
                    api.get('/reports/financial/cash-book', { params }),
                    api.get('/settings').catch(() => ({ data: { data: null } })),
                ])
                if (cashRes.data.success) {
                    setPrintData(cashRes.data.data?.transactions || [])
                }
                if (settingRes.data?.data) {
                    setSetting(settingRes.data.data)
                }
            } catch (err) {
                console.error("Export fetch error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [isOpen, filters])

    const handlePrintClick = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'So_Quy_Chi_Tiet',
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-[1200px] h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between shrink-0 mb-0">
                    <DialogTitle className="text-xl">XEM TRƯỚC BẢN IN — SỔ QUỸ CHI TIẾT</DialogTitle>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={(e) => { e.preventDefault(); onClose(); }} disabled={loading}>
                            Hủy
                        </Button>
                        <Button
                            type="button"
                            onClick={(e) => { e.preventDefault(); handlePrintClick(); }}
                            disabled={loading || printData.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            In Phiếu
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p>Đang tải dữ liệu in...</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-2xl printable-area overflow-auto">
                            <FinancialLedgerPrintTemplate
                                ref={printRef}
                                transactions={printData}
                                filters={filters}
                                setting={setting}
                            />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ExportFinancialLedgerPreviewDialog
