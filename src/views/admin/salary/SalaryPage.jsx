import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getSalaries,
    getSalarySummary,
    approveSalary,
    deleteSalary,
} from "@/stores/SalarySlice";
import { getUsers } from "@/stores/UserSlice";
import { getRoles } from "@/stores/RoleSlice";
import { getWarehouses } from "@/stores/WarehouseSlice";
import SalaryStatusBadge, {
    MonthDisplay,
    PostedStatus,
    formatCurrency,
} from "./components/SalaryStatus";
import AutoCalculateDialog from "./components/AutoCalculateDialog";
import SalaryDetailDialog from "./components/SalaryDetailDialog";
import {
    CheckCircle,
    Trash2,
    Eye,
    Calculator,
    Banknote,
    X,
    Search,
    FileText,
    Plus,
} from "lucide-react";
import Pagination from "@/components/Pagination";

// Custom debounce hook for search
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function SalaryPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showAutoCalcDialog, setShowAutoCalcDialog] = useState(false);
    const [selectedSalaryId, setSelectedSalaryId] = useState(null);

    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);

    // Month filter default to current month YYYYMM
    const [monthFilter, setMonthFilter] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [statusFilter, setStatusFilter] = useState("all");
    const [userFilter, setUserFilter] = useState(0);
    const [roleFilter, setRoleFilter] = useState(0);
    const [warehouseFilter, setWarehouseFilter] = useState(0);

    const { salaries, meta, loading, salarySummary } = useSelector(
        (state) => state.salary
    );
    const { users } = useSelector((state) => state.user);
    const { roles } = useSelector((state) => state.role);
    const { warehouses } = useSelector((state) => state.warehouse);

    // Initial fetches for filter options
    useEffect(() => {
        dispatch(getUsers({ status: "active", limit: 1000 }));
        dispatch(getRoles({ limit: 100 }));
        dispatch(getWarehouses({ limit: 100 }));
    }, [dispatch]);

    // Fetch salary list and summary when filters change
    useEffect(() => {
        const params = {
            page,
            limit,
            month: monthFilter,
        };
        if (debouncedSearch) params.search = debouncedSearch;
        if (userFilter !== 0) params.userId = userFilter;
        if (statusFilter !== "all") params.status = statusFilter;
        if (roleFilter !== 0) params.roleId = roleFilter;
        if (warehouseFilter !== 0) params.warehouseId = warehouseFilter;

        dispatch(getSalaries(params));
        // Fetch summary for the selected month limit
        dispatch(
            getSalarySummary({ fromMonth: monthFilter, toMonth: monthFilter })
        );
    }, [
        dispatch,
        page,
        limit,
        debouncedSearch,
        monthFilter,
        userFilter,
        statusFilter,
        roleFilter,
        warehouseFilter,
    ]);

    // Reset page when filters change (except page)
    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        monthFilter,
        userFilter,
        statusFilter,
        roleFilter,
        warehouseFilter,
    ]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleApprove = (id) => {
        if (window.confirm("Xác nhận phê duyệt bảng lương này?")) {
            dispatch(approveSalary({ id }));
        }
    };

    const handleDelete = (id) => {
        if (
            window.confirm("Xác nhận xóa bảng lương này? Hành động này không thể hoàn tác!")
        ) {
            dispatch(deleteSalary(id));
        }
    };

    const hasActiveFilters =
        !!searchTerm ||
        userFilter !== 0 ||
        statusFilter !== "all" ||
        roleFilter !== 0 ||
        warehouseFilter !== 0;

    const handleResetFilters = () => {
        setSearchTerm("");
        const now = new Date();
        setMonthFilter(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`);
        setUserFilter(0);
        setStatusFilter("all");
        setRoleFilter(0);
        setWarehouseFilter(0);
        setPage(1);
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: "Chờ duyệt",
            approved: "Đã duyệt",
            paid: "Đã thanh toán",
        };
        return labels[status] || status;
    };

    // Safe parsing for month input which expects YYYY-MM
    const monthInputDisplay =
        monthFilter.length === 6
            ? `${monthFilter.substring(0, 4)}-${monthFilter.substring(4, 6)}`
            : "";

    const handleMonthChange = (e) => {
        const val = e.target.value; // YYYY-MM
        if (val) {
            setMonthFilter(val.replace("-", ""));
        } else {
            setMonthFilter("");
        }
    };

    return (
        <div className="w-full space-y-6 h-full overflow-y-auto pb-10 pr-2">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Quản lý Lương
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Quản lý và theo dõi bảng lương nhân viên
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAutoCalcDialog(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Calculator className="w-4 h-4" />
                        Tính tự động hàng loạt
                    </button>
                    <button
                        onClick={() => navigate("/salary/calculate")}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tính lương cá nhân
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-yellow-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-yellow-950">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Chờ Duyệt
                            </p>
                            <p className="mt-3 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {salarySummary?.byStatus?.pending || 0}
                            </p>
                        </div>
                        <div className="border-2 border-yellow-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50">
                            <Calculator className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-blue-950">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Đã Duyệt
                            </p>
                            <p className="mt-3 text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {salarySummary?.byStatus?.approved || 0}
                            </p>
                        </div>
                        <div className="border-2 border-blue-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-green-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-green-950">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Đã Thanh Toán
                            </p>
                            <p className="mt-3 text-3xl font-bold text-green-600 dark:text-green-400">
                                {salarySummary?.byStatus?.paid || 0}
                            </p>
                        </div>
                        <div className="border-2 border-green-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50">
                            <Banknote className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-white to-purple-50 p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer dark:border-gray-800 dark:from-gray-900 dark:to-purple-950">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Tổng Tiền
                            </p>
                            <p className="mt-3 text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(
                                    (salarySummary?.totalBasicSalary || 0) +
                                    (salarySummary?.totalAllowance || 0) +
                                    (salarySummary?.totalBonus || 0)
                                )}
                            </p>
                        </div>
                        <div className="border-2 border-purple-500 rounded-xl p-3 bg-white/50 dark:bg-gray-900/50">
                            <Banknote className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tìm kiếm
                    </label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            placeholder="Tên, mã NV..."
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tháng
                    </label>
                    <input
                        type="month"
                        value={monthInputDisplay}
                        onChange={handleMonthChange}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nhân viên
                    </label>
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(Number(e.target.value))}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value={0}>Tất cả</option>
                        {users?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.fullName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Trạng thái
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="all">Tất cả</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="approved">Đã duyệt</option>
                        <option value="paid">Đã thanh toán</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vai trò
                    </label>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(Number(e.target.value))}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value={0}>Tất cả</option>
                        {roles?.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.roleName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Kho
                    </label>
                    <select
                        value={warehouseFilter}
                        onChange={(e) => setWarehouseFilter(Number(e.target.value))}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value={0}>Tất cả</option>
                        {warehouses?.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.warehouseName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleResetFilters}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    >
                        <X className="h-3.5 w-3.5" />
                        Xóa bộ lọc
                    </button>
                </div>
            )}

            {/* Table Content */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
                    </div>
                ) : !salaries || salaries.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <FileText className="mb-4 h-12 w-12 opacity-50" />
                        <p className="text-sm">Không tìm thấy dữ liệu lương</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Nhân viên
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tháng
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Lương CB
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Phụ cấp+OT
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Khấu trừ
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Tổng lương
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                {salaries.map((salary) => (
                                    <tr
                                        key={salary.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {salary.user?.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                {salary.user?.employeeCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <MonthDisplay month={salary.month} className="text-gray-700 dark:text-gray-300" />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                                            {formatCurrency(salary.basicSalary)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 dark:text-green-400">
                                            {formatCurrency(
                                                Number(salary.allowance || 0) +
                                                Number(salary.overtimePay || 0) +
                                                Number(salary.bonus || 0) +
                                                Number(salary.commission || 0)
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 dark:text-red-400">
                                            {formatCurrency((salary.deduction || 0) + (salary.advance || 0))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(salary.totalSalary)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <SalaryStatusBadge status={salary.status} />
                                                <PostedStatus isPosted={salary.isPosted} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => setSelectedSalaryId(salary.id)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {salary.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(salary.id)}
                                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                            title="Phê duyệt"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(salary.id)}
                                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex justify-end">
                    <Pagination
                        currentPage={page}
                        totalPages={meta.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            <AutoCalculateDialog 
                isOpen={showAutoCalcDialog} 
                onClose={() => setShowAutoCalcDialog(false)} 
            />

            <SalaryDetailDialog
                isOpen={!!selectedSalaryId}
                onClose={() => setSelectedSalaryId(null)}
                salaryId={selectedSalaryId}
            />
        </div>
    );
}

