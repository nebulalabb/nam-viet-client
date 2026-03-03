import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getActivePromotions = createAsyncThunk(
  'promotion/getActive',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/promotions/active', { params })
      const { data, pagination } = response.data
      return { data, pagination }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  activePromotions: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
}

export const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getActivePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getActivePromotions.fulfilled, (state, action) => {
        state.loading = false
        state.activePromotions = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(getActivePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default promotionSlice.reducer
