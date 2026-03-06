import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getUnits = createAsyncThunk(
  'unit/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/units')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getUnitById = createAsyncThunk(
  'unit/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/units/${id}`)
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)


export const createUnit = createAsyncThunk(
  'unit/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/units', data)

      await dispatch(getUnits()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteUnit = createAsyncThunk(
  'unit/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/units/${data}`)
      await dispatch(getUnits()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleUnits = createAsyncThunk(
  'unit/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/units/bulk-delete', { ids })
      await dispatch(getUnits()).unwrap()
      toast.success('Xóa các đơn vị tính đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateUnitStatus = createAsyncThunk(
  'unit/updateStatus',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = updateData
      await api.patch(`/units/${id}/status`, { status })
      await dispatch(getUnits()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateUnit = createAsyncThunk(
  'unit/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/units/${id}`, data)
      await dispatch(getUnits()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  unit: {},
  units: [],
  loading: false,
  error: null,
}

export const unitSlice = createSlice({
  name: 'unit',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUnits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUnits.fulfilled, (state, action) => {
        state.loading = false
        state.units = action.payload || []
      })
      .addCase(getUnits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUnit.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUnit.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUnit.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateUnitStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUnitStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUnitStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteMultipleUnits.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultipleUnits.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteMultipleUnits.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default unitSlice.reducer
