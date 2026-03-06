import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { requestLeave } from '@/stores/AttendanceSlice'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea as TextArea } from '@/components/ui/textarea'

const requestLeaveSchema = z.object({
    date: z.string().min(1, 'Ngày nghỉ là bắt buộc'),
    leaveType: z.enum(['annual', 'sick', 'unpaid', 'other']),
    shift: z.enum(['morning', 'afternoon', 'all_day']),
    reason: z.string().min(1, 'Lý do là bắt buộc').max(500, 'Lý do không quá 500 ký tự'),
})

export default function RequestLeaveDialog({ isOpen, onClose }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.attendance)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(requestLeaveSchema),
        defaultValues: {
            leaveType: 'annual',
            shift: 'all_day',
            date: new Date().toISOString().split('T')[0],
        },
    })

    const onSubmit = async (data) => {
        try {
            await dispatch(requestLeave(data)).unwrap()
            reset()
            onClose()
        } catch {
            // Error is handled in the slice via toast
        }
    }

    const selectClassName =
        'h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800'

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[500px] p-6">
                <DialogHeader className="mb-6">
                    <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white/90">
                        Tạo đơn nghỉ phép
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="date">Ngày nghỉ</Label>
                        <Input id="date" type="date" {...register('date')} error={errors.date?.message} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="leaveType">Loại nghỉ</Label>
                            <div className="relative">
                                <select id="leaveType" {...register('leaveType')} className={selectClassName}>
                                    <option value="annual">Nghỉ phép năm</option>
                                    <option value="sick">Nghỉ ốm</option>
                                    <option value="unpaid">Nghỉ không lương</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            {errors.leaveType && (
                                <p className="mt-1.5 text-xs text-error-500">{errors.leaveType.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="shift">Ca nghỉ</Label>
                            <div className="relative">
                                <select id="shift" {...register('shift')} className={selectClassName}>
                                    <option value="all_day">Cả ngày</option>
                                    <option value="morning">Buổi sáng</option>
                                    <option value="afternoon">Buổi chiều</option>
                                </select>
                            </div>
                            {errors.shift && (
                                <p className="mt-1.5 text-xs text-error-500">{errors.shift.message}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="reason">Lý do</Label>
                        <TextArea
                            id="reason"
                            placeholder="Nhập lý do nghỉ..."
                            {...register('reason')}
                            error={!!errors.reason}
                            hint={errors.reason?.message}
                            rows={3}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose} type="button">
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={loading} disabled={loading}>
                            Gửi yêu cầu
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

