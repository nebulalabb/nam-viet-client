import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { getPublicUrl } from '@/utils/file'

const PrintPurchaseOrderView = ({ purchaseOrder, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: purchaseOrder?.code ? `DHH-${purchaseOrder?.code}` : 'Don-Dat-Hang',
    onAfterPrint: onAfterPrint,
  })

  useEffect(() => {
    reactToPrintFn()
  }, [reactToPrintFn])

  return (
    <div className="hidden">
      <PrintableContent
        ref={contentRef}
        setting={setting}
        purchaseOrder={purchaseOrder}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(({ setting, purchaseOrder }, ref) => {
  const items = purchaseOrder?.details || []

  const totalAmount = Number(purchaseOrder?.totalCurrentAmount ?? purchaseOrder?.totalAmount ?? 0)
  const discountAmount = Number(purchaseOrder?.discountAmount ?? purchaseOrder?.totalDiscountAmount ?? purchaseOrder?.discount ?? 0)
  const taxAmount = Number(purchaseOrder?.totalTaxAmount ?? purchaseOrder?.taxAmount ?? 0)
  const otherCosts = Number(purchaseOrder?.otherCosts ?? 0)

  const createdDate = new Date(purchaseOrder?.orderDate || purchaseOrder?.createdAt || new Date())
  const day = createdDate.getDate().toString().padStart(2, '0')
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
  const year = createdDate.getFullYear()
  const printDateStr = `Ngày ${day} tháng ${month} năm ${year}`

  const now = new Date()
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

  const logoSrc = setting?.logo
    ? (setting.logo.startsWith('http') ? setting.logo : window.location.origin + getPublicUrl(setting.logo))
    : window.location.origin + '/images/logo/logo-nobackground.png'

  const creatorName =
    purchaseOrder?.creator?.fullName ||
    purchaseOrder?.user?.fullName ||
    purchaseOrder?.createdByUser?.fullName ||
    'Quản trị viên hệ thống'

  return (
    <div ref={ref}>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5 portrait; margin: 5mm 6mm; }
        @media print {
          body { margin: 0; padding: 0; }
          .ppo-wrap {
            width: 136mm !important;
            max-height: 198mm !important;
            overflow: hidden !important;
            padding: 3mm 5mm !important;
            font-size: 11px !important;
            box-sizing: border-box !important;
          }
          .ppo-wrap * { box-sizing: border-box !important; }
          .ppo-wrap table { border-collapse: collapse !important; }
          .ppo-wrap th, .ppo-wrap td { border: 0.5px solid #000 !important; }
        }
      `}} />

      <div
        className="ppo-wrap mx-auto bg-white"
        style={{
          width: '136mm',
          maxHeight: '198mm',
          padding: '3mm 5mm',
          boxSizing: 'border-box',
          overflow: 'hidden',
          color: '#000',
          fontSize: '11px',
          fontFamily: 'serif',
        }}
      >
        {/* ── Top timestamp ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#555', marginBottom: '2px', fontFamily: 'sans-serif' }}>
          <span>{nowTime}</span>
          <span>In Chứng Từ</span>
        </div>

        {/* ── Brand header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ width: '58px', height: '58px', flexShrink: 0, marginRight: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, fontSize: '9.5px', lineHeight: 1.45 }}>
            <p style={{ margin: '0 0 1px 0', fontWeight: 'bold', fontSize: '11.5px', textTransform: 'uppercase', color: '#c00000' }}>
              {setting?.brandName || 'CÔNG TY CỔ PHẦN HOÁ SINH NAM VIỆT'}
            </p>
            <p style={{ margin: '0 0 1px 0' }}>{setting?.address || 'QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp'}</p>
            {setting?.bankAccount1
              ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount1}</p>
              : <p style={{ margin: '0 0 1px 0' }}>TK cá nhân: 975767788 - Ngân hàng ACB Chi nhánh Phòng GD Cao Lãnh</p>
            }
            {setting?.bankAccount2
              ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount2}</p>
              : <p style={{ margin: '0 0 1px 0' }}>TK công ty: 08290639 - Ngân hàng ACB Chi nhánh Phòng GD Cao Lãnh</p>
            }
            <p style={{ margin: '0 0 1px 0', color: '#0070c0', fontWeight: 'bold' }}>
              Điện thoại: {setting?.phone || '0886357788 - 0868 759 588'}
            </p>
            {setting?.email && <p style={{ margin: '0 0 1px 0' }}>{setting.email}</p>}
            {setting?.website && <p style={{ margin: 0 }}>{setting.website}</p>}
          </div>
        </div>

        {/* ── Title ── */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '5px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#c00000' }}>
            HÓA ĐƠN ĐẶT HÀNG
          </h2>
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}>
            Số: {purchaseOrder?.poCode || purchaseOrder?.code}
          </div>
        </div>

        {/* ── Supplier Info ── */}
        <div style={{ marginBottom: '4px', fontSize: '11px', lineHeight: 1.65 }}>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Nhà cung cấp:</span>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
              {purchaseOrder?.supplier?.supplierName || purchaseOrder?.supplier?.name || ''}
            </span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>MST:</span>
            <span>{purchaseOrder?.supplier?.taxCode || ''}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Địa chỉ:</span>
            <span>{purchaseOrder?.supplier?.address || ''}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '100px', whiteSpace: 'nowrap' }}>Điện thoại:</span>
            <span>{purchaseOrder?.supplier?.phone || ''}</span>
          </div>
        </div>

        {/* ── Product Table ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '22px', fontWeight: 'bold' }}>TT</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold' }}>Tên sản phẩm</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '32px', fontWeight: 'bold' }}>DVT</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '26px', fontWeight: 'bold' }}>SL</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '56px', fontWeight: 'bold' }}>Giá</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '66px', fontWeight: 'bold' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`item-${index}`}>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px' }}>
                  {item.product?.productName || item.productName || ''}
                  {item.notes && <div style={{ fontSize: '9px', color: '#555', fontStyle: 'italic' }}>({item.notes})</div>}
                </td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>
                  {item.unitName || item.product?.unit?.unitName || item.unit?.unitName || 'Cái'}
                </td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.price)}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.total)}</td>
              </tr>
            ))}

            {/* Summary rows */}
            {discountAmount > 0 && (
              <tr>
                <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px', color: '#c00000' }}>Giảm giá:</td>
                <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right', color: '#c00000' }}>-{moneyFormat(discountAmount)}</td>
              </tr>
            )}
            {taxAmount > 0 && (
              <tr>
                <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px', color: '#0070c0' }}>Tiền thuế:</td>
                <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right', color: '#0070c0' }}>+{moneyFormat(taxAmount)}</td>
              </tr>
            )}
            {otherCosts > 0 && (
              <tr>
                <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px' }}>Chi phí khác:</td>
                <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right' }}>{moneyFormat(otherCosts)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>Tổng cộng:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right', fontWeight: 'bold' }}>{moneyFormat(totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* ── In words & Notes ── */}
        <div style={{ fontSize: '10px', lineHeight: 1.5, marginBottom: '3px' }}>
          <p style={{ margin: '0 0 1px 0', color: '#c00000' }}>
            Viết bằng chữ: <span style={{ fontStyle: 'italic' }}>{toVietnamese(totalAmount)}</span>
          </p>
          <p style={{ margin: 0 }}>Ghi chú: {purchaseOrder?.notes || purchaseOrder?.note || ''}</p>
        </div>

        {/* ── Date ── */}
        <div style={{ textAlign: 'right', paddingRight: '8px', marginBottom: '4px' }}>
          <span style={{ fontStyle: 'italic', fontSize: '11px', display: 'inline-block', width: '50%', textAlign: 'center' }}>
            {printDateStr}
          </span>
        </div>

        {/* ── Signatures ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '11px', paddingLeft: '8px', paddingRight: '8px' }}>
          <div style={{ width: '45%' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Người lập phiếu</p>
            <div style={{ height: '50px' }} />
            <p style={{ margin: 0 }}>{creatorName}</p>
          </div>
          <div style={{ width: '45%' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Nhà cung cấp</p>
            <p style={{ margin: '0 0 2px 0', fontStyle: 'italic', fontSize: '9px' }}>(Ký, họ tên)</p>
            <div style={{ height: '40px' }} />
          </div>
        </div>
      </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

export default PrintPurchaseOrderView
