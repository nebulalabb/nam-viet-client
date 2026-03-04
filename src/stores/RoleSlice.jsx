import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getRoles = createAsyncThunk(
  'role',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/roles')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteRole = createAsyncThunk(
  'role/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/roles/${id}`)
      await dispatch(getRoles()).unwrap()
      toast.success('Xóa vai trò thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createRole = createAsyncThunk(
  'role/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/roles', data)
      const newRole = response.data?.data
      if (newRole?.id && data.permissions?.length > 0) {
        const uniqueIds = [...new Set(data.permissions)]
        await api.put(`/roles/${newRole.id}/permissions`, { permissionIds: uniqueIds })
      }
      await dispatch(getRoles()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateRole = createAsyncThunk(
  'role/update',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/roles/${data.id}`, data)
      if (data.permissions !== undefined) {
        const uniqueIds = [...new Set(data.permissions)]
        await api.put(`/roles/${data.id}/permissions`, { permissionIds: uniqueIds })
      }
      await dispatch(getRoles()).unwrap()
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getRolePermissions = createAsyncThunk(
  'role/permissions',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/roles/${id}/permissions`)
      const { data } = response.data
      return data.permissions.map((p) => p.id)
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  role: {},
  roles: [],
  loading: false,
  error: null,
}

export const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getRoles.fulfilled, (state, action) => {
        state.loading = false
        state.roles = action.payload
      })
      .addCase(getRoles.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteRole.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRole.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateRole.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRole.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default roleSlice.reducer
