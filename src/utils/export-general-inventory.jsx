
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { toVietnamese } from './money-format'

export const exportGeneralInventoryToExcel = async (snapshots, dateRange) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Báo Cáo Tổng Hợp')

    // 1. Headers Info
    worksheet.mergeCells('A1:L1')
    worksheet.getCell('A1').value = 'CÔNG TY TNHH MTV VÀNG BẠC ĐÁ QUÝ KIM ĐẶNG'
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }

    worksheet.mergeCells('A2:L2')
    worksheet.getCell('A2').value = 'Số 47 Ngô Văn Sở, Phường Ninh Kiều, Thành phố Cần Thơ, Việt Nam.'
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 11 }

    worksheet.mergeCells('A4:L4')
    worksheet.getCell('A4').value = 'BÁO CÁO TỔNG HỢP NHẬP XUẤT TỒN'
    worksheet.getCell('A4').font = { name: 'Times New Roman', bold: true, size: 16, color: { argb: 'FFC00000' } } // Red color
    worksheet.getCell('A4').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A5:L5')
    const fDate = dateRange.fromDate ? new Date(dateRange.fromDate).toLocaleDateString('en-GB') : '...'
    const tDate = dateRange.toDate ? new Date(dateRange.toDate).toLocaleDateString('en-GB') : '...'
    worksheet.getCell('A5').value = `Từ ngày ${fDate} đến ${tDate}`
    worksheet.getCell('A5').alignment = { horizontal: 'center' }
    worksheet.getCell('A5').font = { name: 'Times New Roman', bold: true, italic: true }

    // 2. Table Header
    const headerRow1 = 7
    const headerRow2 = 8

    worksheet.mergeCells(`A${headerRow1}:A${headerRow2}`)
    worksheet.getCell(`A${headerRow1}`).value = 'STT'

    worksheet.mergeCells(`B${headerRow1}:B${headerRow2}`)
    worksheet.getCell(`B${headerRow1}`).value = 'Tên hàng hóa'

    worksheet.mergeCells(`C${headerRow1}:C${headerRow2}`)
    worksheet.getCell(`C${headerRow1}`).value = 'ĐVT'

    // Tồn đầu
    worksheet.mergeCells(`D${headerRow1}:E${headerRow1}`)
    worksheet.getCell(`D${headerRow1}`).value = 'Tồn đầu'
    worksheet.getCell(`D${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`E${headerRow2}`).value = 'Số tiền'

    // Nhập
    worksheet.mergeCells(`F${headerRow1}:G${headerRow1}`)
    worksheet.getCell(`F${headerRow1}`).value = 'Nhập'
    worksheet.getCell(`F${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`G${headerRow2}`).value = 'Số tiền'

    // Xuất
    worksheet.mergeCells(`H${headerRow1}:I${headerRow1}`)
    worksheet.getCell(`H${headerRow1}`).value = 'Xuất'
    worksheet.getCell(`H${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`I${headerRow2}`).value = 'Số tiền'

    // Tồn
    worksheet.mergeCells(`J${headerRow1}:K${headerRow1}`)
    worksheet.getCell(`J${headerRow1}`).value = 'Tồn'
    worksheet.getCell(`J${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`K${headerRow2}`).value = 'Số tiền'

    worksheet.mergeCells(`L${headerRow1}:L${headerRow2}`)
    worksheet.getCell(`L${headerRow1}`).value = 'Đơn giá'

    // Apply styles to header
    const borderStyle = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    }

    for (let r = headerRow1; r <= headerRow2; r++) {
      const row = worksheet.getRow(r)
      row.eachCell((cell) => {
        cell.font = { name: 'Times New Roman', bold: true }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = borderStyle
      })
    }

    // 3. Data Body
    // Calculate Totals correctly
    const totals = snapshots.reduce((acc, item) => {
      return {
        openingQty: acc.openingQty + (item.openingQuantity || 0),
        openingAmount: acc.openingAmount + (item.openingAmount || 0),
        inQty: acc.inQty + (item.quantityIn || 0),
        inAmount: acc.inAmount + (item.amountIn || 0),
        outQty: acc.outQty + (item.quantityOut || 0),
        outAmount: acc.outAmount + (item.amountOut || 0),
        closingQty: acc.closingQty + (item.closingQuantity || 0),
        closingAmount: acc.closingAmount + (item.closingAmount || 0),
      }
    }, {
      openingQty: 0, openingAmount: 0,
      inQty: 0, inAmount: 0,
      outQty: 0, outAmount: 0,
      closingQty: 0, closingAmount: 0
    })

    let currentRow = 9
    // "Cộng" Row
    worksheet.getCell(`B${currentRow}`).value = 'Cộng'

    // Set Totals
    worksheet.getCell(`D${currentRow}`).value = totals.openingQty
    worksheet.getCell(`E${currentRow}`).value = totals.openingAmount

    worksheet.getCell(`F${currentRow}`).value = totals.inQty
    worksheet.getCell(`G${currentRow}`).value = totals.inAmount

    worksheet.getCell(`H${currentRow}`).value = totals.outQty
    worksheet.getCell(`I${currentRow}`).value = totals.outAmount

    worksheet.getCell(`J${currentRow}`).value = totals.closingQty
    worksheet.getCell(`K${currentRow}`).value = totals.closingAmount

    // Apply Styles to "Cộng" Row (Borders + Red Text)
    const rowTotal = worksheet.getRow(currentRow)
    rowTotal.font = { name: 'Times New Roman', bold: true, color: { argb: 'FFC00000' } } // Red
    rowTotal.alignment = { vertical: 'middle', horizontal: 'center' }

    // Apply borders to A9:L9
    for (let c = 1; c <= 12; c++) {
      const cell = rowTotal.getCell(c)
      cell.border = borderStyle
      // Apply number format to Cols 4 to 12
      if (c >= 4 && c <= 12) {
        cell.numFmt = '#,##0'
      }
    }

    // Data Rows
    currentRow = 10

    snapshots.forEach((item, index) => {
      const row = worksheet.getRow(currentRow + index)
      row.font = { name: 'Times New Roman', size: 11 }

      row.getCell(1).value = index + 1 // STT
      row.getCell(2).value = item.product?.name || item.productName || '' // Tên
      row.getCell(3).value = item.product?.unit?.name || item.unitName || '' // ĐVT

      // Tồn đầu
      row.getCell(4).value = item.openingQuantity || 0
      row.getCell(5).value = item.openingAmount || 0

      // Nhập
      row.getCell(6).value = item.quantityIn || 0
      row.getCell(7).value = item.amountIn || 0

      // Xuất
      row.getCell(8).value = item.quantityOut || 0
      row.getCell(9).value = item.amountOut || 0

      // Tồn Cuối
      row.getCell(10).value = item.closingQuantity || 0
      row.getCell(11).value = item.closingAmount || 0

      // Đơn giá
      row.getCell(12).value = item.averageUnitPrice || 0

      // Borders & Number Format
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 12) cell.border = borderStyle
        // Apply number format to Cols 4 to 12
        if (colNumber >= 4 && colNumber <= 12) {
          cell.numFmt = '#,##0'
        }
      })
      row.commit()
    })

    // Auto-width columns
    for (let c = 1; c <= 12; c++) {
      let maxLength = 0
      const column = worksheet.getColumn(c)

      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.row >= 7) {
          const cellValue = cell.value ? cell.value.toString() : ''
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length
          }
        }
      })

      column.width = Math.max(10, maxLength + 2)
    }

    // 4. Footer
    const footerRow = currentRow + snapshots.length + 2
    worksheet.getCell(`A${footerRow}`).value = 'Xác nhận nội dung trên là đúng'
    worksheet.getCell(`A${footerRow}`).font = { name: 'Times New Roman', bold: true }

    const signRow = footerRow + 1
    worksheet.getCell(`B${signRow}`).value = 'Thủ kho'
    worksheet.getCell(`B${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`B${signRow}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`G${signRow}`).value = 'Kế toán'
    worksheet.getCell(`G${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`G${signRow}`).alignment = { horizontal: 'center' }

    worksheet.getCell(`K${signRow}`).value = 'Giám đốc'
    worksheet.getCell(`K${signRow}`).font = { name: 'Times New Roman', bold: true }
    worksheet.getCell(`K${signRow}`).alignment = { horizontal: 'center' }

    const signRow2 = signRow + 1
    worksheet.getCell(`B${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`B${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`B${signRow2}`).alignment = { horizontal: 'center' }
    worksheet.getCell(`G${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`G${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`G${signRow2}`).alignment = { horizontal: 'center' }
    worksheet.getCell(`K${signRow2}`).value = '(Ký, họ tên)'
    worksheet.getCell(`K${signRow2}`).font = { name: 'Times New Roman' }
    worksheet.getCell(`K${signRow2}`).alignment = { horizontal: 'center' }

    // 5. Generate File
    const buffer = await workbook.xlsx.writeBuffer()
    const fileName = `Bao_Cao_Tong_Hop_${new Date().getTime()}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất báo cáo.')
  }
}
