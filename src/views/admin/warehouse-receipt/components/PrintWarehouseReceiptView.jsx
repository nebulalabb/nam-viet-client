import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintWarehouseReceiptView = ({ receipt, setting, onAfterPrint }) => {
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
        setting={setting?.payload || setting}
        receipt={receipt}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(
  ({ setting, receipt }, ref) => (
    <div ref={ref} className="mx-auto max-w-3xl bg-white p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between">
        <div className="w-2/3">
          <h1 className="mb-1 font-bold text-lg">{setting?.brandName || 'CÔNG TY'}</h1>
          <p className="mb-1 text-sm">Địa chỉ: {setting?.address}</p>
          <p className="mb-1 text-sm">Điện thoại: {setting?.phone}</p>
          <p className="text-sm">Email: {setting?.email}</p>
        </div>
        <div className="w-1/3 text-center">
          <p className="text-sm font-bold">Mẫu số {receipt?.receiptType === 1 ? '01-VT' : '02-VT'}</p>
          <p className="text-xs italic">(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p className="text-xs italic">ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold uppercase">
        {receipt?.receiptType === 1 ? 'Phiếu Nhập Kho' : 'Phiếu Xuất Kho'}
      </h2>

      <p className="mb-8 text-center text-sm italic">
        Ngày {dateFormat(receipt?.receiptDate || receipt?.createdAt, true)}
      </p>

      <div className="mb-6 space-y-2 text-sm">
        <div className="flex gap-2">
          <span className="min-w-32">Họ tên người {receipt?.receiptType === 1 ? 'giao' : 'nhận'}:</span>
          <span className="font-semibold">{receipt?.partnerName || '................................................'}</span>
        </div>
        {/* <div className="flex gap-2">
            <span className="min-w-32">Đơn vị:</span>
            <span>................................................</span>
         </div> */}
        <div className="flex gap-2">
          <span className="min-w-32">Lý do {receipt?.receiptType === 1 ? 'nhập' : 'xuất'}:</span>
          <span>{receipt?.note || (receipt?.invoice ? `${receipt?.receiptType === 1 ? 'Nhập' : 'Xuất'} hàng theo hóa đơn ${receipt?.invoice?.code}` : '................................................')}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">{receipt?.receiptType === 1 ? 'Nhập tại' : 'Xuất tại'} kho:</span>
          <span className="font-semibold">{receipt?.warehouseName || '................................................'}</span>
        </div>
      </div>

      {/* Table */}
      <table className="mb-6 w-full text-sm border-collapse border border-black">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-2 text-center" rowSpan={2}>STT</th>
            <th className="border border-black p-2 text-center" rowSpan={2}>Tên nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm</th>
            <th className="border border-black p-2 text-center" rowSpan={2}>Mã số</th>
            <th className="border border-black p-2 text-center" rowSpan={2}>ĐVT</th>
            <th className="border border-black p-2 text-center" colSpan={2}>Số lượng</th>
            <th className="border border-black p-2 text-center" rowSpan={2}>Đơn giá</th>
            <th className="border border-black p-2 text-center" rowSpan={2}>Thành tiền</th>
          </tr>
          <tr className="bg-gray-100">
            <th className="border border-black p-1 text-center font-normal italic">Theo CT</th>
            <th className="border border-black p-1 text-center font-normal italic">Thực tế</th>
          </tr>
        </thead>
        <tbody>
          {receipt?.details?.map((item, index) => (
            <tr key={index}>
              <td className="border border-black p-2 text-center">{index + 1}</td>
              <td className="border border-black p-2">{item.productName}</td>
              <td className="border border-black p-2 text-center">{item.productCode}</td>
              <td className="border border-black p-2 text-center">{item.unitName}</td>
              <td className="border border-black p-2 text-center">{parseFloat(item.qtyDocument || 0).toLocaleString('vi-VN')}</td>
              <td className="border border-black p-2 text-center font-bold">{parseFloat(item.qtyActual || 0).toLocaleString('vi-VN')}</td>
              <td className="border border-black p-2 text-right">{moneyFormat(item.price)}</td>
              <td className="border border-black p-2 text-right">{moneyFormat(item.totalAmount)}</td>
            </tr>
          ))}
          {/* Empty rows filler if needed, or total row */}
          <tr className="font-bold">
            <td className="border border-black p-2 text-center" colSpan={4}>Cộng</td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-center">
              {/* {receipt?.details?.reduce((sum, item) => sum + item.qtyActual, 0).toLocaleString('vi-VN')} */}
            </td>
            <td className="border border-black p-2 text-center"></td>
            <td className="border border-black p-2 text-right">
              {moneyFormat(receipt?.details?.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0))}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mb-4 text-sm">
        <div className="flex gap-2">
          <span className="min-w-32">Tổng số tiền (viết bằng chữ):</span>
          <span className="italic font-bold">{toVietnamese(receipt?.details?.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0))}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Số chứng từ gốc kèm theo:</span>
          <span>{receipt?.invoice ? `01 (HĐ ${receipt?.invoice?.code})` : '..............................'}</span>
        </div>
      </div>

      <div className="mt-2 flex justify-end text-sm italic mb-4">
        Ngày ...... tháng ...... năm 20......
      </div>

      <div className="flex justify-between text-center text-sm">
        <div className="w-1/4">
          <p className="font-bold">Người lập phiếu</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
          <p className="font-semibold">{receipt?.createdByUser?.fullName}</p>
        </div>
        <div className="w-1/4">
          <p className="font-bold">Người {receipt?.receiptType === 1 ? 'giao hàng' : 'nhận hàng'}</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
          <p className="font-semibold">{receipt?.partnerName}</p>
        </div>
        <div className="w-1/4">
          <p className="font-bold">Thủ kho</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
        <div className="w-1/4">
          <p className="font-bold">Kế toán trưởng</p>
          <p className="text-xs italic">(Hoặc bộ phận có nhu cầu {receipt?.receiptType === 1 ? 'nhập' : 'lĩnh'})</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
      </div>
    </div>
  ),
)

PrintableContent.displayName = 'PrintableContent'

export default PrintWarehouseReceiptView
