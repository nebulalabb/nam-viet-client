import AuthForm from '@/views/auth/components/AuthForm'
import { Card } from '@/components/ui/card'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
  const isAuthenticated = !!localStorage.getItem('accessToken')
  const navigate = useNavigate()

  const checkAuthenticated = () => {
    if (isAuthenticated) {
      const pendingScan = localStorage.getItem('pending_qr_scan')
      if (pendingScan) {
        return navigate(`/attendance/scan?qrData=${pendingScan}`)
      }
      return navigate('/dashboard')
    }
  }

  useEffect(() => {
    checkAuthenticated()
  }, [])

  return (
    <div className="flex flex-1 flex-col lg:w-1/2">
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Nhập email và mật khẩu để đăng nhập vào hệ thống
            </p>
          </div>

          <AuthForm />

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Liên hệ quản trị viên nếu bạn gặp vấn đề đăng nhập
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
