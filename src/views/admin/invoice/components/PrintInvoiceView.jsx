import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintInvoiceView = ({ invoice, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: invoice?.code ? `HD-${invoice?.code}` : 'Hóa đơn',
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
        invoice={invoice}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(({ setting, invoice }, ref) => {
  const items = invoice?.details || invoice?.invoiceItems || []
  
  const postedReceipts = invoice?.paymentReceipts?.filter(r => r.isPosted) || []
  const totalPaid = postedReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0)
  const totalAmount = Number(invoice?.totalAmount || invoice?.total || 0)
  const currentDebt = Number(invoice?.customer?.currentDebt || 0)
  const unpaidThisInvoice = totalAmount - totalPaid
  const oldDebt = currentDebt - unpaidThisInvoice
  const prepaidCredit = oldDebt < 0 ? Math.abs(oldDebt) : 0
  const displayOldDebt = oldDebt > 0 ? oldDebt : 0
  const effectiveTotalPaid = totalPaid + prepaidCredit
  const totalDebt = displayOldDebt + totalAmount - effectiveTotalPaid

  const createdDate = new Date(invoice?.createdAt || invoice?.orderDate || new Date())
  const day = createdDate.getDate().toString().padStart(2, '0')
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
  const year = createdDate.getFullYear()
  const printDateStr = `Ngày ${day} tháng ${month} năm ${year}`

  const now = new Date()
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

  const logoSrc = setting?.logo
    ? (setting.logo.startsWith('http') ? setting.logo : window.location.origin + setting.logo)
    : window.location.origin + "/images/logo/logo-nobackground.png"

  return (
    <div ref={ref}>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5 portrait; margin: 5mm 6mm; }
        @media print {
          body { margin: 0; padding: 0; }
          .print-invoice-a5 {
            width: 136mm !important;
            max-height: 198mm !important;
            overflow: hidden !important;
            padding: 3mm 5mm !important;
            font-size: 11px !important;
            box-sizing: border-box !important;
          }
          .print-invoice-a5 * { box-sizing: border-box !important; }
          .print-invoice-a5 table { border-collapse: collapse !important; }
          .print-invoice-a5 th, .print-invoice-a5 td { border: 0.5px solid #000 !important; }
        }
      `}} />

      <div className="print-invoice-a5 mx-auto bg-white font-serif"
           style={{ width: '136mm', maxHeight: '198mm', padding: '3mm 5mm', boxSizing: 'border-box', overflow: 'hidden', color: '#000', fontSize: '11px' }}>
        
        {/* Top header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px', fontSize: '8px', fontFamily: 'sans-serif', color: '#666' }}>
          <span>{nowTime}</span>
          <span>In Chứng Từ</span>
        </div>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '6px' }}>
            <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1, fontSize: '10px', lineHeight: 1.4 }}>
            <h1 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 2px 0', lineHeight: 1.3 }}>
              {setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}
            </h1>
            <p style={{ margin: '0 0 1px 0' }}>{setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}</p>
            <p style={{ margin: '0 0 1px 0' }}>ĐT: {setting?.phone || '088 635 7788 - 0868 759 588'}</p>
            {setting?.taxCode && <p style={{ margin: '0 0 1px 0' }}>MST: {setting.taxCode}</p>}
            {setting?.bankAccount1
              ? <p style={{ margin: '0 0 1px 0' }}>{setting.bankAccount1}</p>
              : <p style={{ margin: '0 0 1px 0' }}>TK Lê Trung Thành: 9 75 76 77 88 - NH ACB CN Đồng Tháp</p>
            }
            {setting?.bankAccount2
              ? <p style={{ margin: 0 }}>{setting.bankAccount2}</p>
              : <p style={{ margin: 0 }}>TK Lê Trung Thành: 09 75 76 77 88 - NH SACOMBANK CN Đồng Tháp.</p>
            }
          </div>
        </div>

        {/* Title */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '5px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>HÓA ĐƠN BÁN HÀNG</h2>
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}>
            Số HĐ: {invoice?.orderCode || invoice?.code}
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '3px', fontSize: '11px', lineHeight: 1.5 }}>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>Khách hàng:</span>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{invoice?.customer?.customerName}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>Liên hệ:</span>
            <span>{invoice?.recipientName || invoice?.customer?.contactPerson || ''}</span>
          </div>
          {invoice?.customer?.taxCode && (
            <div style={{ display: 'flex' }}>
              <span style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>MST:</span>
              <span>{invoice?.customer?.taxCode}</span>
            </div>
          )}
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>Địa chỉ:</span>
            <span>{invoice?.deliveryAddress || invoice?.customer?.address || ''}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '80px', whiteSpace: 'nowrap' }}>Điện thoại:</span>
            <span>{invoice?.recipientPhone || invoice?.customer?.phone || ''}</span>
          </div>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2px', fontSize: '10px' }}>
          <thead>
            <tr>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '22px', fontWeight: 'bold' }}>TT</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', fontWeight: 'bold' }}>Tên sản phẩm</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '32px', fontWeight: 'bold' }}>ĐVT</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '28px', fontWeight: 'bold' }}>SL</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '58px', fontWeight: 'bold' }}>Giá</th>
              <th style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'center', width: '68px', fontWeight: 'bold' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`item-${index}`}>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{index + 1}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px' }}>
                  {item.product?.productName || item.productName || 'Sản phẩm không xác định'}
                  {item.gift && ' (Quà tặng)'}
                </td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{item.unitName || item.product?.unit || item.unit?.name || ''}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.price || item.unitPrice)}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.total)}</td>
              </tr>
            ))}
            
            {/* Summary Rows */}
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 3px', fontWeight: 'bold' }}>Tổng cộng:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'right', fontWeight: 'bold' }}>{moneyFormat(totalAmount)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 3px' }}>Thanh toán:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'right' }}>{moneyFormat(effectiveTotalPaid)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 3px' }}>Nợ cũ:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'right' }}>{moneyFormat(displayOldDebt)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 3px', fontWeight: 'bold', fontSize: '12px' }}>Tổng công nợ:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 3px', textAlign: 'right', fontWeight: 'bold', fontSize: '12px' }}>
                {totalDebt < 0 ? `+${moneyFormat(Math.abs(totalDebt))}` : moneyFormat(totalDebt)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* In Words & Notes */}
        <div style={{ marginBottom: '4px', fontSize: '10px', lineHeight: 1.5 }}>
          <p style={{ margin: '0 0 1px 0' }}>
            Viết bằng chữ: <span style={{ fontStyle: 'italic' }}>{toVietnamese(Math.abs(totalDebt))}</span>
          </p>
          <p style={{ margin: 0 }}>
            Ghi chú: {invoice?.note || ''}
          </p>
        </div>

        {/* Date - right aligned above "Người viết hóa đơn" */}
        <div style={{ textAlign: 'right', paddingRight: '10px', marginBottom: '4px' }}>
          <p style={{ fontStyle: 'italic', fontSize: '11px', margin: 0, display: 'inline-block', width: '45%', textAlign: 'center' }}>{printDateStr}</p>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', fontSize: '11px', paddingLeft: '10px', paddingRight: '10px' }}>
          <div style={{ width: '45%' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Người nhận hàng</p>
            <div style={{ height: '50px' }}></div>
            <p style={{ margin: 0 }}>{invoice?.customer?.customerName}</p>
          </div>
          <div style={{ width: '45%' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Người viết hóa đơn</p>
            <div style={{ height: '50px' }}></div>
            <p style={{ margin: 0 }}>{invoice?.creator?.fullName || invoice?.user?.fullName || setting?.brandName}</p>
          </div>
        </div>
      </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

export default PrintInvoiceView
