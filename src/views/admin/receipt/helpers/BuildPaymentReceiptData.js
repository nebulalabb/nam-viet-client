import { toVietnamese } from '@/utils/money-format'

export function buildPaymentReceiptData(receipt, payment) {
  const customer = receipt?.customer || {}
  const invoices = Array.isArray(receipt?.invoices) ? receipt.invoices : []

  const invoiceCodes = invoices
    .map((i) => i?.code)
    .filter(Boolean)
    .join(', ')

  const isFullPayment =
    invoices.length === 1 &&
    Number(payment?.paymentAmount || 0) === Number(receipt?.totalAmount || 0)

  const reason = invoiceCodes
    ? isFullPayment
      ? `Thanh toán toàn bộ HĐ: ${invoiceCodes}`
      : `Thanh toán một phần cho HĐ: ${invoiceCodes}`
    : receipt?.note || 'Thanh toán công nợ'

  const shortNo = receipt?.code
    ? receipt.code.slice(-3)
    : payment?.code?.slice(-3) || '001'

  return {
    company: receipt?.company || undefined,
    receipt: {
      prefix: 'PT',
      no: shortNo,
      date: payment?.createdAt || new Date().toISOString(),
    },
    payer: {
      name: customer?.name || 'Khách hàng',
      address: customer?.address || '',
    },
    reason,
    amount: Number(payment?.paymentAmount || 0),
    amountText: toVietnamese(Number(payment?.paymentAmount || 0)),
    attachedDocs: invoiceCodes ? `Theo HĐ: ${invoiceCodes}` : '',
  }
}
