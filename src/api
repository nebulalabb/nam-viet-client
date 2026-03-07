import api from '@/utils/axios'

/**
 * Generate warehouse receipt from invoice
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} Warehouse receipt data
 */
const generateWarehouseReceiptFromInvoice = async (invoiceId, selectedItemIds = []) => {
  try {
    const { data } = await api.post('/warehouse-receipts/generate-from-invoice', {
      invoiceId,
      selectedItemIds,
    })
    return data?.data
  } catch (error) {
    console.error('Generate warehouse receipt error:', error)
    throw error
  }
}

/**
 * Post warehouse receipt (ghi sổ kho)
 * @param {number} receiptId - Warehouse receipt ID
 * @returns {Promise} Posted warehouse receipt data
 */
const postWarehouseReceipt = async (receiptId) => {
  try {
    const { data } = await api.post(`/warehouse-receipts/${receiptId}/post`, {})
    return data?.data
  } catch (error) {
    console.error('Post warehouse receipt error:', error)
    throw error
  }
}

/**
 * Get warehouse receipt detail
 * @param {number} receiptId - Warehouse receipt ID
 * @returns {Promise} Warehouse receipt detail
 */
const getWarehouseReceiptDetail = async (receiptId) => {
  try {
    const { data } = await api.get(`/warehouse-receipts/${receiptId}`)
    return data?.data
  } catch (error) {
    console.error('Get warehouse receipt detail error:', error)
    throw error
  }
}

/**
 * Get warehouse receipts by invoice ID
 * @param {number} invoiceId - Invoice ID
 * @returns {Promise} List of warehouse receipts
 */
const getWarehouseReceiptsByInvoice = async (invoiceId) => {
  try {
    const { data } = await api.get(`/warehouse-receipts/by-invoice/${invoiceId}`)
    return data?.data
  } catch (error) {
    console.error('Get warehouse receipts by invoice error:', error)
    throw error
  }
}

export {
  generateWarehouseReceiptFromInvoice,
  postWarehouseReceipt,
  getWarehouseReceiptDetail,
  getWarehouseReceiptsByInvoice,
}
