import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Plus, X } from 'lucide-react'
import { createOvertimeSession } from '@/stores/OvertimeSlice'

const formSchema = z.object({
    sessionName: z.string().min(1, 'Tên phiên bắt buộc'),
    startTime: z.string().min(1, 'Thời gian bắt đầu bắt buộc'),
    notes: z.string().optional(),
})

export default function CreateSessionDialog({ isOpen, onClose }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.overtime)

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
            notes: '',
        },
    })

    const handleClose = () => {
        reset()
        onClose()
    }

    const onSubmit = async (values) => {
        try {
            await dispatch(createOvertimeSession({
                ...values,
                startTime: new Date(values.startTime).toISOString(),
            })).unwrap()

            handleClose()
        } catch (error) {
            console.error('Lỗi khi tạo phiên:', error)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Mở phiên tăng ca mới
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Tạo phiên tăng ca để bắt đầu tính giờ làm thêm cho nhân viên.
                        </p>
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
                            Tạo phiên
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
