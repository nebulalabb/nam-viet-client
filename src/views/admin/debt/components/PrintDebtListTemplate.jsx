import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/number-format';
import './PrintDebtListTemplate.css';

export const PrintDebtListTemplate = forwardRef(({ data = [], type = 'customer', dateRange = null, year = null }, ref) => {
    
    // Derived values for localization
    const title = type === 'customer' ? 'CÔNG NỢ KHÁCH HÀNG' : 'CÔNG NỢ NHÀ CUNG CẤP';
    const targetNameHeader = type === 'customer' ? 'Khách hàng' : 'Nhà cung cấp';
    const debtHeader = type === 'customer' ? 'Nợ cần thu' : 'Nợ cần trả';
    const printTime = format(new Date(), 'dd/MM/yyyy HH:mm');

    // Time filter display
    let periodDisplay = '';
    if (dateRange?.from && dateRange?.to) {
        periodDisplay = `Kỳ Đối Chiếu: ${format(new Date(dateRange.from), 'dd/MM/yyyy')} - ${format(new Date(dateRange.to), 'dd/MM/yyyy')}`;
    } else if (dateRange?.from) {
        periodDisplay = `Kỳ Đối Chiếu: Từ ${format(new Date(dateRange.from), 'dd/MM/yyyy')}`;
    } else if (dateRange?.to) {
        periodDisplay = `Kỳ Đối Chiếu: Đến ${format(new Date(dateRange.to), 'dd/MM/yyyy')}`;
    } else if (year) {
        periodDisplay = `Năm: ${year}`;
    }

    // Helper to extract province
    const getProvince = (address) => {
        if (!address) return '';
        const parts = address.split(',');
        return parts.length > 1 ? parts[parts.length - 1].trim() : address.trim();
    };

    return (
        <div className="print-wrapper p-8 bg-white text-black" ref={ref}>
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-red-600 mb-2 uppercase">{title}</h1>
                <div className="flex justify-between items-end">
                    <div className="text-sm font-medium italic">
                        {periodDisplay}
                    </div>
                    <div className="text-sm font-medium">
                        Thời gian in: {printTime}
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse text-[11px]">
                <thead>
                    <tr className="bg-gray-100 uppercase tracking-wider">
                        <th className="border border-black p-2 text-center w-12 font-bold">STT</th>
                        <th className="border border-black p-2 text-left font-bold">{targetNameHeader}</th>
                        <th className="border border-black p-2 text-center font-bold">Điện thoại</th>
                        <th className="border border-black p-2 text-left font-bold">Địa chỉ</th>
                        <th className="border border-black p-2 text-center font-bold">Tỉnh/Thành</th>
                        <th className="border border-black p-2 text-right font-bold">{debtHeader}</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => {
                        const closing = Number(item.closingBalance) || 0;
                        const isOverpaid = closing < -1000;
                        const absClosing = Math.abs(closing);
                        
                        let displayDebt = '0';
                        if (closing > 1000 || closing < -1000) {
                            displayDebt = isOverpaid ? `+${formatCurrency(absClosing)}` : formatCurrency(absClosing);
                        }

                        // Determine debt color for print (though usually bw, red/green highlights help if printed color)
                        // If it's a customer: isDebt(>1000) = RED, isOverpaid(<-1000) = GREEN
                        // If it's a supplier: We use the exact same logic we just standardized.
                        return (
                            <tr key={item.objId || index} className="print-row">
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2 text-left font-semibold">
                                    {item.name}
                                    {item.isBlacklisted && ' (DS Đen)'}
                                </td>
                                <td className="border border-black p-2 text-center">{item.phone || '-'}</td>
                                <td className="border border-black p-2 text-left">
                                    {item.location || '-'}
                                </td>
                                <td className="border border-black p-2 text-center">
                                    {getProvince(item.location) || '-'}
                                </td>
                                <td className="border border-black p-2 text-right font-bold font-mono">
                                    {displayDebt}
                                </td>
                            </tr>
                        );
                    })}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan="6" className="border border-black p-4 text-center text-gray-500 italic">
                                Không có dữ liệu công nợ
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
});

PrintDebtListTemplate.displayName = 'PrintDebtListTemplate';
