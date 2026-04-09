import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintPaymentView = ({ payment, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: payment?.code ? `PC-${payment?.code}` : 'Phieu-chi',
    onAfterPrint: onAfterPrint,
  })

  useEffect(() => {
    if (payment) {
      reactToPrintFn()
    }
  }, [payment, reactToPrintFn])

  return (
    <div className="hidden">
      <PrintableContent
        ref={contentRef}
        setting={setting}
        payment={payment}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(
  ({ setting, payment }, ref) => {
    const now = new Date()
    const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

    const createdDate = new Date(payment?.paymentDate || payment?.createdAt || new Date())
    const day = createdDate.getDate().toString().padStart(2, '0')
    const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
    const year = createdDate.getFullYear()
    const printDateStr = `Ngày ${day} Tháng ${month} Năm ${year}`

    return (
      <div ref={ref}>
        <style dangerouslySetInnerHTML={{__html: `
          @page { size: A5 landscape; margin: 6mm 8mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-payment-a5 {
              width: 195mm !important;
              max-height: 136mm !important;
              overflow: hidden !important;
              padding: 5mm 8mm !important;
              box-sizing: border-box !important;
            }
          }
        `}} />

        <div className="print-payment-a5 mx-auto bg-white font-serif"
             style={{ width: '195mm', maxHeight: '136mm', padding: '5mm 8mm', boxSizing: 'border-box', overflow: 'hidden', color: '#000' }}>
          
          {/* Top header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '10px', fontFamily: 'sans-serif' }}>
            <span>{nowTime}</span>
            <span>In Chứng Từ</span>
          </div>

          {/* Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', paddingLeft: '14px', paddingRight: '10px' }}>
            <div style={{ width: '78px', height: '78px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={setting?.logo ? getPublicUrl(setting.logo) : "/images/logo/logo-nobackground.png"} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center', marginLeft: '-8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 'bold', textTransform: 'uppercase', color: '#e2362b', letterSpacing: '0.5px', marginBottom: '3px', lineHeight: 1.3 }}>
                {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
              </h1>
              <p style={{ color: '#1ab85c', fontWeight: 'bold', fontSize: '13px', marginBottom: '1px', lineHeight: 1.5 }}>
                Địa chỉ: {setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}
              </p>
              <div style={{ color: '#1976d2', fontSize: '11px', fontWeight: 'bold', lineHeight: 1.1, margin: '0 0 2px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ margin: '0 0 1px 0' }}>975767 788 - ngân hàng ACB chi nhánh phòng GD cao lãnh</div>
                <div>08290639 - ngân hàng ACB chi nhánh phòng GD cao lãnh</div>
              </div>
              <p style={{ color: '#8c52d4', fontWeight: 'bold', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
                 Điện thoại: {setting?.phone ? (setting.phone.includes("0868") ? setting.phone : setting.phone + " - 0868 759 588") : "088 635 7788 - 0868 759 588"}
                 {setting?.taxCode && <span> - MST: {setting.taxCode}</span>}
              </p>
            </div>
          </div>

          {/* Title */}
          <div style={{ position: 'relative', textAlign: 'center', marginBottom: '10px', height: '32px', lineHeight: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 'bold', textTransform: 'uppercase', color: '#3498db', letterSpacing: '2px', display: 'inline-block', margin: 0 }}>PHIẾU CHI</h2>
            <div style={{ position: 'absolute', right: '28px', top: '50%', transform: 'translateY(-50%)', color: '#e2362b', fontWeight: 'bold', fontSize: '13px' }}>
              Số: {payment?.code || payment?.paymentCode || payment?.receiptCode || payment?.voucherCode || ''}
            </div>
          </div>

          {/* Body */}
          <div style={{ paddingLeft: '18px', paddingRight: '18px', marginBottom: '6px', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', color: '#3498db', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>Họ tên người nhận tiền:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                {payment?.supplier?.supplierName || 
                 payment?.customer?.customerName || 
                 payment?.employee?.fullName || 
                 payment?.receiver?.name || ''}
              </span>
            </div>
            <div style={{ display: 'flex', color: '#e67e22', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>Địa chỉ:</span>
              <span>
                {payment?.supplier?.address || 
                 payment?.customer?.address || 
                 payment?.employee?.address || 
                 payment?.receiver?.address || ''}
              </span>
            </div>
            <div style={{ display: 'flex', color: '#8c52d4', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>Lý do nhận tiền:</span>
              <span>{payment?.reason || payment?.note || (payment?.purchaseOrder?.code ? `Thanh toán tiền hàng cho đơn hàng ${payment.purchaseOrder.code}` : (payment?.purchaseOrder ? 'Thanh toán tiền hàng' : ''))}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', fontSize: '15px', marginBottom: '2px' }}>
              <div style={{ display: 'flex', color: '#3498db' }}>
                  <span style={{ whiteSpace: 'nowrap', marginRight: '6px' }}>Số tiền:</span>
                  <span>{payment?.amount ? payment.amount.toLocaleString('vi-VN') : '0'}</span>
              </div>
              <div style={{ display: 'flex', color: '#1ab85c' }}>
                <span style={{ whiteSpace: 'nowrap', marginLeft: '24px', marginRight: '6px' }}>( Viết bằng chữ ):</span>
                <span>{payment?.amount ? toVietnamese(payment?.amount) : 'Không đồng'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '35px', color: '#8c52d4', fontSize: '15px', marginTop: '2px' }}>
              <div style={{ display: 'flex' }}>
                <span style={{ marginRight: '6px' }}>Kèm theo</span>
                <span style={{ marginRight: '6px' }}>0</span>
                <span>( chứng từ gốc )</span>
              </div>
              <div style={{ display: 'flex' }}>
                <span style={{ marginRight: '6px' }}>HĐ:</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div style={{ marginTop: '5px', textAlign: 'right', paddingRight: '12%', marginBottom: '8px' }}>
            <span style={{ color: '#e2362b', fontSize: '15px' }}>{printDateStr}</span>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '50px', paddingRight: '50px', color: '#e2362b', fontWeight: 'bold', fontSize: '15px', textAlign: 'center' }}>
            <div style={{ width: '33%' }}>Người nhận tiền</div>
            <div style={{ width: '33%' }}>Thủ Quỹ</div>
            <div style={{ width: '33%' }}>Người duyệt</div>
          </div>
        </div>
      </div>
    )
  }
)

PrintableContent.displayName = 'PrintableContent'

export default PrintPaymentView
