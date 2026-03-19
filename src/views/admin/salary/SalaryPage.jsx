import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    getSalaries,
    getSalarySummary,
    approveSalary,
    deleteSalary,
    paySalary,
} from "@/stores/SalarySlice";
import { getUsers } from "@/stores/UserSlice";
import { getRoles } from "@/stores/RoleSlice";
import { getWarehouses } from "@/stores/WarehouseSlice";
import SalaryStatusBadge, {
    MonthDisplay,
    formatCurrency,
} from "./components/SalaryStatus";
import { MonthPicker } from "../attendance/components/MonthPicker";
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
import CustomPagination from "@/components/CustomPagination";
import { Layout, LayoutBody } from '@/components/custom/Layout';

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

    // Month filter default to empty string (all months)
    const [monthFilter, setMonthFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
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
        };
        if (monthFilter) params.month = monthFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        if (statusFilter !== "all") params.status = statusFilter;
        if (roleFilter !== 0) params.roleId = roleFilter;
        if (warehouseFilter !== 0) params.warehouseId = warehouseFilter;

        dispatch(getSalaries(params));
        // Fetch summary for the selected month limit
        const summaryParams = {};
        if (monthFilter) {
            summaryParams.fromMonth = monthFilter;
            summaryParams.toMonth = monthFilter;
        } else {
            const currentYear = new Date().getFullYear();
            summaryParams.fromMonth = `${currentYear}01`;
            summaryParams.toMonth = `${currentYear}12`;
        }
        dispatch(
            getSalarySummary(summaryParams)
        );
    }, [
        dispatch,
        page,
        limit,
        debouncedSearch,
        monthFilter,
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

    const handlePay = (id) => {
        if (window.confirm("Xác nhận thanh toán cho bảng lương này?")) {
            dispatch(paySalary({ id, data: { paymentDate: new Date().toISOString(), paymentMethod: 'cash', notes: 'Thanh toán tự động' } }));
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
        statusFilter !== "all" ||
        roleFilter !== 0 ||
        warehouseFilter !== 0;

    const handleResetFilters = () => {
        setSearchTerm("");
        setMonthFilter("");
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

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Danh sách bảng lương
                        </h2>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 flex flex-col space-y-4">
                    {/* Toolbar */}
                    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
                        <div className="flex flex-1 items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Tìm tên, mã NV..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex h-8 w-[150px] lg:w-[200px] rounded-md border border-input bg-transparent px-8 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

                            <MonthPicker 
                                value={monthFilter ? `${monthFilter.substring(0,4)}-${monthFilter.substring(4,6)}` : ""} 
                                onChange={(val) => setMonthFilter(val.replace("-", ""))} 
                            />

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-8 min-w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                            >
                                <option value="all">Trạng thái (Tất cả)</option>
                                <option value="pending">Chờ duyệt</option>
                                <option value="approved">Đã duyệt</option>
                                <option value="paid">Đã thanh toán</option>
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={handleResetFilters}
                                    className="inline-flex h-8 items-center justify-center rounded-md px-2 lg:px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    Đặt lại
                                    <X className="ml-2 h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowAutoCalcDialog(true)}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-green-600 px-3 text-sm font-medium text-white shadow hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-700"
                            >
                                <Calculator className="mr-2 h-4 w-4" aria-hidden="true" />
                                Tính tự động
                            </button>
                            <button
                                onClick={() => navigate("/salary/calculate")}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-700"
                            >
                                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                                Lương cá nhân
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="flex-1 overflow-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                                                {salary.status === "approved" && (
                                                    <button
                                                        onClick={() => handlePay(salary.id)}
                                                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                                                        title="Thanh toán"
                                                    >
                                                        <Banknote className="w-5 h-5" />
                                                    </button>
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

                {meta && (
                    <CustomPagination 
                        totalItems={meta.total || 0}
                        currentPage={page}
                        pageSize={limit}
                        onPageChange={handlePageChange}
                        onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                    />
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
            </LayoutBody>
        </Layout>
    );
}

