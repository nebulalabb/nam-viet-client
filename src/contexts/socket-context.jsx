import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)

  // Use VITE_ environment variables commonly found in Vite apps
  const SOCKET_URL = import.meta.env.VITE_SERVER_URL_DEVELOPMENT || 'http://localhost:8000'

  useEffect(() => {
    // DISABLING SOCKET IO TEMPORARILY TO FIX CORS POLLING ERRORS
    // const socketIo = io(SOCKET_URL)
    // setSocket(socketIo)

    return () => {
      // if (socketIo) socketIo.disconnect()
    }
  }, [SOCKET_URL])

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  )
}

export const useSocket = () => {
  return useContext(SocketContext)
}
