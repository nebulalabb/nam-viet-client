import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Search, Calculator } from "lucide-react";
import { calculateBatchSalary } from "@/stores/SalarySlice";
import { getUsers } from "@/stores/UserSlice";
import { toast } from "sonner";

export default function AutoCalculateDialog({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const [month, setMonth] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState({});

    const { users, loading: usersLoading } = useSelector((state) => state.user || { users: [], loading: false });
    const { loading: salaryLoading } = useSelector((state) => state.salary);

    // Initialize month to current month YYYYMM
    useEffect(() => {
        if (isOpen) {
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            setMonth(`${yyyy}${mm}`);
            
            // Try to fetch users if not already there
            if (users && users.length === 0) {
                dispatch(getUsers());
            }
        }
    }, [isOpen, dispatch, users]);

    // Initialize user selection with default 10M basic salary
    useEffect(() => {
        if (users && users.length > 0 && Object.keys(selectedUsers).length === 0) {
            const initialMap = {};
            users.forEach(user => {
                if (user.status === 'active' && user.role?.name !== 'admin') {
                    // preselect all active non-admin users with 10M default salary
                    initialMap[user.id] = {
                        selected: true,
                        basicSalary: 10000000
                    };
                }
            });
            setSelectedUsers(initialMap);
        }
    }, [users, selectedUsers]);

    if (!isOpen) return null;

    const handleSalaryChange = (userId, value) => {
        const numValue = parseInt(value) || 0;
        setSelectedUsers(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                basicSalary: numValue
            }
        }));
    };

    const handleToggleUser = (userId) => {
        setSelectedUsers(prev => {
            const exists = prev[userId];
            if (exists) {
                return {
                    ...prev,
                    [userId]: {
                        ...exists,
                        selected: !exists.selected
                    }
                };
            }
            return {
                ...prev,
                [userId]: {
                    selected: true,
                    basicSalary: 10000000
                }
            };
        });
    };

    const handleToggleAll = (e) => {
        const isChecked = e.target.checked;
        const newMap = { ...selectedUsers };
        filteredUsers.forEach(user => {
            if (newMap[user.id]) {
                newMap[user.id].selected = isChecked;
            } else {
                newMap[user.id] = { selected: isChecked, basicSalary: 10000000 };
            }
        });
        setSelectedUsers(newMap);
    };

    const handleSubmit = async () => {
        if (!month || month.length !== 6) {
            toast.error("Vui lòng nhập tháng hợp lệ (YYYYMM)");
            return;
        }

        const payloadUsers = Object.entries(selectedUsers)
            .filter(([_, data]) => data.selected)
            .map(([userId, data]) => ({
                userId: parseInt(userId),
                basicSalary: data.basicSalary
            }));

        if (payloadUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 nhân viên");
            return;
        }

        try {
            await dispatch(calculateBatchSalary({
                month,
                users: payloadUsers
            })).unwrap();
            
            toast.success("Đã tính lương hàng loạt thành công");
            onClose();
            // Assuming parent triggers a refresh on getSalaries
        } catch (error) {
            toast.error(error || "Có lỗi xảy ra khi tính lương tự động");
        }
    };

    const filteredUsers = (users || []).filter(user => 
        user.status === 'active' && 
        user.role?.name !== 'admin' &&
        (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers[u.id]?.selected);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-blue-500" />
                            Tính Lương Tự Động Hàng Loạt
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Hệ thống sẽ tự động ghép với tổng giờ làm, hoa hồng hóa đơn, bảo hiểm và ngày phép.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tháng tính lương (YYYYMM)
                            </label>
                            <input
                                type="text"
                                value={month}
                                onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                placeholder="VD: 202603"
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Tìm nhân viên
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Tìm theo tên hoặc mã NV..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="px-4 py-3 w-12 text-center">
                                        <input 
                                            type="checkbox" 
                                            checked={allFilteredSelected}
                                            onChange={handleToggleAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-4 py-3">Mã NV</th>
                                    <th className="px-4 py-3">Họ Tên</th>
                                    <th className="px-4 py-3">Vị trí</th>
                                    <th className="px-4 py-3 w-48">Lương cơ bản (Tuỳ chỉnh)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                {usersLoading ? (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Đang tải danh sách nhân viên...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Không tìm thấy nhân viên nào</td></tr>
                                ) : (
                                    filteredUsers.map(user => {
                                        const isSelected = selectedUsers[user.id]?.selected || false;
                                        const basicSalary = selectedUsers[user.id]?.basicSalary ?? 10000000;
                                        return (
                                            <tr key={user.id} className={isSelected ? "bg-blue-50/30 dark:bg-blue-900/10" : ""}>
                                                <td className="px-4 py-3 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => handleToggleUser(user.id)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{user.employeeCode}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{user.fullName}</td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 capitalize">{user.role?.name || 'User'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            value={basicSalary}
                                                            onChange={(e) => handleSalaryChange(user.id, e.target.value)}
                                                            disabled={!isSelected}
                                                            className={`w-full px-3 py-1.5 border rounded-md text-right ${isSelected ? 'border-blue-300 bg-white dark:bg-gray-800 dark:border-blue-500/50 focus:ring-2 focus:ring-blue-500' : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-gray-400'}`}
                                                            step="100000"
                                                            min="0"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">VNĐ</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Hủy
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={salaryLoading || Object.values(selectedUsers).filter(u => u.selected).length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {salaryLoading ? "Đang xử lý..." : `Tạo lương (${Object.values(selectedUsers).filter(u => u.selected).length} người)`}
                    </button>
                </div>
            </div>
        </div>
    );
}
