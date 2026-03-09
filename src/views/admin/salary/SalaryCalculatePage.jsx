import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import {
    calculateSalary, // from Thunk
} from "@/stores/SalarySlice";
import { getUsers } from "@/stores/UserSlice";
import { SalaryBreakdown, formatMonth } from "./components/SalaryStatus";
import {
    User as UserIcon,
    Calendar,
    DollarSign,
    Calculator,
    CheckCircle,
    ArrowLeft,
} from "lucide-react";

export default function SalaryCalculatePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [step, setStep] = useState(1);
    // Store the preview from API or calculation locally
    const { calculationPreview, loading } = useSelector((state) => state.salary);
    const { users } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(getUsers({ status: "active", limit: 1000 }));
    }, [dispatch]);

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            userId: "",
            month: (() => {
                const now = new Date();
                return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
            })(),
            basicSalary: 0,
            allowance: 0,
            bonus: 0,
            advance: 0,
            notes: "",
        },
    });

    const selectedUserId = watch("userId");
    const selectedMonth = watch("month");

    const selectedUser = useMemo(
        () => users.find((u) => u.id === Number(selectedUserId)),
        [users, selectedUserId]
    );

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            userId: Number(data.userId),
            basicSalary: Number(data.basicSalary || 0),
            allowance: Number(data.allowance || 0),
            bonus: Number(data.bonus || 0),
            advance: Number(data.advance || 0),
        };
        const actionResult = await dispatch(calculateSalary(payload));
        if (calculateSalary.fulfilled.match(actionResult)) {
            setStep(3); // Show preview
        }
    };

    const handleConfirm = () => {
        // When confirm, normally the endpoint already saves it as 'pending' according to NextJs code,
        // or it returns preview and we need a separate create API.
        // Based on useSalary in Nextjs, calculateMutation is expected to do the actual saving or at least calculate
        // The previous component just called onSuccess.
        navigate("/admin/salary");
    };

    const handleBack = () => {
        if (step === 3) {
            setStep(2);
        } else if (step === 2) {
            setStep(1);
        } else {
            navigate("/admin/salary");
        }
    };

    const monthInputDisplay =
        selectedMonth && selectedMonth.length === 6
            ? `${selectedMonth.substring(0, 4)}-${selectedMonth.substring(4, 6)}`
            : "";

    const handleMonthChange = (e) => {
        const val = e.target.value;
        if (val) {
            setValue("month", val.replace("-", ""));
        } else {
            setValue("month", "");
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={handleBack}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Tính lương nhân viên
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Nhập thông tin và tính toán lương dự kiến
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6">
                    {/* Progress Steps */}
                    <div className="mb-8 relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
                        <div className="relative flex justify-between">
                            <Step
                                number={1}
                                title="Chọn nhân viên"
                                active={step === 1}
                                completed={step > 1}
                            />
                            <Step
                                number={2}
                                title="Nhập thông tin"
                                active={step === 2}
                                completed={step > 2}
                            />
                            <Step
                                number={3}
                                title="Xem trước"
                                active={step === 3}
                                completed={false}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Step 1: Select Employee & Month */}
                        {step === 1 && (
                            <div className="space-y-6 max-w-2xl mx-auto">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <UserIcon className="w-4 h-4 inline mr-1" />
                                        Nhân viên <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register("userId", { required: "Vui lòng chọn nhân viên" })}
                                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    >
                                        <option value="">-- Chọn nhân viên --</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.fullName} - {user.employeeCode}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.userId && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.userId.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Tháng <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={monthInputDisplay}
                                        onChange={handleMonthChange}
                                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                    />
                                    {!selectedMonth && (
                                        <p className="text-sm text-red-500 mt-1">
                                            Vui lòng chọn tháng
                                        </p>
                                    )}
                                </div>

                                {selectedUser && selectedMonth && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                                        <p className="text-sm text-blue-800 dark:text-blue-400">
                                            <strong>Nhân viên:</strong> {selectedUser.fullName}
                                            <br />
                                            <strong>Mã NV:</strong> {selectedUser.employeeCode}
                                            <br />
                                            <strong>Tháng:</strong> {formatMonth(selectedMonth)}
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        disabled={!selectedUserId || !selectedMonth}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                                    >
                                        Tiếp theo
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Input Salary Components */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Salary */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1" />
                                            Lương cơ bản
                                        </label>
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("basicSalary", { valueAsNumber: true })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Allowance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1 text-transparent" />
                                            Phụ cấp
                                        </label>
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("allowance", { valueAsNumber: true })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Bonus */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1 text-transparent" />
                                            Thưởng
                                        </label>
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("bonus", { valueAsNumber: true })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Advance */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <DollarSign className="w-4 h-4 inline mr-1 text-transparent" />
                                            Tạm ứng
                                        </label>
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("advance", { valueAsNumber: true })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        {...register("notes")}
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ghi chú (không bắt buộc)"
                                    />
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                        <strong>Lưu ý:</strong> Lương làm thêm và hoa hồng sẽ được tính
                                        tự động dựa trên dữ liệu chấm công và doanh số bán hàng từ hệ thống.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-sm transition-colors"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Đang tính toán...
                                            </>
                                        ) : (
                                            <>
                                                <Calculator className="w-5 h-5" />
                                                Tính lương
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Preview */}
                        {step === 3 && calculationPreview && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
                                        Thông tin nhân viên
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Họ tên:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                {calculationPreview.user?.fullName || selectedUser?.fullName}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Mã NV:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                {calculationPreview.user?.employeeCode || selectedUser?.employeeCode}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Tháng:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                {formatMonth(calculationPreview.month || selectedMonth)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                Ngày công:
                                            </span>
                                            <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                {calculationPreview.workDays} ngày
                                            </span>
                                        </div>
                                        {calculationPreview.overtimeHours > 0 && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Giờ OT:
                                                </span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                    {calculationPreview.overtimeHours} giờ
                                                </span>
                                            </div>
                                        )}
                                        {calculationPreview.totalSales && calculationPreview.totalSales > 0 ? (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Doanh số:
                                                </span>
                                                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                                                    {calculationPreview.totalSales.toLocaleString("vi-VN")} đ
                                                </span>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <SalaryBreakdown
                                    basicSalary={calculationPreview.basicSalary}
                                    allowance={calculationPreview.allowance}
                                    overtimePay={calculationPreview.overtimePay}
                                    bonus={calculationPreview.bonus}
                                    commission={calculationPreview.commission}
                                    deduction={calculationPreview.deduction}
                                    advance={calculationPreview.advance}
                                    totalSalary={calculationPreview.totalSalary}
                                />

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={handleConfirm}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-sm transition-colors"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Xác nhận & Trở về
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

function Step({ number, title, active, completed }) {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10 bg-white dark:bg-gray-800 px-4">
            <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${completed
                        ? "bg-green-500 text-white shadow-md"
                        : active
                            ? "bg-blue-600 text-white shadow-md ring-4 ring-blue-100 dark:ring-blue-900/30"
                            : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    }`}
            >
                {completed ? <CheckCircle className="w-6 h-6" /> : number}
            </div>
            <span
                className={`text-xs font-medium whitespace-nowrap ${active || completed
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-500 dark:text-gray-500"
                    }`}
            >
                {title}
            </span>
        </div>
    );
}
