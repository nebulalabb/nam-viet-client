import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

export const exportDebtToExcel = (data, year, type) => {
    const headers = [
        "STT",
        "TÊN KHÁCH HÀNG / NCC",
        "MÃ KH/NCC",
        "ĐIỆN THOẠI",
        "PHỤ TRÁCH",
        "TỈNH/THÀNH",
        "NỢ ĐẦU KỲ",
        "TỔNG MUA (+)",
        "TRẢ HÀNG (-)",
        "ĐIỀU CHỈNH",
        "THANH TOÁN (-)",
        "DƯ NỢ CUỐI KỲ"
    ]

    const rows = data.map((item, index) => [
        index + 1,
        item.name,
        item.code,
        item.phone || '',
        item.assignedUser?.fullName || '',
        item.location || '',
        Number(item.openingBalance || 0),
        Number(item.increasingAmount || 0),
        Number(item.returnAmount || 0),
        Number(item.adjustmentAmount || 0),
        Number(item.decreasingAmount || 0),
        Number(item.closingBalance || 0)
    ])

    const typeName = type === 'customer' ? 'KHÁCH HÀNG' : type === 'supplier' ? 'NHÀ CUNG CẤP' : 'TẤT CẢ'

    const companyInfo = [
        ["CÔNG TY CỔ PHẦN HÓA SINH NAM VIỆT"],
        [`BẢNG TỔNG HỢP CÔNG NỢ NĂM ${year} (${typeName})`],
        [""]
    ]

    const worksheetData = [...companyInfo, headers, ...rows]
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    worksheet['!cols'] = [
        { wch: 5 },
        { wch: 35 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "CongNo")

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const dataBlob = new Blob([excelBuffer], { type: 'application/octet-stream' })

    saveAs(dataBlob, `TongHopCongNo_${type}_${year}_${format(new Date(), 'ddMMyyyy')}.xlsx`)
}
