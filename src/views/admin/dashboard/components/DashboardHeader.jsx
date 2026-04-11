import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Clock, Calendar, RefreshCw, Activity } from 'lucide-react'
import { Button } from '../../../../components/ui/button'

const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 5) return { text: 'Làm việc khuya rồi', emoji: '🌙', subtext: 'Hãy dành thời gian nghỉ ngơi để bảo vệ sức khỏe.' }
    if (h < 12) return { text: 'Chào buổi sáng', emoji: '☀️', subtext: 'Chúc bạn một ngày làm việc tràn đầy năng lượng và bùng nổ doanh số!' }
    if (h < 14) return { text: 'Chào buổi trưa', emoji: '🌤', subtext: 'Đừng quên nghỉ ngơi đôi phút trưa để sạc lại năng lượng nhé.' }
    if (h < 18) return { text: 'Chào buổi chiều', emoji: '🌆', subtext: 'Tiếp tục duy trì phong độ tuyệt vời cho đến cuối ngày nào.' }
    return { text: 'Chào buổi tối', emoji: '🌙', subtext: 'Hãy nhìn lại những thành quả tuyệt vời của Nam Việt trong ngày hôm nay.' }
}

export const DashboardHeader = ({ onRefresh, loading, isConnected }) => {
    const [now, setNow] = useState(new Date())
    const user = useSelector((state) => state.auth?.user || state.user?.currentUser)

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const greeting = getGreeting()
    const userName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Admin'

    const dateStr = now.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    const timeStr = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })

    return (
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg border border-primary/20 bg-gradient-to-r from-primary via-emerald-600 to-green-700 animate-gradient-x p-6 sm:p-8 shrink-0">
            {/* Absolute Abstract Shapes for background depth */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-1/4 mb-[-50px] w-48 h-48 rounded-full bg-green-300/20 blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Greeting Text Area */}
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm mb-1 transform transition-transform hover:scale-105">
                        <span className="relative flex h-2 w-2">
                            {isConnected ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                                </>
                            ) : (
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400"></span>
                            )}
                        </span>
                        <span className="text-xs font-semibold text-white tracking-widest uppercase">
                            {isConnected ? 'Hệ thống trực tuyến' : 'Mất kết nối'}
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                        {greeting.text}, <span className="text-green-200">{userName}</span>! {greeting.emoji}
                    </h1>
                    <p className="text-sm sm:text-base text-green-50 max-w-lg opacity-90 leading-relaxed drop-shadow-sm font-medium">
                        {greeting.subtext}
                    </p>
                </div>

                {/* Info Glass Panel */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
                    <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 shadow-inner">
                        <div className="flex flex-col border-r border-white/20 pr-4 mr-4">
                            <span className="text-[11px] font-medium text-green-100 uppercase tracking-wider mb-1">Hôm nay</span>
                            <div className="flex items-center gap-2 text-white font-semibold whitespace-nowrap">
                                <Calendar className="h-4 w-4 text-green-200" />
                                {dateStr}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-green-100 uppercase tracking-wider mb-1">Thời gian</span>
                            <div className="flex items-center gap-2 text-white font-mono font-bold text-lg tabular-nums tracking-tight">
                                <Clock className="h-4 w-4 text-green-200" />
                                {timeStr}
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={onRefresh}
                        disabled={loading}
                        className="h-full min-h-[64px] rounded-xl bg-white text-primary hover:bg-green-50 font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 border-none px-6"
                    >
                        <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Đang tải...' : 'Cập nhật'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
