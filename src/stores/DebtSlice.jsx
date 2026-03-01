import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getDebts = createAsyncThunk(
    'debt/getList',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/smart-debt', { params })
            const { data, meta } = response.data
            return { data, meta }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const getDebtDetail = createAsyncThunk(
    'debt/getDetail',
    async ({ id, type, year }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/smart-debt/${id}`, { params: { type, year } })
            return response.data?.data || response.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    },
)

export const checkDataIntegrity = createAsyncThunk(
    'debt/checkIntegrity',
    async (year, { rejectWithValue }) => {
        try {
            const response = await api.get(`/smart-debt/check-integrity`, { params: { year } })
            return response.data?.data || {
                year,
                totalChecked: 0,
                discrepanciesCount: 0,
                discrepancies: []
            }
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    }
)

export const syncSnapBatch = createAsyncThunk(
    'debt/syncSnapBatch',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/smart-debt/sync-snap-batch', payload)
            toast.success('Đã kích hoạt đồng bộ nhanh toàn hệ thống!')
            return response.data
        } catch (error) {
            toast.error('Lỗi kích hoạt batch job.')
            return rejectWithValue(handleError(error))
        }
    }
)

export const syncFullBatch = createAsyncThunk(
    'debt/syncFullBatch',
    async (payload, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/smart-debt/sync-full-batch', payload)
            toast.success('Đã kích hoạt chế độ bảo trì hệ thống!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj.message)
            return rejectWithValue(errObj)
        }
    }
)

export const exportDebtList = createAsyncThunk(
    'debt/exportList',
    async ({ year, type }, { rejectWithValue }) => {
        try {
            const response = await api.get('/smart-debt/export-list', { params: { year, type } })
            return response.data?.data || response.data || []
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    }
)

const initialState = {
    debts: [],
    debtDetail: null,
    integrityData: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        summary: {
            opening: 0,
            increase: 0,
            payment: 0,
            closing: 0,
            returnAmount: 0,
            adjustmentAmount: 0
        }
    },
    loading: false,
    error: null,
}

export const debtSlice = createSlice({
    name: 'debt',
    initialState,
    reducers: {
        clearDebtDetail: (state) => {
            state.debtDetail = null
        }
    },
    extraReducers: (builder) => {
        builder
            // getDebts
            .addCase(getDebts.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getDebts.fulfilled, (state, action) => {
                state.loading = false
                state.debts = action.payload.data || []
                if (action.payload.meta) {
                    state.pagination = action.payload.meta
                }
            })
            .addCase(getDebts.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })

            // getDebtDetail
            .addCase(getDebtDetail.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getDebtDetail.fulfilled, (state, action) => {
                state.loading = false
                state.debtDetail = action.payload
            })
            .addCase(getDebtDetail.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Lỗi không xác định'
                toast.error(state.error)
            })

            // checkDataIntegrity
            .addCase(checkDataIntegrity.pending, (state) => {
                // Có thể cần cờ loading riêng cho integrity nếu muốn, tạm dùng chung setup
            })
            .addCase(checkDataIntegrity.fulfilled, (state, action) => {
                state.integrityData = action.payload
            })
            .addCase(checkDataIntegrity.rejected, (state, action) => {
                console.error("Lỗi khi kiểm tra tính toàn vẹn dữ liệu:", action.payload)
            })
    },
})

export const { clearDebtDetail } = debtSlice.actions
export default debtSlice.reducer
