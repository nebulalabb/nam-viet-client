import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getPositions = createAsyncThunk(
  'position',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/position')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  position: {},
  positions: [],
  loading: false,
  error: null,
}

export const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPositions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getPositions.fulfilled, (state, action) => {
        state.loading = false
        state.positions = action.payload
      })
      .addCase(getPositions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default positionSlice.reducer
