const ExcelJS = require('exceljs');
const path = require('path');

async function createTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách');

    worksheet.columns = [
        { header: 'Loại NCC', key: 'type', width: 15 },
        { header: 'Tên nhà cung cấp', key: 'name', width: 30 },
        { header: 'Người liên hệ', key: 'contact', width: 25 },
        { header: 'Số điện thoại', key: 'phone', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Địa chỉ', key: 'address', width: 40 },
        { header: 'Mã số thuế', key: 'tax', width: 15 },
        { header: 'Điều khoản thanh toán', key: 'terms', width: 25 },
        { header: 'Ghi chú', key: 'note', width: 30 },
        { header: 'Trạng thái', key: 'status', width: 15 }
    ];

    // Using random postfixes to ensure unique data
    const rnd = Math.floor(Math.random() * 90000) + 10000;

    worksheet.addRow({
        type: 'Trong nước',
        name: 'Công ty Mới ' + rnd,
        contact: 'Đại Diện ' + rnd,
        phone: '098' + rnd + '12',
        email: 'new_' + rnd + '@congty.vn',
        address: '999 Đường Mới, Quận 2, TP. HCM',
        tax: '031' + rnd + '92',
        terms: 'Thanh toán trực tiếp',
        note: 'Hàng nhập mới',
        status: 'Hoạt động'
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };

    const filePath = path.join(__dirname, '..', 'nam-viet-server', 'public', 'templates', 'supplier_import_template.xlsx');
    await workbook.xlsx.writeFile(filePath);
    console.log('Template created at:', filePath);
}

createTemplate().catch(console.error);
