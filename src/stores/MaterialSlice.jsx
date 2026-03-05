import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getMaterials = createAsyncThunk(
    'material/getMaterials',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/materials', { params })
            const { data, meta } = response.data
            return { data, pagination: meta }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const createMaterial = createAsyncThunk(
    'material/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            await api.post('/materials', data)
            await dispatch(getMaterials()).unwrap()
            toast.success('Thêm nguyên liệu thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const deleteMaterial = createAsyncThunk(
    'material/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.delete(`/materials/${id}`)
            await dispatch(getMaterials()).unwrap()
            toast.success('Xóa nguyên liệu thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const updateMaterial = createAsyncThunk(
    'material/update',
    async (updateData, { rejectWithValue, dispatch }) => {
        try {
            const { id, data } = updateData
            await api.put(`/materials/${id}`, data)
            await dispatch(getMaterials()).unwrap()
            toast.success('Cập nhật nguyên liệu thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

const initialState = {
    material: {},
    materials: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const materialSlice = createSlice({
    name: 'material',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMaterials.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getMaterials.fulfilled, (state, action) => {
                state.loading = false
                state.materials = action.payload.data
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(getMaterials.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(createMaterial.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createMaterial.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createMaterial.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(deleteMaterial.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteMaterial.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteMaterial.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(updateMaterial.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateMaterial.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateMaterial.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
    },
})

export default materialSlice.reducer
