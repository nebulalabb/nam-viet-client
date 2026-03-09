import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { toast } from 'sonner'

// ─── Thunks ───────────────────────────────────────────────────
export const getStockTransactions = createAsyncThunk(
    'stockTransaction/getAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/stock-transactions', { params })
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const getStockTransactionById = createAsyncThunk(
    'stockTransaction/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/stock-transactions/${id}`)
            return response.data.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const createImportTransaction = createAsyncThunk(
    'stockTransaction/createImport',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/stock-transactions/import', data)
            toast.success('Tạo phiếu nhập kho thành công')
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message)
            return rejectWithValue(message)
        }
    }
)

export const createExportTransaction = createAsyncThunk(
    'stockTransaction/createExport',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/stock-transactions/export', data)
            toast.success('Tạo phiếu xuất kho thành công')
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message)
            return rejectWithValue(message)
        }
    }
)

export const approveTransaction = createAsyncThunk(
    'stockTransaction/approve',
    async ({ id, notes }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/stock-transactions/${id}/approve`, { notes })
            toast.success('Đã duyệt phiếu thành công')
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message)
            return rejectWithValue(message)
        }
    }
)

export const cancelTransaction = createAsyncThunk(
    'stockTransaction/cancel',
    async ({ id, reason }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/stock-transactions/${id}/cancel`, { reason })
            toast.success('Đã hủy phiếu')
            return response.data.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message)
            return rejectWithValue(message)
        }
    }
)

// ─── Slice ────────────────────────────────────────────────────
const initialState = {
    transactions: [],
    currentTransaction: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    actionLoading: false,
    error: null,
}

const stockTransactionSlice = createSlice({
    name: 'stockTransaction',
    initialState,
    reducers: {
        clearCurrentTransaction: (state) => {
            state.currentTransaction = null
        },
        clearError: (state) => {
            state.error = null
        },
        // Optimistically update status in list
        updateTransactionStatus: (state, action) => {
            const { id, status } = action.payload
            const idx = state.transactions.findIndex((t) => t.id === id)
            if (idx !== -1) {
                state.transactions[idx] = { ...state.transactions[idx], status }
            }
        },
    },
    extraReducers: (builder) => {
        // getAll
        builder
            .addCase(getStockTransactions.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getStockTransactions.fulfilled, (state, action) => {
                state.loading = false
                state.transactions = action.payload.data || []
                if (action.payload.meta) state.pagination = action.payload.meta
            })
            .addCase(getStockTransactions.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

        // getById
        builder
            .addCase(getStockTransactionById.pending, (state) => {
                state.actionLoading = true
            })
            .addCase(getStockTransactionById.fulfilled, (state, action) => {
                state.actionLoading = false
                state.currentTransaction = action.payload
            })
            .addCase(getStockTransactionById.rejected, (state, action) => {
                state.actionLoading = false
                state.error = action.payload
            })

        // createImport / createExport share the same pending/fulfilled pattern
        const handleActionPending = (state) => { state.actionLoading = true }
        const handleActionFulfilled = (state) => { state.actionLoading = false }
        const handleActionRejected = (state, action) => {
            state.actionLoading = false
            state.error = action.payload
        }

        builder
            .addCase(createImportTransaction.pending, handleActionPending)
            .addCase(createImportTransaction.fulfilled, handleActionFulfilled)
            .addCase(createImportTransaction.rejected, handleActionRejected)

        builder
            .addCase(createExportTransaction.pending, handleActionPending)
            .addCase(createExportTransaction.fulfilled, handleActionFulfilled)
            .addCase(createExportTransaction.rejected, handleActionRejected)

        builder
            .addCase(approveTransaction.pending, handleActionPending)
            .addCase(approveTransaction.fulfilled, (state, action) => {
                state.actionLoading = false
                if (action.payload) {
                    const idx = state.transactions.findIndex((t) => t.id === action.payload.id)
                    if (idx !== -1) state.transactions[idx] = action.payload
                }
            })
            .addCase(approveTransaction.rejected, handleActionRejected)

        builder
            .addCase(cancelTransaction.pending, handleActionPending)
            .addCase(cancelTransaction.fulfilled, (state, action) => {
                state.actionLoading = false
                if (action.payload) {
                    const idx = state.transactions.findIndex((t) => t.id === action.payload.id)
                    if (idx !== -1) state.transactions[idx] = action.payload
                }
            })
            .addCase(cancelTransaction.rejected, handleActionRejected)
    },
})

export const { clearCurrentTransaction, clearError, updateTransactionStatus } =
    stockTransactionSlice.actions

export default stockTransactionSlice.reducer
