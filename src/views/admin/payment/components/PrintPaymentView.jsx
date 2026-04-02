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
    // Top header print time
    const now = new Date()
    const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

    // Date formatting
    const createdDate = new Date(payment?.paymentDate || payment?.createdAt || new Date())
    const day = createdDate.getDate().toString().padStart(2, '0')
    const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
    const year = createdDate.getFullYear()
    const printDateStr = `Ngày ${day} Tháng ${month} Năm ${year}`

    return (
      <div ref={ref} className="font-serif text-black mx-auto bg-white w-[210mm] min-h-[297mm] text-[17px] p-8 pt-6 relative">
        {/* Top small header */}
        <div className="flex justify-between items-center mb-4 text-sm font-sans">
          <span>{nowTime}</span>
          <span>In Chứng Từ</span>
        </div>

        {/* Brand Header */}
        <div className="flex items-center mb-6 pl-8 pr-4">
          {/* Logo */}
          <div className="w-[120px] h-[120px] flex items-center justify-center flex-shrink-0">
            <img src={setting?.logo ? getPublicUrl(setting.logo) : "/logo.png"} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
          </div>
          
          <div className="flex-1 text-center -ml-4">
            <h1 className="text-3xl font-bold uppercase text-[#e2362b] tracking-wider mb-2" style={{ textShadow: '0 0 1px rgba(226,54,43,0.3)' }}>{setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}</h1>
            <p className="text-[#1ab85c] font-bold text-lg mb-0.5">Địa chỉ: {setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}</p>
            <p className="text-[#8c52d4] font-bold text-lg">Điện thoại: {setting?.phone || '088 635 7788 - 0868 759 588'}</p>
          </div>
        </div>

        {/* Title & Receipt Number */}
        <div className="relative text-center mb-8 h-12">
          <h2 className="text-4xl font-bold uppercase text-[#3498db] tracking-wider inline-block">PHIẾU CHI</h2>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 text-[#e2362b] font-bold text-lg tracking-wide">
            Số: {payment?.code || ''}
          </div>
        </div>

        {/* Body Info */}
        <div className="space-y-1.5 px-6 mb-12">
          <div className="flex text-[#3498db] text-xl">
            <span className="whitespace-nowrap mr-2">Họ tên người nhận tiền:</span>
            <span className="uppercase">{payment?.receiver?.name || (payment?.receiverType === 'supplier' ? 'Nhà cung cấp' : '')}</span>
          </div>
          <div className="flex text-[#e67e22] text-xl">
            <span className="whitespace-nowrap mr-2">Địa chỉ:</span>
            <span>{payment?.receiver?.address || ''}</span>
          </div>
          <div className="flex text-[#8c52d4] text-xl">
            <span className="whitespace-nowrap mr-2">Lý do nhận tiền:</span>
            <span>{payment?.reason || payment?.note || (payment?.purchaseOrder ? `Thanh toán tiền hàng cho đơn hàng ${payment?.purchaseOrder?.code}` : '')}</span>
          </div>
          <div className="flex flex-wrap items-center text-xl">
            <div className="flex text-[#3498db]">
                <span className="whitespace-nowrap mr-2">Số tiền:</span>
                <span>{payment?.amount ? payment.amount.toLocaleString('vi-VN') : '0'}</span>
            </div>
            <div className="flex text-[#1ab85c]">
              <span className="whitespace-nowrap ml-6 mr-2">( Viết bằng chữ ):</span>
              <span>{payment?.amount ? toVietnamese(payment?.amount, true) : 'Không đồng'}</span>
            </div>
          </div>
          
          <div className="flex justify-between w-[480px] text-[#8c52d4] text-xl mt-1">
            <div className="flex">
              <span className="mr-2">Kèm theo</span>
              <span className="mr-2">0</span>
              <span>( chứng từ gốc )</span>
            </div>
            <div className="flex">
              <span className="mr-2">HĐ:</span>
              <span>0</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="flex justify-end pr-16 mb-8 text-lg">
          <span className="text-[#e2362b]">{printDateStr}</span>
        </div>

        {/* Signatures */}
        <div className="flex justify-between px-20 text-[#e2362b] font-bold text-xl text-center">
          <div className="w-1/3">Người nhận tiền</div>
          <div className="w-1/3">Thủ Quỹ</div>
          <div className="w-1/3 text-right">Người duyệt</div>
        </div>
      </div>
    )
  }
)

PrintableContent.displayName = 'PrintableContent'

export default PrintPaymentView
