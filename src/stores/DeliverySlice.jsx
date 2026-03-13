import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getDeliveries = createAsyncThunk(
  'delivery/get-deliveries',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/deliveries', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const createDelivery = createAsyncThunk(
  'delivery/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/deliveries', data)
      toast.success('Tạo phiếu giao hàng thành công')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const startDelivery = createAsyncThunk(
  'delivery/start',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deliveries/${id}/start`, { notes })
      toast.success('Bắt đầu giao hàng')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const completeDelivery = createAsyncThunk(
  'delivery/complete',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deliveries/${id}/complete`, data)
      toast.success('Giao hàng thành công')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const failDelivery = createAsyncThunk(
  'delivery/fail',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/deliveries/${id}/fail`, data)
      toast.warning('Cập nhật trạng thái giao hàng thất bại')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

export const settleCOD = createAsyncThunk(
  'delivery/settle-cod',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/deliveries/${id}/settle`, { notes })
      toast.success('Đối soát COD thành công')
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  }
)

const initialState = {
  deliveries: [],
  loading: false,
  error: null,
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  }
}

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getDeliveries.pending, (state) => {
        state.loading = true
      })
      .addCase(getDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.deliveries = action.payload.data
        state.meta = action.payload.meta
      })
      .addCase(getDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addMatcher(
        (action) => [createDelivery.fulfilled, startDelivery.fulfilled, completeDelivery.fulfilled, failDelivery.fulfilled, settleCOD.fulfilled].includes(action.type),
        (state) => {
          state.loading = false
        }
      )
  }
})

export default deliverySlice.reducer
