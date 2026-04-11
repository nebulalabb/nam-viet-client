import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { getPublicUrl } from '@/utils/file'

// ─── Formatters ───────────────────────────────────────────────────────────────
const moneyFmt = (v) => v ? new Intl.NumberFormat('vi-VN').format(Math.abs(Number(v) || 0)) : '-'
const qtyFmt = (v) => v ? new Intl.NumberFormat('vi-VN').format(Number(v) || 0) : '-'

const InventoryPrintTemplate = React.forwardRef(
  ({ reportData = [], filters = {}, setting } = {}, ref) => {
    const now = new Date()
    const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}  ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`

    const fromDate = filters?.fromDate ? format(new Date(filters.fromDate), 'dd/MM/yyyy') : ''
    const toDate = filters?.toDate ? format(new Date(filters.toDate), 'dd/MM/yyyy') : ''
    
    let periodLabel = ''
    if (filters?.fromDate) {
        const d = new Date(filters.fromDate)
        periodLabel = `Tháng ${d.getMonth() + 1} / ${d.getFullYear()}`
    }

    const reportDataArray = Array.isArray(reportData) ? reportData : []

    // Totals
    const totalAll = {
      openingQty: reportDataArray.reduce((s, i) => s + Number(i.openingQuantity || 0), 0),
      openingAmount: reportDataArray.reduce((s, i) => s + Number(i.openingAmount || 0), 0),
      inQty: reportDataArray.reduce((s, i) => s + Number(i.quantityIn || 0), 0),
      inAmount: reportDataArray.reduce((s, i) => s + Number(i.amountIn || 0), 0),
      outQty: reportDataArray.reduce((s, i) => s + Number(i.quantityOut || 0), 0),
      outAmount: reportDataArray.reduce((s, i) => s + Number(i.amountOut || 0), 0),
      closingQty: reportDataArray.reduce((s, i) => s + Number(i.closingQuantity || 0), 0),
      closingAmount: reportDataArray.reduce((s, i) => s + Number(i.closingAmount || 0), 0),
    }

    const logoSrc = setting?.logo
      ? (setting.logo.startsWith('http') ? setting.logo : window.location.origin + getPublicUrl(setting.logo))
      : (typeof window !== 'undefined' ? window.location.origin : '') + '/images/logo/logo-nobackground.png'

    return (
      <div style={{ display: 'none' }}>
        <div ref={ref}>
          <style dangerouslySetInnerHTML={{ __html: `
              @page { size: A4 landscape; margin: 8mm; }
              @media print {
                  body { margin: 0; padding: 0; }
                  .page-break { page-break-after: always; break-after: page; }
                  table { page-break-inside: auto; border-collapse: collapse; width: 100%; }
                  tr { page-break-inside: avoid; page-break-after: auto; }
                  thead { display: table-header-group; }
                  tfoot { display: table-footer-group; }
              }
          ` }} />

          <div
            style={{
                width: '100%',
                color: '#000',
                fontSize: '8.5px',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#fff',
                padding: '0 2mm',
            }}
          >
            {/* ── Timestamp dòng trên ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5px', color: '#888', marginBottom: '3px' }}>
                <span>{nowTime}</span>
            </div>

            {/* ── Header trang ── */}
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                <div style={{ width: '56px', height: '56px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, fontSize: '8px', lineHeight: 1.55 }}>
                    <p style={{ margin: '0 0 1px 0', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#c00000' }}>
                        {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
                    </p>
                    <p style={{ margin: '0 0 1px 0' }}>{setting?.address || 'QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp'}</p>
                    <p style={{ margin: 0, color: '#0070c0', fontWeight: 'bold' }}>
                        ĐT: {setting?.phone || '0886 357 788'}
                    </p>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', color: '#c00000', letterSpacing: '1px' }}>
                    BÁO CÁO TỔNG HỢP XUẤT NHẬP TỒN
                </h2>
                {periodLabel && (
                    <p style={{ margin: '0 0 1px 0', fontSize: '10px', fontWeight: 'bold', color: '#1a3a8f' }}>
                        {periodLabel}
                    </p>
                )}
                <p style={{ margin: 0, fontSize: '9px', color: '#444' }}>
                    Từ: <strong>{fromDate}</strong> &nbsp;—&nbsp; Đến: <strong>{toDate}</strong>
                    &emsp; | &emsp; In lúc: {format(now, 'HH:mm dd/MM/yyyy')}
                </p>
            </div>

            {/* ── Bảng Dữ Liệu ── */}
            {reportDataArray.length > 0 ? (
                <div style={{ marginBottom: '25px', pageBreakInside: 'avoid' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px', marginBottom: '4px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1a3a8f' }}>
                            <th rowSpan={2} style={thStyle('#fff', '20px')}>STT</th>
                            <th rowSpan={2} style={thStyle('#fff', '180px')}>Tên hàng hóa</th>
                            <th rowSpan={2} style={thStyle('#fff', '40px')}>ĐVT</th>
                            <th colSpan={2} style={thStyle('#fff', '100px')}>Tồn đầu</th>
                            <th colSpan={2} style={thStyle('#90ee90', '100px')}>Nhập</th>
                            <th colSpan={2} style={thStyle('#ffbbbb', '100px')}>Xuất</th>
                            <th colSpan={2} style={thStyle('#aaddff', '100px')}>Tồn cuối</th>
                            <th rowSpan={2} style={thStyle('#fff', '50px')}>Đơn giá</th>
                        </tr>
                        <tr style={{ backgroundColor: '#2f4fa8' }}>
                            {/* Tồn đầu */}
                            <th style={thStyle('#fff', '30px')}>Số lượng</th>
                            <th style={thStyle('#fff', '70px')}>Thành tiền</th>
                            {/* Nhập */}
                            <th style={thStyle('#90ee90', '30px')}>Số lượng</th>
                            <th style={thStyle('#90ee90', '70px')}>Thành tiền</th>
                            {/* Xuất */}
                            <th style={thStyle('#ffbbbb', '30px')}>Số lượng</th>
                            <th style={thStyle('#ffbbbb', '70px')}>Thành tiền</th>
                            {/* Tồn cuối */}
                            <th style={thStyle('#aaddff', '30px')}>Số lượng</th>
                            <th style={thStyle('#aaddff', '70px')}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                      {reportDataArray.map((item, i) => {
                          const isEven = i % 2 === 1
                          return (
                              <tr key={`item-${i}`} style={{ backgroundColor: isEven ? '#f4f6ff' : '#fff' }}>
                                  <td style={tdStyle('center', '#777')}>{i + 1}</td>
                                  <td style={{ ...tdStyle('left'), fontWeight: 'bold', color: '#111' }}>
                                      {item.product?.name || item.product?.productName}
                                  </td>
                                  <td style={tdStyle('center')}>{item.product?.unit?.name || item.product?.unit?.unitName || ''}</td>
                                  
                                  {/* Opening */}
                                  <td style={tdStyle('right')}>{qtyFmt(item.openingQuantity)}</td>
                                  <td style={tdStyle('right')}>{moneyFmt(item.openingAmount)}</td>
                                  
                                  {/* In */}
                                  <td style={{ ...tdStyle('right'), color: '#0d6e31' }}>{qtyFmt(item.quantityIn)}</td>
                                  <td style={{ ...tdStyle('right'), color: '#0d6e31' }}>{moneyFmt(item.amountIn)}</td>
                                  
                                  {/* Out */}
                                  <td style={{ ...tdStyle('right'), color: '#c00000' }}>{qtyFmt(item.quantityOut)}</td>
                                  <td style={{ ...tdStyle('right'), color: '#c00000' }}>{moneyFmt(item.amountOut)}</td>
                                  
                                  {/* Closing */}
                                  <td style={{ ...tdStyle('right'), color: '#0070c0', fontWeight: 'bold' }}>{qtyFmt(item.closingQuantity)}</td>
                                  <td style={{ ...tdStyle('right'), color: '#0070c0', fontWeight: 'bold' }}>{moneyFmt(item.closingAmount)}</td>
                                  
                                  {/* Default Price */}
                                  <td style={tdStyle('right')}>{moneyFmt(item.averageUnitPrice)}</td>
                              </tr>
                          )
                      })}
                    </tbody>
                    
                    {/* TFoot */}
                    <tfoot>
                        <tr style={{ backgroundColor: '#dce6f1' }}>
                            <td colSpan={3} style={{ border: '0.5px solid #1a3a8f', padding: '4px 6px', fontWeight: 'bold', color: '#1a3a8f', textAlign: 'center', fontSize: '9px' }}>
                                TỔNG CỘNG
                            </td>
                            {/* Opening */}
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontSize: '9px' }}>
                                {qtyFmt(totalAll.openingQty)}
                            </td>
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', fontWeight: 'bold', fontSize: '9px' }}>
                                {moneyFmt(totalAll.openingAmount)}
                            </td>
                            
                            {/* In */}
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#0d6e31', fontWeight: 'bold', fontSize: '9px' }}>
                                {qtyFmt(totalAll.inQty)}
                            </td>
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#0d6e31', fontWeight: 'bold', fontSize: '9px' }}>
                                {moneyFmt(totalAll.inAmount)}
                            </td>
                            
                            {/* Out */}
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#c00000', fontWeight: 'bold', fontSize: '9px' }}>
                                {qtyFmt(totalAll.outQty)}
                            </td>
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#c00000', fontWeight: 'bold', fontSize: '9px' }}>
                                {moneyFmt(totalAll.outAmount)}
                            </td>
                            
                            {/* Closing */}
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#0070c0', fontWeight: 'bold', fontSize: '9px' }}>
                                {qtyFmt(totalAll.closingQty)}
                            </td>
                            <td style={{ border: '0.5px solid #1a3a8f', padding: '4px', textAlign: 'right', color: '#0070c0', fontWeight: 'bold', fontSize: '9px' }}>
                                {moneyFmt(totalAll.closingAmount)}
                            </td>
                            
                            <td style={{ border: '0.5px solid #1a3a8f' }}></td>
                        </tr>
                    </tfoot>
                  </table>
                </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ccc', marginTop: '10px' }}>
                  Không có dữ liệu
              </div>
            )}

            {/* ── Ký tên ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '10px', paddingLeft: '20px', paddingRight: '20px', marginTop: '20px', pageBreakInside: 'avoid' }}>
                {['Người Lập Bảng', 'Thủ Kho', 'Giám Đốc'].map(role => (
                    <div key={role} style={{ width: '30%' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>{role}</p>
                        <p style={{ fontStyle: 'italic', fontSize: '8.5px', margin: '0 0 40px 0', color: '#888' }}>(Ký, họ tên)</p>
                    </div>
                ))}
            </div>

          </div>
        </div>
      </div>
    )
  }
)

// ─── Style helpers ─────────────────────────────────────────────────────────────
const thStyle = (color = '#fff', width = undefined) => ({
    border: '0.5px solid #5575b5',
    padding: '4px',
    textAlign: 'center',
    color,
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    ...(width ? { width, minWidth: width, maxWidth: width } : {}),
})

const tdStyle = (align = 'left', color = '#000') => ({
    border: '0.5px solid #ccc',
    padding: '3px 4px',
    textAlign: align,
    color,
    verticalAlign: 'middle',
})

InventoryPrintTemplate.displayName = 'InventoryPrintTemplate'

export default InventoryPrintTemplate
