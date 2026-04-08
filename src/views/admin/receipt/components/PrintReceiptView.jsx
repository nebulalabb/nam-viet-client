import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { getPublicUrl } from '@/utils/file'

const PrintReceiptView = ({ receipt, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: receipt?.receiptCode || receipt?.code ? `PT-${receipt?.receiptCode || receipt?.code}` : 'Phieu-thu',
    onAfterPrint: onAfterPrint,
  })

  useEffect(() => {
    if (receipt) {
      reactToPrintFn()
    }
  }, [receipt, reactToPrintFn])

  return (
    <div className="hidden">
      <PrintableContent
        ref={contentRef}
        setting={setting}
        receipt={receipt}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(
  ({ setting, receipt }, ref) => {
    const rDate = receipt?.receiptDate || receipt?.createdAt ? new Date(receipt?.receiptDate || receipt?.createdAt) : new Date();
    const dateStr = `Ngày ${rDate.getDate().toString().padStart(2, '0')} Tháng ${(rDate.getMonth() + 1).toString().padStart(2, '0')} Năm ${rDate.getFullYear()}`;

    const note = receipt?.note || receipt?.notes || (receipt?.invoice ? `Thu bán hàng hóa đơn ${receipt?.invoice?.orderCode || receipt?.invoice?.code}` : '');

    return (
      <div ref={ref}>
        <style dangerouslySetInnerHTML={{__html: `
          @page { size: A5 landscape; margin: 6mm 8mm; }
          @media print {
            body { margin: 0; padding: 0; }
            .print-receipt-a5 {
              width: 195mm !important;
              max-height: 136mm !important;
              overflow: hidden !important;
              padding: 5mm 8mm !important;
              box-sizing: border-box !important;
            }
          }
        `}} />

        <div className="print-receipt-a5 mx-auto bg-white font-['Times_New_Roman',Times,serif]"
             style={{ width: '195mm', maxHeight: '136mm', padding: '5mm 8mm', boxSizing: 'border-box', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '90px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2px' }}>
              <img src={setting?.logo ? getPublicUrl(setting.logo) : "/images/logo/logo-nobackground.png"} style={{ width: '75px', height: '75px', objectFit: 'contain' }} alt="Logo" />
            </div>
            <div style={{ flex: 1, textAlign: 'center', marginTop: '2px' }}>
              <h1 style={{ color: '#D64A38', fontWeight: 'bold', fontSize: '17px', letterSpacing: '0.5px', marginBottom: '3px', lineHeight: 1.3 }}>
                {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
              </h1>
              <p style={{ color: '#089c65', fontSize: '13px', fontWeight: 600, lineHeight: 1.5, margin: '0 0 1px 0' }}>
                Địa chỉ: {setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}
              </p>
              <p style={{ color: '#804297', fontSize: '13px', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
                Điện thoại: {setting?.phone || '088 635 7788 - 0868 759 588'}
                {setting?.taxCode && <span> - MST: {setting.taxCode}</span>}
              </p>
              <h2 style={{ marginTop: '12px', fontSize: '26px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: '#2CA5C9', lineHeight: 1.2 }}>
                PHIẾU THU
              </h2>
            </div>
            <div style={{ width: '130px', textAlign: 'right', paddingTop: '55px' }}>
               <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#089c65', margin: 0 }}>Số: {receipt?.receiptCode || receipt?.code}</p>
            </div>
          </div>

          {/* Content */}
          <div style={{ marginTop: '10px', paddingLeft: '24px', paddingRight: '24px', lineHeight: 1.7 }}>
            <div style={{ display: 'flex', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ color: '#D48625', minWidth: '155px', whiteSpace: 'nowrap' }}>Họ tên người nộp tiền: </span>
              <span style={{ color: '#3286A9', textTransform: 'uppercase', flex: 1 }}>{receipt?.receiver?.name || ''}</span>
            </div>
            <div style={{ display: 'flex', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ color: '#089c65', minWidth: '65px', whiteSpace: 'nowrap' }}>Địa chỉ: </span>
              <span style={{ color: '#804297', flex: 1 }}>{receipt?.receiver?.address || ''}</span>
            </div>
            <div style={{ display: 'flex', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ color: '#D48625', minWidth: '125px', whiteSpace: 'nowrap' }}>Lý do nộp tiền: </span>
              <span style={{ color: '#804297', flex: 1 }}>{note}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px', marginBottom: '2px' }}>
              <span style={{ color: '#D48625', marginRight: '6px', whiteSpace: 'nowrap' }}>Số tiền:</span>
              <span style={{ color: '#D64A38', marginRight: '35px' }}>{moneyFormat(receipt?.amount)}</span>
              <span style={{ color: '#089c65', marginRight: '6px', whiteSpace: 'nowrap' }}>( Viết bằng chữ ):</span>
              <span style={{ color: '#D64A38' }}>{toVietnamese(receipt?.amount)}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '15px' }}>
               <span style={{ color: '#3286A9', marginRight: '10px' }}>Kèm theo 1 ( chứng từ gốc )</span>
               {receipt?.invoice && (
                 <span style={{ color: '#3286A9' }}>HĐ: {receipt?.invoice?.orderCode || receipt?.invoice?.code || ''} - 0</span>
               )}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginTop: '10px', textAlign: 'center', paddingRight: '0' }}>
            <p style={{ color: '#804297', fontSize: '15px', margin: 0 }}>{dateStr}</p>
          </div>

          {/* Signatures */}
          <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontWeight: 'bold', color: '#D64A38', fontSize: '15px', paddingLeft: '50px', paddingRight: '50px' }}>
            <div style={{ width: '33%' }}>Người nộp tiền</div>
            <div style={{ width: '33%' }}>Thủ Quỹ</div>
            <div style={{ width: '33%' }}>Giám Đốc</div>
          </div>
        </div>
      </div>
    );
  }
)

PrintableContent.displayName = 'PrintableContent'

export default PrintReceiptView
