import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCategories = createAsyncThunk(
    'category',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/categories', { params })
            const { data, pagination } = response.data
            return { data, pagination }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
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
            toast.success('Cập nhật thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const deleteCategory = createAsyncThunk(
    'category/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.delete(`/categories/${id}`)
            await dispatch(getCategories()).unwrap()
            toast.success('Xóa thành công')
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

export const deleteMultipleCategories = createAsyncThunk(
    'category/deleteMultiple',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            await api.post('/categories/bulk-delete', data)
            await dispatch(getCategories()).unwrap()
            toast.success('Xóa nhiều danh mục thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const importCategory = createAsyncThunk(
    'category/import',
    async (formData, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/categories/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            await dispatch(getCategories()).unwrap()
            return response.data
        } catch (error) {
            const message = handleError(error) // Returns string or object
            return rejectWithValue(error.response?.data || message)
        }
    },
)

export const getCategoryTree = createAsyncThunk(
    'category/tree',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/categories/tree')
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

const initialState = {
    categories: [],
    categoryTree: [],
    pagination: {
        pageIndex: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const categorySlice = createSlice({
    name: 'category',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.loading = false
                state.categories = action.payload.data
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
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
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteCategory.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteCategory.rejected, (state, action) => {
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
            .addCase(deleteMultipleCategories.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteMultipleCategories.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteMultipleCategories.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
            .addCase(importCategory.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(importCategory.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(importCategory.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi khi import'
            })
            .addCase(getCategoryTree.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getCategoryTree.fulfilled, (state, action) => {
                state.loading = false
                state.categoryTree = action.payload
            })
            .addCase(getCategoryTree.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload.message || 'Lỗi không xác định'
                toast.error(state.error)
            })
    },
})

export default categorySlice.reducer
