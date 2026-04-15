import React, { useState, useEffect } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import api from '../../../../utils/axios'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

const vndCompact = (v) => new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0].payload
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-muted-foreground">{vndCompact(item.value)} ₫ • {item.percent ? item.percent.toFixed(1) : 0}%</p>
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

// Generate fromDate and toDate based on 'week' or 'month'
const getDatesRange = (period) => {
    const today = new Date();
    const toDate = new Date();
    toDate.setHours(23, 59, 59, 999);

    if (period === 'week') {
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return { fromDate: startOfWeek.toISOString(), toDate: toDate.toISOString() };
    }
    
    // month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return { fromDate: startOfMonth.toISOString(), toDate: toDate.toISOString() };
}

export const TopProductsPieWidget = () => {
    const [period, setPeriod] = useState('week')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchTopProducts = async () => {
            setLoading(true)
            try {
                const { fromDate, toDate } = getDatesRange(period);
                // limit=5 & sortBy=revenue
                const response = await api.get(`/reports/sales/top-products?limit=5&sortBy=revenue&fromDate=${fromDate}&toDate=${toDate}`)
                console.log("TopProducts API response:", response.data);
                if (response.data?.success) {
                    const rawProducts = response.data.data || [];
                    const totalRevenue = rawProducts.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
                    
                    const chartData = rawProducts.map(p => ({
                        name: p.productName || 'Không tên',
                        value: Number(p.revenue || 0),
                        percent: totalRevenue > 0 ? (Number(p.revenue || 0) / totalRevenue) * 100 : 0
                    }))
                    setData(chartData)
                }
            } catch (err) {
                console.error("Failed to load TopProductsPieWidget data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTopProducts()
    }, [period])

    return (
        <div className="p-4 bg-card border rounded-xl h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            {/* Header & Toggle */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Sản phẩm bán chạy nhất</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Tỷ trọng Doanh thu (% )</p>
                </div>
                <div className="flex bg-muted p-1 rounded-md text-[10px] font-medium">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`px-2 py-1 rounded transition-colors ${period === 'week' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Tuần
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`px-2 py-1 rounded transition-colors ${period === 'month' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Tháng
                    </button>
                </div>
            </div>

            {/* Chart Area */}
            <div className="w-full h-[250px] relative mt-2">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-card/50 z-10">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : null}

                {data.length === 0 && !loading ? (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-sm text-muted-foreground">Chưa có dữ liệu giao dịch</span>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={45} // donut style
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="value"
                                labelLine={false}
                                label={renderCustomLabel}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-xs text-foreground truncate max-w-[100px] inline-block">{value}</span>
                                )}
                            />
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}
