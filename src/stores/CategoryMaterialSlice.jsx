import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCategories = createAsyncThunk(
  'category',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/categories', {
        params: { limit: 1000 }
      })

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/categories/${data}`)
      await dispatch(getCategories()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleCategories = createAsyncThunk(
  'category/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/categories/bulk-delete', { ids })
      await dispatch(getCategories()).unwrap()
      toast.success('Xóa các danh mục đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createCategory = createAsyncThunk(
  'category/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/categories', data)

      await dispatch(getCategories()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCategory = createAsyncThunk(
  'category/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/categories/${id}`, data)
      await dispatch(getCategories()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCategoryStatus = createAsyncThunk(
  'category/updateStatus',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = updateData
      await api.patch(`/categories/${id}/status`, { status })
      await dispatch(getCategories()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const importCategories = createAsyncThunk(
  'category/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/categories/import', data)
      await dispatch(getCategories()).unwrap()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error)
    }
  },
)

const initialState = {
  category: {},
  categories: [],
  loading: false,
  error: null,
}

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false
        state.categories = action.payload
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateCategoryStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCategoryStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCategoryStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(importCategories.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importCategories.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importCategories.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default categorySlice.reducer
