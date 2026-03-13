import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

/**
 * Format currency to VND
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value || 0)
}

/**
 * Format number
 */
const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}

/**
 * Format percentage
 */
const formatPercentage = (value) => {
  return `${(value || 0).toFixed(1)}%`
}

/**
 * Export Sales Report to Excel
 */
export const exportSalesReportToExcel = async (data, filters) => {
  try {
    const workbook = new ExcelJS.Workbook()
    
    // Sheet 1: Summary (Tổng quan)
    const summarySheet = workbook.addWorksheet('Tổng quan')
    
    // Title
    summarySheet.mergeCells('A1:D1')
    summarySheet.getCell('A1').value = 'BÁO CÁO BÁN HÀNG'
    summarySheet.getCell('A1').font = { size: 16, bold: true }
    summarySheet.getCell('A1').alignment = { horizontal: 'center' }
    
    // Period
    summarySheet.mergeCells('A2:D2')
    summarySheet.getCell('A2').value = `Từ ${filters.fromDate} đến ${filters.toDate}`
    summarySheet.getCell('A2').alignment = { horizontal: 'center' }
    
    // Empty row
    summarySheet.addRow([])
    
    // KPI Headers
    summarySheet.addRow(['Chỉ tiêu', 'Giá trị', 'Đơn vị', 'Ghi chú'])
    summarySheet.getRow(4).font = { bold: true }
    summarySheet.getRow(4).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    
    // KPI Data (làm tròn % 2 chữ số thập phân)
    const summary = data.summary || {}
    const round2 = (v) => (v != null && !Number.isNaN(v) ? Number(Number(v).toFixed(2)) : 0)
    summarySheet.addRow(['Doanh thu thuần', round2(summary.netRevenue), 'VND', ''])
    summarySheet.addRow(['Tăng trưởng', round2(summary.netRevenueGrowth), '%', 'So với kỳ trước'])
    summarySheet.addRow(['Lợi nhuận ước tính', round2(summary.estimatedProfit), 'VND', ''])
    summarySheet.addRow(['Tỷ suất lợi nhuận', round2(summary.profitMargin), '%', ''])
    summarySheet.addRow(['Tổng đơn hàng', summary.totalOrders ?? 0, 'Đơn', ''])
    summarySheet.addRow(['Đơn hoàn thành', summary.completedOrders ?? 0, 'Đơn', ''])
    summarySheet.addRow(['Đơn đã hủy', summary.cancelledOrders ?? 0, 'Đơn', ''])
    summarySheet.addRow(['Công nợ phát sinh', round2(summary.newDebt), 'VND', ''])
    summarySheet.addRow(['Tổng công nợ', round2(summary.totalDebt), 'VND', ''])
    summarySheet.addRow(['Tỷ lệ công nợ', round2(summary.debtPercentage), '%', ''])
    
    // Column widths
    summarySheet.getColumn(1).width = 25
    summarySheet.getColumn(2).width = 20
    summarySheet.getColumn(3).width = 10
    summarySheet.getColumn(4).width = 20
    
    // Sheet 2: Orders (Đơn hàng)
    if (data.orders && data.orders.length > 0) {
      const ordersSheet = workbook.addWorksheet('Đơn hàng')
      
      // Headers
      ordersSheet.addRow([
        'Mã đơn',
        'Ngày bán',
        'Khách hàng',
        'Nhân viên',
        'Tổng tiền',
        'Giảm giá',
        'Thành tiền',
        'Trạng thái TT'
      ])
      ordersSheet.getRow(1).font = { bold: true }
      ordersSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      
      // Data (tiền làm tròn; trạng thái TT hiển thị tiếng Việt nếu có)
      const round2 = (v) => (v != null && !Number.isNaN(v) ? Number(Number(v).toFixed(0)) : 0)
      const paymentLabel = (s) => ({ paid: 'Đã thanh toán', unpaid: 'Chưa thanh toán', partial: 'Thanh toán một phần' }[String(s).toLowerCase()] || s)
      data.orders.forEach(order => {
        ordersSheet.addRow([
          order.orderCode,
          new Date(order.orderDate).toLocaleDateString('vi-VN'),
          order.customerName,
          order.staffName || '-',
          round2(order.totalAmount),
          round2(order.discountAmount),
          round2(order.finalAmount),
          paymentLabel(order.paymentStatus)
        ])
      })
      
      // Column widths
      ordersSheet.getColumn(1).width = 15
      ordersSheet.getColumn(2).width = 12
      ordersSheet.getColumn(3).width = 25
      ordersSheet.getColumn(4).width = 20
      ordersSheet.getColumn(5).width = 15
      ordersSheet.getColumn(6).width = 15
      ordersSheet.getColumn(7).width = 15
      ordersSheet.getColumn(8).width = 15
    }
    
    // Sheet 3: Products (Sản phẩm)
    if (data.productPerformance && data.productPerformance.length > 0) {
      const productsSheet = workbook.addWorksheet('Sản phẩm')
      
      // Headers
      productsSheet.addRow([
        'Mã SKU',
        'Tên sản phẩm',
        'Đơn vị',
        'Số lượng',
        'Doanh số',
        'Tỷ trọng (%)'
      ])
      productsSheet.getRow(1).font = { bold: true }
      productsSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      
      // Data (tỷ trọng làm tròn 2 chữ số)
      const round2 = (v) => (v != null && !Number.isNaN(v) ? Number(Number(v).toFixed(2)) : 0)
      data.productPerformance.forEach(product => {
        productsSheet.addRow([
          product.sku,
          product.productName,
          typeof product.unit === 'string' ? product.unit : product.unit?.unitName || '-',
          product.quantity ?? 0,
          round2(product.revenue),
          round2(product.percentage)
        ])
      })
      
      // Column widths
      productsSheet.getColumn(1).width = 15
      productsSheet.getColumn(2).width = 30
      productsSheet.getColumn(3).width = 10
      productsSheet.getColumn(4).width = 12
      productsSheet.getColumn(5).width = 15
      productsSheet.getColumn(6).width = 12
    }
    
    // Sheet 4: Customers (Khách hàng)
    if (data.customerAnalysis && data.customerAnalysis.length > 0) {
      const customersSheet = workbook.addWorksheet('Khách hàng')
      
      // Headers
      customersSheet.addRow([
        'Mã khách',
        'Tên khách hàng',
        'Số đơn',
        'Tổng doanh số',
        'Công nợ'
      ])
      customersSheet.getRow(1).font = { bold: true }
      customersSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
      
      // Data (tiền làm tròn)
      const round2 = (v) => (v != null && !Number.isNaN(v) ? Number(Number(v).toFixed(0)) : 0)
      data.customerAnalysis.forEach(customer => {
        customersSheet.addRow([
          customer.customerCode,
          customer.customerName,
          customer.orderCount ?? 0,
          round2(customer.totalRevenue),
          round2(customer.currentDebt)
        ])
      })
      
      // Column widths
      customersSheet.getColumn(1).width = 15
      customersSheet.getColumn(2).width = 30
      customersSheet.getColumn(3).width = 12
      customersSheet.getColumn(4).width = 15
      customersSheet.getColumn(5).width = 15
    }
    
    // Generate file
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    
    const fileName = `bao-cao-ban-hang-${filters.fromDate}-${filters.toDate}.xlsx`
    saveAs(blob, fileName)
    
    return true
  } catch (error) {
    console.error('Error exporting to Excel:', error)
    throw error
  }
}

/**
 * Print Sales Report
 */
export const printSalesReport = () => {
  window.print()
}
