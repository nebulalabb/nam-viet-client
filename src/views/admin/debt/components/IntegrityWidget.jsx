import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { checkDataIntegrity, syncFullBatch } from '@/stores/DebtSlice'
import { AlertTriangle, CheckCircle, RefreshCw, Wrench, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function IntegrityWidget({ year }) {
    const dispatch = useDispatch()
    const result = useSelector(state => state.debt.integrityData)
    const isFixing = useSelector(state => state.debt.loading)

    // Custom simple loading state handling
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchIntegrity = async () => {
        setIsLoading(true)
        await dispatch(checkDataIntegrity(year))
        setIsLoading(false)
    }

    useEffect(() => {
        fetchIntegrity()
    }, [year, dispatch])

    if (isLoading && !result) return (
        <div className="h-24 bg-gray-50/50 animate-pulse rounded-lg border border-gray-200 mb-4 flex flex-col items-center justify-center text-sm text-gray-500 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span>Đang kiểm tra sức khỏe dữ liệu...</span>
        </div>
    )

    if (!result) return null

    if (result.discrepanciesCount === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 mb-6 transition-all shadow-sm">
                <div className="bg-green-100 p-2 rounded-full">
                    <CheckCircle className="text-green-600 w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-green-800 text-sm">Dữ liệu công nợ toàn vẹn</h4>
                    <p className="text-xs text-green-700 mt-0.5">
                        Đã kiểm tra <b>{result.totalChecked}</b> hồ sơ năm {year}. Hệ thống vận hành ổn định.
                    </p>
                </div>
                <button
                    onClick={fetchIntegrity}
                    disabled={isLoading}
                    className="text-green-700 hover:bg-green-100 p-2 rounded-full transition-colors"
                    title="Kiểm tra lại"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        )
    }

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 transition-all shadow-md">
            <div className="flex items-start gap-3 mb-4">
                <div className="bg-red-100 p-2 rounded-full mt-0.5">
                    <AlertTriangle className="text-red-600 w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-red-800 flex items-center gap-2 text-sm">
                        Cảnh báo: Phát hiện {result.discrepanciesCount} lỗi dữ liệu!
                        <span className="bg-red-200 text-red-800 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                            Cần xử lý
                        </span>
                    </h4>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                        Phát hiện sự sai lệch giữa số liệu tổng hợp và chi tiết.
                        Vui lòng bấm nút <b>"Sửa ngay"</b> ở danh sách dưới để hệ thống tự động đồng bộ lại.
                    </p>
                </div>
                <button
                    onClick={fetchIntegrity}
                    disabled={isLoading}
                    className="text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors"
                    title="Làm mới danh sách lỗi"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="max-h-60 overflow-y-auto bg-white rounded-md border border-red-100 shadow-sm">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-gray-500 text-xs uppercase font-semibold">
                            <th className="px-4 py-2 bg-gray-50">Đối tượng</th>
                            <th className="px-4 py-2 bg-gray-50">Chi tiết lỗi</th>
                            <th className="px-4 py-2 text-right bg-gray-50">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {result.discrepancies?.map((err, idx) => (
                            <tr key={idx} className="hover:bg-red-50/30 group transition-colors duration-150">

                                <td className="px-4 py-3 align-top">
                                    <div className="font-medium text-gray-900 text-xs sm:text-sm">
                                        {err.customerName || "Không xác định"}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                        MASTER ID: {err.masterId}
                                    </div>
                                </td>

                                <td className="px-4 py-3 align-top">
                                    <div className="text-red-600 text-xs font-semibold mb-0.5">
                                        {err.reason}
                                    </div>
                                    <div className="text-gray-500 text-[11px] leading-tight line-clamp-2" title={err.details}>
                                        {err.details}
                                    </div>
                                </td>

                                <td className="px-4 py-3 text-right align-top">
                                    <button
                                        disabled={isFixing}
                                        onClick={() => {
                                            toast.info("Gửi lệnh đồng bộ sửa lỗi hệ thống...");
                                            dispatch(syncFullBatch({ year }));
                                        }}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-md hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm transition-all"
                                    >
                                        <Wrench className="w-3 h-3" />
                                        Sửa ngay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
