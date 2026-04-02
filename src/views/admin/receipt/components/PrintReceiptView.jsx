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
    const dateStr = `Ngày ${rDate.getDate().toString().padStart(2, '0')} Tháng ${rDate.getMonth() + 1 < 10 ? '0' : ''}${rDate.getMonth() + 1} Năm ${rDate.getFullYear()}`;

    const note = receipt?.note || receipt?.notes || (receipt?.invoice ? `Thu bán hàng hóa đơn ${receipt?.invoice?.orderCode || receipt?.invoice?.code}` : '');

    return (
      <div ref={ref} className="mx-auto max-w-4xl bg-white p-10 font-['Times_New_Roman',Times,serif]">
        
        {/* Header Flex */}
        <div className="flex justify-between items-start">
          {/* Logo */}
          <div className="w-[140px] flex flex-col items-center mt-2">
            {setting?.logo ? (
              <img src={getPublicUrl(setting.logo)} className="w-[100px] h-[100px] object-contain" alt="Logo" />
            ) : (
              <div className="flex w-[100px] h-[100px] border items-center justify-center font-bold text-gray-400">LOGO</div>
            )}
            <div className="text-[#D64A38] font-bold text-sm mt-1 tracking-widest uppercase">NAM VIỆT</div>
          </div>

          {/* Company Info */}
          <div className="flex-1 text-center mt-6">
            <h1 className="text-[#D64A38] font-bold text-[22px] tracking-wide mb-1">{setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}</h1>
            <p className="text-[#089c65] text-[15px] font-semibold leading-relaxed">Địa chỉ: {setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}</p>
            <p className="text-[#804297] text-[15px] font-semibold leading-relaxed">Điện thoại: {setting?.phone || '088 635 7788 - 0868 759 588'}</p>
            
            <h2 className="mt-8 text-[32px] font-bold uppercase tracking-wider text-[#2CA5C9]">
              PHIẾU THU
            </h2>
          </div>

          {/* Receipt Number */}
          <div className="w-[180px] text-right mt-16 pt-[70px]">
             <p className="text-[15px] font-bold text-[#089c65]">Số: {receipt?.receiptCode || receipt?.code}</p>
          </div>
        </div>

        {/* Content Details */}
        <div className="mt-[20px] space-y-1.5 text-[17px] px-10">
          <div className="flex">
            <span className="text-[#D48625] min-w-[170px]">Họ tên người nộp tiền: </span>
            <span className="text-[#3286A9] uppercase flex-1">{receipt?.receiver?.name || ''}</span>
          </div>
          <div className="flex">
            <span className="text-[#089c65] min-w-[70px]">Địa chỉ: </span>
            <span className="text-[#804297] flex-1">{receipt?.receiver?.address || ''}</span>
          </div>
          <div className="flex">
            <span className="text-[#D48625] min-w-[130px]">Lý do nộp tiền: </span>
            <span className="text-[#804297] flex-1">{note}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-[#D48625] mr-2">Số tiền:</span>
            <span className="text-[#D64A38] mr-[50px]">{moneyFormat(receipt?.amount)}</span>
            <span className="text-[#089c65] mr-2">( Viết bằng chữ ):</span>
            <span className="text-[#D64A38]">{toVietnamese(receipt?.amount)}</span>
          </div>
          
          <div className="flex items-center">
             <span className="text-[#3286A9] w-[350px]">Kèm theo 1 ( chứng từ gốc )</span>
             {receipt?.invoice && (
               <span className="text-[#3286A9]">HĐ: {receipt?.invoice?.orderCode || receipt?.invoice?.code || ''} - 0</span>
             )}
          </div>
        </div>

        {/* Date Row */}
        <div className="mt-6 flex justify-end pr-[100px]">
          <p className="text-[#804297] text-[17px]">{dateStr}</p>
        </div>

        {/* Signatures */}
        <div className="mt-4 flex justify-between text-center font-bold text-[#D64A38] text-[18px] px-[80px]">
          <div className="w-1/3">
            Người nộp tiền
          </div>
          <div className="w-1/3">
            Thủ Quỹ
          </div>
          <div className="w-1/3 flex flex-col items-center">
            <span className="mb-[100px]">Giám Đốc</span>
          </div>
        </div>
      </div>
    );
  }
)

PrintableContent.displayName = 'PrintableContent'

export default PrintReceiptView
