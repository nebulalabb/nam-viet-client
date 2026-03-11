import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// Fetch all promotions
export const getPromotions = createAsyncThunk(
  'promotion',
  async (query = '', { rejectWithValue }) => {
    try {
      const response = await api.get(`/promotion?${query}`)
      if (response.data.data) {
        return response.data
      }
      return { data: response.data, meta: {} }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Fetch active promotions
export const getActivePromotions = createAsyncThunk(
  'promotion/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/promotion?status=active')
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Create promotion
export const createPromotion = createAsyncThunk(
  'promotion/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/promotion', data)
      await dispatch(getPromotions()).unwrap()
      toast.success('Thêm mới khuyến mãi thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Update promotion
export const updatePromotion = createAsyncThunk(
  'promotion/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/promotion/${id}`, data)
      await dispatch(getPromotions()).unwrap()
      toast.success('Cập nhật khuyến mãi thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Approve promotion
export const approvePromotion = createAsyncThunk(
  'promotion/approve',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/promotion/${id}/approve`, data)
      await dispatch(getPromotions()).unwrap()
      toast.success('Duyệt khuyến mãi thành công!')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Cancel prediction
export const cancelPromotion = createAsyncThunk(
  'promotion/cancel',
  async (cancelData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = cancelData
      await api.delete(`/promotion/${id}`, { data })
      await dispatch(getPromotions()).unwrap()
      toast.success('Hủy khuyến mãi thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Delete promotion
export const deletePromotion = createAsyncThunk(
  'promotion/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/promotion/${id}/delete`)
      await dispatch(getPromotions()).unwrap()
      toast.success('Xóa khuyến mãi thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Restore promotion
export const restorePromotion = createAsyncThunk(
  'promotion/restore',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/promotion/${id}/restore`)
      await dispatch(getPromotions()).unwrap()
      toast.success('Khôi phục trạng thái chờ duyệt thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Delete multiple promotions
export const deleteMultiplePromotions = createAsyncThunk(
  'promotion/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/promotion/bulk-delete`, { ids })
      await dispatch(getPromotions()).unwrap()
      toast.success(response.data.message || 'Xóa các khuyến mãi thành công')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Cancel multiple promotions
export const cancelMultiplePromotions = createAsyncThunk(
  'promotion/cancelMultiple',
  async (cancelData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/promotion/bulk-cancel`, cancelData)
      await dispatch(getPromotions()).unwrap()
      toast.success(response.data.message || 'Hủy các khuyến mãi thành công')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Restore multiple promotions
export const restoreMultiplePromotions = createAsyncThunk(
  'promotion/restoreMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/promotion/bulk-restore`, { ids })
      await dispatch(getPromotions()).unwrap()
      toast.success(response.data.message || 'Khôi phục các khuyến mãi thành công')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

// Approve multiple promotions
export const approveMultiplePromotions = createAsyncThunk(
  'promotion/approveMultiple',
  async (approveData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post(`/promotion/bulk-approve`, approveData)
      await dispatch(getPromotions()).unwrap()
      toast.success(response.data.message || 'Duyệt các khuyến mãi thành công')
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  promotions: [],
  activePromotions: [],
  meta: {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
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
      // getPromotions
      .addCase(getPromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPromotions.fulfilled, (state, action) => {
        state.loading = false
        state.promotions = action.payload.data
        if (action.payload.meta) {
          state.meta = action.payload.meta
        }
      })
      .addCase(getPromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi lấy danh sách khuyến mãi'
        toast.error(state.error)
      })

      // getActivePromotions
      .addCase(getActivePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getActivePromotions.fulfilled, (state, action) => {
        state.loading = false
        state.activePromotions = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(getActivePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi lấy khuyến mãi đang hoạt động'
        toast.error(state.error)
      })

      // createPromotion
      .addCase(createPromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi thêm mới khuyến mãi'
        toast.error(state.error)
      })

      // updatePromotion
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi cập nhật khuyến mãi'
        toast.error(state.error)
      })

      // approvePromotion
      .addCase(approvePromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approvePromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(approvePromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi duyệt khuyến mãi'
        toast.error(state.error)
      })

      // cancelPromotion
      .addCase(cancelPromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelPromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(cancelPromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi hủy khuyến mãi'
        toast.error(state.error)
      })

      // restorePromotion
      .addCase(restorePromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(restorePromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(restorePromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi khôi phục khuyến mãi'
        toast.error(state.error)
      })

      // deletePromotion
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deletePromotion.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi xóa khuyến mãi'
        toast.error(state.error)
      })

      // deleteMultiplePromotions
      .addCase(deleteMultiplePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultiplePromotions.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteMultiplePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi xóa nhiều khuyến mãi'
        toast.error(state.error)
      })

      // cancelMultiplePromotions
      .addCase(cancelMultiplePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelMultiplePromotions.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(cancelMultiplePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi hủy nhiều khuyến mãi'
        toast.error(state.error)
      })

      // restoreMultiplePromotions
      .addCase(restoreMultiplePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(restoreMultiplePromotions.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(restoreMultiplePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi khôi phục nhiều khuyến mãi'
        toast.error(state.error)
      })

      // approveMultiplePromotions
      .addCase(approveMultiplePromotions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveMultiplePromotions.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(approveMultiplePromotions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi duyệt nhiều khuyến mãi'
        toast.error(state.error)
      })
  },
})

export default promotionSlice.reducer