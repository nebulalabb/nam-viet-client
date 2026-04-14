import React from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

const vnd = (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }}>
                    {p.name}: {new Intl.NumberFormat('vi-VN').format(Number(p.value))} ₫
                </p>
            ))}
        </div>
    )
}

export const RevenueChart = ({ initialData = [] }) => {
    // Use real data from Redux, fallback to empty
    const displayData = initialData?.length > 0
        ? initialData.map((d) => ({
            name: d.month || d.date || d.label || '',
            revenue: Number(d.revenue || d.total_revenue || 0),
            expense: Number(d.expense || d.total_expense || 0),
        }))
        : []

    const noData = displayData.length === 0

    return (
        <div className="p-4 bg-card border rounded-xl h-full flex flex-col shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-base font-semibold text-foreground">Biểu đồ Doanh Thu & Chi Phí</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Dữ liệu thực tế từ hệ thống</p>
                </div>
                {!noData && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />Doanh thu
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />Chi phí
                        </span>
                    </div>
                )}
            </div>

            {noData ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                    Chưa có dữ liệu biểu đồ trong kỳ này
                </div>
            ) : (
                <div className="w-full h-[250px] mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={vnd} width={55} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" dot={displayData.length === 1 ? { r: 4, fill: '#3b82f6' } : false} activeDot={{ r: 6 }} />
                            <Area type="monotone" dataKey="expense" name="Chi phí" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" dot={displayData.length === 1 ? { r: 4, fill: '#ef4444' } : false} activeDot={{ r: 6 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}
