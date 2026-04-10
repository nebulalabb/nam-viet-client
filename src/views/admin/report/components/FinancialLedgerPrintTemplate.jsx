import React from 'react'
import { format } from 'date-fns'
import { getPublicUrl } from '@/utils/file'

const moneyFmt = (v) =>
    new Intl.NumberFormat('vi-VN').format(v || 0)

const RECEIPT_TYPE_LABELS = {
    sales: 'Thu bán hàng',
    debt_collection: 'Thu nợ',
    refund: 'Hoàn trả',
}

const PAYMENT_TYPE_LABELS = {
    supplier_payment: 'Chi NCC',
    salary: 'Chi lương',
    operating_cost: 'Chi phí khác',
    refund: 'Hoàn tiền',
    other: 'Chi khác',
}

const ITEMS_PER_PAGE = 22

const FinancialLedgerPrintTemplate = React.forwardRef(({ transactions = [], filters = {}, setting } = {}, ref) => {
    const now = new Date()
    const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

    const fromDate = filters?.fromDate ? format(new Date(filters.fromDate), 'dd/MM/yyyy') : ''
    const toDate   = filters?.toDate   ? format(new Date(filters.toDate),   'dd/MM/yyyy') : ''

    // Split into pages
    const pages = []
    for (let i = 0; i < Math.max(1, transactions.length); i += ITEMS_PER_PAGE) {
        pages.push(transactions.slice(i, i + ITEMS_PER_PAGE))
    }
    const totalPages = pages.length

    const logoSrc = setting?.logo
        ? (setting.logo.startsWith('http') ? setting.logo : window.location.origin + getPublicUrl(setting.logo))
        : (typeof window !== 'undefined' ? window.location.origin : '') + '/images/logo/logo-nobackground.png'

    // Running balance — computed cumulatively across all transactions
    let runningBalance = 0

    return (
        <div ref={ref}>
            <style dangerouslySetInnerHTML={{ __html: `
                @page { size: A4 landscape; margin: 8mm 10mm; }
                @media print {
                    body { margin: 0; padding: 0; }
                    .flpt-page { page-break-after: always; break-after: page; }
                    .flpt-page:last-child { page-break-after: avoid; break-after: avoid; }
                }
            ` }} />

            {pages.map((pageItems, pageIdx) => {
                const startIdx = pageIdx * ITEMS_PER_PAGE

                return (
                    <div
                        key={pageIdx}
                        className="flpt-page"
                        style={{
                            width: '277mm',
                            minHeight: '190mm',
                            padding: '3mm 5mm',
                            boxSizing: 'border-box',
                            position: 'relative',
                            paddingBottom: '14mm',
                            color: '#000',
                            fontSize: '10px',
                            fontFamily: 'Arial, sans-serif',
                            backgroundColor: '#fff',
                        }}
                    >
                        {/* ── Top timestamp ── */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#555', marginBottom: '3px' }}>
                            <span>{nowTime}</span>
                            <span>In Chứng Từ</span>
                        </div>

                        {/* ── Brand header (only page 1) ── */}
                        {pageIdx === 0 && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '5px' }}>
                                {/* Logo */}
                                <div style={{ width: '62px', height: '62px', flexShrink: 0, marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                                {/* Company info */}
                                <div style={{ flex: 1, fontSize: '9px', lineHeight: 1.45 }}>
                                    <p style={{ margin: '0 0 1px 0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#c00000' }}>
                                        {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
                                    </p>
                                    <p style={{ margin: '0 0 1px 0' }}>
                                        {setting?.address || 'QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp'}
                                    </p>
                                    {setting?.bankAccount1
                                        ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount1}</p>
                                        : <p style={{ margin: '0 0 1px 0' }}>TK cá nhân - 975767788 - ngân hàng ACB chi nhánh phòng GD cao lãnh</p>
                                    }
                                    {setting?.bankAccount2
                                        ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount2}</p>
                                        : <p style={{ margin: '0 0 1px 0' }}>TK công ty - 08290639 - ngân hàng ACB chi nhánh phòng GD cao lãnh</p>
                                    }
                                    <p style={{ margin: '0 0 1px 0', color: '#0070c0', fontWeight: 'bold' }}>
                                        Điện thoại: {setting?.phone || '0886357788 - 0868 759 588'}
                                    </p>
                                    {setting?.email && <p style={{ margin: 0 }}>{setting.email}</p>}
                                </div>
                                {/* Title block aligned right */}
                                <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 3px 0', color: '#c00000', letterSpacing: '1px' }}>
                                        SỔ QUỸ CHI TIẾT
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '9px', color: '#333' }}>
                                        Từ ngày: <strong>{fromDate}</strong> — Đến ngày: <strong>{toDate}</strong>
                                    </p>
                                    <p style={{ margin: 0, fontSize: '8px', color: '#555' }}>
                                        Thời gian in: {format(now, 'dd/MM/yyyy HH:mm')}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Repeat title on subsequent pages */}
                        {pageIdx > 0 && (
                            <div style={{ textAlign: 'center', marginBottom: '5px' }}>
                                <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', color: '#c00000' }}>
                                    SỔ QUỸ CHI TIẾT (tiếp theo)
                                </h2>
                                <p style={{ margin: 0, fontSize: '8px', color: '#555' }}>
                                    Từ: <strong>{fromDate}</strong> — Đến: <strong>{toDate}</strong>
                                </p>
                            </div>
                        )}

                        {/* ── Main Table ── */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5px', marginBottom: '4px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f0f4ff' }}>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '26px', color: '#1a3a8f', fontWeight: 'bold' }}>STT</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '62px', color: '#1a3a8f', fontWeight: 'bold' }}>Ngày</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '68px', color: '#1a3a8f', fontWeight: 'bold' }}>Mã phiếu</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', color: '#1a3a8f', fontWeight: 'bold' }}>Khách hàng / Đối tượng</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', color: '#1a3a8f', fontWeight: 'bold' }}>Diễn giải</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '72px', color: '#1a3a8f', fontWeight: 'bold' }}>Loại phiếu</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '80px', color: '#089c65', fontWeight: 'bold' }}>Thu (VNĐ)</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '80px', color: '#c00000', fontWeight: 'bold' }}>Chi (VNĐ)</th>
                                    <th style={{ border: '0.5px solid #000', padding: '3px 4px', textAlign: 'center', width: '88px', color: '#0070c0', fontWeight: 'bold' }}>Tồn quỹ (VNĐ)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pageItems.length > 0 ? pageItems.map((tx, i) => {
                                    const globalIdx = startIdx + i + 1
                                    const txDate = tx.datetime ? new Date(tx.datetime) : null
                                    const typeLabel = tx.isReceipt
                                        ? (RECEIPT_TYPE_LABELS[tx.voucherType] || 'Thu khác')
                                        : (PAYMENT_TYPE_LABELS[tx.voucherType] || 'Chi khác')

                                    const amt = Number(tx.amount || 0)
                                    if (tx.isReceipt) runningBalance += amt
                                    else runningBalance -= amt

                                    const objectName = tx.partyName || tx.customerName || tx.supplierName || ''
                                    const isReceipt = tx.isReceipt

                                    return (
                                        <tr key={`${tx.type}-${tx.id}`} style={{ backgroundColor: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'center' }}>{globalIdx}</td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'center' }}>
                                                {txDate ? format(txDate, 'dd/MM/yyyy') : ''}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'center', textTransform: 'uppercase', fontSize: '8.5px' }}>
                                                {tx.code}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', fontWeight: 600, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {objectName}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', color: '#444', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {tx.content || ''}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'center', color: '#555' }}>
                                                {typeLabel}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'right', color: '#089c65', fontWeight: isReceipt ? 'bold' : 'normal' }}>
                                                {isReceipt ? moneyFmt(amt) : ''}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'right', color: '#c00000', fontWeight: !isReceipt ? 'bold' : 'normal' }}>
                                                {!isReceipt ? moneyFmt(amt) : ''}
                                            </td>
                                            <td style={{ border: '0.5px solid #bbb', padding: '2px 4px', textAlign: 'right', color: runningBalance >= 0 ? '#0070c0' : '#c00000', fontWeight: 'bold' }}>
                                                {moneyFmt(runningBalance)}
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan={9} style={{ border: '0.5px solid #bbb', padding: '12px 4px', textAlign: 'center', color: '#777' }}>
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* ── Signatures (last page only) ── */}
                        {pageIdx === totalPages - 1 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '10px', paddingLeft: '10px', paddingRight: '10px', marginTop: '6px' }}>
                                <div style={{ width: '30%' }}>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Thủ Quỹ</p>
                                    <p style={{ fontStyle: 'italic', fontSize: '8.5px', margin: '0 0 30px 0', color: '#555' }}>(Ký, họ tên)</p>
                                </div>
                                <div style={{ width: '30%' }}>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Kế Toán</p>
                                    <p style={{ fontStyle: 'italic', fontSize: '8.5px', margin: '0 0 30px 0', color: '#555' }}>(Ký, họ tên)</p>
                                </div>
                                <div style={{ width: '30%' }}>
                                    <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Giám Đốc</p>
                                    <p style={{ fontStyle: 'italic', fontSize: '8.5px', margin: '0 0 30px 0', color: '#555' }}>(Ký, họ tên)</p>
                                </div>
                            </div>
                        )}

                        {/* ── Footer ── */}
                        <div style={{
                            position: 'absolute',
                            bottom: '5mm',
                            left: '5mm',
                            right: '5mm',
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '7.5px',
                            color: '#888',
                            borderTop: '0.5px solid #ddd',
                            paddingTop: '2px',
                        }}>
                            <span>{setting?.website || 'hoasinhnamviet.thietkevuondao.com/financial-report'}</span>
                            <span>Trang {pageIdx + 1}/{totalPages}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
})

FinancialLedgerPrintTemplate.displayName = 'FinancialLedgerPrintTemplate'

export default FinancialLedgerPrintTemplate
