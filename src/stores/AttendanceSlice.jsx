import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// Get All Attendance Records
export const getAttendanceList = createAsyncThunk(
    'attendance/list',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance', { params: filters })
            if (response.data?.data) return response.data
            return { data: response.data || [], meta: {} }
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

// Get My Attendance Records
export const getMyAttendance = createAsyncThunk(
    'attendance/myList',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance/my', { params: filters })
            if (response.data?.data) return response.data
            return { data: response.data || [], meta: {} }
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

// Get Today's Attendance Status
export const getTodayAttendance = createAsyncThunk(
    'attendance/today',
    async (_, { rejectWithValue }) => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const response = await api.get('/attendance/my', {
                params: { fromDate: today, toDate: today },
            })
            const todayRecord = response.data?.data?.[0]
            return {
                hasCheckedIn: !!todayRecord?.checkInTime,
                hasCheckedOut: !!todayRecord?.checkOutTime,
                checkInTime: todayRecord?.checkInTime,
                checkOutTime: todayRecord?.checkOutTime,
                workHours: todayRecord?.workHours,
                status: todayRecord?.status || 'absent',
            }
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

// Get Attendance Statistics
export const getAttendanceStatistics = createAsyncThunk(
    'attendance/statistics',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/attendance/statistics', { params: filters })
            return response.data?.data || response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

// Check In
export const checkIn = createAsyncThunk(
    'attendance/checkIn',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/attendance/check-in', data)
            await dispatch(getTodayAttendance()).unwrap()
            toast.success('Chấm công vào thành công!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Chấm công vào thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Check Out
export const checkOut = createAsyncThunk(
    'attendance/checkOut',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/attendance/check-out', data)
            await dispatch(getTodayAttendance()).unwrap()
            toast.success('Chấm công ra thành công!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Chấm công ra thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Request Leave
export const requestLeave = createAsyncThunk(
    'attendance/leave',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/attendance/leave', data)
            await dispatch(getMyAttendance()).unwrap()
            toast.success('Yêu cầu nghỉ phép đã được gửi!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Gửi yêu cầu nghỉ phép thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Approve Leave
export const approveLeave = createAsyncThunk(
    'attendance/approve',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/attendance/${id}/approve`, { approved: true })
            await dispatch(getAttendanceList()).unwrap()
            toast.success('Đã phê duyệt thông qua nghỉ phép!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Xử lý phê duyệt thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Reject Leave
export const rejectLeave = createAsyncThunk(
    'attendance/reject',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/attendance/${id}/approve`, { approved: false })
            await dispatch(getAttendanceList()).unwrap()
            toast.success('Đã từ chối nghỉ phép!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Từ chối thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Update Attendance (Admin)
export const updateAttendance = createAsyncThunk(
    'attendance/update',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/attendance/${id}`, data)
            await dispatch(getAttendanceList()).unwrap()
            toast.success('Cập nhật chấm công thành công!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Cập nhật chấm công thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Import Attendance
export const importAttendance = createAsyncThunk(
    'attendance/import',
    async (file, { rejectWithValue, dispatch }) => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            const response = await api.post('/attendance/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            await dispatch(getAttendanceList()).unwrap()
            const summary = response.data?.data?.summary || {}
            toast.success(`Nhập thành công ${summary.validCount || 0} bản ghi. ${summary.invalidCount > 0 ? `${summary.invalidCount} bản ghi lỗi.` : ''}`)
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Nhập dữ liệu thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

// Lock Attendance Month
export const lockAttendanceMonth = createAsyncThunk(
    'attendance/lockMonth',
    async (month, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/attendance/lock-month', { month })
            await dispatch(getAttendanceStatistics()).unwrap()
            toast.success('Chốt công tháng thành công!')
            return response.data
        } catch (error) {
            const errObj = handleError(error)
            toast.error(errObj?.message || 'Chốt công tháng thất bại!')
            return rejectWithValue(errObj)
        }
    }
)

const initialState = {
    attendanceList: [],
    myAttendance: [],
    todayStatus: null,
    statistics: null,
    meta: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
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
            // getAttendanceList
            .addCase(getAttendanceList.pending, (state) => { state.loading = true; state.error = null })
            .addCase(getAttendanceList.fulfilled, (state, action) => {
                state.loading = false
                state.attendanceList = action.payload.data
                if (action.payload.meta) state.meta = action.payload.meta
            })
            .addCase(getAttendanceList.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi tải danh sách chấm công'
            })

            // getMyAttendance
            .addCase(getMyAttendance.pending, (state) => { state.loading = true; state.error = null })
            .addCase(getMyAttendance.fulfilled, (state, action) => {
                state.loading = false
                state.myAttendance = action.payload.data
                if (action.payload.meta) state.meta = action.payload.meta
            })
            .addCase(getMyAttendance.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // getTodayAttendance
            .addCase(getTodayAttendance.fulfilled, (state, action) => {
                state.todayStatus = action.payload
            })

            // getAttendanceStatistics
            .addCase(getAttendanceStatistics.fulfilled, (state, action) => {
                state.statistics = action.payload
            })

            // checkIn
            .addCase(checkIn.pending, (state) => { state.loading = true })
            .addCase(checkIn.fulfilled, (state) => { state.loading = false })
            .addCase(checkIn.rejected, (state) => { state.loading = false })

            // checkOut
            .addCase(checkOut.pending, (state) => { state.loading = true })
            .addCase(checkOut.fulfilled, (state) => { state.loading = false })
            .addCase(checkOut.rejected, (state) => { state.loading = false })

            // lockAttendanceMonth
            .addCase(lockAttendanceMonth.pending, (state) => { state.loading = true })
            .addCase(lockAttendanceMonth.fulfilled, (state) => { state.loading = false })
            .addCase(lockAttendanceMonth.rejected, (state, action) => { state.loading = false; state.error = action.payload })

            // importAttendance
            .addCase(importAttendance.pending, (state) => { state.loading = true })
            .addCase(importAttendance.fulfilled, (state) => { state.loading = false })
            .addCase(importAttendance.rejected, (state, action) => { state.loading = false; state.error = action.payload })
    },
})

export default attendanceSlice.reducer
