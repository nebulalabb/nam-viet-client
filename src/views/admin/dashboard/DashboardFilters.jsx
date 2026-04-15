import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectIsEditMode, toggleEditMode, resetLayout } from '../../../stores/DashboardSlice'
import { CalendarIcon, SlidersHorizontal, Settings2, RotateCcw } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../../components/ui/select'
import api from '../../../utils/axios'

export const DashboardFilters = ({ period, setPeriod, warehouseId, setWarehouseId }) => {
    const dispatch = useDispatch()
    const isEditMode = useSelector(selectIsEditMode)
    const [warehouses, setWarehouses] = useState([])

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/warehouses')
                setWarehouses(res.data?.data?.items || res.data?.data || [])
            } catch (error) {
                console.error('Failed to fetch warehouses:', error)
            }
        }
        fetchWarehouses()
    }, [])

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex flex-wrap items-center gap-4">
                {/* Date Filter */}
                <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[160px] h-[42px] bg-white dark:bg-card border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow rounded-xl font-semibold text-[14px]">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-emerald-700" />
                            <SelectValue placeholder="Chọn thời gian" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="today" className="font-medium cursor-pointer">Hôm nay</SelectItem>
                        <SelectItem value="week" className="font-medium cursor-pointer">Tuần này</SelectItem>
                        <SelectItem value="month" className="font-medium cursor-pointer">Tháng này</SelectItem>
                        <SelectItem value="custom" className="font-medium cursor-pointer">Tùy chọn...</SelectItem>
                    </SelectContent>
                </Select>

                {/* Warehouse Filter */}
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                    <SelectTrigger className="min-w-[180px] h-[42px] bg-white dark:bg-card border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow rounded-xl font-semibold text-[14px]">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
                            <SelectValue placeholder="Chọn kho hàng" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="all" className="font-medium cursor-pointer">Tất cả Kho hàng</SelectItem>
                        {warehouses.map(w => (
                            <SelectItem key={w.id} value={w.id.toString()} className="font-medium cursor-pointer">
                                {w.warehouse_name || w.warehouseName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-3">
                {isEditMode && (
                    <button
                        onClick={() => dispatch(resetLayout())}
                        className="flex items-center gap-2 px-5 py-2.5 border border-destructive/50 text-destructive rounded-xl text-sm font-semibold hover:bg-destructive/10 transition-colors"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset Layout
                    </button>
                )}
                <button
                    onClick={() => dispatch(toggleEditMode())}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold transition-all shadow-sm
                        ${isEditMode
                        ? 'bg-[#37664D] text-white hover:bg-[#2b513c] shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-[#407659] text-white hover:bg-[#346149] hover:shadow-md'
                        }`}
                >
                    <Settings2 className="h-[18px] w-[18px]" />
                    {isEditMode ? 'Hoàn tất Chỉnh sửa' : 'Tùy chỉnh Dashboard'}
                </button>
            </div>
        </div>
    )
}
