import { toVietnamese } from '@/utils/money-format'

export function buildAgreementData(invoice) {
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

  const items = rawItems.map((item) => {
    const qty = Number(item?.quantity || 0)
    const price = Number(item?.price || 0)
    const total = Number(item?.total || 0)
    const unitName = item?.unitName || 'Cái'
    
    // Format: "1 Lượng (Cây) x 76,000,000"
    const priceFormatted = price.toLocaleString('vi-VN')
    const weightDetail = `${qty} ${unitName} x ${priceFormatted}`
    
    return {
      name: item?.productName || '',
      purity: '', // Can be filled from product details if available
      weight: '', // Can be filled from product details if available
      description: item?.note || '',
      weightDetail: weightDetail,
      total: total, // For THÀNH TIỀN column
    }
  })

  return {
    company: invoice?.company || undefined,

    agreement: {
      no: invoice?.code || 'THMB-2025-001',
      date: invoice?.date || invoice?.createdAt || new Date().toISOString(),
      title: 'THỎA THUẬN MUA BÁN',
      code: 'MST: 1801755621',
    },

    customer: {
      name: invoice?.customerName || customer?.name || '',
      phone: invoice?.customerPhone || customer?.phone || '',
    },

    items,

    totals: {
      subtotal,
      vatRate,
      vatAmount: taxAmount,
      grandTotal,
    },

    amountText: toVietnamese(grandTotal),

    note: invoice?.note || '',

    terms: undefined,
    warranty: undefined,
  }
}
