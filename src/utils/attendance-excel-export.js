import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const handleExportAttendance = (attendances, users, month) => {
    if (!attendances || attendances.length === 0) {
        alert('Không có dữ liệu để xuất Excel');
        return;
    }

    try {
        // Map data to rows
        const rows = attendances.map((record, index) => {
            const user = users.find(u => u.id === record.userId) || record.user || {};
            
            return {
                'STT': index + 1,
                'Mã NV': user.employeeCode || '',
                'Họ và tên': user.fullName || '',
                'Ngày': record.date ? format(new Date(record.date), 'dd/MM/yyyy') : '',
                'Giờ vào': record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm:ss') : '',
                'Giờ ra': record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm:ss') : '',
                'Số giờ công': record.workHours ? Number(record.workHours).toFixed(2) : '0',
                'Trạng thái': translateStatus(record.status),
                'Loại nghỉ': translateLeaveType(record.leaveType),
                'Ghi chú': record.notes || ''
            };
        });

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bảng Công');

        // Set column widths
        const colWidths = [
            { wch: 5 },  // STT
            { wch: 15 }, // Mã NV
            { wch: 30 }, // Họ tên
            { wch: 15 }, // Ngày
            { wch: 15 }, // Giờ vào
            { wch: 15 }, // Giờ ra
            { wch: 15 }, // Giờ công
            { wch: 20 }, // Trạng thái
            { wch: 20 }, // Loại nghỉ
            { wch: 40 }  // Ghi chú
        ];
        worksheet['!cols'] = colWidths;

        // Generate Excel file
        const fileName = `Bang_Cong_${month || format(new Date(), 'MM_yyyy')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    } catch (error) {
        console.error('Error exporting attendance to Excel:', error);
        alert('Đã xảy ra lỗi khi xuất Excel. Vui lòng thử lại.');
    }
};

function translateStatus(status) {
    switch(status) {
        case 'present': return 'Đủ công';
        case 'late': return 'Đi muộn';
        case 'absent': return 'Vắng mặt';
        case 'leave': return 'Nghỉ phép';
        case 'work_from_home': return 'Làm việc từ xa';
        default: return status || '';
    }
}

function translateLeaveType(leaveType) {
    switch(leaveType) {
        case 'annual': return 'Nghỉ phép năm';
        case 'sick': return 'Nghỉ ốm';
        case 'unpaid': return 'Nghỉ không lương';
        case 'other': return 'Nghỉ khác';
        case 'none': return 'Không';
        default: return leaveType || '';
    }
}
