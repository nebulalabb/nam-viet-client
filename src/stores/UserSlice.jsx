import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import { getAuthUserRolePermissions } from './AuthSlice'

export const getUsers = createAsyncThunk(
  'user',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/users', { params: query })
      const { data, meta } = response.data
      return {
        data: data || [],
        pagination: {
          total: meta?.total ?? data?.length ?? 0,
          totalPages: meta?.totalPages ?? 1,
          page: meta?.page ?? 1,
          limit: meta?.limit ?? data?.length ?? 0,
        }
      }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteUser = createAsyncThunk(
  'user/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/users/${data}`)
      await dispatch(getUsers()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createUser = createAsyncThunk(
  'user/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/users', data)

      await dispatch(getUsers()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateUser = createAsyncThunk(
  'user/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/users/${id}`, data)
      await dispatch(getUsers()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateUserStatus = createAsyncThunk(
  'user/update-status',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.patch(`/users/${id}/status`, data)
      await dispatch(getUsers()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const changePassword = createAsyncThunk(
  'user/change-password',
  async (updateData, { rejectWithValue }) => {
    try {
      const { id, data } = updateData
      await api.put(`/users/${id}/password`, data)
      toast.success('Cập nhật mật khẩu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateProfile = createAsyncThunk(
  'user/update-profile',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { id, profileData } = data
      await api.put(`/users/${id}`, profileData)
      await dispatch(getAuthUserRolePermissions()).unwrap()
      toast.success('Cập nhật thông tin thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  users: [],
  pagination: {
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default userSlice.reducer
