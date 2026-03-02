import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const getPermission = createAsyncThunk(
  'permission',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/permissions')
      const { data } = response.data

      const groups = [
        {
          key: 'all',
          label: 'Quản lý quyền hạn',
          items: Object.keys(data.grouped).map(module => ({
            key: module,
            label: module.toUpperCase(),
            permissions: data.grouped[module].map(p => ({
              id: p.id,
              name: p.permissionName,
              code: p.permissionKey
            }))
          }))
        }
      ]

      return groups
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  permissions: [],
  loading: false,
  error: null,
}

export const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPermission.pending, (state) => {
        state.loading = true
      })
      .addCase(getPermission.fulfilled, (state, action) => {
        state.loading = false
        state.permissions = action.payload
      })
      .addCase(getPermission.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default permissionSlice.reducer