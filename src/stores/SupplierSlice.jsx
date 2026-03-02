import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSuppliers = createAsyncThunk(
    'supplier/getSuppliers',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/suppliers', { params })
            const { data, meta } = response.data
            return { data, pagination: meta }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const createSupplier = createAsyncThunk(
    'supplier/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            await api.post('/suppliers', data)
            await dispatch(getSuppliers()).unwrap()
            toast.success('Thêm mới thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const deleteSupplier = createAsyncThunk(
    'supplier/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.delete(`/suppliers/${id}`)
            await dispatch(getSuppliers()).unwrap()
            toast.success('Xóa thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const updateSupplier = createAsyncThunk(
    'supplier/update',
    async (updateData, { rejectWithValue, dispatch }) => {
        try {
            const { id, data } = updateData
            await api.put(`/suppliers/${id}`, data)
            await dispatch(getSuppliers()).unwrap()
            toast.success('Cập nhật dữ liệu thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const updateSupplierStatus = createAsyncThunk(
    'supplier/updateStatus',
    async (updateData, { rejectWithValue, dispatch }) => {
        try {
            const { id, status } = updateData
            await api.patch(`/suppliers/${id}/status`, { status })
            await dispatch(getSuppliers()).unwrap()
            toast.success('Cập nhật trạng thái thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const importSupplier = createAsyncThunk(
    'supplier/import',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/suppliers/import', data)
            await dispatch(getSuppliers()).unwrap()
            return response.data
        } catch (error) {
            // Throw original error inside if it contains structured messages
            if (error?.response?.data?.error?.importErrors) {
                const message = error.response.data.error.message || 'Lỗi dữ liệu'
                throw { message, importErrors: error.response.data.error.importErrors }
            }
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

const initialState = {
    supplier: {},
    suppliers: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const supplierSlice = createSlice({
    name: 'supplier',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSuppliers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSuppliers.fulfilled, (state, action) => {
                state.loading = false
                state.suppliers = action.payload.data
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(getSuppliers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(createSupplier.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createSupplier.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createSupplier.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(deleteSupplier.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteSupplier.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteSupplier.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(updateSupplier.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateSupplier.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateSupplier.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(updateSupplierStatus.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateSupplierStatus.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateSupplierStatus.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(importSupplier.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(importSupplier.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(importSupplier.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || action.error?.message || 'Lỗi không xác định'
                // Toast error is handled inside components for import
            })
    },
})

export default supplierSlice.reducer
