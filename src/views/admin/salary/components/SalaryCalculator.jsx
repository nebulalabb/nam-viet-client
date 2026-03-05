import React, { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
import { calculateSalary } from "@/stores/SalarySlice";
import { fetchUsers } from "@/stores/UserSlice";
import { SalaryBreakdown } from "./SalaryStatus";
import { formatMonth } from "./SalaryStatus";
import {
    User,
    Calendar,
    DollarSign,
    Calculator,
    CheckCircle,
    AlertCircle,
    ChevronLeft
} from "lucide-react";

// Using native input date type month for simplicity, or we can use a custom MonthPicker
// YYYYMM format
const dateToMonth = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
}

const calculateSalarySchema = z.object({
    userId: z.number().min(1, "Vui lòng chọn nhân viên"),
    month: z.string().min(6, "Vui lòng chọn tháng"),
    basicSalary: z.number().min(0, "Lương cơ bản không hợp lệ"),
    allowance: z.number().min(0).optional().default(0),
    bonus: z.number().min(0).optional().default(0),
    advance: z.number().min(0).optional().default(0),
    notes: z.string().optional(),
});


function Step({ number, title, active, completed }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-base shadow-sm font-bold transition-all duration-300 ${completed
                        ? "bg-green-500 text-white shadow-green-500/30 ring-4 ring-green-50"
                        : active
                            ? "bg-blue-600 text-white shadow-blue-600/30 ring-4 ring-blue-50"
                            : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
            >
                {completed ? <CheckCircle className="w-6 h-6" /> : number}
            </div>
            <span
                className={`text-sm font-semibold uppercase tracking-wider ${active || completed ? "text-gray-900" : "text-gray-400"
                    }`}
            >
                {title}
            </span>
        </div>
    );
}

export default function SalaryCalculator({ onSuccess, onCancel, className = "" }) {
    const dispatch = useDispatch();
    const [step, setStep] = useState("select");
    const [preview, setPreview] = useState(null);

    const { users } = useSelector((state) => state.user);
    const { loading: isCalculating } = useSelector((state) => state.salary);

    const {
        register,
        handleSubmit,
        watch,
        control,
        setValue,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(calculateSalarySchema),
        defaultValues: {
            userId: 0,
            month: dateToMonth(new Date()),
            basicSalary: 0,
            allowance: 0,
            bonus: 0,
            advance: 0,
        },
        mode: "onChange"
    });

    const selectedUserId = watch("userId");
    const selectedMonth = watch("month");

    const selectedUser = useMemo(
        () => users.find((u) => u.id === selectedUserId),
        [users, selectedUserId]
    );

    useEffect(() => {
        if (users.length === 0) {
            dispatch(fetchUsers({ limit: 1000 }));
        }
    }, [dispatch, users.length]);

    const handleCalculate = async (data) => {
        try {
            const result = await dispatch(calculateSalary(data)).unwrap();
            setPreview(result.data);
            setStep("preview");
        } catch (error) {
            // Error is handled in the thunk via toast
        }
    };

    const handleConfirm = () => {
        if (onSuccess) onSuccess();
    };

    const handleBack = () => {
        if (step === "preview") {
            setStep("input");
            setPreview(null);
        } else if (step === "input") {
            setStep("select");
        }
    };

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>

            {/* Header & Steps */}
            <div className="bg-gray-50 border-b border-gray-200 p-8">
                <div className="flex items-center justify-between max-w-2xl mx-auto relative px-4">

                    {/* Progress Line */}
                    <div className="absolute top-6 left-16 right-16 h-[2px] bg-gray-200 -z-0">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
                            style={{
                                width: step === 'select' ? '0%' : step === 'input' ? '50%' : '100%',
                                backgroundColor: step === 'preview' ? '#22c55e' : '#3b82f6'
                            }}
                        />
                    </div>

                    <div className="relative z-10 w-full flex justify-between">
                        <Step
                            number={1}
                            title="Chọn nhân viên"
                            active={step === "select"}
                            completed={step !== "select"}
                        />
                        <Step
                            number={2}
                            title="Nhập thông tin"
                            active={step === "input"}
                            completed={step === "preview"}
                        />
                        <Step
                            number={3}
                            title="Xem trước"
                            active={step === "preview"}
                        />
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-3xl mx-auto">
                <form onSubmit={handleSubmit(handleCalculate)}>

                    {/* Step 1: Select Employee & Month */}
                    {step === "select" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
                                    Bắt đầu tính lương
                                </h3>
                                <p className="text-gray-500 font-medium">Chọn nhân viên và thời gian thanh toán lương</p>
                            </div>

                            <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm space-y-6">
                                {/* User Selector */}
                                <div>
                                    <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                        <User className="w-4 h-4 mr-2 text-blue-500" />
                                        Nhân viên <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="userId"
                                        render={({ field }) => (
                                            <select
                                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={field.value}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            >
                                                <option value={0} disabled>-- Chọn nhân viên --</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.employeeCode} - {u.fullName}</option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.userId && (
                                        <p className="text-sm font-medium text-red-500 mt-2 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.userId.message}
                                        </p>
                                    )}
                                </div>

                                {/* Month Selector */}
                                <div>
                                    <label className="flex items-center text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        Tháng <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <Controller
                                        control={control}
                                        name="month"
                                        render={({ field }) => (
                                            <input
                                                type="month"
                                                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-gray-900 font-medium focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                value={field.value ? `${field.value.substring(0, 4)}-${field.value.substring(4, 6)}` : ""}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val) {
                                                        const formatted = val.replace("-", "");
                                                        field.onChange(formatted);
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    {errors.month && (
                                        <p className="text-sm font-medium text-red-500 mt-2 flex items-center">
                                            <AlertCircle className="w-4 h-4 mr-1" /> {errors.month.message}
                                        </p>
                                    )}
                                </div>

                                {/* Selected Info */}
                                {selectedUser && selectedMonth && selectedMonth.length === 6 && (
                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-start">
                                        <div className="p-2 bg-blue-100 rounded-lg mr-4">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 uppercase tracking-wider mb-1">Xác nhận thông tin</p>
                                            <p className="text-base text-blue-900 font-semibold">
                                                Sẽ tính lương cho <strong>{selectedUser.fullName}</strong> ({selectedUser.employeeCode}) trong <strong>{formatMonth(selectedMonth)}</strong>.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4">
                                {onCancel ? (
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="px-6 py-3 font-semibold border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        Hủy bỏ
                                    </button>
                                ) : <div></div>}

                                <button
                                    type="button"
                                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                    onClick={() => setStep("input")}
                                    disabled={!selectedUserId || !selectedMonth || selectedMonth.length !== 6}
                                >
                                    Tiếp tục &rarr;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Input Salary Components */}
                    {step === "input" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
                                    Thành phần lương
                                </h3>
                                <p className="text-gray-500 font-medium">Nhập các khoản cố định. Hoa hồng và OT sẽ được hệ thống tính tự động.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-1 md:col-span-2 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl relative overflow-hidden">
                                    <div className="absolute right-0 top-0 opacity-10">
                                        <DollarSign className="w-48 h-48 -mt-10 -mr-10 text-blue-600" />
                                    </div>
                                    <div className="relative z-10 w-full md:w-1/2">
                                        <label className="flex items-center text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider">
                                            <DollarSign className="w-4 h-4 mr-2" />
                                            Lương cơ bản <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("basicSalary", { valueAsNumber: true })}
                                            className="block w-full text-xl rounded-xl border border-blue-200 bg-white px-4 py-3 text-blue-900 font-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
                                            placeholder="0"
                                        />
                                        {errors.basicSalary && (
                                            <p className="text-sm font-medium text-red-500 mt-2 flex items-center">
                                                <AlertCircle className="w-4 h-4 mr-1" /> {errors.basicSalary.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Allowance */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">
                                        Phụ cấp
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("allowance", { valueAsNumber: true })}
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 font-bold focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all pl-10"
                                            placeholder="0"
                                        />
                                        <div className="absolute left-3.5 top-3.5 text-gray-400 font-bold">₫</div>
                                    </div>
                                </div>

                                {/* Bonus */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">
                                        Thưởng
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("bonus", { valueAsNumber: true })}
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-green-700 font-bold focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all pl-10"
                                            placeholder="0"
                                        />
                                        <div className="absolute left-3.5 top-3.5 text-green-400 font-bold">₫</div>
                                    </div>
                                </div>

                                {/* Advance */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">
                                        Tạm ứng (Khấu trừ)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="1000"
                                            {...register("advance", { valueAsNumber: true })}
                                            className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-red-700 font-bold focus:border-red-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all pl-10"
                                            placeholder="0"
                                        />
                                        <div className="absolute left-3.5 top-3.5 text-red-400 font-bold">₫</div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider ml-1">
                                        Ghi chú nội bộ
                                    </label>
                                    <textarea
                                        {...register("notes")}
                                        rows={3}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                        placeholder="Ví dụ: Tạm ứng mượn xe công ty..."
                                    />
                                </div>

                            </div>

                            {/* Info Box */}
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start shadow-sm">
                                <AlertCircle className="w-5 h-5 text-amber-500 mr-3 mt-0.5 shrink-0" />
                                <p className="text-sm text-amber-800 font-medium">
                                    Hoa hồng sẽ được hệ thống tính tự động dựa trên doanh số và cấu hình hệ số bán hàng. Giờ tăng ca được lấy từ các phiên tăng ca đã đóng.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="inline-flex items-center px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                                </button>

                                <button
                                    type="submit"
                                    disabled={isCalculating || !isValid}
                                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                                >
                                    {isCalculating ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>
                                            <Calculator className="w-5 h-5 mr-2" />
                                            Chạy tính toán
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preview */}
                    {step === "preview" && preview && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
                                    Kết quả dự kiến
                                </h3>
                                <p className="text-gray-500 font-medium">Kiểm tra kỹ các con số dưới đây trước khi xác nhận lưu bản nháp.</p>
                            </div>

                            {/* Employee Info Header */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                                <div className="absolute -right-10 -top-10 opacity-10">
                                    <User className="w-40 h-40" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-700/50 pb-4 mb-4">
                                    <div>
                                        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Mã NV: {preview.user?.employeeCode}</p>
                                        <h4 className="text-2xl font-black text-white">{preview.user?.fullName}</h4>
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5">
                                        <p className="text-gray-300 text-xs font-bold uppercase tracking-wider">Kỳ tính lương</p>
                                        <p className="text-lg font-bold text-white">{formatMonth(preview.month)}</p>
                                    </div>
                                </div>

                                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ngày công HT</p>
                                        <p className="text-xl font-bold">{preview.workDays} <span className="text-sm font-normal text-gray-500">ngày</span></p>
                                    </div>
                                    {preview.overtimeHours > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">OT đã duyệt</p>
                                            <p className="text-xl font-bold">{preview.overtimeHours} <span className="text-sm font-normal text-gray-500">giờ</span></p>
                                        </div>
                                    )}
                                    {(preview.totalSales || 0) > 0 && (
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Doanh số</p>
                                            <p className="text-xl font-bold text-green-400">{(preview.totalSales || 0).toLocaleString()} <span className="text-sm font-normal text-gray-500">₫</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Salary Breakdown component */}
                            <SalaryBreakdown
                                basicSalary={preview.basicSalary}
                                allowance={preview.allowance}
                                overtimePay={preview.overtimePay}
                                bonus={preview.bonus}
                                commission={preview.commission}
                                deduction={preview.deduction}
                                advance={preview.advance}
                                totalSalary={preview.totalSalary}
                                className="border-2 border-gray-100 shadow-xl"
                            />

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="inline-flex items-center px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Chỉnh sửa
                                </button>

                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/40 hover:-translate-y-0.5 transition-all"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Lưu bảng lương
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
