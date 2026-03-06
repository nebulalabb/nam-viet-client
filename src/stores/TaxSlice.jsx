import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getTaxes = createAsyncThunk(
  'tax',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/taxes')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createTax = createAsyncThunk(
  'tax/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/taxes', data)
      await dispatch(getTaxes()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateTax = createAsyncThunk(
  'tax/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/taxes/${id}`, data)
      await dispatch(getTaxes()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteTax = createAsyncThunk(
  'tax/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/taxes/${id}`)
      await dispatch(getTaxes()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const bulkDeleteTaxes = createAsyncThunk(
  'tax/bulkDelete',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/taxes/bulk-delete', { ids })
      await dispatch(getTaxes()).unwrap()
      toast.success(`Xóa thành công ${ids.length} loại thuế`)
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  taxes: [],
  loading: false,
  error: null,
}

export const taxSlice = createSlice({
  name: 'tax',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTaxes.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getTaxes.fulfilled, (state, action) => {
        state.loading = false
        state.taxes = action.payload || []
      })
      .addCase(getTaxes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createTax.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createTax.fulfilled, (state) => { state.loading = false })
      .addCase(createTax.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateTax.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateTax.fulfilled, (state) => { state.loading = false })
      .addCase(updateTax.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteTax.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deleteTax.fulfilled, (state) => { state.loading = false })
      .addCase(deleteTax.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(bulkDeleteTaxes.pending, (state) => { state.loading = true; state.error = null })
      .addCase(bulkDeleteTaxes.fulfilled, (state) => { state.loading = false })
      .addCase(bulkDeleteTaxes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default taxSlice.reducer
