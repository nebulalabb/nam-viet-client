
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { toVietnamese } from './money-format'

export const exportWarehouseReceiptToExcel = async (receipt, templatePath = '/templates/xuatkho.xlsx') => {
  try {
    // 1. Load the template
    const response = await fetch(templatePath)
    if (!response.ok) throw new Error('Failed to load template')
    const arrayBuffer = await response.arrayBuffer()

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)
    const worksheet = workbook.getWorksheet(1)

    // 2. Prepare Data
    const day = new Date(receipt.receiptDate).getDate()
    const month = new Date(receipt.receiptDate).getMonth() + 1
    const year = new Date(receipt.receiptDate).getFullYear()
    const dateString = `Ngày ${day} tháng ${month} năm ${year}`

    const isImport = receipt.receiptType === 1
    const partner = isImport ? receipt.supplier : receipt.customer
    const partnerName = partner?.name || ''
    const partnerLabel = isImport ? 'Họ và tên người giao hàng' : 'Họ và tên người nhận hàng'
    const reasonLabel = isImport ? 'Lý do nhập kho' : 'Lý do xuất kho'
    const warehouseActionLabel = isImport ? 'Nhập tại kho' : 'Xuất tại kho'

    // Address logic: prioritize partner address
    const address = partner?.address || ''
    const reason = receipt.reason || ''
    // Warehouse info might be static or inferred
    const warehouse = 'Kho Cần Thơ' // Placeholder or from receipt if available

    // 3. Find and Replace Header Info & Table Headers
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        let cellText = ''
        let isRichText = false
        if (cell.value && cell.value.richText) {
          isRichText = true
          cellText = cell.value.richText.map(rt => rt.text).join('')
        } else if (cell.value && typeof cell.value === 'string') {
          cellText = cell.value
        } else {
          return
        }

        let newText = cellText

        // Main Title
        if (isImport && newText.includes('PHIẾU XUẤT KHO')) {
          newText = newText.replace('PHIẾU XUẤT KHO', 'PHIẾU NHẬP KHO')
        }

        // Table Header
        if (isImport && newText.includes('Thực xuất')) {
          newText = newText.replace('Thực xuất', 'Thực nhập')
        }

        // Date
        if (newText.includes('Ngày....tháng....năm')) {
          newText = newText.replace(/Ngày\.*tháng\.*năm\.*/i, dateString)
        } else if (newText.includes('Ngày') && newText.includes('tháng') && newText.includes('năm') && !newText.includes(dateString)) {
          newText = `                  Ngày ${day} tháng ${month} năm ${year}`
        }

        // Code
        if (newText.includes('Số:')) {
          newText = `Số: ${receipt.code}`
        }

        // Receiver Name
        if (newText.includes('Họ và tên')) {
          newText = `${partnerLabel}: ${partnerName}`
          if (cellText.includes('Địa chỉ')) {
            const parts = cellText.split('Địa chỉ')
            if (parts.length > 1) {
              newText = `${partnerLabel}: ${partnerName}          Địa chỉ (bộ phận): ${address}`
            }
          }
        }

        // Fallback for separate Address cell
        if (newText.includes('Địa chỉ (bộ phận):') && !newText.includes('Họ và tên')) {
          newText = `Địa chỉ (bộ phận): ${address}`
        }

        // Reason
        if (newText.includes('Lý do xuất kho:')) {
          newText = `${reasonLabel}: ${reason}`
        }

        // Warehouse
        if (newText.includes('Xuất tại kho')) {
          newText = `${warehouseActionLabel}: ${warehouse}                          Địa điểm: Cần Thơ`
        }

        if (newText !== cellText) {
          if (isRichText) {
            const baseFont = cell.value.richText[0]?.font
            cell.value = { richText: [{ font: baseFont, text: newText }] }
          } else {
            cell.value = newText
          }
        }
      })
    })

    // 4. Fill Table Details
    // User requested to start from row 15
    const startRow = 15

    // Insert rows strictly
    if (receipt.details.length > 0) {
      worksheet.insertRows(startRow, receipt.details.map((_, i) => []))
    }

    // Write data
    receipt.details.forEach((item, index) => {
      const currentRow = startRow + index
      const row = worksheet.getRow(currentRow)

      // Styles
      row.font = { name: 'Times New Roman', size: 11 }
      row.alignment = { vertical: 'middle', wrapText: true }

      // STT (Merge A and B)
      try {
        worksheet.mergeCells(`A${currentRow}:B${currentRow}`)
      } catch (e) {
        // Ignore if already merged
      }

      // Custom borders to avoid internal line
      // Cell 1: Left, Top, Bottom (No Right)
      row.getCell(1).value = index + 1
      row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(1).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' }
      }

      // Cell 2: Top, Right, Bottom (No Left) - ensuring the box closes on the far right
      row.getCell(2).value = ''
      row.getCell(2).border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }

      // Name (C)
      row.getCell(3).value = item.productName || ''
      row.getCell(3).border = borderStyle

      // Code (D)
      row.getCell(4).value = item.productCode || ''
      row.getCell(4).border = borderStyle

      // Unit (E)
      row.getCell(5).value = item.unitName || ''
      row.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(5).border = borderStyle

      // Qty Doc (F)
      row.getCell(6).value = ''
      row.getCell(6).border = borderStyle

      // Qty Real (G)
      const qtyValue = parseFloat(item.qtyActual || 0)
      row.getCell(7).value = qtyValue
      row.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' }
      row.getCell(7).numFmt = Number.isInteger(qtyValue) ? '#,##0' : '#,##0.###'
      row.getCell(7).border = borderStyle

      // Price (H)
      row.getCell(8).value = parseFloat(item.price || 0)
      row.getCell(8).numFmt = '#,##0'
      row.getCell(8).border = borderStyle

      // Amount (I)
      row.getCell(9).value = parseFloat(item.totalAmount || 0)
      row.getCell(9).numFmt = '#,##0'
      row.getCell(9).border = borderStyle

      row.commit()
    })

    // 5. Total and Text
    let totalRowIndex = -1
    const totalAmount = receipt.totalAmount || 0

    worksheet.eachRow((row, rowNumber) => {
      // "Cộng" usually in Description column (C)
      const cellC = row.getCell(3)
      if (cellC.value && cellC.value.toString().includes('Cộng')) {
        totalRowIndex = rowNumber
        // Write Total to Col I (9)
        const totalCell = row.getCell(9)
        totalCell.value = parseFloat(totalAmount)
        totalCell.numFmt = '#,##0'
      }

      // Text
      const firstCell = row.getCell(1) // A
      if (firstCell.value && firstCell.value.toString().includes('Tổng số tiền (viết bằng chữ):')) {
        firstCell.value = `Tổng số tiền (viết bằng chữ): ${toVietnamese(totalAmount)}`
      }
    })

    // 6. Save
    const buffer = await workbook.xlsx.writeBuffer()
    const exportPrefix = isImport ? 'Phieu_Nhap_Kho' : 'Phieu_Xuat_Kho'
    const fileName = `${exportPrefix}_${receipt.code}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất Excel. Vui lòng thử lại.')
  }
}

const borderStyle = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
}
