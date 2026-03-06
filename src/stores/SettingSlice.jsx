import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'



export const getSetting = createAsyncThunk(
  'setting/get-setting',
  async (key, { rejectWithValue }) => {
    try {
      let url = '/settings/general'
      if (key === 'system_information') {
        url = '/settings/general/system-info'
      }
      const response = await api.get(url)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const syncSystemSetting = createAsyncThunk(
  'setting/sync-system-setting',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await dispatch(getSetting('system_information')).unwrap()
      toast.success('Đồng bộ thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateGeneralSetting = createAsyncThunk(
  'setting/update-general-setting',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const payload = data.generalSetting ? data.generalSetting : data
      await api.put('/settings/general', payload)
      await dispatch(getSetting())
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)



const initialState = {
  setting: null,
  loading: false,
  error: null,
}

export const settingSlice = createSlice({
  name: 'school',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getSetting.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getSetting.fulfilled, (state, action) => {
        state.setting = action.payload
        state.loading = false
      })
      .addCase(getSetting.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

  },
})

export default settingSlice.reducer
