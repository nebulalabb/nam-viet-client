import React from 'react'
import { formatCurrency } from '@/utils/number-format'
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from '@/components/ui/table'

export default function DebtMonthlyTable({ data, isLoading }) {
    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
                <div className="flex flex-col items-center gap-2 animate-pulse text-gray-500">
                    <div className="h-5 w-5 bg-gray-300 rounded-full animate-bounce"></div>
                    <span>Đang tải dữ liệu theo tháng...</span>
                </div>
            </div>
        )
    }

    const months = data?.months || []
    const summary = data?.summary || {}

    if (months.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-1">
                    <span>📭 Không có dữ liệu theo tháng.</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-secondary">
                            <TableRow>
                                <TableHead className="w-[120px]">Tháng</TableHead>
                                <TableHead className="text-right text-blue-600">Tổng mua (+)</TableHead>
                                <TableHead className="text-right text-indigo-600">Trả hàng</TableHead>
                                <TableHead className="text-right text-green-600">Thanh toán (-)</TableHead>
                                <TableHead className="text-right px-4 bg-gray-100/50 border-l border-gray-200">
                                    Phát sinh ròng
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {months.map((item) => {
                                const isPositive = item.closing > 0
                                const isNegative = item.closing < 0
                                const hasData = item.increase > 0 || item.payment > 0 || item.returnAmount > 0

                                return (
                                    <TableRow key={item.month} className={!hasData ? 'opacity-50' : ''}>
                                        <TableCell className="px-4 py-3 font-medium text-gray-900">
                                            {item.monthLabel}
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right text-blue-600 font-bold text-xs font-mono">
                                            {item.increase > 0 ? formatCurrency(item.increase) : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right text-indigo-600 font-medium font-mono text-xs">
                                            {item.returnAmount > 0 ? formatCurrency(item.returnAmount) : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right text-green-600 font-medium font-mono text-xs">
                                            {item.payment > 0 ? `-${formatCurrency(item.payment)}` : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className={`px-4 py-3 text-right border-l ${isPositive ? 'bg-red-50/30 border-red-100' :
                                            isNegative ? 'bg-teal-50/30 border-teal-100' :
                                                'bg-gray-50/30 border-gray-100'
                                            }`}>
                                            <span className={`text-sm font-bold font-mono ${isPositive ? 'text-red-600' :
                                                isNegative ? 'text-teal-600' :
                                                    'text-gray-400'
                                                }`}>
                                                {hasData ? formatCurrency(item.closing) : '-'}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}

                            {/* Summary Row (chỉ hiển thị khi có nhiều tháng) */}
                            {months.length > 1 && (
                                <TableRow className="bg-gray-50 font-bold border-t-2 border-gray-300">
                                    <TableCell className="px-4 py-3 text-gray-900 font-bold">
                                        TỔNG CỘNG
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right text-blue-700 font-bold text-sm font-mono">
                                        {summary.increase > 0 ? formatCurrency(summary.increase) : '-'}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right text-indigo-700 font-bold text-sm font-mono">
                                        {summary.returnAmount > 0 ? formatCurrency(summary.returnAmount) : '-'}
                                    </TableCell>
                                    <TableCell className="px-2 py-3 text-right text-green-700 font-bold text-sm font-mono">
                                        {summary.payment > 0 ? `-${formatCurrency(summary.payment)}` : '-'}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-right border-l border-gray-300 bg-gray-100">
                                        <span className={`text-base font-extrabold font-mono ${summary.closing > 0 ? 'text-red-700' : summary.closing < 0 ? 'text-teal-700' : 'text-gray-500'}`}>
                                            {formatCurrency(summary.closing)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
