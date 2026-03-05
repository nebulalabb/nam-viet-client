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
        // Server trả: { success, data: [...], meta: { page, limit, total, totalPages } }
        state.logs = action.payload.data
        const meta = action.payload.meta || {}
        state.meta = {
          total: meta.total ?? 0,
          totalPages: meta.totalPages ?? 1,
          page: meta.page ?? 1,
          limit: meta.limit ?? 20,
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
