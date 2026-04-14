import React from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const vnd = (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0]
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-muted-foreground">{vnd(item.value)} ₫ • {item.payload.percent}%</p>
        </div>
    )
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

export const SalesChannelChart = ({ data = [] }) => {
    const normalized = data.map((d) => ({
        ...d,
        name: d.name || d.channel || d.sales_channel || 'Khác',
        value: Number(d.value || d.total || d.revenue || 0),
        percent: d.percent || 0,
    }))

    return (
        <div className="p-4 bg-card border shadow-sm rounded-xl h-full flex flex-col hover:shadow-md transition-all">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Phân bổ kênh bán hàng</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Theo doanh thu thực tế</p>
            </div>
            <div className="w-full h-[250px] mt-2 flex items-center justify-center">
                {normalized.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Chưa có dữ liệu kênh bán hàng</span>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={normalized}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                nameKey="name"
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {normalized.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-xs text-foreground">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
