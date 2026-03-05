import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getProducts = createAsyncThunk(
    'product/getAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/products', { params })
            const { data, pagination, summary } = response.data
            return { data, pagination, summary }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const getProductById = createAsyncThunk(
    'product/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/products/${id}`)
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const createProduct = createAsyncThunk(
    'product/create',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            await api.post('/products', data)
            await dispatch(getProducts()).unwrap()
            toast.success('Thêm sản phẩm thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const updateProduct = createAsyncThunk(
    'product/update',
    async (updateData, { rejectWithValue, dispatch }) => {
        try {
            const { id, data } = updateData
            await api.put(`/products/${id}`, data)
            await dispatch(getProducts()).unwrap()
            toast.success('Cập nhật sản phẩm thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const deleteProduct = createAsyncThunk(
    'product/delete',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            await api.delete(`/products/${id}`)
            await dispatch(getProducts()).unwrap()
            toast.success('Xóa sản phẩm thành công')
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

const initialState = {
    products: [],
    summary: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.loading = false
                state.products = action.payload.data
                state.summary = action.payload.summary
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi lấy dữ liệu'
            })
            .addCase(createProduct.pending, (state) => {
                state.loading = true
            })
            .addCase(createProduct.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                toast.error(state.error)
            })
            .addCase(updateProduct.pending, (state) => {
                state.loading = true
            })
            .addCase(updateProduct.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                toast.error(state.error)
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteProduct.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                toast.error(state.error)
            })
    },
})

export default productSlice.reducer
