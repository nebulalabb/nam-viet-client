import React from 'react'
import { MapPin, User, Eye, ShieldAlert, SkipForward, ShieldOff } from 'lucide-react'
import { formatCurrency } from '@/utils/number-format'
import DebtPagination from './DebtPagination'

import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from '@/components/ui/table'

export default function DebtReconciliationTable({ data, isLoading, onView, pagination, pageCount, rowCount, onPaginationChange, onToggleBlacklist, onExtendDebt }) {
    // 1. Loading State
    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8">
                <div className="flex flex-col items-center gap-2 animate-pulse text-gray-500">
                    <div className="h-5 w-5 bg-gray-300 rounded-full animate-bounce"></div>
                    <span>Đang tải danh sách công nợ...</span>
                </div>
            </div>
        )
    }

    // 2. Empty State
    if (!data || data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
                <div className="flex flex-col items-center gap-1">
                    <span>📭 Không tìm thấy hồ sơ công nợ nào.</span>
                    <span className="text-xs text-gray-400">Thử thay đổi bộ lọc hoặc tạo mới.</span>
                </div>
            </div>
        )
    }

    // 3. Main Table
    return (
        <div className="space-y-4">
            <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-secondary">
                            <TableRow>
                                <TableHead className="w-[220px]">Đối tượng</TableHead>
                                <TableHead className="w-[140px]">Khu vực</TableHead>
                                <TableHead className="w-[100px]">Phụ trách</TableHead>
                                <TableHead className="w-[50px] text-center">Năm</TableHead>
                                <TableHead className="text-right">Đầu kỳ</TableHead>
                                <TableHead className="text-right text-blue-600">Mua hàng</TableHead>
                                <TableHead className="text-right text-indigo-600">Trả hàng</TableHead>

                                <TableHead className="text-right text-green-600">Thanh toán</TableHead>
                                <TableHead className="text-right px-4 bg-gray-100/50 border-l border-gray-200">
                                    Nợ cuối kỳ
                                </TableHead>
                                <TableHead className="text-center">Tình trạng</TableHead>
                                <TableHead className="text-center px-4">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => {
                                const {
                                    name, code, type, objId, periodName,
                                    assignedUser, location, isWarning, isBlacklisted
                                } = item

                                const isCustomer = type === 'customer'
                                const typeLabel = isCustomer ? "KH" : "NCC"
                                const typeColor = isCustomer
                                    ? "text-blue-600 bg-blue-50 border-blue-100"
                                    : "text-orange-600 bg-orange-50 border-orange-100"

                                const opening = Number(item.openingBalance) || 0
                                const increase = Number(item.increasingAmount) || 0
                                const returnAmt = Number(item.returnAmount) || 0

                                const payment = Number(item.decreasingAmount) || 0
                                const closing = Number(item.closingBalance) || 0

                                const isDebt = closing > 1000
                                const isOverpaid = closing < -1000
                                const absClosing = Math.abs(closing)

                                return (
                                    <TableRow key={`${type}-${objId}`} className={`${isWarning ? 'bg-yellow-50 hover:bg-yellow-100' : ''}`}>
                                        <TableCell className="px-4 py-3 align-top">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${typeColor}`}>
                                                    {typeLabel}
                                                </span>
                                                <div className="font-semibold text-sm text-gray-900 truncate max-w-[160px]" title={name}>
                                                    {name}
                                                </div>
                                                {isWarning && (
                                                    <span className="text-[9px] px-1 py-0.5 rounded font-bold bg-yellow-200 text-yellow-800 border border-yellow-300 whitespace-nowrap" title="Nợ quá 1 năm không thanh toán">⚠ Nợ lâu</span>
                                                )}
                                                {isBlacklisted && (
                                                    <span className="text-[9px] px-1 py-0.5 rounded font-bold bg-gray-800 text-white whitespace-nowrap">● DS Đen</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono ml-9">{code}</div>
                                        </TableCell>

                                        <TableCell className="px-4 py-3 align-top">
                                            {location ? (
                                                <div className="flex items-start gap-1 text-xs text-gray-600">
                                                    <MapPin className="w-3 h-3 mt-0.5 text-gray-400 shrink-0" />
                                                    <span className="line-clamp-2" title={location}>{location}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 align-top">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                                                {assignedUser ? (
                                                    <>
                                                        <User className="h-3 w-3 text-gray-400" />
                                                        <span className="truncate max-w-[80px]" title={assignedUser.fullName}>
                                                            {assignedUser.fullName}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-300 italic pl-1">-</span>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-center align-top">
                                            <span className="text-[11px] font-mono text-gray-500">
                                                {periodName}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right align-top text-gray-600 font-medium text-xs font-mono">
                                            {opening !== 0 ? formatCurrency(opening) : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right align-top text-blue-600 font-bold text-xs font-mono">
                                            {increase > 0 ? `+${formatCurrency(increase)}` : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-right align-top text-indigo-600 font-medium font-mono text-xs">
                                            {returnAmt > 0 ? `-${formatCurrency(returnAmt)}` : <span className="text-gray-300">-</span>}
                                        </TableCell>



                                        <TableCell className="px-2 py-3 text-right align-top text-green-600 font-medium font-mono text-xs">
                                            {payment > 0 ? formatCurrency(payment) : <span className="text-gray-300">-</span>}
                                        </TableCell>

                                        <TableCell className={`px-4 py-3 text-right align-top border-l ${isDebt ? 'bg-red-50/30 border-red-100' :
                                            isOverpaid ? 'bg-green-50/30 border-green-100' :
                                                'bg-gray-50/30 border-gray-100'
                                            }`}>
                                            <span className={`text-sm font-bold font-mono ${isDebt ? 'text-red-600' :
                                                isOverpaid ? 'text-green-600' :
                                                    'text-gray-400'
                                                }`}>
                                                {isOverpaid ? `+${formatCurrency(absClosing)}` : formatCurrency(absClosing)}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-2 py-3 text-center align-middle">
                                            {isDebt && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                                                    CÒN NỢ
                                                </span>
                                            )}
                                            {isOverpaid && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                    TRẢ TRƯỚC
                                                </span>
                                            )}
                                            {!isDebt && !isOverpaid && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                                                    HẾT NỢ
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {type === 'customer' && isWarning && onExtendDebt && (
                                                    <button
                                                        onClick={() => onExtendDebt(objId)}
                                                        className="rounded p-1 text-green-600 hover:bg-green-100 flex items-center"
                                                        title="Gia hạn thêm 1 năm"
                                                    >
                                                        <SkipForward className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {type === 'customer' && !isBlacklisted && onToggleBlacklist && (
                                                    <button
                                                        onClick={() => onToggleBlacklist(objId)}
                                                        className="rounded p-1 text-red-600 hover:bg-red-100 flex items-center"
                                                        title="Đưa vào danh sách đen"
                                                    >
                                                        <ShieldAlert className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {type === 'customer' && isBlacklisted && onToggleBlacklist && (
                                                    <button
                                                        onClick={() => onToggleBlacklist(objId)}
                                                        className="rounded p-1 text-blue-600 hover:bg-blue-100 flex items-center"
                                                        title="Gỡ khỏi danh sách đen"
                                                    >
                                                        <ShieldOff className="h-4 w-4" />
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => onView(objId, type, periodName)}
                                                    className="rounded p-1 text-gray-600 hover:bg-gray-100"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>
            {pagination && onPaginationChange && (
                <DebtPagination
                    pagination={pagination}
                    pageCount={pageCount}
                    rowCount={rowCount}
                    onPaginationChange={onPaginationChange}
                />
            )}
        </div>
    )
}
