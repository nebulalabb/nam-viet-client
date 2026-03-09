import { toVietnamese } from '@/utils/money-format'

export function buildQuotationData(invoice) {
  const customer = invoice?.customer || {}
  const rawItems = Array.isArray(invoice?.invoiceItems)
    ? invoice.invoiceItems
    : []

  const subtotal = Number(invoice?.subTotal || 0)
  const taxAmount = Number(invoice?.taxAmount || 0)
  const grandTotal = Number(invoice?.amount || 0)

  let vatRate = 8
  if (subtotal > 0 && taxAmount > 0) {
    vatRate = parseFloat(((taxAmount / subtotal) * 100).toFixed(1))
  } else if (taxAmount === 0) {
    vatRate = 0
  }

  const items = rawItems.map((item, index) => ({
    stt: index + 1,
    description: item?.productName || '',
    details: item?.note || '',
    unit: item?.unitName || 'Cái',
    qty: Number(item?.quantity || 0),
    price: Number(item?.price || 0),
    total: Number(item?.total || 0),
  }))

  return {
    company: invoice?.company || undefined,

    quotation: {
      no: invoice?.code || 'Q-2025-TNF',
      date: invoice?.date || invoice?.createdAt || new Date().toISOString(),
      subtitle: 'Bảo dưỡng xe nâng/Sửa chữa xe nâng/Phụ tùng xe nâng',
    },

    customer: {
      name: 'Ban Giám đốc',
      unit: invoice?.customerName || customer?.name || 'Công ty ABC',
      address: invoice?.customerAddress || customer?.address || '...',
      tel: invoice?.customerPhone || customer?.phone || '...',
    },

    items,

    totals: {
      subtotal,
      vatRate,
      vatAmount: taxAmount,
      grandTotal,
    },

    amountText: toVietnamese(grandTotal),

    terms: undefined,
    warranty: undefined,
  }
}
