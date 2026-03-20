import { cn } from '@/lib/utils'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/custom/PasswordInput'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { loginSchema } from '../schema'
import { toast } from 'sonner'
import { login, verifyOTP, resetRequireOTP, getAuthUserRolePermissions } from '@/stores/AuthSlice'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'


const AuthForm = ({ className, ...props }) => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, requireOTP, emailForOTP } = useSelector((state) => state.auth)
  const [otpCode, setOtpCode] = useState('')

  const onSubmit = async (data) => {
    dispatch(login(data))
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      toast.error('Mã OTP phải gồm 6 chữ số')
      return
    }

    const result = await dispatch(verifyOTP({ email: emailForOTP, code: otpCode }))
    if (verifyOTP.fulfilled.match(result)) {
      await dispatch(getAuthUserRolePermissions()).unwrap()
      setOtpCode('')
      
      const pendingScan = localStorage.getItem('pending_qr_scan')
      if (pendingScan) {
        navigate(`/attendance/scan?qrData=${pendingScan}`)
      } else {
        navigate('/dashboard')
      }
    }
  }

  const handleCloseOTPDialog = () => {
    dispatch(resetRequireOTP())
    setOtpCode('')
  }

  useEffect(() => {
    document.title = 'Đăng nhập'
  }, [])

  return (
    <div className={cn('w-full', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          {/* Email Field */}
          <div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormMessage className="text-red-500 text-xs font-normal relative top-[1px]" />
                  </div>
                  <FormControl>
                    <Input
                      tabIndex={1}
                      autoFocus
                      autoComplete="off"
                      placeholder="Nhập email"
                      className="h-11 rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Password Field */}
          <div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5 pt-1.5">
                  <div className="flex items-center space-x-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Mật khẩu <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormMessage className="text-red-500 text-xs font-normal relative top-[1px]" />
                  </div>
                  <FormControl>
                    <PasswordInput
                      tabIndex={2}
                      autoComplete="new-password"
                      placeholder="Nhập mật khẩu"
                      className="h-11 rounded-lg border-gray-300 focus:border-brand-500 focus:ring-brand-500"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            className="h-11 w-full rounded-lg bg-success-600 hover:bg-success-700 text-white font-medium text-base shadow-sm"
            loading={loading}
            disabled={loading}
          >
            Đăng nhập
          </Button>
        </form>
      </Form>

      {/* OTP Dialog */}
      <Dialog open={requireOTP} onOpenChange={(open) => !open && handleCloseOTPDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xác minh Đăng nhập</DialogTitle>
            <DialogDescription>
              Vui lòng nhập mã gồm 6 số vừa được gửi đến email <strong>{emailForOTP}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                id="otp"
                placeholder="Ví dụ: 123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-[0.5em]"
                maxLength={6}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyOTP(e)
                }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCloseOTPDialog}>
              Hủy
            </Button>
            <Button type="button" className="bg-success-600 hover:bg-success-700" onClick={handleVerifyOTP} loading={loading} disabled={loading || otpCode.length !== 6}>
              Xác nhận
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AuthForm
