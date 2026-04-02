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
  
  // Calculate total payment based on POSTED receipts
  const postedReceipts = invoice?.paymentReceipts?.filter(r => r.isPosted) || []
  const totalPaid = postedReceipts.reduce((sum, r) => sum + Number(r.amount || 0), 0)

  // Invoice total
  const totalAmount = Number(invoice?.totalAmount || invoice?.total || 0)

  // currentDebt is the realtime debt. To find previous debt, subtract the unpaid amount of THIS invoice.
  // unpaid amount of this invoice = totalAmount - totalPaid.
  const currentDebt = Number(invoice?.customer?.currentDebt || 0)
  const unpaidThisInvoice = totalAmount - totalPaid
  const oldDebt = currentDebt - unpaidThisInvoice
  
  // If customer has prepaid credit (negative oldDebt), add it to payment line
  const prepaidCredit = oldDebt < 0 ? Math.abs(oldDebt) : 0
  const displayOldDebt = oldDebt > 0 ? oldDebt : 0
  
  // Effective payment = actual receipts + prepaid credit from debt
  const effectiveTotalPaid = totalPaid + prepaidCredit
  
  // Total debt = Old debt + Invoice total - Effective payment
  const totalDebt = displayOldDebt + totalAmount - effectiveTotalPaid

  // Date formatted as "Ngày dd tháng MM năm yyyy"
  const createdDate = new Date(invoice?.createdAt || invoice?.orderDate || new Date())
  const day = createdDate.getDate().toString().padStart(2, '0')
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
  const year = createdDate.getFullYear()
  const printDateStr = `Ngày ${day} tháng ${month} năm ${year}`

  // Top header print time
  const now = new Date()
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

  return (
    <div ref={ref} className="font-serif text-black mx-auto bg-white p-8 w-[210mm] min-h-[297mm] text-sm">
      {/* Top small header */}
      <div className="flex justify-between items-center mb-2 text-xs">
        <span>{nowTime}</span>
        <span>In Chứng Từ</span>
      </div>

      {/* Brand Header */}
      <div className="flex items-start mb-6">
        {/* Mock Logo Space */}
        <div className="w-24 h-24 mr-4 flex items-center justify-center flex-shrink-0">
          <img src="/logo.png" alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
        </div>
        
        <div className="flex-1">
          <h1 className="text-xl font-bold uppercase mb-1">{setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}</h1>
          <p className="mb-1 leading-tight">{setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}</p>
          <p className="mb-1 leading-tight">Điện thoại: {setting?.phone || '088 635 7788 - 0868 759 588'}</p>
          {setting?.bankAccount1 ? <p className="mb-0 leading-tight">{setting.bankAccount1}</p> : <p className="mb-1 leading-tight">TK Lê Trung Thành: 9 75 76 77 88 - NH ACB CN Đồng Tháp</p>}
          {setting?.bankAccount2 ? <p className="mb-0 leading-tight">{setting.bankAccount2}</p> : <p className="mb-0 leading-tight">TK Lê Trung Thành: 09 75 76 77 88 - NH SACOMBANK CN Đồng Tháp.</p>}
        </div>
      </div>

      {/* Title */}
      <div className="relative text-center mb-8">
        <h2 className="text-2xl font-bold uppercase">HÓA ĐƠN BÁN HÀNG</h2>
        <div className="absolute right-0 top-0 text-sm">
          Số HĐ: {invoice?.orderCode || invoice?.code}
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <div className="flex">
          <span className="w-32">Tên khách hàng:</span>
          <span className="font-bold uppercase">{invoice?.customer?.customerName}</span>
        </div>
        <div className="flex mt-1">
          <span className="w-32">Liên hệ:</span>
          <span>{invoice?.recipientName || invoice?.customer?.contactPerson || ''}</span>
        </div>
        <div className="flex mt-1">
          <span className="w-32">MST:</span>
          <span>{invoice?.customer?.taxCode || ''}</span>
        </div>
        <div className="flex mt-1">
          <span className="w-32">Địa chỉ:</span>
          <span>{invoice?.deliveryAddress || invoice?.customer?.address || ''}</span>
        </div>
        <div className="flex mt-1">
          <span className="w-32">Điện thoại:</span>
          <span>{invoice?.recipientPhone || invoice?.customer?.phone || ''}</span>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-2 border-collapse border border-black">
        <thead>
          <tr>
            <th className="border border-black p-1 text-center w-12 font-bold">TT</th>
            <th className="border border-black p-1 text-center font-bold">Tên sản phẩm</th>
            <th className="border border-black p-1 text-center w-20 font-bold">ĐVT</th>
            <th className="border border-black p-1 text-center w-20 font-bold">SL</th>
            <th className="border border-black p-1 text-center w-28 font-bold">Giá</th>
            <th className="border border-black p-1 text-center w-32 font-bold">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={`item-${index}`}>
              <td className="border border-black p-1 text-center">{index + 1}</td>
              <td className="border border-black p-1 px-2">{item.product?.productName || item.productName || 'Sản phẩm không xác định'}</td>
              <td className="border border-black p-1 text-center">{item.unitName || item.product?.unit || item.unit?.name || ''}</td>
              <td className="border border-black p-1 text-center">{item.quantity}</td>
              <td className="border border-black p-1 text-right pr-2">{moneyFormat(item.price || item.unitPrice)}</td>
              <td className="border border-black p-1 text-right pr-2">{moneyFormat(item.total)}</td>
            </tr>
          ))}
          
          {/* Summary Rows */}
          <tr>
            <td colSpan={5} className="border border-black p-1 px-2 font-bold">Tổng cộng:</td>
            <td className="border border-black p-1 text-right pr-2 font-bold">{moneyFormat(totalAmount)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black p-1 px-2">Thanh toán:</td>
            <td className="border border-black p-1 text-right pr-2">{moneyFormat(effectiveTotalPaid)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black p-1 px-2">Nợ cũ:</td>
            <td className="border border-black p-1 text-right pr-2">{moneyFormat(displayOldDebt)}</td>
          </tr>
          <tr>
            <td colSpan={5} className="border border-black p-1 px-2 font-bold text-lg">Tổng công nợ:</td>
            <td className="border border-black p-1 text-right pr-2 font-bold text-lg">
              {totalDebt < 0 ? `+${moneyFormat(Math.abs(totalDebt))}` : moneyFormat(totalDebt)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* In Words & Notes */}
      <div className="mb-8">
        <p className="mb-1">
          Viết bằng chữ: <span className="italic">{toVietnamese(Math.abs(totalDebt))}</span>
        </p>
        <p className="mb-1">
          Ghi chú: {invoice?.note || ''}
        </p>
      </div>

      {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center mt-12 text-sm">
          <div>
            <p className="font-bold">Người nhận hàng</p>
            <p className="text-sm"> </p> {/* Matching space to keep align */}
            <div className="h-24"></div>
            <p>{invoice?.customer?.customerName}</p>
          </div>
          <div>
            <p className="italic text-right mb-1 -mr-20">{printDateStr}</p>
            <p className="font-bold">Người viết hóa đơn</p>
            <p className="text-sm"> </p>
            <div className="h-24"></div>
            <p>{invoice?.creator?.fullName || invoice?.user?.fullName || setting?.brandName}</p>
          </div>
        </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

export default PrintInvoiceView
