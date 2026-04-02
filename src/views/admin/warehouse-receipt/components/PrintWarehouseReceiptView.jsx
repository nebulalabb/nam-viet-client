import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintWarehouseReceiptView = ({ receipt, setting, onAfterPrint, isTransferType, displayTransferWarehouse, isTransferIn, isTransferOut }) => {
  const contentRef = useRef(null)

  const documentTitle = receipt?.code
    ? `${receipt.receiptType === 1 ? 'PN' : 'PX'}-${receipt.code}`
    : (receipt?.receiptType === 1 ? 'Phieu-nhap' : 'Phieu-xuat')

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle,
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
        isTransferType={isTransferType}
        displayTransferWarehouse={displayTransferWarehouse}
        isTransferIn={isTransferIn}
        isTransferOut={isTransferOut}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(({ setting, receipt, isTransferType, displayTransferWarehouse, isTransferIn, isTransferOut }, ref) => {
  const isImport = receipt?.receiptType === 1

  // Date formatting
  const createdDate = new Date(receipt?.receiptDate || receipt?.createdAt || new Date())
  const day = createdDate.getDate().toString().padStart(2, '0')
  const month = (createdDate.getMonth() + 1).toString().padStart(2, '0')
  const year = createdDate.getFullYear()
  const printDateStr = `Ngày ${day} tháng ${month} năm ${year}`

  // Top header print time
  const now = new Date()
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear().toString().slice(-2)}`

  return (
    <div ref={ref} className="font-serif text-black mx-auto bg-white w-[210mm] min-h-[297mm] text-sm p-4 relative">
      {/* Top small header */}
      <div className="flex justify-between items-center mb-1 text-xs">
        <span>{nowTime}</span>
        <span>In Chứng Từ</span>
      </div>

      {/* Brand Header */}
      <div className="flex items-start mb-4">
        {/* Logo */}
        <div className="w-24 h-24 mr-4 flex items-center justify-center flex-shrink-0">
          <img src={setting?.logo ? getPublicUrl(setting.logo) : "/logo.png"} alt="Logo" className="max-w-full max-h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
        </div>
        
        <div className="flex-1">
          <h1 className="text-xl font-bold uppercase mb-1 text-red-600">{setting?.brandName || 'CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT'}</h1>
          <p className="mb-0.5 leading-tight text-green-700 font-semibold text-[13px]">{setting?.address || 'Quốc Lộ 30, ấp Đông Mỹ, xã Mỹ Thọ, tỉnh Đồng Tháp.'}</p>
          <p className="mb-0.5 leading-tight text-blue-700 font-semibold text-[13px]">Điện thoại: {setting?.phone || '088 635 7788 - 0868 759 588'}</p>
          {setting?.bankAccount1 ? <p className="mb-0.5 leading-tight text-blue-700 font-semibold text-[13px]">{setting.bankAccount1}</p> : <p className="mb-0.5 leading-tight text-blue-700 font-semibold text-[13px]">TK Lê Trung Thành: 9 75 76 77 88 - NH ACB CN Đồng Tháp</p>}
          {setting?.bankAccount2 ? <p className="mb-0 leading-tight text-blue-700 font-semibold text-[13px]">{setting.bankAccount2}</p> : <p className="mb-0 leading-tight text-blue-700 font-semibold text-[13px]">TK Lê Trung Thành: 09 75 76 77 88 - NH SACOMBANK CN Đồng Tháp.</p>}
        </div>
      </div>

      {/* Title */}
      <div className="relative text-center mb-6">
        <h2 className="text-2xl font-bold uppercase text-blue-700">{isImport ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO'}</h2>
        <div className="absolute right-0 top-0 text-sm font-bold mt-2">
          Số HĐ: {receipt?.code}
        </div>
      </div>

      {/* Partner Info */}
      <div className="mb-4">
        <div className="flex text-fuchsia-600 font-semibold">
          <span className="w-40">{isTransferIn ? 'Kho xuất:' : isTransferOut ? 'Kho nhận:' : isImport ? 'Nhà cung cấp:' : 'Cty/Hộ kinh doanh:'}</span>
          <span className="uppercase">{isTransferType ? displayTransferWarehouse?.warehouseName : receipt?.partnerName || receipt?.supplier?.name || receipt?.customer?.customerName || ''}</span>
        </div>
        <div className="flex mt-1 text-green-600 font-semibold">
          <span className="w-40">Địa chỉ:</span>
          <span>{isTransferType ? displayTransferWarehouse?.address : receipt?.supplier?.address || receipt?.customer?.address || ''}</span>
        </div>
        <div className="flex mt-1 text-blue-600 font-semibold">
          <span className="w-40">Điện thoại:</span>
          <span>{isTransferType ? displayTransferWarehouse?.phone : receipt?.supplier?.phone || receipt?.customer?.phone || ''}</span>
        </div>
      </div>

      {/* Table */}
      <table className="mb-2 w-full text-sm border-collapse border border-black">
        <thead>
          <tr className="bg-white text-green-700">
            <th className="border border-black p-1 text-center font-bold w-12">TT</th>
            <th className="border border-black p-1 text-center font-bold">Tên sản phẩm</th>
            <th className="border border-black p-1 text-center font-bold w-20">ĐVT</th>
            <th className="border border-black p-1 text-center font-bold w-24">SL</th>
            <th className="border border-black p-1 text-center font-bold w-28">Ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {receipt?.details?.map((item, index) => (
            <tr key={index}>
              <td className="border border-black p-1 text-center">{index + 1}</td>
              <td className="border border-black p-1 font-semibold">{item.productName || item.product?.productName}</td>
              <td className="border border-black p-1 text-center font-semibold">{item.unitName || item.product?.unit?.name}</td>
              <td className="border border-black p-1 text-center font-bold">{parseFloat(item.qtyActual || item.quantity || 0).toLocaleString('vi-VN')}</td>
              <td className="border border-black p-1 text-center font-semibold text-xs">{item.notes}</td>
            </tr>
          ))}
          {/* Summary Row */}
          <tr className="text-red-600">
            <td className="border border-black p-1 text-left font-bold" colSpan={3}>Cộng:</td>
            <td className="border border-black p-1 text-center font-bold">
              {receipt?.details?.reduce((sum, item) => sum + parseFloat(item.qtyActual || item.quantity || 0), 0).toLocaleString('vi-VN')}
            </td>
            <td className="border border-black p-1 text-center"></td>
          </tr>
        </tbody>
      </table>

      {/* Ghi chú Invoice */}
      <div className="mb-8">
        <p className="text-red-600 italic text-sm font-semibold">
          Ghi chú: {receipt?.notes || receipt?.note || 'Hóa đơn sẽ được xuất khi khách nhận đủ và thanh toán hết đơn hàng.'}
        </p>
      </div>

      {/* Date & Signatures */}
      <div className="flex justify-end mb-2">
        <div className="text-sm font-semibold italic text-center pr-8 w-1/3">
          {printDateStr}
        </div>
      </div>
      
      <div className="flex justify-between text-center text-sm">
        <div className="w-1/2">
          <p className="font-bold">{isImport ? 'Người giao hàng' : 'Người nhận hàng'}</p>
        </div>
        <div className="w-1/2">
          <p className="font-bold">Thủ kho</p>
        </div>
      </div>
    </div>
  )
})

PrintableContent.displayName = 'PrintableContent'

export default PrintWarehouseReceiptView
