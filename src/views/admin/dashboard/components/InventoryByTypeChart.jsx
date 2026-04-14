import React from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const vnd = (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-foreground mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="text-muted-foreground">
                    {p.name}: <span className="font-medium text-foreground">{p.dataKey === 'value' ? `${vnd(p.value)} ₫` : p.value}</span>
                </p>
            ))}
        </div>
    )
}

export const InventoryByTypeChart = ({ data = [] }) => {
    const normalized = data.map((d) => ({
        ...d,
        name: d.name || d.type || d.product_type || d.productType || 'Chưa phân loại',
        value: Number(d.value || d.total_value || 0),
        count: Number(d.count || d.total_count || d.itemCount || 0),
    }))

    return (
        <div className="p-4 bg-card border shadow-sm rounded-xl h-full flex flex-col hover:shadow-md transition-all">
            <div className="mb-4">
                <h3 className="text-base font-semibold text-foreground">Tỷ trọng Tồn kho theo loại</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Giá trị & số lượng theo nhóm sản phẩm</p>
            </div>
            <div className="w-full h-[250px] flex items-center justify-center mt-2">
                {normalized.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Chưa có dữ liệu tồn kho</span>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={normalized}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={vnd} />
                            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
                            <Bar dataKey="value" name="Giá trị" radius={[0, 6, 6, 0]} barSize={14} maxBarSize={20}>
                                {normalized.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
