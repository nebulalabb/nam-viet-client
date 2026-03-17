import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateAttendance } from '@/stores/AttendanceSlice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const STATUS_OPTIONS = [
    { value: 'present', label: 'Có mặt' },
    { value: 'absent', label: 'Vắng mặt' },
    { value: 'late', label: 'Đi muộn' },
    { value: 'leave', label: 'Nghỉ phép' },
    { value: 'work_from_home', label: 'Làm việc từ xa (WFH)' },
];

export default function AttendanceEditDialog({ isOpen, onClose, attendance, onSuccess }) {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    
    // Form state
    const [status, setStatus] = useState('present');
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen && attendance) {
            setStatus(attendance.status || 'present');
            
            // Format checkInTime and checkOutTime to HH:mm string for input[type="time"]
            const formatTime = (timeStr) => {
                if (!timeStr) return '';
                if (typeof timeStr === 'string' && timeStr.includes('T')) {
                    const date = new Date(timeStr);
                    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                }
                return timeStr.substring(0, 5);
            };

            setCheckInTime(formatTime(attendance.checkInTime));
            setCheckOutTime(formatTime(attendance.checkOutTime));
            setNotes(attendance.notes || '');
        }
    }, [isOpen, attendance]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!attendance) return;

        setLoading(true);
        try {
            const data = {
                status,
                // Only send time if they exist, send null if empty to clear them
                checkInTime: checkInTime ? `${checkInTime}:00` : null,
                checkOutTime: checkOutTime ? `${checkOutTime}:00` : null,
                notes: notes || undefined
            };

            await dispatch(updateAttendance({ id: attendance.id, data })).unwrap();
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!attendance) return null;

    const recordDate = new Date(attendance.date).toLocaleDateString('vi-VN');
    const userName = attendance.user?.fullName || 'Nhân viên';
    const employeeCode = attendance.user?.employeeCode || '';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Màn hình cập nhật chấm công</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin điểm danh thủ công cho nhân viên.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nhân viên</Label>
                            <Input value={`${userName} ${employeeCode ? `(${employeeCode})` : ''}`} disabled className="bg-gray-50 dark:bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Ngày</Label>
                            <Input value={recordDate} disabled className="bg-gray-50 dark:bg-gray-800" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái điểm danh</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="checkInTime">Giờ vào</Label>
                            <Input 
                                id="checkInTime" 
                                type="time" 
                                value={checkInTime}
                                onChange={(e) => setCheckInTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="checkOutTime">Giờ ra</Label>
                            <Input 
                                id="checkOutTime" 
                                type="time" 
                                value={checkOutTime}
                                onChange={(e) => setCheckOutTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Lý do điều chỉnh (Ghi chú)</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="Nhập lý do cập nhật giờ công..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu cập nhật'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
