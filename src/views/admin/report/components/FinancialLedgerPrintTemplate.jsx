import React from 'react'
import { format } from 'date-fns'
import { getPublicUrl } from '@/utils/file'

// ─── Formatters ───────────────────────────────────────────────────────────────
// Luôn dương, không dấu +/-
const moneyFmt = (v) =>
    new Intl.NumberFormat('vi-VN').format(Math.abs(Number(v) || 0))

const RECEIPT_TYPE_LABELS = {
    sales:           'Thu bán hàng',
    debt_collection: 'Thu nợ',
    refund:          'Hoàn trả',
}

const PAYMENT_TYPE_LABELS = {
    supplier_payment: 'Chi NCC',
    salary:           'Chi lương',
    operating_cost:   'Chi phí khác',
    refund:           'Hoàn tiền',
    other:            'Chi khác',
}

// A4 dọc: 210mm × 297mm, có thể chứa khoảng 28 dòng/trang
const ITEMS_PER_PAGE = 28

// ─── Component ────────────────────────────────────────────────────────────────
const FinancialLedgerPrintTemplate = React.forwardRef(
    ({ transactions = [], openingBalance = 0, filters = {}, setting } = {}, ref) => {
        const now     = new Date()
        const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}  ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

        const fromDate = filters?.fromDate ? format(new Date(filters.fromDate), 'dd/MM/yyyy') : ''
        const toDate   = filters?.toDate   ? format(new Date(filters.toDate),   'dd/MM/yyyy') : ''

        let periodLabel = ''
        if (filters?.fromDate) {
            const d = new Date(filters.fromDate)
            periodLabel = `Tháng ${d.getMonth() + 1} / ${d.getFullYear()}`
        }

        // ── Running balance từ openingBalance ───────────────────────────────
        let runBalance = Number(openingBalance || 0)
        const txsWithBalance = transactions.map(tx => {
            const amt = Number(tx.amount || 0)
            runBalance = tx.isReceipt ? runBalance + amt : runBalance - amt
            return { ...tx, _rb: runBalance }
        })

        // ── Phân trang ──────────────────────────────────────────────────────
        const pages = []
        for (let i = 0; i < Math.max(1, txsWithBalance.length); i += ITEMS_PER_PAGE) {
            pages.push(txsWithBalance.slice(i, i + ITEMS_PER_PAGE))
        }
        const totalPages = pages.length

        // Tổng Thu / Chi
        const sumReceipt = transactions.filter(t => t.isReceipt).reduce((s, t) => s + Number(t.amount || 0), 0)
        const sumPayment = transactions.filter(t => !t.isReceipt).reduce((s, t) => s + Number(t.amount || 0), 0)

        const logoSrc = setting?.logo
            ? (setting.logo.startsWith('http') ? setting.logo : window.location.origin + getPublicUrl(setting.logo))
            : (typeof window !== 'undefined' ? window.location.origin : '') + '/images/logo/logo-nobackground.png'

        return (
            <div ref={ref}>
                <style dangerouslySetInnerHTML={{ __html: `
                    @page { size: A4 portrait; margin: 8mm 10mm; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .flpt-page { page-break-after: always; break-after: page; }
                        .flpt-page:last-child { page-break-after: avoid; break-after: avoid; }
                    }
                ` }} />

                {pages.map((pageItems, pageIdx) => {
                    const startIdx   = pageIdx * ITEMS_PER_PAGE
                    const isLastPage = pageIdx === totalPages - 1

                    return (
                        <div
                            key={pageIdx}
                            className="flpt-page"
                            style={{
                                width: '190mm',       // A4 portrait nội dung (210 - 2×10mm margin)
                                minHeight: '277mm',   // A4 portrait chiều cao (297 - 2×10mm margin)
                                padding: '3mm 0',
                                boxSizing: 'border-box',
                                position: 'relative',
                                paddingBottom: '14mm',
                                color: '#000',
                                fontSize: '9px',
                                fontFamily: 'Arial, sans-serif',
                                backgroundColor: '#fff',
                            }}
                        >
                            {/* ── Timestamp dòng trên ── */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5px', color: '#888', marginBottom: '3px' }}>
                                <span>{nowTime}</span>
                                <span>Trang {pageIdx + 1}/{totalPages}</span>
                            </div>

                            {/* ── Header trang 1 ── */}
                            {pageIdx === 0 && (
                                <>
                                    {/* Logo + Company + Title */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                                        {/* Logo */}
                                        <div style={{ width: '56px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        </div>

                                        {/* Company info */}
                                        <div style={{ flex: 1, fontSize: '8px', lineHeight: 1.55 }}>
                                            <p style={{ margin: '0 0 1px 0', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase', color: '#c00000' }}>
                                                {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
                                            </p>
                                            <p style={{ margin: '0 0 1px 0' }}>{setting?.address || 'QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp'}</p>
                                            {setting?.bankAccount1
                                                ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount1}</p>
                                                : <p style={{ margin: '0 0 1px 0' }}>TK cá nhân: 975767788 - ACB Cao Lãnh</p>
                                            }
                                            {setting?.bankAccount2
                                                ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount2}</p>
                                                : <p style={{ margin: '0 0 1px 0' }}>TK CT: 08290639 - ACB Cao Lãnh</p>
                                            }
                                            <p style={{ margin: 0, color: '#0070c0', fontWeight: 'bold' }}>
                                                ĐT: {setting?.phone || '0886 357 788 — 0868 759 588'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tiêu đề chính — căn giữa */}
                                    <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                                        <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', color: '#c00000', letterSpacing: '1px' }}>
                                            SỔ QUỸ CHI TIẾT
                                        </h2>
                                        {periodLabel && (
                                            <p style={{ margin: '0 0 1px 0', fontSize: '10px', fontWeight: 'bold', color: '#1a3a8f' }}>
                                                {periodLabel}
                                            </p>
                                        )}
                                        <p style={{ margin: 0, fontSize: '8px', color: '#444' }}>
                                            Từ: <strong>{fromDate}</strong> &nbsp;—&nbsp; Đến: <strong>{toDate}</strong>
                                            &emsp; | &emsp; In lúc: {format(now, 'HH:mm dd/MM/yyyy')}
                                        </p>
                                    </div>

                                    {/* Số dư đầu kỳ */}
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#e8f0fe',
                                        border: '0.5px solid #aac4f0',
                                        borderRadius: '4px',
                                        padding: '2px 10px',
                                        marginBottom: '5px',
                                        fontSize: '8.5px',
                                        fontWeight: 'bold',
                                        color: '#1a3a8f',
                                    }}>
                                        Số dư đầu kỳ:&nbsp;
                                        <span style={{ color: '#0070c0' }}>
                                            {moneyFmt(openingBalance)} ₫
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* ── Header trang tiếp ── */}
                            {pageIdx > 0 && (
                                <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                                    <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', color: '#c00000' }}>
                                        SỔ QUỸ CHI TIẾT{periodLabel ? ` — ${periodLabel}` : ''} (tiếp)
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '7.5px', color: '#666' }}>
                                        Từ: <strong>{fromDate}</strong> — Đến: <strong>{toDate}</strong>
                                    </p>
                                </div>
                            )}

                            {/* ── Bảng chính ── */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '4px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1a3a8f' }}>
                                        {/* 6 cột tối ưu cho A4 dọc */}
                                        <th style={thStyle('#fff', '22px')}>STT</th>
                                        <th style={thStyle('#fff', '56px')}>Ngày</th>
                                        <th style={thStyle('#fff', '62px')}>Mã phiếu</th>
                                        <th style={thStyle('#fff')}>Khách / Đối tượng & Diễn giải</th>
                                        <th style={thStyle('#90ee90', '52px')}>Loại</th>
                                        <th style={thStyle('#aef0c0', '62px')}>Thu (₫)</th>
                                        <th style={thStyle('#ffbbbb', '62px')}>Chi (₫)</th>
                                        <th style={thStyle('#aaddff', '68px')}>Tồn quỹ (₫)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageItems.length > 0 ? pageItems.map((tx, i) => {
                                        const globalIdx  = startIdx + i + 1
                                        const txDate     = tx.datetime ? new Date(tx.datetime) : null
                                        const typeLabel  = tx.isReceipt
                                            ? (RECEIPT_TYPE_LABELS[tx.voucherType] || 'Thu khác')
                                            : (PAYMENT_TYPE_LABELS[tx.voucherType] || 'Chi khác')
                                        const amt        = Number(tx.amount || 0)
                                        const rb         = tx._rb
                                        const objectName = tx.partyName || tx.customerName || tx.supplierName || ''
                                        const isEven     = i % 2 === 1

                                        return (
                                            <tr key={`${tx.type}-${tx.id}`} style={{ backgroundColor: isEven ? '#f4f6ff' : '#fff' }}>
                                                <td style={tdStyle('center', '#777')}>{globalIdx}</td>
                                                <td style={tdStyle('center')}>
                                                    {txDate ? format(txDate, 'dd/MM/yyyy') : ''}
                                                </td>
                                                <td style={{ ...tdStyle('center'), textTransform: 'uppercase', fontSize: '7.5px', color: '#333' }}>
                                                    {tx.code}
                                                </td>
                                                {/* Cột gộp: Tên + Diễn giải */}
                                                <td style={{ ...tdStyle('left'), maxWidth: '0', overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 700, fontSize: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#111' }}>
                                                        {objectName}
                                                    </div>
                                                    {tx.content && (
                                                        <div style={{ fontSize: '7.5px', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                                                            {tx.content}
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Loại phiếu — badge nhỏ */}
                                                <td style={{ ...tdStyle('center'), padding: '2px 2px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        background: tx.isReceipt ? '#2563eb' : '#0f766e',
                                                        color: '#fff',
                                                        borderRadius: '3px',
                                                        padding: '1px 4px',
                                                        fontSize: '7px',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.3px',
                                                        whiteSpace: 'nowrap',
                                                    }}>
                                                        {typeLabel}
                                                    </span>
                                                </td>
                                                {/* Thu — dương, không dấu */}
                                                <td style={{ ...tdStyle('right'), color: '#0d6e31', fontWeight: tx.isReceipt ? 'bold' : 'normal' }}>
                                                    {tx.isReceipt ? moneyFmt(amt) : ''}
                                                </td>
                                                {/* Chi — dương, không dấu */}
                                                <td style={{ ...tdStyle('right'), color: '#c00000', fontWeight: !tx.isReceipt ? 'bold' : 'normal' }}>
                                                    {!tx.isReceipt ? moneyFmt(amt) : ''}
                                                </td>
                                                {/* Tồn quỹ — dương, không dấu */}
                                                <td style={{ ...tdStyle('right'), color: rb >= 0 ? '#0070c0' : '#c00000', fontWeight: 'bold' }}>
                                                    {moneyFmt(rb)}
                                                </td>
                                            </tr>
                                        )
                                    }) : (
                                        <tr>
                                            <td colSpan={8} style={{ border: '0.5px solid #ccc', padding: '16px 4px', textAlign: 'center', color: '#aaa' }}>
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* ── Tổng cộng (trang cuối) ── */}
                                {isLastPage && txsWithBalance.length > 0 && (
                                    <tfoot>
                                        <tr style={{ backgroundColor: '#dce6f1' }}>
                                            <td colSpan={5} style={{ border: '0.5px solid #1a3a8f', padding: '3px 6px', fontWeight: 'bold', color: '#1a3a8f', textAlign: 'right', fontSize: '9px' }}>
                                                TỔNG CỘNG
                                            </td>
                                            <td style={{ border: '0.5px solid #1a3a8f', padding: '3px 5px', textAlign: 'right', color: '#0d6e31', fontWeight: 'bold', fontSize: '9px' }}>
                                                {moneyFmt(sumReceipt)}
                                            </td>
                                            <td style={{ border: '0.5px solid #1a3a8f', padding: '3px 5px', textAlign: 'right', color: '#c00000', fontWeight: 'bold', fontSize: '9px' }}>
                                                {moneyFmt(sumPayment)}
                                            </td>
                                            <td style={{ border: '0.5px solid #1a3a8f', padding: '3px 5px', textAlign: 'right', color: runBalance >= 0 ? '#0070c0' : '#c00000', fontWeight: 'bold', fontSize: '9px' }}>
                                                {moneyFmt(runBalance)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>

                            {/* ── Tóm tắt cuối kỳ (trang cuối) ── */}
                            {isLastPage && txsWithBalance.length > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                    <table style={{ borderCollapse: 'collapse', fontSize: '8.5px' }}>
                                        <tbody>
                                            {[
                                                ['Số dư đầu kỳ:', moneyFmt(openingBalance), '#555'],
                                                ['Tổng thu trong kỳ:', moneyFmt(sumReceipt), '#0d6e31'],
                                                ['Tổng chi trong kỳ:', moneyFmt(sumPayment), '#c00000'],
                                                ['Số dư cuối kỳ:', moneyFmt(runBalance), runBalance >= 0 ? '#0070c0' : '#c00000'],
                                            ].map(([label, val, col]) => (
                                                <tr key={label}>
                                                    <td style={{ padding: '2px 8px 2px 0', textAlign: 'right', color: '#444', whiteSpace: 'nowrap' }}>{label}</td>
                                                    <td style={{ padding: '2px 4px', textAlign: 'right', fontWeight: 'bold', color: col, whiteSpace: 'nowrap' }}>{val} ₫</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* ── Ký tên (trang cuối) ── */}
                            {isLastPage && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '9px', paddingLeft: '4px', paddingRight: '4px', marginTop: '6px' }}>
                                    {['Thủ Quỹ', 'Kế Toán', 'Giám Đốc'].map(role => (
                                        <div key={role} style={{ width: '30%' }}>
                                            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>{role}</p>
                                            <p style={{ fontStyle: 'italic', fontSize: '7.5px', margin: '0 0 28px 0', color: '#888' }}>(Ký, họ tên)</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* ── Footer ── */}
                            <div style={{
                                position: 'absolute',
                                bottom: '4mm',
                                left: '0',
                                right: '0',
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '7px',
                                color: '#bbb',
                                borderTop: '0.5px solid #ddd',
                                paddingTop: '2px',
                            }}>
                                <span>{setting?.website || 'hoasinhnamviet.thietkevuondao.com'}</span>
                                <span>Trang {pageIdx + 1}/{totalPages}</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }
)

// ─── Style helpers ─────────────────────────────────────────────────────────────
const thStyle = (color = '#fff', width = undefined) => ({
    border: '0.5px solid #5575b5',
    padding: '3px 4px',
    textAlign: 'center',
    color,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    ...(width ? { width } : {}),
})

const tdStyle = (align = 'left', color = '#000') => ({
    border: '0.5px solid #ccc',
    padding: '2px 4px',
    textAlign: align,
    color,
    verticalAlign: 'top',
})

FinancialLedgerPrintTemplate.displayName = 'FinancialLedgerPrintTemplate'

export default FinancialLedgerPrintTemplate
