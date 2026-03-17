
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'


export const exportDetailedLedgerToExcel = async (data, snapshot, dateRange) => {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sổ Chi Tiết')

    // 1. Headers Info
    worksheet.mergeCells('A1:M1')
    worksheet.getCell('A1').value = 'HỆ THỐNG QUẢN LÝ NAM VIỆT'
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 12 }

    worksheet.mergeCells('A2:M2')
    worksheet.getCell('A2').value = 'Địa chỉ: Số 123, Đường ABC, Quận XYZ, TP. Hồ Chí Minh'
    worksheet.getCell('A2').font = { name: 'Times New Roman', size: 11 }

    worksheet.mergeCells('A5:M5')
    worksheet.getCell('A5').value = 'SỔ CHI TIẾT VẬT TƯ'
    worksheet.getCell('A5').font = { name: 'Times New Roman', bold: true, size: 16, color: { argb: 'FFC00000' } }
    worksheet.getCell('A5').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A6:M6')
    worksheet.getCell('A6').value = (snapshot.product?.name || snapshot.productName || 'SẢN PHẨM').toUpperCase()
    worksheet.getCell('A6').font = { name: 'Times New Roman', bold: true, size: 14 }
    worksheet.getCell('A6').alignment = { horizontal: 'center' }

    worksheet.mergeCells('A7:M7')
    const fDate = dateRange?.fromDate ? new Date(dateRange.fromDate).toLocaleDateString('en-GB') : '...'
    const tDate = dateRange?.toDate ? new Date(dateRange.toDate).toLocaleDateString('en-GB') : '...'
    worksheet.getCell('A7').value = `Từ ngày ${fDate} đến ${tDate}`
    worksheet.getCell('A7').alignment = { horizontal: 'center' }
    worksheet.getCell('A7').font = { name: 'Times New Roman', bold: true, italic: true }

    // 2. Table Header
    // Row 9, 10
    const headerRow1 = 9
    const headerRow2 = 10

    // Chứng từ
    worksheet.mergeCells(`A${headerRow1}:B${headerRow1}`)
    worksheet.getCell(`A${headerRow1}`).value = 'Chứng từ'
    worksheet.getCell(`A${headerRow2}`).value = 'Số'
    worksheet.getCell(`B${headerRow2}`).value = 'Ngày'

    // Đối tượng
    worksheet.mergeCells(`C${headerRow1}:C${headerRow2}`)
    worksheet.getCell(`C${headerRow1}`).value = 'Đối tượng' // description

    // ĐVT
    worksheet.mergeCells(`D${headerRow1}:D${headerRow2}`)
    worksheet.getCell(`D${headerRow1}`).value = 'ĐVT'

    // Nhập trong kỳ
    worksheet.mergeCells(`E${headerRow1}:G${headerRow1}`)
    worksheet.getCell(`E${headerRow1}`).value = 'Nhập trong kỳ'
    worksheet.getCell(`E${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`F${headerRow2}`).value = 'Đơn giá'
    worksheet.getCell(`G${headerRow2}`).value = 'Thành tiền'

    // Xuất trong kỳ
    worksheet.mergeCells(`H${headerRow1}:J${headerRow1}`)
    worksheet.getCell(`H${headerRow1}`).value = 'Xuất trong kỳ'
    worksheet.getCell(`H${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`I${headerRow2}`).value = 'Đơn giá'
    worksheet.getCell(`J${headerRow2}`).value = 'Thành tiền'

    // Tồn cuối kỳ
    worksheet.mergeCells(`K${headerRow1}:M${headerRow1}`)
    worksheet.getCell(`K${headerRow1}`).value = 'Tồn cuối kỳ'
    worksheet.getCell(`K${headerRow2}`).value = 'Số lượng'
    worksheet.getCell(`L${headerRow2}`).value = 'Đơn giá'
    worksheet.getCell(`M${headerRow2}`).value = 'Thành tiền'

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

    // 3. Body
    let currentRow = 11

    // Dư đầu row
    const rowOpen = worksheet.getRow(currentRow)
    rowOpen.font = { name: 'Times New Roman' }
    rowOpen.getCell(3).value = 'Dư đầu kỳ'
    rowOpen.getCell(3).font = { name: 'Times New Roman', bold: true }
    
    // Fill dummy or 0
    rowOpen.eachCell({ includeEmpty: true }, (cell, col) => {
      if (col <= 13) cell.border = borderStyle
      if (col >= 5 && col <= 13) { // Qty, Price, Amount cols
        cell.numFmt = '#,##0'
      }
      if (col >= 11 && col <= 13) {
        cell.font = { name: 'Times New Roman', bold: true }
      }
    })
    
    // Dữ đầu kỳ từ data backend (nếu có - hiện tại backend trả về trong response)
    // Giả sử data.openingBalance có sẵn
    const opQty = snapshot.openingBalance?.quantity || 0
    const opAmount = snapshot.openingBalance?.amount || 0
    rowOpen.getCell(11).value = opQty 
    rowOpen.getCell(12).value = opQty !== 0 ? opAmount / opQty : 0
    rowOpen.getCell(13).value = opAmount

    currentRow++

    // Transaction rows
    if (data && data.length > 0) {
      data.forEach(item => {
        const row = worksheet.getRow(currentRow)
        row.font = { name: 'Times New Roman' }

        row.getCell(1).value = item.documentCode || ''
        row.getCell(2).value = item.postingDate ? new Date(item.postingDate).toLocaleDateString('en-GB') : ''
        row.getCell(3).value = item.objectName || item.description || ''
        row.getCell(4).value = item.unit?.name || ''

        // In
        const qtyIn = parseFloat(item.qtyIn) || 0
        const amountIn = parseFloat(item.amountIn) || 0
        if (qtyIn > 0) {
          row.getCell(5).value = qtyIn
          row.getCell(6).value = parseFloat(item.unitCost) || 0
          row.getCell(7).value = amountIn
        }

        // Out
        const qtyOut = parseFloat(item.qtyOut) || 0
        const amountOut = parseFloat(item.amountOut) || 0
        if (qtyOut > 0) {
          row.getCell(8).value = qtyOut
          row.getCell(9).value = parseFloat(item.unitCost) || 0
          row.getCell(10).value = amountOut
        }

        // Balance
        row.getCell(11).value = parseFloat(item.balanceQty) || 0
        row.getCell(12).value = parseFloat(item.unitCost) || 0
        row.getCell(13).value = parseFloat(item.balanceAmount) || 0

        // Styling
        row.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col <= 13) {
            cell.border = borderStyle
            cell.alignment = { vertical: 'middle' }
            if (col >= 5) cell.numFmt = '#,##0'
          }
        })

        currentRow++
      })
    }

    // Cộng Row
    const totalInQty = data?.reduce((sum, item) => sum + (parseFloat(item.qtyIn) || 0), 0) || 0
    const totalInAmount = data?.reduce((sum, item) => sum + (parseFloat(item.amountIn) || 0), 0) || 0
    const totalOutQty = data?.reduce((sum, item) => sum + (parseFloat(item.qtyOut) || 0), 0) || 0
    const totalOutAmount = data?.reduce((sum, item) => sum + (parseFloat(item.amountOut) || 0), 0) || 0

    const rowTotal = worksheet.getRow(currentRow)
    rowTotal.font = { name: 'Times New Roman', bold: true }
    rowTotal.getCell(3).value = 'Cộng phát sinh'

    // In Totals
    rowTotal.getCell(5).value = totalInQty
    rowTotal.getCell(7).value = totalInAmount

    // Out Totals
    rowTotal.getCell(8).value = totalOutQty
    rowTotal.getCell(10).value = totalOutAmount

    rowTotal.eachCell({ includeEmpty: true }, (cell, col) => {
      if (col <= 13) {
        cell.border = borderStyle
        if (col >= 5) cell.numFmt = '#,##0'
      }
    })

    // Auto-width columns (A to M -> 1 to 13)
    for (let c = 1; c <= 13; c++) {
      let maxLength = 0
      const column = worksheet.getColumn(c)
      column.eachCell({ includeEmpty: true }, (cell) => {
        if (cell.row >= 9) { // Start from Table Header (Row 9)
          const cellValue = cell.value ? cell.value.toString() : ''
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length
          }
        }
      })
      column.width = Math.max(10, maxLength + 2)
    }

    // 4. Footer
    const footerRow = rowTotal.number + 3

    // Signatures...
    const signRow = footerRow
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

    const buffer = await workbook.xlsx.writeBuffer()
    const safeName = (snapshot.product?.name || snapshot.productName || 'SanPham').replace(/[^a-z0-9]/gi, '_')
    const fileName = `So_Chi_Tiet_${safeName}.xlsx`
    saveAs(new Blob([buffer]), fileName)

  } catch (error) {
    console.error('Export Excel Error:', error)
    alert('Có lỗi khi xuất sổ chi tiết.')
  }
}
