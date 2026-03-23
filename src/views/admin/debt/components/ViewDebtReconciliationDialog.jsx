import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { format } from 'date-fns'
import {
    Mail, User, Phone, MapPin,
    RefreshCw, DatabaseZap, Calendar,
    AlertCircle, ShoppingBag, FileText, Receipt,
    ArrowDownLeft, RotateCw, X, UserCog,
    FileDown, FileSpreadsheet, Printer
} from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { exportToExcel, exportToWord } from '@/utils/export-reconciliation'
import { ReconciliationPrintTemplate } from './ReconciliationPrintTemplate'
import { useReactToPrint } from 'react-to-print'
import { useRef } from 'react'

import { formatCurrency } from '@/utils/number-format'
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table'
import { Button } from '@/components/custom/Button'

import { getDebtDetail, syncSnapBatch, syncFullBatch, clearDebtDetail } from '@/stores/DebtSlice'

export function ViewDebtReconciliationDialog({
    isOpen,
    onClose,
    id,
    type,
    year
}) {
    const dispatch = useDispatch()
    const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear())

    const debtDetail = useSelector(state => state.debt.debtDetail)
    const isLoading = useSelector(state => state.debt.loading)
    const componentRef = useRef(null)

    useEffect(() => {
        if (year) setSelectedYear(year)
    }, [year])

    useEffect(() => {
        if (isOpen && id && type) {
            dispatch(getDebtDetail({ id, type, year: selectedYear }))
        } else {
            dispatch(clearDebtDetail())
        }
    }, [isOpen, id, type, selectedYear, dispatch])

    const data = debtDetail?.info ? debtDetail : null

    const handleSyncSnap = () => {
        if (!data || !id) return
        if (confirm(`Tính lại số liệu NĂM ${selectedYear} cho khách hàng này?`)) {
            dispatch(syncSnapBatch({
                year: selectedYear,
                customerId: type === 'customer' ? id : undefined,
                supplierId: type === 'supplier' ? id : undefined,
            })).then(() => {
                dispatch(getDebtDetail({ id, type, year: selectedYear }))
            })
        }
    }

    const handleSyncFull = () => {
        if (!data || !id) return
        if (confirm(`⚠️ QUÉT LẠI TOÀN BỘ LỊCH SỬ?\n\nHành động này sẽ tính toán lại từ đầu. Có thể mất thời gian.`)) {
            dispatch(syncFullBatch({
                year: selectedYear,
                customerId: type === 'customer' ? id : undefined,
                supplierId: type === 'supplier' ? id : undefined,
            })).then(() => {
                dispatch(getDebtDetail({ id, type, year: selectedYear }))
            })
        }
    }

    const refetch = () => {
        if (id && type) dispatch(getDebtDetail({ id, type, year: selectedYear }))
    }

    const handleExportExcel = () => {
        if (!data) return;
        const fileName = `DoiChieuCongNo_${data.info?.name || ''}_${selectedYear}`.replace(/\s+/g, '_');
        exportToExcel(data, fileName);
    }

    const handleExportWord = () => {
        if (!data) return;
        const fileName = `DoiChieuCongNo_${data.info?.name || ''}_${selectedYear}`.replace(/\s+/g, '_');
        exportToWord(data, fileName);
    }

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `DoiChieuCongNo_${data?.info?.name || ''}_${selectedYear}`
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl h-[90vh] p-0 flex flex-col overflow-hidden [&>button]:hidden bg-gray-50/50">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3 bg-white flex-shrink-0">
                    <div>
                        <DialogTitle className="text-lg font-bold text-gray-900 m-0">
                            Chi tiết công nợ
                        </DialogTitle>
                        <DialogDescription className="hidden">
                            Xem chi tiết và lịch sử công nợ của đối tác.
                        </DialogDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                    {isLoading && !data ? (
                        <div className="flex flex-col h-full items-center justify-center text-gray-400 gap-3">
                            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                            <p className="font-medium">Đang tải hồ sơ công nợ...</p>
                        </div>
                    ) : !data || !data.info ? (
                        <div className="flex h-full items-center justify-center text-gray-500 flex-col gap-2">
                            <AlertCircle className="h-10 w-10 text-gray-300" />
                            <span className="font-medium">Không tìm thấy dữ liệu hoặc hồ sơ không tồn tại.</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* ROW 1: ACTIONS */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button disabled={isLoading} variant="outline" size="sm" className="h-9 gap-2 border-gray-200 text-gray-700">
                                                <FileDown className="h-4 w-4" /> Xuất File
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-[180px]">
                                            <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                                Xuất Excel (.xlsx)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleExportWord} className="gap-2 cursor-pointer">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                Xuất Word (.docx)
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <Button onClick={handlePrint} disabled={isLoading} variant="outline" size="sm" className="h-9 gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                        <Printer className="h-4 w-4" /> In Bảng
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button onClick={handleSyncSnap} disabled={isLoading} variant="outline" size="sm" className="h-9 gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 border-none">
                                        <RotateCw className="h-4 w-4" /> Tính lại
                                    </Button>
                                    <Button onClick={handleSyncFull} disabled={isLoading} variant="outline" size="sm" className="h-9 gap-2 text-orange-600 bg-orange-50 hover:bg-orange-100 hover:text-orange-700 border-none">
                                        <DatabaseZap className="h-4 w-4" /> Quét lịch sử
                                    </Button>
                                    <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                    <Button onClick={refetch} disabled={isLoading} variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:bg-gray-100 rounded-full">
                                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>

                            {/* ROW 2: CUSTOMER INFO & METADATA */}
                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-5 flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-600">Kỳ dữ liệu:</span>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            className="bg-transparent text-sm font-bold text-gray-900 focus:outline-none cursor-pointer hover:text-blue-600"
                                        >
                                            {Array.from({ length: 5 }).map((_, i) => {
                                                const y = new Date().getFullYear() - i
                                                return <option key={y} value={y}>{y}</option>
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pr-32 sm:pr-48">
                                    <div className="bg-blue-50 p-3 rounded-full flex-shrink-0 hidden sm:block">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h2 className="font-bold text-gray-900 text-lg md:text-xl">{data.info.name}</h2>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold border bg-gray-100 text-gray-600 border-gray-200">
                                                {data.info.code}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${data.financials?.status === 'unpaid' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {data.financials?.status === 'unpaid' ? 'ĐANG NỢ' : 'ĐÃ THANH TOÁN'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6 mt-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400 flex-shrink-0" /> <span className="truncate">{data.info.phone || "---"}</span></div>
                                            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400 flex-shrink-0" /> <span className="truncate">{data.info.email || "---"}</span></div>
                                            <div className="flex gap-2"><MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" /> <span className="leading-snug">{[data.info.address, data.info.district, data.info.province].filter(Boolean).join(', ') || "---"}</span></div>
                                            <div className="flex items-center gap-2"><UserCog className="h-4 w-4 text-gray-400 flex-shrink-0" /> <span className="truncate border-gray-200 md:border-l md:pl-2">Phụ trách: {data.info.assignedUser?.fullName || "---"}</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ROW 3: FINANCIAL SUMMARY */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <StatBox label="Nợ đầu kỳ" value={data.financials?.opening} />
                                <StatBox label="Tổng mua (+)" value={data.financials?.increase} color="text-blue-600" />
                                <StatBox label="Trả hàng (-)" value={data.financials?.returnAmount} color="text-indigo-600" />
                                <StatBox label="Thanh toán (-)" value={data.financials?.payment} color="text-green-600" />

                                <StatBox label="Dư nợ cuối kỳ (=)" value={data.financials?.closing} color="text-red-600" isBig bg="bg-red-50" />
                            </div>

                            {/* Tabs Data */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
                                <Tabs defaultValue="products" className="w-full">
                                    <div className="border-b px-6 pt-2 overflow-x-auto">
                                        <TabsList className="bg-transparent gap-6 h-auto p-0 flex justify-start">
                                            <TabItem value="products" label="Sản phẩm" icon={ShoppingBag} count={data.history?.products?.length || 0} />
                                            <TabItem value="orders" label="Đơn hàng" icon={FileText} count={data.history?.orders?.length || 0} />
                                            <TabItem value="payments" label="Thanh toán" icon={Receipt} count={data.history?.payments?.length || 0} />
                                            <TabItem value="returns" label="Trả hàng" icon={ArrowDownLeft} count={data.history?.returns?.length || 0} />

                                        </TabsList>
                                    </div>

                                    <TabsContent value="products" className="p-0">
                                        <ProductHistoryTable data={data.history?.products} />
                                    </TabsContent>

                                    <TabsContent value="orders" className="p-0">
                                        <DocumentHistoryTable data={data.history?.orders} type="ORDER" />
                                    </TabsContent>

                                    <TabsContent value="payments" className="p-0">
                                        <DocumentHistoryTable data={data.history?.payments} type="PAYMENT" />
                                    </TabsContent>

                                    <TabsContent value="returns" className="p-0">
                                        <DocumentHistoryTable data={data.history?.returns} type="RETURN" />
                                    </TabsContent>


                                </Tabs>
                            </div>
                        </div>
                    )}
                </div>

                {/* Print Template (Hidden from screen view but printable) */}
                <div className="absolute opacity-0 pointer-events-none -z-50 w-0 h-0 overflow-hidden">
                    <ReconciliationPrintTemplate
                        ref={componentRef}
                        data={data}
                        year={selectedYear}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="flex gap-3 items-center">
            <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 flex justify-between">
                <span className="text-gray-500">{label}:</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]" title={value}>{value || "---"}</span>
            </div>
        </div>
    )
}

function StatBox({ label, value, color = "text-gray-900", isBig = false, bg = "bg-white" }) {
    return (
        <div className={`${bg} p-4 flex flex-col justify-center items-center text-center h-28 hover:bg-gray-50 transition-colors`}>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</span>
            <span className={`font-bold tracking-tight ${color} ${isBig ? 'text-2xl' : 'text-xl'}`}>
                {formatCurrency(value)}
            </span>
        </div>
    )
}

function TabItem({ value, label, icon: Icon, count }) {
    return (
        <TabsTrigger
            value={value}
            className="group flex items-center gap-2 border-b-2 border-transparent px-1 pb-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none shadow-none transition-all"
        >
            <Icon className="h-4 w-4" />
            {label}
            {count > 0 && (
                <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 group-data-[state=active]:bg-blue-100 group-data-[state=active]:text-blue-600">
                    {count}
                </span>
            )}
        </TabsTrigger>
    )
}

function ProductHistoryTable({ data }) {
    if (!data || data.length === 0) return <EmptyState />

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="pl-6 w-[300px]">Sản phẩm</TableHead>
                        <TableHead>Ngày mua</TableHead>
                        <TableHead>Mã đơn</TableHead>
                        <TableHead className="text-right">SL</TableHead>
                        <TableHead className="text-right">Đơn giá</TableHead>
                        <TableHead className="text-right pr-6">Thành tiền</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-gray-50/50">
                            <TableCell className="pl-6 align-top">
                                <div className="font-medium text-gray-900">{item.productName}</div>
                                <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                            </TableCell>
                            <TableCell className="text-gray-600 text-xs">
                                {format(new Date(item.date), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell>
                                <div className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                    {item.orderCode}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{item.quantity}</TableCell>
                            <TableCell className="text-right text-gray-600 text-xs">{formatCurrency(item.price)}</TableCell>
                            <TableCell className="text-right font-bold text-gray-900 pr-6">
                                {formatCurrency(item.quantity * item.price)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function DocumentHistoryTable({ data, type }) {
    if (!data || data.length === 0) return <EmptyState />

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="pl-6">Mã chứng từ</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Nội dung / Ghi chú</TableHead>
                        <TableHead className="text-right pr-6">Giá trị</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => {
                        const code = item.orderCode || item.poCode || item.receiptCode || item.voucherCode || item.code || `#${item.id}`
                        const date = item.orderDate || item.receiptDate || item.paymentDate || item.date
                        const amount = item.totalAmount || item.amount

                        let note = item.notes || item.note || item.reason || ""
                        if (!note) {
                            if (type === 'ORDER') note = "Đơn hàng bán"
                            else if (type === 'PAYMENT') note = "Phiếu thu/chi"
                            else if (type === 'RETURN') note = "Phiếu trả hàng"

                        }

                        let amountColor = 'text-gray-900'
                        let prefix = ''

                        if (type === 'ORDER') { amountColor = 'text-blue-600'; prefix = '+' }
                        else if (type === 'PAYMENT') { amountColor = 'text-green-600'; prefix = '-' }
                        else if (type === 'RETURN') { amountColor = 'text-indigo-600'; prefix = '-' }


                        return (
                            <TableRow key={item.id} className="hover:bg-gray-50/50">
                                <TableCell className="pl-6 font-medium">
                                    <span className="text-gray-900">{code}</span>
                                </TableCell>
                                <TableCell className="text-gray-600 text-sm">
                                    {date ? format(new Date(date), "dd/MM/yyyy HH:mm") : "-"}
                                </TableCell>
                                <TableCell className="text-gray-600 max-w-[300px] truncate">{note}</TableCell>
                                <TableCell className={`text-right font-bold pr-6 ${amountColor}`}>
                                    {prefix}{formatCurrency(amount)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <AlertCircle className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-sm">Không có dữ liệu trong kỳ này.</p>
        </div>
    )
}
