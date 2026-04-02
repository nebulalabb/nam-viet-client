import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

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

import { getPublicUrl } from '@/utils/file'

const PrintableContent = React.forwardRef(
  ({ setting, purchaseOrder }, ref) => (
    <div ref={ref} className="mx-auto max-w-3xl bg-white p-6">
      <div className="mb-6 flex items-start">
        <div className="w-24 h-24 mr-4 flex items-center justify-center flex-shrink-0">
          <img src={setting?.logo ? getPublicUrl(setting.logo) : "/images/logo/logo-nobackground.png"} alt="Logo" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="mb-1 text-lg font-bold">{setting?.brandName || 'TÊN CÔNG TY'}</h1>
          <p className="mb-1 text-sm flex gap-2"><span>Địa chỉ: {setting?.address}</span></p>
          <p className="mb-1 text-sm flex gap-2"><span>Điện thoại: {setting?.phone}</span> {setting?.taxCode && <span>MST: {setting.taxCode}</span>}</p>
          <p className="text-sm">Email: {setting?.email}</p>
        </div>
      </div>

      <h2 className="mb-4 text-center text-xl font-bold uppercase">
        Đơn Đặt Hàng
      </h2>

      <p className="mb-4 text-center text-sm">
        Số: {purchaseOrder?.poCode || purchaseOrder?.code} - Ngày: {dateFormat(purchaseOrder?.orderDate || purchaseOrder?.createdAt, true)}
      </p>

      <div className="mb-6">
        <p className="mb-1 font-bold">Nhà cung cấp: {purchaseOrder?.supplier?.supplierName || purchaseOrder?.supplier?.name}</p>
        <p className="mb-1">
          Địa chỉ: {purchaseOrder?.supplier?.address || '—'}
        </p>
        <p>Điện thoại: {purchaseOrder?.supplier?.phone || '—'}</p>
        {purchaseOrder?.supplier?.taxCode && <p>MST: {purchaseOrder.supplier.taxCode}</p>}
        {purchaseOrder?.notes && <p className="mt-1 text-sm italic">Ghi chú: {purchaseOrder.notes}</p>}
      </div>

      <table className="mb-6 w-full border-collapse">
        <thead>
          <tr className="border bg-gray-100">
            <th className="border p-2 text-center text-sm font-semibold">STT</th>
            <th className="border p-2 text-center text-sm font-semibold">Nguyên liệu</th>
            <th className="border p-2 text-center text-sm font-semibold">Đơn vị</th>
            <th className="border p-2 text-center text-sm font-semibold">Số lượng</th>
            <th className="border p-2 text-center text-sm font-semibold">Đơn giá</th>
            <th className="border p-2 text-center text-sm font-semibold">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrder.details?.map((item, index) => (
            <tr className="border" key={`po-item-${index}`}>
              <td className="border p-2 text-center text-sm">{index + 1}</td>
              <td className="border p-2 text-sm">
                {item.product?.productName}
                {item.notes && <div className="text-xs text-gray-500 italic">({item.notes})</div>}
              </td>
              <td className="border p-2 text-center text-sm">{item.unitName || 'Cái'}</td>
              <td className="border p-2 text-center text-sm">{item.quantity}</td>
              <td className="border p-2 text-right text-sm">{moneyFormat(item.price)}</td>
              <td className="border p-2 text-right text-sm">{moneyFormat(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 flex w-full justify-end">
        <table className="w-64 text-sm">
          <tbody>
            {(purchaseOrder?.discountAmount ?? purchaseOrder?.discount ?? 0) > 0 && (
              <tr>
                <td className="py-1 text-red-600">Giảm giá:</td>
                <td className="py-1 text-right text-red-600">
                  -{moneyFormat(purchaseOrder?.discountAmount ?? purchaseOrder?.discount ?? 0)}
                </td>
              </tr>
            )}

            {(purchaseOrder?.taxAmount ?? 0) > 0 && (
              <tr>
                <td className="py-1 text-blue-600">Tiền thuế:</td>
                <td className="py-1 text-right text-blue-600">
                  +{moneyFormat(purchaseOrder?.taxAmount ?? 0)}
                </td>
              </tr>
            )}

            {(purchaseOrder?.otherCosts ?? 0) > 0 && (
              <tr>
                <td className="py-1">Chi phí khác:</td>
                <td className="py-1 text-right">
                  {moneyFormat(purchaseOrder?.otherCosts ?? 0)}
                </td>
              </tr>
            )}

            <tr className="font-bold text-base">
              <td className="py-1">Tổng tiền:</td>
              <td className="py-1 text-right font-bold text-primary">
                {moneyFormat(purchaseOrder?.totalCurrentAmount ?? purchaseOrder?.totalAmount ?? 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-bold text-sm">
        Số tiền bằng chữ: {toVietnamese(purchaseOrder?.totalAmount)}
      </p>

      <div className="mt-4 text-sm">
        <strong>Ghi chú:</strong> {purchaseOrder?.notes || purchaseOrder?.note || 'Không có ghi chú'}
      </div>

      <div className="mt-8 flex justify-between text-center text-sm">
        <div className="w-1/3">
          <p className="font-bold">Người lập phiếu</p>
          <p className="italic">(Ký, họ tên)</p>
          <div className="h-20"></div>
          <p className="font-bold">{purchaseOrder?.creator?.fullName || purchaseOrder?.user?.fullName || purchaseOrder?.createdByUser?.fullName}</p>
        </div>
        <div className="w-1/3">
          <p className="font-bold">Nhà cung cấp</p>
          <p className="italic">(Ký, họ tên)</p>
        </div>
      </div>
    </div>
  ),
)

PrintPurchaseOrderView.displayName = 'PrintableContent'

export default PrintPurchaseOrderView
