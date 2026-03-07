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

  const itemHasCondition = (key) => {
    return invoice.invoiceItems.some((item) => item[key] > 0)
  }
  const hasDiscount = () => itemHasCondition('discount')
  const hasGiveaway = () => itemHasCondition('giveaway')
  const hasTaxAmount = () => itemHasCondition('taxAmount')

  return (
    <div className="hidden">
      <PrintableContent
        ref={contentRef}
        setting={setting?.payload}
        invoice={invoice}
        hasDiscount={hasDiscount()}
        hasGiveaway={hasGiveaway()}
        hasTaxAmount={hasTaxAmount()}
      />
    </div>
  )
}

const PrintableContent = React.forwardRef(
  ({ setting, invoice, hasGiveaway, hasDiscount, hasTaxAmount }, ref) => (
    <div ref={ref} className="mx-auto max-w-3xl bg-white p-6">
      <div className="mb-6">
        <h1 className="mb-1">{setting?.brandName}</h1>
        <p className="mb-1 text-sm">Địa chỉ: {setting?.address}</p>
        <p className="mb-1 text-sm">Điện thoại: {setting?.phone}</p>
        <p className="text-sm">Email: {setting?.email}</p>
      </div>

      <h2 className="mb-4 text-center text-xl font-bold uppercase">
        Hóa đơn bán hàng
      </h2>

      <p className="mb-4 text-center text-sm">
        Số: {invoice?.code} - Ngày: {dateFormat(invoice?.createdAt, true)}
      </p>

      <div className="mb-6">
        <p className="mb-1 font-bold">Khách hàng: {invoice?.customer?.name}</p>
        <p className="mb-1">
          Địa chỉ: {invoice?.customer.address || 'Không có địa chỉ'}
        </p>
        <p>Điện thoại: {invoice?.customer.phone || 'Không có số điện thoại'}</p>
      </div>

      <table className="mb-6 w-full">
        <thead>
          <tr className="border bg-secondary">
            <th className="border p-2 text-center">STT</th>
            <th className="border p-2 text-center">Sản phẩm</th>
            <th className="border p-2 text-center">Đơn vị tính</th>
            <th className="border p-2 text-center">Số lượng</th>
            {hasGiveaway && <th className="border p-2 text-center">Tặng</th>}
            <th className="border p-2 text-center">Giá</th>
            {hasTaxAmount && <th className="border p-2 text-center">Thuế</th>}
            {hasDiscount && (
              <th className="border p-2 text-center">Giảm giá</th>
            )}
            <th className="border p-2 text-center">Tổng</th>
          </tr>
        </thead>
        <tbody>
          {invoice.invoiceItems?.map((item, index) => (
            <tr className="border" key={`invoice-item-${index}`}>
              <td className="border p-2 text-center">{index + 1}</td>
              <td className="border p-2">{item.productName}</td>
              <td className="border p-2">{item.unitName}</td>
              <td className="border p-2 text-center">{item.quantity}</td>
              {hasGiveaway && (
                <td className="border p-2 text-center">{item.giveaway}</td>
              )}
              <td className="border p-2 text-end">{moneyFormat(item.price)}</td>
              {hasTaxAmount && (
                <td className="border p-2 text-end">
                  {moneyFormat(item.taxAmount)}
                </td>
              )}
              {hasDiscount && (
                <td className="border p-2 text-end">
                  {moneyFormat(item.discount)}
                </td>
              )}
              <td className="border p-2 text-end">{moneyFormat(item.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-6 flex w-full justify-end">
        <table className="w-64">
          <tbody>
            <tr>
              <td className="py-1">Tổng:</td>
              <td className="py-1 text-right">
                {moneyFormat(invoice?.subTotal)}
              </td>
            </tr>

            {invoice?.taxAmount > 0 && (
              <tr>
                <td className="py-1">Thuế:</td>
                <td className="py-1 text-right">
                  {moneyFormat(invoice?.taxAmount)}
                </td>
              </tr>
            )}

            {invoice?.discount > 0 && (
              <tr>
                <td className="py-1">Giảm giá:</td>
                <td className="py-1 text-right">
                  {moneyFormat(invoice?.discount)}
                </td>
              </tr>
            )}

            {invoice?.otherExpenses && (
              <tr>
                <td className="py-1">Phí vận chuyển:</td>
                <td className="py-1 text-right">
                  {moneyFormat(invoice?.otherExpenses.price)}
                </td>
              </tr>
            )}

            <tr className="font-bold">
              <td className="py-1">Tổng tiền:</td>
              <td className="py-1 text-right">
                {moneyFormat(invoice?.amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 font-bold">
        Số tiền bằng chữ: {toVietnamese(invoice?.amount)}
      </p>

      <div className="mt-4">
        <strong>Ghi chú:</strong> {invoice.note || 'Không có ghi chú'}
      </div>
    </div>
  ),
)

PrintableContent.displayName = 'PrintableContent'

export default PrintInvoiceView
