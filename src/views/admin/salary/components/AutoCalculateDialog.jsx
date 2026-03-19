import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Search, Calculator, AlertTriangle, ArrowLeft, CheckCircle } from "lucide-react";
import { calculateBatchSalary, getSalaries } from "@/stores/SalarySlice";
import api from "@/utils/axios";
import { getUsers } from "@/stores/UserSlice";
import { toast } from "sonner";

export default function AutoCalculateDialog({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const [month, setMonth] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState({});
    
    // UI states
    const [step, setStep] = useState(1);
    const [previewResults, setPreviewResults] = useState(null);
    const [existingSalaries, setExistingSalaries] = useState([]);
    const [isChecking, setIsChecking] = useState(false);

    const { users, loading: usersLoading } = useSelector((state) => state.user || { users: [], loading: false });
    const { loading: salaryLoading } = useSelector((state) => state.salary);

    // Initialize month to current month YYYYMM
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setPreviewResults(null);
            
            const date = new Date();
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            setMonth(`${yyyy}${mm}`);
            
            // Try to fetch users if not already there
            if (users && users.length === 0) {
                dispatch(getUsers({ status: "active", limit: 1000 }));
            }
        }
    }, [isOpen, dispatch, users.length]);

    // Check existing salaries for duplication warning
    useEffect(() => {
        if (isOpen && month && month.length === 6) {
            setIsChecking(true);
            api.get('/salary', { params: { month, limit: 1000 } })
                .then(res => {
                    const data = res.data?.data?.data || res.data?.data || [];
                    setExistingSalaries(data);
                })
                .catch(err => console.log("Failed to fetch existing"))
                .finally(() => setIsChecking(false));
        }
    }, [isOpen, month]);

    // Initialize user selection with default 10M basic salary
    useEffect(() => {
        if (users && users.length > 0 && Object.keys(selectedUsers).length === 0) {
            const initialMap = {};
            users.forEach(user => {
                if (user.status === 'active' && user.role?.name !== 'admin') {
                    // preselect all active non-admin users with 10M default salary
                    initialMap[user.id] = {
                        selected: true,
                        basicSalary: 10000000,
                        allowance: 0,
                        bonus: 0,
                        advance: 0
                    };
                }
            });
            setSelectedUsers(initialMap);
        }
    }, [users, selectedUsers]);

    if (!isOpen) return null;

    const handleFieldChange = (userId, field, value) => {
        const numValue = parseInt(value) || 0;
        setSelectedUsers(prev => ({
            ...prev,
            [userId]: {
                ...prev[userId],
                [field]: numValue
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
                    basicSalary: 10000000,
                    allowance: 0,
                    bonus: 0,
                    advance: 0
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
                newMap[user.id] = { selected: isChecked, basicSalary: 10000000, allowance: 0, bonus: 0, advance: 0 };
            }
        });
        setSelectedUsers(newMap);
    };

    const handlePreview = async () => {
        if (!month || month.length !== 6) {
            toast.error("Vui lòng nhập tháng hợp lệ (YYYYMM)");
            return;
        }

        const payloadUsers = Object.entries(selectedUsers)
            .filter(([_, data]) => data.selected)
            .map(([userId, data]) => ({
                userId: parseInt(userId),
                basicSalary: data.basicSalary,
                allowance: data.allowance,
                bonus: data.bonus,
                advance: data.advance
            }));

        if (payloadUsers.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 nhân viên");
            return;
        }

        try {
            const actionResult = await dispatch(calculateBatchSalary({
                month,
                users: payloadUsers,
                preview: true
            }));
            
            if (calculateBatchSalary.fulfilled.match(actionResult)) {
                setPreviewResults(actionResult.payload.data);
                toast.success("Dữ liệu xem trước đã tải thành công", { id: "preview-toast" }); // Optional toast rewrite
                setStep(2);
            }
        } catch (error) {
            console.log("preview error", error);
        }
    };

    const handleConfirmSubmit = async () => {
        const payloadUsers = Object.entries(selectedUsers)
            .filter(([_, data]) => data.selected)
            .map(([userId, data]) => ({
                userId: parseInt(userId),
                basicSalary: data.basicSalary,
                allowance: data.allowance,
                bonus: data.bonus,
                advance: data.advance
            }));

        try {
            const actionResult = await dispatch(calculateBatchSalary({
                month,
                users: payloadUsers,
                preview: false
            }));
            
            if (calculateBatchSalary.fulfilled.match(actionResult)) {
                toast.success("Đã ghi nhận dữ liệu lương đồng loạt thành công");
                onClose();
            }
        } catch (error) {
            console.log("submit error", error);
        }
    };

    const filteredUsers = (users || []).filter(user => 
        user.status === 'active' && 
        user.role?.name !== 'admin' &&
        (user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         user.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUsers[u.id]?.selected);

    const hasExistingWarning = Object.entries(selectedUsers).some(([userId, data]) => 
        data.selected && existingSalaries.find(s => s.userId === parseInt(userId))
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-blue-500" />
                            {step === 1 ? "Tính Lương Tự Động Hàng Loạt" : "Xem Trước Kết Quả Tính Lương"}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {step === 1 
                                ? "Hệ thống sẽ tự động ghép với tổng giờ làm, hoa hồng hóa đơn, bảo hiểm và ngày phép."
                                : "Xem trước và xác nhận dữ liệu lương sẽ được hệ thống khởi tạo."
                            }
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    {step === 1 ? (
                        <>
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

                            {/* Warning Banner */}
                            {hasExistingWarning && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex gap-3 items-center">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Có nhân viên được chọn <strong>đã có bảng lương</strong> trong tháng {month}. Việc tính tự động tiếp sẽ ghi đè lên những bảng lương hiện tại.
                                    </p>
                                </div>
                            )}

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
                                            <th className="px-4 py-3">Nhân viên</th>
                                            <th className="px-4 py-3 w-40">Lương cơ bản</th>
                                            <th className="px-4 py-3 w-32">Phụ cấp</th>
                                            <th className="px-4 py-3 w-32">Thưởng</th>
                                            <th className="px-4 py-3 w-32">Tạm ứng</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {usersLoading ? (
                                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Đang tải danh sách nhân viên...</td></tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Không tìm thấy nhân viên nào</td></tr>
                                        ) : (
                                            filteredUsers.map(user => {
                                                const isSelected = selectedUsers[user.id]?.selected || false;
                                                const basicSalary = selectedUsers[user.id]?.basicSalary ?? 10000000;
                                                const allowance = selectedUsers[user.id]?.allowance ?? 0;
                                                const bonus = selectedUsers[user.id]?.bonus ?? 0;
                                                const advance = selectedUsers[user.id]?.advance ?? 0;
                                                const prevSalInfo = existingSalaries.find(s => s.userId === user.id);

                                                return (
                                                    <tr key={user.id} className={isSelected ? "bg-blue-50/10 dark:bg-blue-900/10" : ""}>
                                                        <td className="px-4 py-3 text-center">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={isSelected}
                                                                onChange={() => handleToggleUser(user.id)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{user.fullName}</div>
                                                                    <div className="text-xs text-gray-500">{user.employeeCode}</div>
                                                                </div>
                                                                {prevSalInfo && isSelected && (
                                                                    <div title={`Đã có bảng lương: ${prevSalInfo.status}`} className="px-2 py-0.5 whitespace-nowrap bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full flex items-center gap-1">
                                                                        <AlertTriangle className="w-3 h-3" /> Đã có
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input 
                                                                type="number" 
                                                                value={basicSalary}
                                                                onChange={(e) => handleFieldChange(user.id, "basicSalary", e.target.value)}
                                                                disabled={!isSelected}
                                                                className={`w-full px-2 py-1.5 border rounded-md text-right ${isSelected ? 'border-blue-300 bg-white dark:bg-gray-800 dark:border-blue-500/50 focus:ring-2 focus:ring-blue-500' : 'border-transparent bg-transparent text-gray-400'}`}
                                                                step="100000" min="0"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input 
                                                                type="number" 
                                                                value={allowance}
                                                                onChange={(e) => handleFieldChange(user.id, "allowance", e.target.value)}
                                                                disabled={!isSelected}
                                                                className={`w-full px-2 py-1.5 border rounded-md text-right ${isSelected ? 'border-gray-300 bg-white dark:bg-gray-800' : 'border-transparent bg-transparent text-gray-400'}`}
                                                                step="10000" min="0" placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input 
                                                                type="number" 
                                                                value={bonus}
                                                                onChange={(e) => handleFieldChange(user.id, "bonus", e.target.value)}
                                                                disabled={!isSelected}
                                                                className={`w-full px-2 py-1.5 border rounded-md text-right ${isSelected ? 'border-gray-300 bg-white dark:bg-gray-800' : 'border-transparent bg-transparent text-gray-400'}`}
                                                                step="10000" min="0" placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input 
                                                                type="number" 
                                                                value={advance}
                                                                onChange={(e) => handleFieldChange(user.id, "advance", e.target.value)}
                                                                disabled={!isSelected}
                                                                className={`w-full px-2 py-1.5 border rounded-md text-right ${isSelected ? 'border-gray-300 bg-white dark:bg-gray-800' : 'border-transparent bg-transparent text-gray-400'}`}
                                                                step="10000" min="0" placeholder="0"
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        // Step 2: Preview Results
                        <div className="space-y-4">
                            {previewResults?.errors && previewResults.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                                    <h4 className="font-bold flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5"/>
                                        Lỗi xử lý {previewResults.errors.length} nhân viên (Không được phép ghi đè)
                                    </h4>
                                    <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                                        {previewResults.errors.map((err, idx) => (
                                            <li key={idx}>Nhân viên ID #{err.userId}: {err.message}</li>
                                        ))}
                                    </ul>
                                    <p className="mt-2 text-sm opacity-80">Các nhân viên bị lỗi sẽ bị bỏ qua khi tính tự động ở bước tiếp theo.</p>
                                </div>
                            )}

                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-4 py-3">Nhân viên</th>
                                            <th className="px-4 py-3 text-right">Tổng thu (+)</th>
                                            <th className="px-4 py-3 text-right">Khấu trừ (-)</th>
                                            <th className="px-4 py-3 text-right">Tạm ứng (-)</th>
                                            <th className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">Thực nhận</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {(!previewResults?.results || previewResults.results.length === 0) ? (
                                            <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Chưa có kết quả</td></tr>
                                        ) : (
                                            previewResults.results.map((salary, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{salary.user?.fullName}</div>
                                                        <div className="text-xs text-gray-500">{salary.user?.employeeCode}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary.breakdown?.grossIncome || 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary.breakdown?.insuranceDeduction + salary.breakdown?.tax || 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary.advance || 0)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-green-600 dark:text-green-400">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(salary.totalSalary || 0)}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                    <div>
                        {step === 2 && (
                            <button 
                                onClick={() => setStep(1)}
                                className="px-4 py-2 text-gray-700 flex items-center gap-2 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                <ArrowLeft className="w-4 h-4"/> Quay Lại Cập Nhật
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Hủy
                        </button>
                        {step === 1 ? (
                            <button 
                                onClick={handlePreview}
                                disabled={salaryLoading || isChecking || Object.values(selectedUsers).filter(u => u.selected).length === 0}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {salaryLoading || isChecking ? "Đang lấy dữ liệu..." : `Xem trước kết quả`}
                            </button>
                        ) : (
                            <button 
                                onClick={handleConfirmSubmit}
                                disabled={salaryLoading || previewResults?.results?.length === 0}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {salaryLoading ? (
                                    <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white animate-spin rounded-full border-t-transparent"/> Đang lưu...</div>
                                ) : (
                                    <><CheckCircle className="w-5 h-5"/> Xác nhận ({previewResults?.results?.length} bảng lương)</>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
