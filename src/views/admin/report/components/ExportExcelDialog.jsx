import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Loader2, CalendarDays } from 'lucide-react'
import api from '@/utils/axios'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const THIS_YEAR  = new Date().getFullYear()
const THIS_MONTH = new Date().getMonth() + 1

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }))
const YEARS  = Array.from({ length: 5 },  (_, i) => THIS_YEAR - i)

function monthRange(month, year) {
    const m = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    return {
        fromDate: `${year}-${m}-01`,
        toDate:   `${year}-${m}-${lastDay}`,
    }
}

// ─── Component ────────────────────────────────────────────────────────────────
const ExportExcelDialog = ({ isOpen, onClose }) => {
    const [mode,     setMode]     = useState('month') // 'month' | 'year'
    const [selMonth, setSelMonth] = useState(THIS_MONTH)
    const [selYear,  setSelYear]  = useState(THIS_YEAR)
    const [loading,  setLoading]  = useState(false)

    const handleExport = async () => {
        try {
            setLoading(true)

            let fromDate, toDate
            if (mode === 'month') {
                const r = monthRange(selMonth, selYear)
                fromDate = r.fromDate
                toDate   = r.toDate
            } else {
                fromDate = `${selYear}-01-01`
                toDate   = `${selYear}-12-31`
            }

            const response = await api.get('/reports/financial/export-cash-book', {
                params: { fromDate, toDate },
                responseType: 'blob',
            })

            const contentType = (response.headers?.['content-type'] || '').toLowerCase()
            if (!contentType.includes('spreadsheet') && !contentType.includes('octet-stream')) {
                alert('Không thể xuất file Excel.')
                return
            }

            const filename = mode === 'month'
                ? `SoQuy_T${selMonth}_${selYear}.xlsx`
                : `SoQuy_Nam${selYear}.xlsx`

            const url  = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href  = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            onClose()
        } catch (err) {
            console.error('Export error:', err)
            alert('Không thể xuất file Excel. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-700">
                        <Download className="h-5 w-5" />
                        Xuất Excel — Sổ Quỹ Chi Tiết
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Mode selector */}
                    <div className="flex gap-2">
                        {[
                            { value: 'month', label: 'Theo Tháng' },
                            { value: 'year',  label: 'Theo Năm'   },
                        ].map(m => (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className={[
                                    'flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors',
                                    mode === m.value
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 text-gray-500 hover:border-gray-300',
                                ].join(' ')}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Picker */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border">
                        <CalendarDays className="h-5 w-5 text-green-600 shrink-0" />

                        {mode === 'month' && (
                            <select
                                value={selMonth}
                                onChange={e => setSelMonth(Number(e.target.value))}
                                className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                            >
                                {MONTHS.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        )}

                        {mode === 'month' && <span className="text-gray-400">/</span>}

                        <select
                            value={selYear}
                            onChange={e => setSelYear(Number(e.target.value))}
                            className="bg-transparent text-sm font-semibold text-gray-800 outline-none cursor-pointer"
                        >
                            {YEARS.map(y => (
                                <option key={y} value={y}>Năm {y}</option>
                            ))}
                        </select>
                    </div>

                    {/* Preview info */}
                    <p className="text-xs text-gray-500 text-center">
                        {mode === 'month'
                            ? `Xuất dữ liệu tháng ${selMonth}/${selYear}`
                            : `Xuất toàn bộ dữ liệu năm ${selYear}`
                        }
                    </p>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Đang xuất…
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Xuất Excel
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ExportExcelDialog
