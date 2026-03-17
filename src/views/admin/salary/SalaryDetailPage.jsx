import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getSalaryById } from "@/stores/SalarySlice";
import { ArrowLeft, User, DollarSign, Calendar, Clock, PenTool } from "lucide-react";
import SalaryStatusBadge, {
    SalaryBreakdown,
    formatMonth,
    formatCurrency,
    PostedStatus,
    PaymentMethodDisplay
} from "./components/SalaryStatus";
import { toast } from "sonner";

export default function SalaryDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { currentSalary, loading, error } = useSelector((state) => state.salary);

    useEffect(() => {
        if (id) {
            dispatch(getSalaryById(id)).unwrap().catch((err) => {
                toast.error(err || "Không thể tải chi tiết lương");
            });
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !currentSalary) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <p className="text-gray-500 dark:text-gray-400">
                    {error || "Không tìm thấy bảng lương này"}
                </p>
                <button
                    onClick={() => navigate("/salary")}
                    className="text-blue-600 hover:text-blue-700 underline"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 h-full overflow-y-auto pb-10 pr-2">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate("/salary")}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        Chi tiết lương
                        <SalaryStatusBadge status={currentSalary.status} />
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Mã NV: {currentSalary.user?.employeeCode} | Kỳ lương: {formatMonth(currentSalary.month)}
                    </p>
                </div>
                {/* Actions could go here, like Export PDF */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Employee Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-500" />
                            Thông tin nhân viên
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">Họ tên:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{currentSalary.user?.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">Mã NV:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{currentSalary.user?.employeeCode}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{currentSalary.user?.email || "—"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            Thông tin phụ
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">Kỳ lương:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{formatMonth(currentSalary.month)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                                <span className="text-gray-500 dark:text-gray-400">Hạch toán:</span>
                                <PostedStatus isPosted={currentSalary.isPosted} />
                            </div>
                            {currentSalary.paymentMethod && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 dark:text-gray-400">Thanh toán:</span>
                                    <PaymentMethodDisplay method={currentSalary.paymentMethod} />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Notes Card */}
                    {(currentSalary.notes && currentSalary.notes.trim() !== '') && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-800 p-5">
                            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
                                <PenTool className="w-4 h-4" />
                                Ghi chú
                            </h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">
                                {currentSalary.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                            <DollarSign className="w-5 h-5 text-green-500" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Chi tiết thu nhập & Khấu trừ</h2>
                        </div>
                        
                        <SalaryBreakdown
                            basicSalary={Number(currentSalary.basicSalary)}
                            allowance={Number(currentSalary.allowance)}
                            overtimePay={Number(currentSalary.overtimePay)}
                            bonus={Number(currentSalary.bonus)}
                            commission={Number(currentSalary.commission)}
                            deduction={Number(currentSalary.deduction)}
                            advance={Number(currentSalary.advance)}
                            totalSalary={Number(currentSalary.totalSalary)}
                        />
                    </div>

                    {/* Timeline / Action History */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Lịch sử xử lý</h3>
                        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                            {/* Created */}
                            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 dark:bg-blue-900/30 dark:border-gray-800 dark:text-blue-400">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-bold text-gray-900 dark:text-white">Tạo phiếu lương</div>
                                        <time className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(currentSalary.createdAt).toLocaleDateString('vi-VN')}
                                        </time>
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Người tạo: {currentSalary.creator?.fullName || "Hệ thống"}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Approved */}
                            {currentSalary.approvedAt && (
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-100 text-green-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 dark:bg-green-900/30 dark:border-gray-800 dark:text-green-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow dark:bg-gray-800 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-gray-900 dark:text-white">Duyệt phiếu lương</div>
                                            <time className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(currentSalary.approvedAt).toLocaleDateString('vi-VN')}
                                            </time>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Người duyệt: {currentSalary.approver?.fullName || "—"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Paid */}
                            {currentSalary.paidAt && (
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-purple-100 text-purple-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 dark:bg-purple-900/30 dark:border-gray-800 dark:text-purple-400">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow dark:bg-gray-800 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-gray-900 dark:text-white">Thanh toán</div>
                                            <time className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(currentSalary.paidAt).toLocaleDateString('vi-VN')}
                                            </time>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Người chi: {currentSalary.payer?.fullName || "—"}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
