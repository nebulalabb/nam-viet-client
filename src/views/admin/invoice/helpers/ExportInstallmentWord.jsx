import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import QRCode from 'qrcode'
import ImageModule from 'docxtemplater-image-module-free'

/**
 * Export installment contract to Word document using template
 * @param {Object} data - Contract data
 * @param {string} filename - Output filename (default: hop-dong-tra-cham.docx)
 */
export async function exportInstallmentWord(data, filename = 'hop-dong-tra-cham.docx') {
  try {
    // 1. Load template file
    const templatePath = '/templates/hop-dong-tra-cham.docx'
    const response = await fetch(templatePath)

    if (!response.ok) {
      throw new Error(`Template not found: ${templatePath}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // 2. Create PizZip instance
    const zip = new PizZip(arrayBuffer)

    // 3. Configure ImageModule for QR code embedding
    const imageOpts = {
      centered: false,
      getImage: (tagValue) => {
        // Convert base64 data URL to buffer
        return dataURLtoBuffer(tagValue)
      },
      getSize: () => {
        // Return fixed size for QR code (in pixels)
        return [100, 100]
      }
    }

    // 4. Create Docxtemplater instance with ImageModule
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => '',
      modules: [new ImageModule(imageOpts)]
    })

    // 5. Prepare data for template (including QR code)
    const templateData = await prepareTemplateData(data)

    // 6. Set data
    doc.setData(templateData)

    // 7. Render document
    doc.render()

    // 8. Generate blob
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE',
    })

    // 9. Download Word file
    saveAs(blob, filename)

    return true
  } catch (error) {
    console.error('Export Word error:', error)
    throw error
  }
}

/**
 * Prepare data for Word template
 */
async function prepareTemplateData(data) {
  const contract = data?.contract || {}
  const company = data?.company || {}
  const seller = data?.seller || {
    name: 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG',
    representative: '',
    address: '47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam',
    phone: '0984490249',
  }
  const customer = data?.customer || {}
  const items = data?.items || []
  const payment = data?.payment || {}

  // Parse date
  const contractDate = parseDate(contract.date)

  // Calculate total
  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0)

  return {
    // Contract info - match template placeholders
    contract_no: contract.no || 'Số:.........................',
    day: contractDate.day,
    month: contractDate.month,
    year: contractDate.year,

    // Seller info - match template placeholders
    seller_name: seller.name || 'CÔNG TY TNHH VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG',
    seller_representative: seller.representative || '',
    seller_address: seller.address || '47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam',
    seller_phone: seller.phone || '0984490249',

    // Customer info - match template placeholders
    customer_name: customer.name || '',
    customer_phone: customer.phone || '',
    id_number: customer.identityCard || '',
    id_date: customer.identityDate || '',
    id_place: customer.identityPlace || '',
    customer_address: customer.address || '',

    // Items (for loop in template) - match template placeholders
    items: items.map((item, idx) => ({
      index: idx + 1,
      name: item.description || '',
      quantity: item.qty || '',
      price: formatMoney(item.price),
      total: formatMoney(item.total),
    })),

    // Totals - match template placeholders
    total: formatMoney(totalAmount), // Tổng cộng thành tiền
    total_words: data?.amountText || '', // Số tiền bằng chữ

    // Payment info - match template placeholders
    delivery_date: payment.deliveryDate || '',

    // QR Code - for {%qr_code} placeholder in template
    qr_code: data?.qrCode || null,

    // Print tracking - for {print_count} placeholder in template
    print_count: (data?.printCount || 0) + 1,
  }
}

/**
 * Parse date string to day/month/year
 */
function parseDate(value) {
  if (!value) {
    return { day: '...', month: '...', year: '...' }
  }

  const d = new Date(value)
  if (isNaN(d.getTime())) {
    return { day: '...', month: '...', year: '...' }
  }

  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    year: String(d.getFullYear()),
  }
}

/**
 * Format number to Vietnamese currency
 */
function formatMoney(n) {
  if (typeof n === 'number') {
    return n.toLocaleString('vi-VN')
  }
  return n || ''
}

/**
 * Convert data URL to ArrayBuffer for ImageModule
 */
function dataURLtoBuffer(dataURL) {
  if (!dataURL) return null

  // Extract base64 data from data URL
  const base64 = dataURL.split(',')[1]
  if (!base64) return null

  // Decode base64 to binary string
  const binaryString = atob(base64)

  // Convert binary string to ArrayBuffer
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  return bytes.buffer
}
