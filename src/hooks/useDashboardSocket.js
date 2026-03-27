import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

// Cấu hình Base URL của Socket (Thay đổi theo biến môi trường thực tế)
const SOCKET_URL = import.meta.env.VITE_SERVER_URL_DEVELOPMENT || import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_SERVER_URL_PRODUCTION

export const useDashboardSocket = () => {
    const [socket, setSocket] = useState(null)
    const [realtimeData, setRealtimeData] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Khởi tạo kết nối Socket.io
        const newSocket = io(SOCKET_URL, {
            path: '/socket.io',
            transports: ['websocket'],
            autoConnect: true,
            withCredentials: true
        })

        newSocket.on('connect', () => {
            console.log('🔗 Đã kết nối Socket.io Realtime Dashboard')
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('❌ Mất kết nối Socket.io')
            setIsConnected(false)
        })

        // Lắng nghe sự kiện cập nhật số liệu Dashboard mới
        newSocket.on('dashboard_update', (data) => {
            console.log('⚡ Dữ liệu Dashboard thời gian thực cập nhật:', data)
            setRealtimeData(data)

            // Ở đây ta có thể cập nhật vào Redux / React Query cache 
            // tùy thuộc vào cách kiến trúc Store để các Component bên dưới tự động re-render
        })

        setSocket(newSocket)

        // Cleanup khi unmount
        return () => {
            newSocket.off('connect')
            newSocket.off('disconnect')
            newSocket.off('dashboard_update')
            newSocket.disconnect()
        }
    }, [])

    return { socket, realtimeData, isConnected }
}
