import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSystemLogs = createAsyncThunk(
  'systemLog/get-system-logs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/activity-logs', { params })
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  logs: [],
  meta: {},
  loading: false,
  error: null,
}

export const systemLogSlice = createSlice({
  name: 'systemLog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSystemLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSystemLogs.fulfilled, (state, action) => {
        state.loading = false
        state.logs = action.payload.data.logs
        const pagination = action.payload.data.pagination || action.payload.pagination || action.payload.data.meta || {}
        state.meta = {
          ...pagination,
          last_page: pagination.totalPages || pagination.last_page,
          current_page: pagination.page || pagination.current_page,
          per_page: pagination.limit || pagination.per_page,
          total: pagination.total
        }
      })
      .addCase(getSystemLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default systemLogSlice.reducer
