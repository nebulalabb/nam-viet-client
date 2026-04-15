import { useState, useEffect } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SingleDatePicker } from '@/components/custom/SingleDatePicker'
import {
    startOfDay, endOfDay, subDays,
    startOfWeek, endOfWeek, subWeeks,
    startOfMonth, endOfMonth, subMonths,
    startOfQuarter, endOfQuarter, subQuarters,
    startOfYear, endOfYear, subYears
} from 'date-fns'

const PRESET_OPTIONS = {
    custom: 'Chọn ngày đến ngày',
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    this_week: 'Tuần này',
    last_week: 'Tuần trước',
    last_7_days: '7 ngày qua',
    this_month: 'Tháng này',
    last_month: 'Tháng trước',
    last_30_days: '30 ngày qua',
    this_quarter: 'Quý này',
    last_quarter: 'Quý trước',
    this_year: 'Năm này',
    last_year: 'Năm trước',
    all_time: 'Toàn thời gian'
}

export function DatePresetFilter({ dateRange, onChange }) {
    const [preset, setPreset] = useState('all_time')

    useEffect(() => {
        if (!dateRange?.from && !dateRange?.to && preset !== 'all_time') {
            setPreset('all_time')
        }
    }, [dateRange])

    const handlePresetChange = (val) => {
        setPreset(val)
        let from, to;
        const now = new Date()
        switch (val) {
            case 'today':
                from = startOfDay(now); to = endOfDay(now); break;
            case 'yesterday':
                const y = subDays(now, 1); from = startOfDay(y); to = endOfDay(y); break;
            case 'this_week':
                from = startOfWeek(now, { weekStartsOn: 1 }); to = endOfWeek(now, { weekStartsOn: 1 }); break;
            case 'last_week':
                const lw = subWeeks(now, 1); from = startOfWeek(lw, { weekStartsOn: 1 }); to = endOfWeek(lw, { weekStartsOn: 1 }); break;
            case 'last_7_days':
                from = startOfDay(subDays(now, 6)); to = endOfDay(now); break;
            case 'this_month':
                from = startOfMonth(now); to = endOfMonth(now); break;
            case 'last_month':
                const lm = subMonths(now, 1); from = startOfMonth(lm); to = endOfMonth(lm); break;
            case 'last_30_days':
                from = startOfDay(subDays(now, 29)); to = endOfDay(now); break;
            case 'this_quarter':
                from = startOfQuarter(now); to = endOfQuarter(now); break;
            case 'last_quarter':
                const lq = subQuarters(now, 1); from = startOfQuarter(lq); to = endOfQuarter(lq); break;
            case 'this_year':
                from = startOfYear(now); to = endOfYear(now); break;
            case 'last_year':
                const ly = subYears(now, 1); from = startOfYear(ly); to = endOfYear(ly); break;
            case 'all_time':
                from = undefined; to = undefined; break;
            case 'custom':
            default:
                return; // Custom is handled by SingleDatePickers
        }
        if (val !== 'custom') {
            onChange({ from, to })
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Select value={preset} onValueChange={handlePresetChange}>
                <SelectTrigger className="w-full md:w-[180px] h-9 bg-transparent border-input">
                    <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent className="max-h-[350px]">
                    <SelectGroup>
                        <SelectLabel className="text-gray-900 font-bold">Lựa chọn khác</SelectLabel>
                        <SelectItem value="custom" className="pl-6">{PRESET_OPTIONS.custom}</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel className="text-gray-900 font-bold">Theo tuần & ngày</SelectLabel>
                        {['today', 'yesterday', 'this_week', 'last_week', 'last_7_days'].map(k => (
                            <SelectItem key={k} value={k} className="pl-6">{PRESET_OPTIONS[k]}</SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel className="text-gray-900 font-bold">Theo tháng & Quý</SelectLabel>
                        {['this_month', 'last_month', 'last_30_days', 'this_quarter', 'last_quarter'].map(k => (
                            <SelectItem key={k} value={k} className="pl-6">{PRESET_OPTIONS[k]}</SelectItem>
                        ))}
                    </SelectGroup>
                    <SelectGroup>
                        <SelectLabel className="text-gray-900 font-bold">Theo năm</SelectLabel>
                        {['this_year', 'last_year', 'all_time'].map(k => (
                            <SelectItem key={k} value={k} className="pl-6">{PRESET_OPTIONS[k]}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {preset === 'custom' && (
                <div className="flex gap-2 w-full md:w-[280px]">
                    <SingleDatePicker 
                        defaultValue={dateRange?.from}
                        onChange={(val) => onChange({ ...dateRange, from: val })}
                        className="flex-1 h-9 bg-transparent"
                        placeholder="Từ ngày"
                    />
                    <SingleDatePicker 
                        defaultValue={dateRange?.to}
                        onChange={(val) => onChange({ ...dateRange, to: val })}
                        className="flex-1 h-9 bg-transparent"
                        placeholder="Đến ngày"
                    />
                </div>
            )}
        </div>
    )
}
