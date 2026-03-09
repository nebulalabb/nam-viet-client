import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getSalesOrders = createAsyncThunk(
    'salesOrder/getAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/sales-orders', { params })
            const { data, pagination } = response.data
            return { data, pagination }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const getSalesOrderById = createAsyncThunk(
    'salesOrder/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/sales-orders/${id}`)
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

const initialState = {
    salesOrder: {},
    salesOrders: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const salesOrderSlice = createSlice({
    name: 'salesOrder',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getSalesOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSalesOrders.fulfilled, (state, action) => {
                state.loading = false
                state.salesOrders = action.payload.data
                if (action.payload.pagination) {
                    state.pagination = action.payload.pagination
                }
            })
            .addCase(getSalesOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
            })
            .addCase(getSalesOrderById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getSalesOrderById.fulfilled, (state, action) => {
                state.loading = false
                state.salesOrder = action.payload
            })
            .addCase(getSalesOrderById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
            })
    },
})

export default salesOrderSlice.reducer
