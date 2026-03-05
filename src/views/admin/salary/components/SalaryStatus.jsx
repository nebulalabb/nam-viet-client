/**
 * SalaryStatus Component
 * Reusable components for displaying salary-related information
 */

import React from "react";
import { format } from "date-fns";
import {
    CheckCircle,
    Clock,
    Banknote,
    AlertCircle,
} from "lucide-react";

// Mocking types since typically they are in types folder
export const SALARY_STATUS_LABELS = {
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    paid: "Đã thanh toán",
};

export const PAYMENT_METHOD_LABELS = {
    cash: "Tiền mặt",
    transfer: "Chuyển khoản",
};

export const SALARY_COMPONENT_LABELS = {
    basicSalary: "Lương cơ bản",
    allowance: "Phụ cấp",
    overtimePay: "Lương tăng ca",
    bonus: "Thưởng",
    commission: "Hoa hồng",
    deduction: "Khấu trừ",
    advance: "Tạm ứng",
    totalSalary: "Tổng nhận",
};

// Utilities
export const formatMonth = (monthStr) => {
    if (!monthStr || monthStr.length !== 6) return monthStr;
    const year = monthStr.substring(0, 4);
    const month = monthStr.substring(4, 6);
    return `Tháng ${month}/${year}`;
}

export const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "0 đ";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

//----------------------------------------------
// Status Badge Component
//----------------------------------------------

export function SalaryStatusBadge({ status, className = "" }) {
    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            approved: "bg-blue-100 text-blue-800 border-blue-300",
            paid: "bg-green-100 text-green-800 border-green-300",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            approved: <CheckCircle className="w-4 h-4" />,
            paid: <Banknote className="w-4 h-4" />,
        };
        return icons[status];
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                status
            )} ${className}`}
        >
            {getStatusIcon(status)}
            {SALARY_STATUS_LABELS[status] || status}
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
        return icons[method];
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 text-sm text-gray-700 ${className}`}
        >
            {getMethodIcon(method)}
            {PAYMENT_METHOD_LABELS[method]}
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
        if (positive) return "text-green-600";
        if (negative) return "text-red-600";
        if (amount < 0) return "text-red-600";
        return "text-gray-900";
    };

    return (
        <div className={`${className}`}>
            {label && (
                <div className="text-xs text-gray-500 mb-1">
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
// Salary Breakdown Card
//----------------------------------------------

export function SalaryBreakdown({
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
    const additions = basicSalary + allowance + overtimePay + bonus + commission;
    const deductions = deduction + advance;

    return (
        <div
            className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm ${className}`}
        >
            <h3 className="text-base font-bold text-gray-900 mb-4 border-b pb-2">
                Chi tiết bảng lương
            </h3>

            {/* Income Items */}
            <div className="space-y-3 mb-4">
                <SalaryLineItem
                    label={SALARY_COMPONENT_LABELS.basicSalary}
                    amount={basicSalary}
                    positive
                />
                {allowance > 0 && (
                    <SalaryLineItem
                        label={SALARY_COMPONENT_LABELS.allowance}
                        amount={allowance}
                        positive
                    />
                )}
                {overtimePay > 0 && (
                    <SalaryLineItem
                        label={SALARY_COMPONENT_LABELS.overtimePay}
                        amount={overtimePay}
                        positive
                    />
                )}
                {bonus > 0 && (
                    <SalaryLineItem
                        label={SALARY_COMPONENT_LABELS.bonus}
                        amount={bonus}
                        positive
                    />
                )}
                {commission > 0 && (
                    <SalaryLineItem
                        label={SALARY_COMPONENT_LABELS.commission}
                        amount={commission}
                        positive
                    />
                )}
            </div>

            {/* Subtotal Additions */}
            <div className="border-t border-dashed border-gray-300 pt-3 mb-4">
                <SalaryLineItem
                    label="Tổng các khoản cộng"
                    amount={additions}
                    bold
                    positive
                />
            </div>

            {/* Deduction Items */}
            {(deduction > 0 || advance > 0) && (
                <div className="space-y-3 mb-4 bg-red-50/50 p-3 rounded-lg border border-red-50">
                    {deduction > 0 && (
                        <SalaryLineItem
                            label={SALARY_COMPONENT_LABELS.deduction}
                            amount={deduction}
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
                    <div className="border-t border-red-200 pt-2 mt-2">
                        <SalaryLineItem
                            label="Tổng các khoản trừ"
                            amount={deductions}
                            bold
                            negative
                        />
                    </div>
                </div>
            )}

            {/* Total */}
            <div className="border-t-2 border-gray-900 pt-4 mt-2">
                <SalaryLineItem
                    label={SALARY_COMPONENT_LABELS.totalSalary}
                    amount={totalSalary}
                    bold
                    large
                />
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
        if (positive) return "text-green-600";
        if (negative) return "text-red-600";
        return "text-gray-900";
    };

    const fontClass = bold ? "font-bold" : "font-medium";
    const sizeClass = large ? "text-xl font-black" : "text-sm";
    const labelClass = large ? "text-lg font-bold text-gray-900" : (bold ? "text-sm font-bold text-gray-700" : "text-sm text-gray-500");

    return (
        <div className="flex items-center justify-between">
            <span className={labelClass}>
                {label}
            </span>
            <span className={`${sizeClass} ${fontClass} ${getColorClass()}`}>
                {negative && amount > 0 ? "-" : ""}{formatCurrency(amount)}
            </span>
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
    color = "blue",
}) {
    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-emerald-50 text-emerald-600",
        purple: "bg-purple-50 text-purple-600",
        orange: "bg-orange-50 text-orange-600",
        yellow: "bg-yellow-50 text-yellow-600",
    }
    const c = colorMap[color] || colorMap.blue;

    return (
        <div
            className={`bg-white border border-gray-100 shadow-sm rounded-xl p-6 ${className}`}
        >
            <div className="flex items-center gap-4 mb-4">
                {icon && (
                    <div className={`p-3 rounded-xl ${c}`}>
                        {icon}
                    </div>
                )}
                <div>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {title}
                    </span>
                    <div className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                        {formatCurrency(amount)}
                    </div>
                </div>
            </div>

            {trend && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${trend.isPositive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                    </span>
                    <span className="text-xs font-medium text-gray-400">
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
                    ? "bg-purple-100 text-purple-800 border border-purple-300"
                    : "bg-gray-100 text-gray-800 border border-gray-300"
                } ${className}`}
        >
            {isPosted ? (
                <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    Đã hạch toán
                </>
            ) : (
                <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    Chưa hạch toán
                </>
            )}
        </span>
    );
}
