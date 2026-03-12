import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const login = createAsyncThunk(
  'login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', data)
      // Since our new flow returns { requireOTP: true }
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const verifyOTP = createAsyncThunk(
  'verify-otp',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', data)
      const { data: token } = response.data

      localStorage.setItem('accessToken', token)
      toast.success('Đăng nhập thành công')

      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const logout = createAsyncThunk(
  'logout',
  async (data, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout', data)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('permissionCodes')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getAuthUserRolePermissions = createAsyncThunk(
  '/auth/authenticated',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/authenticated')
      const { data: user } = response.data
      const permissions = user?.role?.permissions.map(
        (permission) => permission.code,
      )

      localStorage.setItem(
        'permissionCodes',
        JSON.stringify(permissions) || '[]',
      )
      return user
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)


export const getAccessLogs = createAsyncThunk(
  'auth/get-access-logs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/settings/login-history')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const revokeTokens = createAsyncThunk(
  'auth/revoke-tokens',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/settings/login-history/revoke', data)
      toast.success('Đăng xuất thiết bị thành công')
      dispatch(getAccessLogs())
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  authUserWithRoleHasPermissions: null,
  error: null,
  loading: false,
  requireOTP: false,
  emailForOTP: null,
  accessLogs: [],
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null
    },
    resetRequireOTP: (state) => {
      state.requireOTP = false
      state.emailForOTP = null
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN MATCH (OTP Trigger)
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data?.requireOTP) {
          state.requireOTP = true
          state.emailForOTP = action.payload.data.email
          toast.success('Đã gửi mã xác nhận đến email của bạn')
        } else if (action.payload?.data?.requireOTP === false && action.payload?.data?.token) {
          // Development bypass logic
          state.requireOTP = false
          localStorage.setItem('accessToken', action.payload.data.token)
          toast.success('Đăng nhập thành công')
          // Optional: Force a redirect to dashboard on the next tick
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 500)
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // VERIFY OTP (Actual Login)
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false
        state.requireOTP = false
        state.emailForOTP = null
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // GET USER ROLES
      .addCase(getAuthUserRolePermissions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAuthUserRolePermissions.fulfilled, (state, action) => {
        state.loading = false
        state.authUserWithRoleHasPermissions = action.payload
      })
      .addCase(getAuthUserRolePermissions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // LOGOUT
      .addCase(logout.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.authUserWithRoleHasPermissions = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // GET ACCESS LOGS
      .addCase(getAccessLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAccessLogs.fulfilled, (state, action) => {
        state.loading = false
        state.accessLogs = action.payload?.data || []
      })
      .addCase(getAccessLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // REVOKE TOKENS
      .addCase(revokeTokens.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(revokeTokens.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(revokeTokens.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export const { resetAuthError, resetRequireOTP } = authSlice.actions
export default authSlice.reducer
