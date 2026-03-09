import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import React, { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

const PrintReceiptView = ({ receipt, setting, onAfterPrint }) => {
  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: receipt?.code ? `PT-${receipt?.code}` : 'Phieu-thu',
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
        <div>
          <h1 className="mb-1 font-bold text-lg">{setting?.brandName || 'CÔNG TY'}</h1>
          <p className="mb-1 text-sm">Địa chỉ: {setting?.address}</p>
          <p className="mb-1 text-sm">Điện thoại: {setting?.phone}</p>
          <p className="text-sm">Email: {setting?.email}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold">Mẫu số 01 - TT</p>
          <p className="text-xs italic">(Ban hành theo Thông tư số 200/2014/TT-BTC</p>
          <p className="text-xs italic">ngày 22/12/2014 của Bộ Tài chính)</p>
        </div>
      </div>

      <h2 className="mb-2 text-center text-2xl font-bold uppercase">
        Phiếu thu
      </h2>

      <p className="mb-8 text-center text-sm italic">
        Ngày {dateFormat(receipt?.paymentDate || receipt?.createdAt, true)}
      </p>

      <div className="mb-6 space-y-3 text-base">
        <div className="flex gap-2">
          <span className="min-w-32">Họ tên người nộp:</span>
          <span className="font-semibold">{receipt?.receiver?.name || '................................................'}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Địa chỉ:</span>
          <span>{receipt?.receiver?.address || '................................................'}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Lý do nộp:</span>
          <span>{receipt?.note || (receipt?.invoice ? `Thanh toán tiền hàng cho hóa đơn ${receipt?.invoice?.code}` : '................................................')}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Số tiền:</span>
          <span className="font-bold">{moneyFormat(receipt?.amount)}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Viết bằng chữ:</span>
          <span className="italic">{toVietnamese(receipt?.amount)}</span>
        </div>
        <div className="flex gap-2">
          <span className="min-w-32">Kèm theo:</span>
          <span>{receipt?.invoice ? `01 chứng từ gốc (HĐ ${receipt?.invoice?.code})` : '................................................'}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between text-center">
        <div className="w-1/5">
          <p className="font-bold">Giám đốc</p>
          <p className="text-xs italic">(Ký, họ tên, đóng dấu)</p>
          <div className="h-24"></div>
        </div>
        <div className="w-1/5">
          <p className="font-bold">Kế toán trưởng</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
        <div className="w-1/5">
          <p className="font-bold">Người nộp tiền</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
          <p className="font-semibold">{receipt?.receiver?.name}</p>
        </div>
        <div className="w-1/5">
          <p className="font-bold">Người lập phiếu</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
          <p className="font-semibold">{receipt?.createdByUser?.fullName}</p>
        </div>
        <div className="w-1/5">
          <p className="font-bold">Thủ quỹ</p>
          <p className="text-xs italic">(Ký, họ tên)</p>
          <div className="h-24"></div>
        </div>
      </div>

      <div className="mt-4 text-xs italic text-center">
        (Đã nhận đủ số tiền (viết bằng chữ): ........................................................................................................................)
      </div>
    </div>
  ),
)

PrintableContent.displayName = 'PrintableContent'

export default PrintReceiptView
