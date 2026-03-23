import React from "react";
import {
    CheckCircle,
    Clock,
    Banknote,
    AlertCircle,
} from "lucide-react";

// Types mapping equivalent
const SALARY_STATUS_LABELS = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    paid: "Đã thanh toán",
};

const PAYMENT_METHOD_LABELS = {
    cash: "Tiền mặt",
    transfer: "Chuyển khoản",
    installment: "Trả góp",
    credit: "Tín dụng",
};

const SALARY_COMPONENT_LABELS = {
    basicSalary: "Lương cơ bản",
    allowance: "Phụ cấp",
    overtimePay: "Lương làm thêm",
    bonus: "Thưởng",
    commission: "Hoa hồng",
    deduction: "Khấu trừ (Bảo hiểm, Thuế, Lương vượt phép...)",
    advance: "Tạm ứng",
    totalSalary: "Tổng lương",
};

export function formatMonth(month) {
    if (!month || month.length !== 6) return month;
    const year = month.substring(0, 4);
    const mon = month.substring(4, 6);
    return `${mon}/${year}`;
}

export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
}

//----------------------------------------------
// Status Badge Component
//----------------------------------------------

export default function SalaryStatusBadge({ status, className = "" }) {
    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700",
            approved: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700",
            paid: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            approved: <CheckCircle className="w-4 h-4" />,
            paid: <Banknote className="w-4 h-4" />,
        };
        return icons[status] || <AlertCircle className="w-4 h-4" />;
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                status
            )} ${className}`}
        >
            {getStatusIcon(status)}
            {SALARY_STATUS_LABELS[status] || "Không xác định"}
        </span>
    );
}

//----------------------------------------------
// Payment Method Display
//----------------------------------------------

export function PaymentMethodDisplay({ method, className = "" }) {
    const getMethodIcon = (method) => {
        const icons = {
            cash: <Banknote className="w-4 h-4" />,
            transfer: <Banknote className="w-4 h-4" />,
        };
        return icons[method] || <Banknote className="w-4 h-4" />;
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 ${className}`}
        >
            {getMethodIcon(method)}
            {PAYMENT_METHOD_LABELS[method] || method}
        </span>
    );
}

//----------------------------------------------
// Month Display
//----------------------------------------------

export function MonthDisplay({ month, className = "" }) {
    return (
        <span className={`text-sm font-medium ${className}`}>
            {formatMonth(month)}
        </span>
    );
}

//----------------------------------------------
// Currency Display
//----------------------------------------------

export function CurrencyDisplay({
    amount,
    label,
    positive,
    negative,
    className = "",
}) {
    const getColorClass = () => {
        if (positive) return "text-green-600 dark:text-green-400";
        if (negative) return "text-red-600 dark:text-red-400";
        if (amount < 0) return "text-red-600 dark:text-red-400";
        return "text-gray-900 dark:text-gray-100";
    };

    return (
        <div className={`${className}`}>
            {label && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {label}
                </div>
            )}
            <div className={`text-sm font-semibold ${getColorClass()}`}>
                {formatCurrency(amount)}
            </div>
        </div>
    );
}

//----------------------------------------------
// Salary Line Item (Internal)
//----------------------------------------------

function SalaryLineItem({
    label,
    amount,
    positive,
    negative,
    bold,
    large,
}) {
    const getColorClass = () => {
        if (positive) return "text-green-600 dark:text-green-400";
        if (negative) return "text-red-600 dark:text-red-400";
        return "text-gray-900 dark:text-gray-100";
    };

    const fontClass = bold ? "font-semibold" : "font-medium";
    const sizeClass = large ? "text-base" : "text-sm";

    return (
        <div className="flex items-center justify-between">
            <span
                className={`${sizeClass} text-gray-600 dark:text-gray-400 ${bold ? "font-semibold" : ""
                    }`}
            >
                {label}
            </span>
            <span className={`${sizeClass} ${fontClass} ${getColorClass()}`}>
                {formatCurrency(amount)}
            </span>
        </div>
    );
}

//----------------------------------------------
// Salary Breakdown Card
//----------------------------------------------

export function SalaryBreakdown({
    breakdown,
    basicSalary = 0,
    allowance = 0,
    overtimePay = 0,
    bonus = 0,
    commission = 0,
    deduction = 0,
    advance = 0,
    totalSalary = 0,
    className = "",
}) {
    // New detailed UI (prompt-based) when backend returns a `breakdown`.
    if (breakdown) {
        const standardWorkDays = Number(breakdown.standardWorkDays || 0);
        const workDaysActual = Number(breakdown.workDaysActual || 0); // X
        const lateCount = Number(breakdown.lateCount || 0); // M
        const permittedLeaveDays = Number(breakdown.permittedLeaveDays || 0); // P
        const unpermittedDays = Number(breakdown.unpermittedDays || 0); // KP

        const latePenaltyPerInstance = Number(breakdown.latePenaltyPerInstance || 0);
        const latePenaltyAmount = Number(breakdown.latePenaltyAmount || 0);

        const dailySalary = Number(breakdown.dailySalary || 0);
        const excessLeaveDays = Number(breakdown.excessLeaveDays || 0);
        const excessLeavePenalty = Number(breakdown.excessLeavePenalty || 0);

        const insuranceRate = Number(breakdown.insuranceRate || 0);
        const insuranceDeduction = Number(breakdown.insuranceDeduction || 0);

        const pitRate = Number(breakdown.pitRate || 0);
        const pitTax = Number(breakdown.pitTax || 0);

        const timeSalaryBase = Number(breakdown.timeSalaryBase || 0);
        const earnedNetSalary = Number(breakdown.netSalary ?? totalSalary ?? 0);

        const totalAdditions =
            timeSalaryBase +
            Number(allowance || 0) +
            Number(overtimePay || 0) +
            Number(bonus || 0) +
            Number(commission || 0);

        const totalDeductions =
            latePenaltyAmount +
            excessLeavePenalty +
            insuranceDeduction +
            pitTax +
            Number(advance || 0);

        return (
            <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Chi tiết lương</h3>

                {/* Attendance summary */}
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-4">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        Tóm tắt chấm công
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-600 dark:text-gray-300">Ngày công chuẩn</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{standardWorkDays}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-600 dark:text-gray-300">Đi làm thực tế (X)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{workDaysActual}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-600 dark:text-gray-300">Đi muộn (M)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{lateCount}</span>
                        </div>
                        <div className="flex justify-between gap-2">
                            <span className="text-gray-600 dark:text-gray-300">Nghỉ phép (P)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{permittedLeaveDays}</span>
                        </div>
                        <div className="flex justify-between gap-2 col-span-2">
                            <span className="text-gray-600 dark:text-gray-300">Nghỉ không phép (KP)</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 text-right">{unpermittedDays}</span>
                        </div>
                    </div>
                </div>

                {/* Income items */}
                <div className="space-y-2 mb-3">
                    <SalaryLineItem label="Lương thời gian" amount={timeSalaryBase} positive />
                    {allowance > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.allowance} amount={allowance} positive />}
                    {overtimePay > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.overtimePay} amount={overtimePay} positive />}
                    {bonus > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.bonus} amount={bonus} positive />}
                    {commission > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.commission} amount={commission} positive />}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-3">
                    <SalaryLineItem label="Tổng thu nhập" amount={totalAdditions} bold positive />
                </div>

                {/* Deduction items (prompt-based) */}
                <div className="space-y-2 mb-3">
                    {latePenaltyAmount > 0 && (
                        <SalaryLineItem
                            label={`Tiền phạt đi muộn: ${lateCount} x ${formatCurrency(latePenaltyPerInstance)}`}
                            amount={latePenaltyAmount}
                            negative
                        />
                    )}
                    {excessLeavePenalty > 0 && (
                        <SalaryLineItem
                            label={`Tiền phạt nghỉ quá phép: ${excessLeaveDays} x ${formatCurrency(dailySalary * 0.5)}`}
                            amount={excessLeavePenalty}
                            negative
                        />
                    )}
                    {insuranceDeduction > 0 && (
                        <SalaryLineItem
                            label={`Tiền bảo hiểm: ${(insuranceRate * 100).toFixed(1)}%`}
                            amount={insuranceDeduction}
                            negative
                        />
                    )}
                    {pitTax > 0 && (
                        <SalaryLineItem
                            label={`Thuế TNCN: ${(pitRate * 100).toFixed(0)}%`}
                            amount={pitTax}
                            negative
                        />
                    )}
                    {advance > 0 && (
                        <SalaryLineItem
                            label={SALARY_COMPONENT_LABELS.advance}
                            amount={advance}
                            negative
                        />
                    )}
                </div>

                {totalDeductions > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-3">
                        <SalaryLineItem label="Tổng khấu trừ" amount={totalDeductions} bold negative />
                    </div>
                )}

                <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                    <SalaryLineItem label={SALARY_COMPONENT_LABELS.totalSalary} amount={earnedNetSalary} bold large />
                </div>
            </div>
        );
    }

    // Legacy UI (fallback)
    const additions =
        Number(basicSalary || 0) +
        Number(allowance || 0) +
        Number(overtimePay || 0) +
        Number(bonus || 0) +
        Number(commission || 0);
    const deductions = Number(deduction || 0) + Number(advance || 0);

    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Chi tiết lương</h3>
            <div className="space-y-2 mb-3">
                <SalaryLineItem label={SALARY_COMPONENT_LABELS.basicSalary} amount={basicSalary} positive />
                {allowance > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.allowance} amount={allowance} positive />}
                {overtimePay > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.overtimePay} amount={overtimePay} positive />}
                {bonus > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.bonus} amount={bonus} positive />}
                {commission > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.commission} amount={commission} positive />}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-3">
                <SalaryLineItem label="Tổng thu nhập" amount={additions} bold positive />
            </div>
            {(deduction > 0 || advance > 0) && (
                <div className="space-y-2 mb-3">
                    {deduction > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.deduction} amount={deduction} negative />}
                    {advance > 0 && <SalaryLineItem label={SALARY_COMPONENT_LABELS.advance} amount={advance} negative />}
                </div>
            )}
            {deductions > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mb-3">
                    <SalaryLineItem label="Tổng khấu trừ" amount={deductions} bold negative />
                </div>
            )}
            <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                <SalaryLineItem label={SALARY_COMPONENT_LABELS.totalSalary} amount={totalSalary} bold large />
            </div>
        </div>
    );
}

//----------------------------------------------
// Salary Summary Card (for dashboard)
//----------------------------------------------

export function SalarySummaryCard({
    title,
    amount,
    icon,
    trend,
    className = "",
}) {
    return (
        <div
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {title}
                </span>
                {icon && (
                    <div className="text-gray-400 dark:text-gray-500">{icon}</div>
                )}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(amount)}
            </div>
            {trend && (
                <div className="mt-2 flex items-center gap-1">
                    <span
                        className={`text-xs font-medium ${trend.isPositive
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                    >
                        {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        so với tháng trước
                    </span>
                </div>
            )}
        </div>
    );
}

//----------------------------------------------
// Posted Status Indicator
//----------------------------------------------

export function PostedStatus({ isPosted, className = "" }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPosted
                    ? "bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700"
                    : "bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700"
                } ${className}`}
        >
            {isPosted ? (
                <>
                    <CheckCircle className="w-4 h-4" />
                    Đã thanh toán
                </>
            ) : (
                <>
                    <AlertCircle className="w-4 h-4" />
                    Chưa thanh toán
                </>
            )}
        </span>
    );
}
