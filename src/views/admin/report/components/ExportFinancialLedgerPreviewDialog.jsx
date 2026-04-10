import React, { useRef, useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, Loader2, CalendarDays } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import FinancialLedgerPrintTemplate from './FinancialLedgerPrintTemplate'
import api from '@/utils/axios'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const THIS_YEAR  = new Date().getFullYear()
const THIS_MONTH = new Date().getMonth() + 1 // 1-12

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
const YEARS  = Array.from({ length: 5 },  (_, i) => THIS_YEAR - i)

// Trả về { fromDate, toDate } dạng 'YYYY-MM-DD' cho tháng/năm
function monthRange(month, year) {
    const m = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    return {
        fromDate: `${year}-${m}-01`,
        toDate:   `${year}-${m}-${lastDay}`,
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
const ExportFinancialLedgerPreviewDialog = ({ isOpen, onClose, filters }) => {
    const printRef = useRef(null)
    const [loading, setLoading]       = useState(true)
    const [printData, setPrintData]   = useState([])
    const [openingBal, setOpeningBal] = useState(0)
    const [setting, setSetting]       = useState(null)

    // Bộ lọc tháng bên trong dialog (mặc định = tháng hiện tại)
    const [selMonth, setSelMonth] = useState(THIS_MONTH)
    const [selYear,  setSelYear]  = useState(THIS_YEAR)

    // Khoảng ngày được tính từ tháng/năm đã chọn
    const [printFilters, setPrintFilters] = useState(() => monthRange(THIS_MONTH, THIS_YEAR))

    // Khi dialog mở, reset về tháng hiện tại và lấy dữ liệu
    useEffect(() => {
        if (!isOpen) return
        const range = monthRange(THIS_MONTH, THIS_YEAR)
        setSelMonth(THIS_MONTH)
        setSelYear(THIS_YEAR)
        setPrintFilters(range)
    }, [isOpen])

    // Fetch khi printFilters thay đổi
    useEffect(() => {
        if (!isOpen || !printFilters.fromDate) return

        let cancelled = false
        async function fetchData() {
            try {
                setLoading(true)
                const params = {
                    fromDate: printFilters.fromDate,
                    toDate:   printFilters.toDate,
                    page:     1,
                    pageSize: 9999,
                }
                // kế thừa filter đối tượng từ trang chính nếu có
                if (filters?.customerId) params.customerId = filters.customerId
                if (filters?.supplierId) params.supplierId = filters.supplierId
                if (filters?.voucherType) params.voucherType = filters.voucherType

                const [cashRes, settingRes] = await Promise.all([
                    api.get('/reports/financial/cash-book', { params }),
                    api.get('/settings').catch(() => ({ data: { data: null } })),
                ])
                if (cancelled) return
                if (cashRes.data.success) {
                    const data = cashRes.data.data
                    // Đảo ngược transactions (API trả về newest-first) → in cần oldest-first
                    const txs = [...(data?.transactions || [])].reverse()
                    setPrintData(txs)
                    setOpeningBal(data?.openingBalance ?? 0)
                }
                if (settingRes.data?.data) setSetting(settingRes.data.data)
            } catch (err) {
                console.error('Export fetch error:', err)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        fetchData()
        return () => { cancelled = true }
    }, [isOpen, printFilters, filters?.customerId, filters?.supplierId, filters?.voucherType])

    const handleApplyFilter = () => {
        setPrintFilters(monthRange(selMonth, selYear))
    }

    const handlePrintClick = useReactToPrint({
        contentRef: printRef,
        documentTitle: `SoQuy_T${selMonth}_${selYear}`,
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-[1250px] h-[94vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-3 border-b flex flex-row items-center justify-between shrink-0">
                    <DialogTitle className="text-xl">
                        In Sổ Quỹ Chi Tiết
                    </DialogTitle>

                    {/* ── Bộ lọc tháng ── */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5">
                            <CalendarDays className="h-4 w-4 text-indigo-500" />
                            <select
                                value={selMonth}
                                onChange={e => setSelMonth(Number(e.target.value))}
                                className="bg-transparent text-sm font-medium text-indigo-700 outline-none cursor-pointer"
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                            <span className="text-indigo-400 mx-1">/</span>
                            <select
                                value={selYear}
                                onChange={e => setSelYear(Number(e.target.value))}
                                className="bg-transparent text-sm font-medium text-indigo-700 outline-none cursor-pointer"
                            >
                                {YEARS.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleApplyFilter}
                            disabled={loading}
                            className="border-indigo-400 text-indigo-700 hover:bg-indigo-50"
                        >
                            Lọc
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Đóng
                        </Button>

                        <Button
                            type="button"
                            onClick={() => handlePrintClick()}
                            disabled={loading || printData.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            size="sm"
                        >
                            <Printer className="h-4 w-4" />
                            In Phiếu
                        </Button>
                    </div>
                </DialogHeader>

                {/* ─── Preview area ─── */}
                <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                            <p className="text-sm">Đang tải dữ liệu tháng {selMonth}/{selYear}…</p>
                        </div>
                    ) : printData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                            <CalendarDays className="h-10 w-10 opacity-40" />
                            <p className="text-sm">Không có giao dịch trong tháng {selMonth}/{selYear}</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow-2xl printable-area overflow-auto">
                            <FinancialLedgerPrintTemplate
                                ref={printRef}
                                transactions={printData}
                                openingBalance={openingBal}
                                filters={printFilters}
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
