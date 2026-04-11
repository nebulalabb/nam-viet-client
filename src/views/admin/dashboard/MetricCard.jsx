import React from 'react'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Inline SVG sparkline — no external dep needed
const InlineSparkline = ({ data, color }) => {
    if (!data?.length || data.length < 2) return null
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    const w = 100, h = 28
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w
        const y = h - ((v - min) / range) * h
        return `${x},${y}`
    }).join(' ')
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}


// Color config per widget id
const CARD_COLORS = {
    'revenue-kpi': { iconBg: 'bg-emerald-50 dark:bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400' },
    'orders-kpi': { iconBg: 'bg-blue-50 dark:bg-blue-500/10', iconText: 'text-blue-500 dark:text-blue-400' },
    'debts-kpi': { iconBg: 'bg-orange-50 dark:bg-orange-500/10', iconText: 'text-orange-500 dark:text-orange-400' },
    'production-kpi': { iconBg: 'bg-purple-50 dark:bg-purple-500/10', iconText: 'text-purple-600 dark:text-purple-400' },
}
const DEFAULT_COLOR = { iconBg: 'bg-gray-100 dark:bg-gray-800', iconText: 'text-gray-600 dark:text-gray-400' }

export const MetricCard = ({ title, value, trend, trendValue, icon: Icon, loading, onClick, widgetId, sparkData }) => {
    const isPositive = trend === 'up'
    const isNegative = trend === 'down'
    const colors = CARD_COLORS[widgetId] || DEFAULT_COLOR

    const trendIcon = isPositive
        ? <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
        : isNegative
            ? <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
            : <Minus className="h-4 w-4" strokeWidth={2.5} />

    return (
        <div
            className={`relative p-5 lg:p-6 flex flex-col justify-between h-full rounded-[24px] border border-gray-100 dark:border-zinc-800 bg-white dark:bg-card shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 group
                ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-[0.98]' : ''}
                ${loading ? 'opacity-70 pointer-events-none' : ''}
            `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between z-10 relative">
                {/* Left side: Title and Value */}
                <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <h3 className="text-[11px] sm:text-[12px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-tight mb-2 truncate">
                        {title}
                    </h3>
                    <div className="text-[26px] sm:text-[30px] xl:text-[32px] font-extrabold text-slate-800 dark:text-gray-100 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mb-1 drop-shadow-sm">
                        {loading ? <div className="h-8 w-24 bg-muted/50 rounded animate-pulse" /> : value}
                    </div>
                </div>

                {/* Right side: Circular Icon */}
                {loading ? (
                    <Loader2 className="h-4 w-4 text-muted-foreground animate-spin shrink-0" />
                ) : Icon && (
                    <div className={`shrink-0 h-[46px] w-[46px] rounded-full ${colors.iconBg} ${colors.iconText} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-[22px] w-[22px]" strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Bottom side: Trend */}
            <div className="relative z-10 mt-3 pt-1">
                {(trendValue || trendValue === 0) && !loading && (
                    <p className={`text-[13px] flex items-center font-bold whitespace-nowrap overflow-hidden
                        ${isPositive ? 'text-emerald-500 dark:text-emerald-400' : isNegative ? 'text-rose-500 dark:text-rose-400' : 'text-muted-foreground'}`}>
                        <span className="truncate flex items-center gap-1.5">
                           {trendIcon} {isPositive ? '+' : ''}{trendValue}% 
                           <span className="text-gray-400 dark:text-gray-500 font-medium ml-1 text-[12px]">so với tháng trước</span>
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
}
