import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintInvoiceView = ({ invoice, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: invoice?.code ? `HD-${invoice?.code}` : 'Hoa-don',
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
    : window.location.origin + '/images/logo/logo-nobackground.png'

  const writerName =
    invoice?.creator?.role?.roleName ||
    invoice?.creator?.fullName ||
    invoice?.user?.fullName ||
    'Quản trị viên hệ thống'

  return (
    <div ref={ref}>
      <style dangerouslySetInnerHTML={{__html: `
        @page { size: A5 portrait; margin: 5mm 6mm; }
        @media print {
          body { margin: 0; padding: 0; }
          .piv-wrap {
            width: 136mm !important;
            max-height: 198mm !important;
            overflow: hidden !important;
            padding: 3mm 5mm !important;
            font-size: 11px !important;
            box-sizing: border-box !important;
          }
          .piv-wrap * { box-sizing: border-box !important; }
          .piv-wrap table { border-collapse: collapse !important; }
          .piv-wrap th, .piv-wrap td { border: 0.5px solid #000 !important; }
        }
      `}} />

      <div
        className="piv-wrap mx-auto bg-white"
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
          {/* Logo */}
          <div style={{ width: '58px', height: '58px', flexShrink: 0, marginRight: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logoSrc} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          </div>
          {/* Company info */}
          <div style={{ flex: 1, fontSize: '9.5px', lineHeight: 1.45 }}>
            <p style={{ margin: '0 0 1px 0', fontWeight: 'bold', fontSize: '11.5px', textTransform: 'uppercase', color: '#c00000' }}>
              {setting?.brandName || 'CÔNG TY CỔ PHẦN HOÁ SINH NAM VIỆT'}
            </p>
            <p style={{ margin: '0 0 1px 0' }}>{setting?.address || 'QL30/ấp Đông Mỹ, Mỹ Hội, Cao Lãnh, Đồng Tháp'}</p>
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
            {setting?.email && <p style={{ margin: '0 0 1px 0' }}>{setting.email}</p>}
            {setting?.website && <p style={{ margin: 0 }}>{setting.website}</p>}
          </div>
        </div>

        {/* ── Title ── */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: '5px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0, color: '#c00000' }}>
            HÓA ĐƠN BÁN HÀNG
          </h2>
          <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '10px' }}>
            Số HĐ: {invoice?.orderCode || invoice?.code}
          </div>
        </div>

        {/* ── Customer Info ── */}
        <div style={{ marginBottom: '4px', fontSize: '11px', lineHeight: 1.65 }}>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '105px', whiteSpace: 'nowrap' }}>Tên khách hàng:</span>
            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{invoice?.customer?.customerName}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '105px', whiteSpace: 'nowrap' }}>MST:</span>
            <span>{invoice?.customer?.taxCode || ''}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '105px', whiteSpace: 'nowrap' }}>Địa chỉ:</span>
            <span>{invoice?.deliveryAddress || invoice?.customer?.address || ''}</span>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ minWidth: '105px', whiteSpace: 'nowrap' }}>Điện thoại:</span>
            <span>{invoice?.recipientPhone || invoice?.customer?.phone || ''}</span>
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
                  {item.product?.productName || item.productName || 'Sản phẩm không xác định'}
                  {item.gift && ' (Quà tặng)'}
                </td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>
                  {item.unitName || item.product?.unit?.unitName || item.unit?.name || ''}
                </td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.price || item.unitPrice)}</td>
                <td style={{ border: '0.5px solid #000', padding: '1px 3px', textAlign: 'right' }}>{moneyFormat(item.total)}</td>
              </tr>
            ))}

            {/* Summary rows */}
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>Tổng cộng:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right', fontWeight: 'bold' }}>{moneyFormat(totalAmount)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px' }}>Thanh toán:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right' }}>{moneyFormat(effectiveTotalPaid)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px' }}>Nợ cũ:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right' }}>{moneyFormat(displayOldDebt)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '0.5px solid #000', padding: '2px 5px', fontWeight: 'bold' }}>Tổng công nợ:</td>
              <td style={{ border: '0.5px solid #000', padding: '2px 5px', textAlign: 'right', fontWeight: 'bold' }}>
                {totalDebt < 0 ? `+${moneyFormat(Math.abs(totalDebt))}` : moneyFormat(totalDebt)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── In words & Notes ── */}
        <div style={{ fontSize: '10px', lineHeight: 1.5, marginBottom: '3px' }}>
          <p style={{ margin: '0 0 1px 0', color: '#c00000' }}>
            Viết bằng chữ: <span style={{ fontStyle: 'italic' }}>{toVietnamese(Math.abs(totalDebt))}</span>
          </p>
          <p style={{ margin: 0 }}>Ghi chú: {invoice?.note || ''}</p>
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
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Người nhận hàng</p>
            <div style={{ height: '50px' }} />
            <p style={{ margin: 0 }}>{invoice?.customer?.customerName}</p>
          </div>
          <div style={{ width: '45%' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 2px 0' }}>Người viết hóa đơn</p>
            <div style={{ height: '50px' }} />
            <p style={{ margin: 0 }}>{writerName}</p>
          </div>
        </div>
      </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

export default PrintInvoiceView
