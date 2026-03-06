import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, Plus, Search, X } from 'lucide-react'
import { addEmployeesToOvertime } from '@/stores/OvertimeSlice'

export default function AddEmployeeDialog({ sessionId, existingUserIds = [], isOpen, onClose }) {
    const dispatch = useDispatch()
    const { loading } = useSelector((state) => state.overtime)
    const { users, loading: usersLoading } = useSelector((state) => state.user)

    const [selectedIds, setSelectedIds] = useState([])
    const [search, setSearch] = useState('')

    const filteredUsers = useMemo(() => {
        if (!users) return []
        return users.filter(
            (user) =>
                !existingUserIds.includes(user.id) &&
                (user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                    user.employeeCode?.toLowerCase().includes(search.toLowerCase()))
        )
    }, [users, existingUserIds, search])

    const toggleUser = (userId) => {
        setSelectedIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
    }

    const handleAdd = async () => {
        if (selectedIds.length === 0) return
        try {
            await dispatch(addEmployeesToOvertime({ sessionId, userIds: selectedIds })).unwrap()
            // Toast success is handled in the thunk or slice
            setSelectedIds([])
            onClose()
        } catch (error) {
            console.error('Lỗi khi thêm nhân viên:', error)
        }
    }

    const handleClose = () => {
        setSearch('')
        setSelectedIds([])
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Thêm nhân viên vào phiên
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Chọn nhân viên để thêm vào phiên tăng ca này.
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            placeholder="Tìm kiếm nhân viên..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-[300px] overflow-y-auto rounded-md border border-gray-200 p-2 space-y-1 dark:border-gray-700">
                        {usersLoading ? (
                            <div className="flex h-full items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <p className="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                                Không tìm thấy nhân viên phù hợp
                            </p>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                    onClick={() => toggleUser(user.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(user.id)}
                                        onChange={() => toggleUser(user.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                                    />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.fullName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.employeeCode} - {user.role?.roleName || 'Chưa phân vai trò'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Đã chọn:{' '}
                            <span className="font-medium text-gray-900 dark:text-white">
                                {selectedIds.length}
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={loading || selectedIds.length === 0}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Thêm đã chọn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
