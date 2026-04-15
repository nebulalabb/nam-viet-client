import React, { useState, useEffect } from 'react'
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
import api from '../../../../utils/axios'

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const item = payload[0].payload
    return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-muted-foreground mt-1 text-xs">
                Số lượng xuất: <span className="font-bold text-foreground">{item.quantity}</span> {item.unit || 'cái'}
            </p>
        </div>
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
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        return { fromDate: startOfWeek.toISOString(), toDate: toDate.toISOString() };
    }
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return { fromDate: startOfMonth.toISOString(), toDate: toDate.toISOString() };
}

export const TopExportedWidget = () => {
    const [period, setPeriod] = useState('week')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchTopExported = async () => {
            setLoading(true)
            try {
                const { fromDate, toDate } = getDatesRange(period);
                // limit=5 & sortBy=quantity
                const response = await api.get(`/reports/sales/top-products?limit=5&sortBy=quantity&fromDate=${fromDate}&toDate=${toDate}`)
                if (response.data?.success) {
                    const rawProducts = response.data.data || [];
                    
                    const chartData = rawProducts.map(p => {
                        let unitStr = ''
                        if (typeof p.unit === 'string') unitStr = p.unit
                        else if (p.unit && p.unit.unitName) unitStr = p.unit.unitName

                        return {
                            name: p.productName || 'Không tên',
                            quantity: Number(p.quantitySold || 0),
                            unit: unitStr
                        }
                    })
                    setData(chartData)
                }
            } catch (err) {
                console.error("Failed to load TopExportedWidget data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchTopExported()
    }, [period])

    return (
        <div className="p-4 bg-card border rounded-xl h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
            {/* Header & Toggle */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-foreground">Hàng xuất kho nhiều nhất</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Top 5 sản lượng cao nhất</p>
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
                    <div className="flex items-center justify-center h-full">
                        <span className="text-sm text-muted-foreground">Chưa có dữ liệu xuất kho</span>
                    </div>
                ) : (
                    <div className="w-full h-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                            layout="vertical"
                            margin={{ top: 0, right: 20, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                            <XAxis type="number" hide />
                            <YAxis 
                                type="category" 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false}
                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                width={120}
                                style={{ fontSize: '11px', fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--muted)', opacity: 0.2}} />
                            <Bar 
                                dataKey="quantity" 
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                                label={{ position: 'right', fill: 'var(--foreground)', fontSize: 11, fontWeight: 500 }}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}
