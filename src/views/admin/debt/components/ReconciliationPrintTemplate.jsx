import React from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/number-format';

/**
 * Hàm đọc số tiền bằng chữ tiếng Việt
 */
function readVietnameseNumber(n) {
    if (n === 0) return 'Không đồng';
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    const groups = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

    function readThreeDigits(num, showZeroHundred) {
        const h = Math.floor(num / 100);
        const t = Math.floor((num % 100) / 10);
        const u = num % 10;
        let result = '';
        if (h > 0 || showZeroHundred) result += units[h] + ' trăm ';
        if (t > 1) result += units[t] + ' mươi ';
        else if (t === 1) result += 'mười ';
        else if (t === 0 && h > 0 && u > 0) result += 'lẻ ';
        if (u === 5 && t >= 1) result += 'lăm ';
        else if (u === 1 && t > 1) result += 'mốt ';
        else if (u > 0) result += units[u] + ' ';
        return result;
    }

    const abs = Math.abs(Math.round(n));
    if (abs === 0) return 'Không đồng';
    let str = abs.toString();
    // Pad to multiple of 3
    while (str.length % 3 !== 0) str = '0' + str;
    const chunks = [];
    for (let i = 0; i < str.length; i += 3) {
        chunks.push(parseInt(str.substring(i, i + 3)));
    }
    let result = '';
    for (let i = 0; i < chunks.length; i++) {
        const groupIndex = chunks.length - 1 - i;
        if (chunks[i] > 0) {
            result += readThreeDigits(chunks[i], i > 0) + groups[groupIndex] + ' ';
        }
    }
    result = result.trim();
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng';
    if (n < 0) result = 'Âm ' + result;
    return result;
}

export const ReconciliationPrintTemplate = React.forwardRef(({ data, title, year }, ref) => {
    if (!data || data.length === 0) {
        return <div ref={ref}>Đang tải dữ liệu in...</div>;
    }

    const { info, financials, history, periodName } = data;

    // Build transaction rows: products + payments + returns, sorted by date
    const allItems = [
        ...(history.products || []).map((p) => ({
            date: p.date,
            name: p.productName,
            unit: p.unitName || '',
            qty: p.quantity,
            price: Number(p.price),
            amount: Number(p.quantity) * Number(p.price),
            payment: 0,
            note: p.gift ? 'Hàng tặng' : '',
            isProduct: true
        })),
        ...(history.payments || []).map((pay) => ({
            date: pay.receiptDate || pay.paymentDate,
            name: `Phiếu thu ${pay.receiptCode || pay.voucherCode}`,
            unit: '', qty: '', price: 0,
            amount: 0,
            payment: Number(pay.amount),
            note: pay.notes || 'Thu bán hàng',
            isProduct: false
        })),
        ...(history.returns || []).flatMap((ret) => {
            // Flatten each return into individual product rows with negative amounts
            if (ret.details && ret.details.length > 0) {
                return ret.details.map((det, idx) => {
                    const price = Number(det.unitPrice) || 0;
                    const lineTotal = Number(det.lineTotal) || 0;
                    return {
                        date: ret.date,
                        name: `${det.productName || 'Sản phẩm'} (Trả hàng)`,
                        unit: det.unitName || '',
                        qty: det.quantity || 0,
                        price,
                        amount: -lineTotal,
                        payment: 0,
                        note: idx === 0 ? (ret.note || 'Trả hàng') : '',
                        isProduct: true,
                        isReturn: true
                    };
                });
            }
            // Fallback if no details
            return [{
                date: ret.date,
                name: `Trả hàng (${ret.code})`,
                unit: '', qty: '', price: 0,
                amount: -(Number(ret.amount) || 0),
                payment: 0,
                note: ret.note || 'Trả hàng',
                isProduct: false,
                isReturn: true
            }];
        }),
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalAmount = allItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalPayment = allItems.reduce((sum, item) => sum + (Number(item.payment) || 0), 0);
    const debtInPeriod = totalAmount - totalPayment;
    const closingBalance = Number(financials?.closing || 0);

    const now = new Date();

    return (
        <div ref={ref} className="print:block font-serif text-[11px] text-black bg-white p-6 max-w-[210mm] mx-auto leading-snug">
            {/* HEADER */}
            <div className="flex items-start mb-1">
                <div className="text-[9px] text-gray-500 flex-shrink-0 w-[120px]">
                    {format(now, 'HH:mm')} {format(now, 'dd/M/yy')}
                </div>
                <div className="flex-1 text-center text-[9px] text-gray-500">
                    In Chứng Từ
                </div>
                <div className="w-[120px]"></div>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center">
                    <img src="/images/logo/logo-nobackground.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center space-y-0">
                    <h2 className="text-[16px] font-bold uppercase" style={{ color: '#008000' }}>CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT</h2>
                    <p className="text-[11px] font-semibold" style={{ color: '#002060' }}>Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.</p>
                    <p className="text-[11px]" style={{ color: '#C00000' }}>Điện thoại: <b>088 635 7788 - 0868 759 588</b></p>
                    <p className="text-[11px]" style={{ color: '#C00000' }}>TK Lê Trung Thành: <b>9 75 76 77 88</b> - NH ACB CN Đồng Tháp</p>
                    <p className="text-[11px]" style={{ color: '#C00000' }}>TK Lê Trung Thành: <b>09 75 76 77 88</b> - NH SACOMBANK CN Đồng Tháp.</p>
                </div>
            </div>

            {/* TITLE */}
            <div className="text-center mb-4">
                <h1 className="text-[18px] font-bold uppercase" style={{ color: '#FF0000' }}>
                    ĐỐI CHIẾU CÔNG NỢ KHÁCH HÀNG
                </h1>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mb-3 ml-1 text-[12px]">
                <p><b>Tên khách hàng:</b> <span className="font-bold text-blue-800">{info?.name}</span></p>
                <p><b>Địa chỉ:</b> {[info?.address, info?.district, info?.province].filter(Boolean).join(', ')}</p>
                <p><b>Điện thoại:</b> {info?.phone}</p>
            </div>

            {/* TABLE 1 - TRANSACTIONS */}
            <table className="w-full border-collapse text-[11px]" style={{ borderColor: '#000', tableLayout: 'fixed' }}>
                <colgroup>
                    <col style={{ width: '75px' }} />
                    <col />
                    <col style={{ width: '40px' }} />
                    <col style={{ width: '30px' }} />
                    <col style={{ width: '75px' }} />
                    <col style={{ width: '85px' }} />
                    <col style={{ width: '85px' }} />
                    <col style={{ width: '70px' }} />
                </colgroup>
                <thead>
                    <tr className="text-center font-bold" style={{ backgroundColor: '#FFFF00', color: '#002060' }}>
                        <th className="border border-black px-1 py-1">Ngày</th>
                        <th className="border border-black px-1 py-1">Tên Sản Phẩm</th>
                        <th className="border border-black px-1 py-1">ĐVT</th>
                        <th className="border border-black px-1 py-1">SL</th>
                        <th className="border border-black px-1 py-1">Giá</th>
                        <th className="border border-black px-1 py-1">Thành tiền</th>
                        <th className="border border-black px-1 py-1">Thanh toán</th>
                        <th className="border border-black px-1 py-1">Ghi Chú</th>
                    </tr>
                </thead>
                <tbody>
                    {/* NỢ ĐẦU KỲ */}
                    <tr className="font-bold text-center">
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 text-center font-bold" style={{ color: '#FF0000' }}>
                            Nợ Đầu Kỳ
                        </td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 text-right" style={{ color: '#FF0000' }}>
                            {Number(financials?.opening) !== 0 ? formatCurrency(financials.opening) : '0'}
                        </td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                    </tr>

                    {/* TRANSACTION ROWS */}
                    {allItems.length > 0 ? (
                        allItems.map((item, index) => (
                            <tr key={index} style={item.isReturn ? { color: '#C00000' } : {}}>
                                <td className="border border-black px-1 py-1 text-center">
                                    {format(new Date(item.date), 'dd/MM/yyyy')}
                                </td>
                                <td className="border border-black px-1 py-1 break-words">
                                    {item.name}
                                </td>
                                <td className="border border-black px-1 py-1 text-center">{item.unit}</td>
                                <td className="border border-black px-1 py-1 text-center">{item.qty !== '' ? item.qty : ''}</td>
                                <td className="border border-black px-1 py-1 text-right">
                                    {item.price > 0 ? formatCurrency(item.price) : (item.isProduct ? '0' : '')}
                                </td>
                                <td className="border border-black px-1 py-1 text-right">
                                    {item.amount !== 0 ? formatCurrency(item.amount) : (item.isProduct ? '0' : '')}
                                </td>
                                <td className="border border-black px-1 py-1 text-right">
                                    {item.payment > 0 ? formatCurrency(item.payment) : ''}
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[10px] break-words">
                                    {item.note}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="border border-black py-4 text-center text-gray-400 italic">
                                Không có giao dịch phát sinh trong kỳ
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* TABLE 2 - SUMMARY (No thead to avoid repeating headers) */}
            <table className="w-full border-collapse text-[11px] mb-3" style={{ borderColor: '#000', tableLayout: 'fixed', borderTop: 'none', pageBreakInside: 'avoid' }}>
                <colgroup>
                    <col style={{ width: '75px' }} />
                    <col />
                    <col style={{ width: '40px' }} />
                    <col style={{ width: '30px' }} />
                    <col style={{ width: '75px' }} />
                    <col style={{ width: '85px' }} />
                    <col style={{ width: '85px' }} />
                    <col style={{ width: '70px' }} />
                </colgroup>
                <tbody>
                    {/* GIAO DỊCH */}
                    <tr className="font-bold" style={{ backgroundColor: '#FFFF00' }}>
                        <td className="border border-black border-t-0 px-1 py-1"></td>
                        <td className="border border-black border-t-0 px-1 py-1 font-bold">GIAO DỊCH</td>
                        <td className="border border-black border-t-0 px-1 py-1"></td>
                        <td className="border border-black border-t-0 px-1 py-1"></td>
                        <td className="border border-black border-t-0 px-1 py-1"></td>
                        <td className="border border-black border-t-0 px-1 py-1 text-right">{formatCurrency(totalAmount)}</td>
                        <td className="border border-black border-t-0 px-1 py-1 text-right">{formatCurrency(totalPayment)}</td>
                        <td className="border border-black border-t-0 px-1 py-1"></td>
                    </tr>

                    {/* NỢ TRONG KỲ */}
                    <tr className="font-bold" style={{ backgroundColor: '#FFFF00' }}>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 font-bold" style={{ color: '#002060' }}>NỢ TRONG KỲ</td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 text-right" colSpan={2}>
                            {formatCurrency(debtInPeriod)}
                        </td>
                        <td className="border border-black px-1 py-1"></td>
                    </tr>

                    {/* TỔNG NỢ PHẢI THU */}
                    <tr className="font-bold text-[12px]" style={{ backgroundColor: '#FFFF00' }}>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 font-bold" style={{ color: '#FF0000' }}>TỔNG NỢ PHẢI THU</td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1"></td>
                        <td className="border border-black px-1 py-1 text-right" colSpan={2} style={{ color: '#FF0000' }}>
                            {formatCurrency(closingBalance)}
                        </td>
                        <td className="border border-black px-1 py-1"></td>
                    </tr>
                </tbody>
            </table>

            {/* VIẾT BẰNG CHỮ */}
            <div className="mb-4 ml-1 text-[11px]">
                <i>Viết bằng chữ: </i><i style={{ color: '#FF0000' }}>{readVietnameseNumber(closingBalance)}</i>
            </div>

            {/* FOOTER: DATE + SIGNATURES */}
            <div className="mt-6">
                <div className="flex justify-end mb-3 text-[11px]">
                    <p><i>Ngày {format(now, 'dd')} tháng {format(now, 'MM')} năm {format(now, 'yyyy')}</i></p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-[12px]">
                    <div>
                        <p className="font-bold mb-16">Khách hàng</p>
                        <p className="text-[10px] italic text-gray-500">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold mb-16">Đại diện công ty</p>
                        <p className="text-[10px] italic text-gray-500">(Ký và ghi rõ họ tên)</p>
                    </div>
                    <div>
                        <p className="font-bold mb-16">Người lập phiếu</p>
                        <p className="text-[10px] italic text-gray-500">(Ký và ghi rõ họ tên)</p>
                    </div>
                </div>
            </div>
        </div>
    );
});

ReconciliationPrintTemplate.displayName = 'ReconciliationPrintTemplate';
