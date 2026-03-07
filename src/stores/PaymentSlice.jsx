import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPayments = createAsyncThunk(
  'payment/get-payments',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-vouchers', {
        params: {
          voucherType: 'payment_out',
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
        },
      })
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyPayments = createAsyncThunk(
  'payment/get-my-payments',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-vouchers/my-payment-vouchers', {
        params: {
          voucherType: 'payment_out',
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
        },
      })
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getPaymentById = createAsyncThunk(
  'payment/get-payment-by-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-vouchers/${id}`)
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updatePaymentStatus = createAsyncThunk(
  'payment/update-payment-status',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      let response
      if (status === 'completed') {
        response = await api.post(`/payment-vouchers/${id}/complete`)
      } else if (status === 'cancelled') {
        response = await api.post(`/payment-vouchers/${id}/cancel`)
      } else {
        response = await api.put(`/payment-vouchers/${id}`, { status })
      }
      toast.success('Cập nhật trạng thái phiếu chi thành công')
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)


export const updatePayment = createAsyncThunk(
  'payment/update-payment',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payment-vouchers/${id}`, data)
      toast.success('Cập nhật phiếu chi thành công')
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createPayment = createAsyncThunk
  (
    'payment/create-payment',
    async (data, { rejectWithValue }) => {
      try {
        await api.post('/payment-vouchers', data)
        toast.success('Tạo thanh toán thành công')
      } catch (error) {
        const message = handleError(error)
        return rejectWithValue(message)
      }
    },
  )

export const deletePayment = createAsyncThunk(
  'payment/delete-payment',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payment-vouchers/${id}`)
      toast.success('Xóa thanh toán thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultiplePayments = createAsyncThunk(
  'payment/delete-multiple-payments',
  async (ids, { rejectWithValue }) => {
    try {
      await api.post('/payment-vouchers/bulk-delete', {
        ids,
        voucherType: 'payment_out',
      })

      toast.success(`Đã xóa ${ids.length} phiếu chi thành công`)
      return ids
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updatePaymentDueDate = createAsyncThunk(
  'payment/update-due-date',
  async ({ id, dueDate }, { rejectWithValue }) => {
    try {
      await api.put(`/payment-vouchers/${id}/update-due-date`, { dueDate })
      toast.success('Cập nhật hạn chót thành công')
      return { id, dueDate }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  payments: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
}

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPayments.pending, (state) => {
        state.loading = true
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.payments = action.payload.data
          state.pagination = action.payload.pagination || state.pagination
        } else if (Array.isArray(action.payload)) {
          state.payments = action.payload
        } else {
          // Fallback
          state.payments = []
        }
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(getMyPayments.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyPayments.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.payments = action.payload.data
          state.pagination = action.payload.pagination || state.pagination
        } else if (Array.isArray(action.payload)) {
          state.payments = action.payload
        } else {
          state.payments = []
        }
      })
      .addCase(getMyPayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // .addCase(updatePaymentStatus.pending, (state) => {
      //   state.loading = true
      // })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedPayment = action.payload
        const index = state.payments.findIndex((p) => p.id === updatedPayment.id)
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...updatedPayment }
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(createPayment.pending, (state) => {
        state.loading = true
      })
      .addCase(createPayment.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(deletePayment.pending, (state) => {
        state.loading = true
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false
        state.payments = state.payments.filter((p) => p.id !== action.payload)
        state.pagination.total -= 1
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(deleteMultiplePayments.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteMultiplePayments.fulfilled, (state, action) => {
        state.loading = false
        state.payments = state.payments.filter((p) => !action.payload.includes(p.id))
        state.pagination.total -= action.payload.length
      })
      .addCase(deleteMultiplePayments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(updatePaymentDueDate.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePaymentDueDate.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePaymentDueDate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(updatePayment.pending, (state) => {
        state.loading = true
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false
        const updatedPayment = action.payload
        const index = state.payments.findIndex((p) => p.id === updatedPayment.id)
        if (index !== -1) {
          state.payments[index] = { ...state.payments[index], ...updatedPayment }
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default paymentSlice.reducer
