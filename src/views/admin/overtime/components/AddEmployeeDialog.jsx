import React, { useState, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Loader2 } from "lucide-react"
import { getUsers } from "@/stores/UserSlice"
import { addEmployeesToSession } from "@/stores/OvertimeSlice"

export default function AddEmployeeDialog({ sessionId, existingUserIds = [], onSuccess }) {
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [selectedIds, setSelectedIds] = useState([])
    const [isAdding, setIsAdding] = useState(false)

    const users = useSelector(state => state.user.users) || []
    const loadingUsers = useSelector(state => state.user.loading)

    useEffect(() => {
        if (isOpen && users.length === 0) {
            dispatch(getUsers({ status: 'active', limit: 100 }))
        }
        if (!isOpen) {
            setSearch("")
            setSelectedIds([])
        }
    }, [isOpen, dispatch, users.length])

    const filteredUsers = useMemo(() => {
        return users.filter(
            (user) =>
                !existingUserIds.includes(user.id) &&
                (user.fullName.toLowerCase().includes(search.toLowerCase()) ||
                    user.employeeCode.toLowerCase().includes(search.toLowerCase()))
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
        setIsAdding(true)
        try {
            await dispatch(addEmployeesToSession({ sessionId, userIds: selectedIds })).unwrap()
            setIsOpen(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <>
            <Button variant="outline" onClick={() => setIsOpen(true)} className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                Thêm nhân viên
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Thêm nhân viên vào phiên</DialogTitle>
                        <p className="text-sm text-gray-500">Chọn nhân viên để thêm vào phiên tăng ca này.</p>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                className="pl-10"
                                placeholder="Tìm kiếm nhân viên (Tên, Mã NV)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="h-[300px] overflow-y-auto border border-gray-200 rounded-md p-2 space-y-1 bg-gray-50">
                            {loadingUsers ? (
                                <div className="flex justify-center py-8">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    Không tìm thấy nhân viên phù hợp
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center space-x-3 p-3 hover:bg-blue-50 bg-white rounded-md border border-gray-100 cursor-pointer shadow-sm transition-colors"
                                        onClick={() => toggleUser(user.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(user.id)}
                                            onChange={() => toggleUser(user.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {user.employeeCode} - {user.role?.roleName || "Chưa có chức vụ"}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 px-1">
                            <span>Đã chọn: <strong className="text-gray-900">{selectedIds.length}</strong> nhân viên</span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isAdding}>
                            Hủy
                        </Button>
                        <Button onClick={handleAdd} disabled={isAdding || selectedIds.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Thêm đã chọn
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
