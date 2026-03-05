import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getAttendances = createAsyncThunk(
    'attendance/getList',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance', { params })
            const { data, meta } = response.data
            return { data, meta }
        } catch (error) {
            const errorObj = handleError(error)
            return rejectWithValue(errorObj?.message || 'Có lỗi xảy ra')
        }
    },
)

export const getMyAttendances = createAsyncThunk(
    'attendance/getMyList',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance/my', { params })
            const { data, meta } = response.data
            return { data, meta }
        } catch (error) {
            const errorObj = handleError(error)
            return rejectWithValue(errorObj?.message || 'Có lỗi xảy ra')
        }
    },
)

export const getAttendanceStatistics = createAsyncThunk(
    'attendance/getStatistics',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance/statistics', { params })
            return response.data.data
        } catch (error) {
            const errorObj = handleError(error)
            return rejectWithValue(errorObj?.message || 'Có lỗi xảy ra')
        }
    },
)

export const checkIn = createAsyncThunk(
    'attendance/checkIn',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/check-in', payload)
            toast.success('Chấm công vào thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const checkOut = createAsyncThunk(
    'attendance/checkOut',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/check-out', payload)
            toast.success('Chấm công ra thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const updateAttendance = createAsyncThunk(
    'attendance/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/attendance/${id}`, data)
            toast.success('Cập nhật chấm công thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const generateQR = createAsyncThunk(
    'attendance/generateQR',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/qr/generate', payload)
            toast.success('Tạo mã QR thành công!')
            return response.data.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)


export const requestLeave = createAsyncThunk(
    'attendance/requestLeave',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/attendance/leave', payload)
            toast.success('Gửi yêu cầu nghỉ phép thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const approveLeave = createAsyncThunk(
    'attendance/approveLeave',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/attendance/${id}/approve`, data)
            toast.success('Duyệt phép thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

const initialState = {
    attendances: [],
    myAttendances: [],
    statistics: null,
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const attendanceSlice = createSlice({
    name: 'attendance',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getAttendances
            .addCase(getAttendances.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getAttendances.fulfilled, (state, action) => {
                state.loading = false
                state.attendances = action.payload.data || []
                if (action.payload.meta) {
                    state.pagination = action.payload.meta
                }
            })
            .addCase(getAttendances.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
                toast.error(state.error)
            })
            // getMyAttendances
            .addCase(getMyAttendances.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getMyAttendances.fulfilled, (state, action) => {
                state.loading = false
                state.myAttendances = action.payload.data || []
            })
            .addCase(getMyAttendances.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
                toast.error(state.error)
            })
            // getAttendanceStatistics
            .addCase(getAttendanceStatistics.pending, (state) => {
                state.loading = true
            })
            .addCase(getAttendanceStatistics.fulfilled, (state, action) => {
                state.loading = false
                state.statistics = action.payload
            })
            .addCase(getAttendanceStatistics.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // updateAttendance
            .addCase(updateAttendance.pending, (state) => {
                state.loading = true
            })
            .addCase(updateAttendance.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateAttendance.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // approveLeave
            .addCase(approveLeave.pending, (state) => {
                state.loading = true
            })
            .addCase(approveLeave.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(approveLeave.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default attendanceSlice.reducer
