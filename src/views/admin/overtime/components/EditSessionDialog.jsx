import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, X } from 'lucide-react'
import { updateOvertimeSession } from '@/stores/OvertimeSlice'
import { getUsers } from '@/stores/UserSlice'
import MultipleSelector from '@/components/custom/MultiSelector'

const formSchema = z.object({
    sessionName: z.string().min(1, 'Tên phiên bắt buộc'),
    startTime: z.string().min(1, 'Thời gian bắt đầu bắt buộc'),
    endTime: z.string().optional(),
    status: z.enum(['open', 'closed', 'cancelled']),
    notes: z.string().optional(),
})

export default function EditSessionDialog({ isOpen, onClose, selectedSession }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.overtime)
    const { users } = useSelector((state) => state.user)

    const [selectedUsers, setSelectedUsers] = React.useState([])

    useEffect(() => {
        if (isOpen) {
            dispatch(getUsers({ limit: 1000, status: 'active' }))
        }
    }, [dispatch, isOpen])

    const userOptions = users.map(u => ({ label: `${u.fullName} - ${u.employeeCode || ''}`, value: u.id }))

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sessionName: '',
            startTime: '',
            endTime: '',
            status: 'open',
            notes: '',
        },
    })

    useEffect(() => {
        if (isOpen && selectedSession) {
            // Convert ISO dates to expected datetime-local format YYYY-MM-DDTHH:mm
            const formatForInput = (dateStr) => {
                if (!dateStr) return '';
                const date = new Date(dateStr)
                return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            }

            reset({
                sessionName: selectedSession.sessionName || '',
                startTime: formatForInput(selectedSession.startTime),
                endTime: formatForInput(selectedSession.endTime),
                status: selectedSession.status || 'open',
                notes: selectedSession.notes || '',
            })

            if (selectedSession.entries) {
                const initialUsers = selectedSession.entries.map(entry => ({
                    label: entry.user ? `${entry.user.fullName} - ${entry.user.employeeCode || ''}` : `Nhân viên #${entry.userId}`,
                    value: entry.userId
                }))
                setSelectedUsers(initialUsers)
            } else {
                setSelectedUsers([])
            }
        }
    }, [isOpen, selectedSession, reset])

    const handleClose = () => {
        reset()
        setSelectedUsers([])
        onClose()
    }

    const onSubmit = async (values) => {
        try {
            await dispatch(updateOvertimeSession({
                id: selectedSession.id,
                data: {
                    ...values,
                    startTime: new Date(values.startTime).toISOString(),
                    endTime: values.endTime ? new Date(values.endTime).toISOString() : undefined,
                    userIds: selectedUsers.map(u => u.value)
                }
            })).unwrap()

            handleClose()
        } catch (error) {
            console.error('Lỗi khi sửa phiên:', error)
        }
    }

    if (!isOpen || !selectedSession) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Sửa phiên tăng ca
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="sessionName" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tên phiên
                        </label>
                        <input
                            type="text"
                            id="sessionName"
                            placeholder="VD: Tăng ca tối 24/10"
                            {...register('sessionName')}
                            className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 
                                ${errors.sessionName
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500'
                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                        />
                        {errors.sessionName && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                {errors.sessionName.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Thời gian bắt đầu
                            </label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                {...register('startTime')}
                                className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 
                                    ${errors.startTime
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500'
                                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                            />
                            {errors.startTime && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    {errors.startTime.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="endTime" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Thời gian kết thúc (Tùy chọn)
                            </label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                {...register('endTime')}
                                className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 
                                    ${errors.endTime
                                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500'
                                    } bg-white dark:bg-gray-900 text-gray-900 dark:text-white`}
                            />
                            {errors.endTime && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    {errors.endTime.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Nhân viên tăng ca
                        </label>
                        <MultipleSelector
                            defaultOptions={userOptions}
                            value={selectedUsers}
                            onChange={setSelectedUsers}
                            placeholder="Chọn nhân viên..."
                            emptyIndicator={<p className="text-center text-sm text-gray-500">Không tìm thấy nhân viên</p>}
                            className="bg-white dark:bg-gray-900"
                            badgeClassName="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Trạng thái
                        </label>
                        <select
                            id="status"
                            {...register('status')}
                            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="open">Đang mở (Open)</option>
                            <option value="closed">Đã đóng (Closed)</option>
                            <option value="cancelled">Đã hủy (Cancelled)</option>
                        </select>
                        {errors.status && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                {errors.status.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="notes" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Ghi chú
                        </label>
                        <textarea
                            id="notes"
                            placeholder="Ghi chú thêm..."
                            {...register('notes')}
                            rows={3}
                            className={`block w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 
                                ${errors.notes
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:focus:border-blue-500'
                                } bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none`}
                        />
                        {errors.notes && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                {errors.notes.message}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
