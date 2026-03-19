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
            const errorObj = handleError(error)
            const errorMsg = errorObj?.message || errorObj || 'Không thể lấy danh sách lương'
            toast.error(errorMsg)
            return rejectWithValue(errorObj)
        }
    }
)

export const getSalarySummary = createAsyncThunk(
    'salary/getSummary',
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = params ? new URLSearchParams(params).toString() : '';
            const response = await api.get(`/salary/summary?${queryParams}`);
            // The Next.js API returned a `data` wrapping object but since it handles `data.data` inside the component
            // in some cases we might just map it as we did for getSalaries.
            // In Next.js client `data` wraps `{ data: ... }`
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể lấy thông tin tổng quan lương'
            );
        }
    }
);

// Get salary by ID
export const getSalaryById = createAsyncThunk(
    'salary/getById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/salary/${id}`);
            return response.data?.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Không thể lấy chi tiết lương'
            );
        }
    }
);

export const calculateBatchSalary = createAsyncThunk(
    'salary/calculateBatch',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/salary/calculate-batch', data);
            if (!data.preview) {
                toast.success('Tính lương tự động thành công!');
                dispatch(getSalaries());
                dispatch(getSalarySummary({ fromMonth: data.month, toMonth: data.month }));
            }
            return response.data;
        } catch (error) {
            const errorObj = handleError(error);
            const errorMsg = errorObj?.message || errorObj || 'Không thể tạo lương tự động';
            if (data?.preview !== true) toast.error(errorMsg);
            return rejectWithValue(errorObj);
        }
    }
);

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
            if (!data.preview) {
                toast.success('Tính toán lương thành công!')
            }
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMsg = errorObj?.message || errorObj || 'Tính toán lương thất bại!'
            if (data?.preview !== true) toast.error(errorMsg)
            return rejectWithValue(errorObj)
        }
    }
)

export const recalculateSalary = createAsyncThunk(
    'salary/recalculateSalary',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post(`/salary/${id}/recalculate`, data)
            toast.success('Tính lại lương thành công!')
            dispatch(getSalaryById(id))
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
            dispatch(getSalaryById(id))
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
            dispatch(getSalaryById(id))
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
            dispatch(getSalaryById(id))
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
    currentSalary: null,
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
            state.currentSalary = null
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

            // getSalaryById
            .addCase(getSalaryById.pending, handlePending)
            .addCase(getSalaryById.fulfilled, (state, action) => {
                state.loading = false
                state.currentSalary = action.payload.data || action.payload
            })
            .addCase(getSalaryById.rejected, handleRejected)

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

            // calculateBatchSalary
            .addCase(calculateBatchSalary.pending, handlePending)
            .addCase(calculateBatchSalary.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(calculateBatchSalary.rejected, handleRejected)

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
