import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'

export const getSalaries = createAsyncThunk(
    'salary/getSalaries',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/salary', { params })
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Không thể lấy danh sách lương')
            return rejectWithValue(message)
        }
    }
)

export const getSalarySummary = createAsyncThunk(
    'salary/getSalarySummary',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/salary/summary', { params })
            return response.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    }
)

export const getSalaryDetail = createAsyncThunk(
    'salary/getSalaryDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/salary/${id}`)
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Không thể lấy chi tiết bảng lương')
            return rejectWithValue(message)
        }
    }
)

export const getSalaryByUserMonth = createAsyncThunk(
    'salary/getSalaryByUserMonth',
    async ({ userId, month }, { rejectWithValue }) => {
        try {
            const response = await api.get(`/salary/${userId}/${month}`)
            return response.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    }
)

export const calculateSalary = createAsyncThunk(
    'salary/calculateSalary',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/salary/calculate', data)
            toast.success('Tính toán trước lương thành công!')
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Tính toán lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const recalculateSalary = createAsyncThunk(
    'salary/recalculateSalary',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post(`/salary/${id}/recalculate`, data)
            toast.success('Tính lại lương thành công!')
            dispatch(getSalaryDetail(id))
            dispatch(getSalaries())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Tính lại lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const updateSalary = createAsyncThunk(
    'salary/updateSalary',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/salary/${id}`, data)
            toast.success('Cập nhật bảng lương thành công!')
            dispatch(getSalaryDetail(id))
            dispatch(getSalaries())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Cập nhật bảng lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const approveSalary = createAsyncThunk(
    'salary/approveSalary',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/salary/${id}/approve`, data)
            toast.success('Phê duyệt bảng lương thành công!')
            dispatch(getSalaryDetail(id))
            dispatch(getSalaries())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Phê duyệt bảng lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const paySalary = createAsyncThunk(
    'salary/paySalary',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post(`/salary/${id}/pay`, data)
            toast.success('Thanh toán lương thành công!')
            dispatch(getSalaryDetail(id))
            dispatch(getSalaries())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Thanh toán lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const deleteSalary = createAsyncThunk(
    'salary/deleteSalary',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.delete(`/salary/${id}`)
            toast.success('Xóa bảng lương thành công!')
            dispatch(getSalaries())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Xóa bảng lương thất bại!')
            return rejectWithValue(message)
        }
    }
)

const initialState = {
    salaries: [],
    salaryDetail: null,
    salarySummary: null,
    calculationPreview: null,
    meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    loading: false,
    error: null,
}

const handlePending = (state) => {
    state.loading = true
    state.error = null
}

const handleRejected = (state, action) => {
    state.loading = false
    state.error = action.payload
}

const salarySlice = createSlice({
    name: 'salary',
    initialState,
    reducers: {
        clearSalaryDetail: (state) => {
            state.salaryDetail = null
        },
        clearCalculationPreview: (state) => {
            state.calculationPreview = null
        }
    },
    extraReducers: (builder) => {
        builder
            // getSalaries
            .addCase(getSalaries.pending, handlePending)
            .addCase(getSalaries.fulfilled, (state, action) => {
                state.loading = false
                state.salaries = action.payload.data || []
                if (action.payload.meta) {
                    state.meta = action.payload.meta
                }
            })
            .addCase(getSalaries.rejected, handleRejected)

            // getSalarySummary
            .addCase(getSalarySummary.pending, handlePending)
            .addCase(getSalarySummary.fulfilled, (state, action) => {
                state.loading = false
                state.salarySummary = action.payload.data || action.payload
            })
            .addCase(getSalarySummary.rejected, handleRejected)

            // getSalaryDetail
            .addCase(getSalaryDetail.pending, handlePending)
            .addCase(getSalaryDetail.fulfilled, (state, action) => {
                state.loading = false
                state.salaryDetail = action.payload.data || action.payload
            })
            .addCase(getSalaryDetail.rejected, handleRejected)

            // getSalaryByUserMonth
            .addCase(getSalaryByUserMonth.pending, handlePending)
            .addCase(getSalaryByUserMonth.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(getSalaryByUserMonth.rejected, handleRejected)

            // calculateSalary
            .addCase(calculateSalary.pending, handlePending)
            .addCase(calculateSalary.fulfilled, (state, action) => {
                state.loading = false
                state.calculationPreview = action.payload.data || action.payload
            })
            .addCase(calculateSalary.rejected, handleRejected)

            // action thunks only set loading states
            .addCase(recalculateSalary.pending, handlePending)
            .addCase(recalculateSalary.fulfilled, (state) => { state.loading = false })
            .addCase(recalculateSalary.rejected, handleRejected)

            .addCase(updateSalary.pending, handlePending)
            .addCase(updateSalary.fulfilled, (state) => { state.loading = false })
            .addCase(updateSalary.rejected, handleRejected)

            .addCase(approveSalary.pending, handlePending)
            .addCase(approveSalary.fulfilled, (state) => { state.loading = false })
            .addCase(approveSalary.rejected, handleRejected)

            .addCase(paySalary.pending, handlePending)
            .addCase(paySalary.fulfilled, (state) => { state.loading = false })
            .addCase(paySalary.rejected, handleRejected)

            .addCase(deleteSalary.pending, handlePending)
            .addCase(deleteSalary.fulfilled, (state) => { state.loading = false })
            .addCase(deleteSalary.rejected, handleRejected)
    }
})

export const { clearSalaryDetail, clearCalculationPreview } = salarySlice.actions
export default salarySlice.reducer
