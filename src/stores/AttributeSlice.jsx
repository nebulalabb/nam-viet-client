import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getAttributes = createAsyncThunk(
  'attribute',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attributes')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

export const getAttributeById = createAsyncThunk(
  'attribute/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/attributes/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

export const createAttribute = createAsyncThunk(
  'attribute/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/attributes', data)
      await dispatch(getAttributes()).unwrap()
      toast.success('Thêm mới thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

export const importAttribute = createAsyncThunk(
  'attribute/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/attributes/import', data)
      await dispatch(getAttributes()).unwrap()
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data || error)
    }
  },
)

export const updateAttribute = createAsyncThunk(
  'attribute/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/attributes/${id}`, data)
      await dispatch(getAttributes()).unwrap()
      toast.success('Cập nhật thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue({ message })
    }
  },
)

export const deleteAttribute = createAsyncThunk(
  'attribute/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/attributes/${id}`)
      await dispatch(getAttributes()).unwrap()
      toast.success('Xóa thuộc tính thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const bulkDeleteAttributes = createAsyncThunk(
  'attribute/bulkDelete',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/attributes/bulk-delete', { ids })
      await dispatch(getAttributes()).unwrap()
      toast.success(`Xóa thành công ${ids.length} thuộc tính`)
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  attribute: {},
  attributes: [],
  loading: false,
  error: null,
}

export const attributeSlice = createSlice({
  name: 'attribute',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAttributes.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getAttributes.fulfilled, (state, action) => {
        state.loading = false
        state.attributes = action.payload || []
      })
      .addCase(getAttributes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getAttributeById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(getAttributeById.fulfilled, (state, action) => {
        state.loading = false
        state.attribute = action.payload
      })
      .addCase(getAttributeById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createAttribute.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createAttribute.fulfilled, (state) => { state.loading = false })
      .addCase(createAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateAttribute.pending, (state) => { state.loading = true; state.error = null })
      .addCase(updateAttribute.fulfilled, (state) => { state.loading = false })
      .addCase(updateAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteAttribute.pending, (state) => { state.loading = true; state.error = null })
      .addCase(deleteAttribute.fulfilled, (state) => { state.loading = false })
      .addCase(deleteAttribute.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(bulkDeleteAttributes.pending, (state) => { state.loading = true; state.error = null })
      .addCase(bulkDeleteAttributes.fulfilled, (state) => { state.loading = false })
      .addCase(bulkDeleteAttributes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default attributeSlice.reducer
