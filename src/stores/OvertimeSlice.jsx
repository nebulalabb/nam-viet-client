import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'

export const getOvertimeSessions = createAsyncThunk(
    'overtime/getOvertimeSessions',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/overtime', { params })
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Không thể lấy danh sách tăng ca')
            return rejectWithValue(message)
        }
    }
)

export const getOvertimeStats = createAsyncThunk(
    'overtime/getOvertimeStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/overtime/stats')
            return response.data
        } catch (error) {
            const message = handleError(error)
            return rejectWithValue(message)
        }
    }
)

export const getOvertimeSessionDetail = createAsyncThunk(
    'overtime/getOvertimeSessionDetail',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/overtime/${id}`)
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Không thể lấy chi tiết phiên tăng ca')
            return rejectWithValue(message)
        }
    }
)

export const createOvertimeSession = createAsyncThunk(
    'overtime/createOvertimeSession',
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post('/overtime', data)
            toast.success('Tạo phiên tăng ca thành công!')
            dispatch(getOvertimeSessions())
            dispatch(getOvertimeStats())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Tạo phiên tăng ca thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const updateOvertimeSession = createAsyncThunk(
    'overtime/updateOvertimeSession',
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.put(`/overtime/${id}`, data)
            toast.success('Cập nhật phiên tăng ca thành công!')
            dispatch(getOvertimeSessionDetail(id))
            dispatch(getOvertimeSessions())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Cập nhật phiên tăng ca thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const deleteOvertimeSession = createAsyncThunk(
    'overtime/deleteOvertimeSession',
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.delete(`/overtime/${id}`)
            toast.success('Xóa phiên tăng ca thành công!')
            dispatch(getOvertimeSessions())
            dispatch(getOvertimeStats())
            return id // Return ID to remove from state if needed
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Xóa phiên tăng ca thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const addEmployeesToOvertime = createAsyncThunk(
    'overtime/addEmployeesToOvertime',
    async ({ sessionId, userIds }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post(`/overtime/${sessionId}/employees`, { userIds })
            toast.success('Thêm nhân viên thành công!')
            dispatch(getOvertimeSessionDetail(sessionId))
            dispatch(getOvertimeSessions())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Thêm nhân viên thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const removeEmployeeFromOvertime = createAsyncThunk(
    'overtime/removeEmployeeFromOvertime',
    async ({ sessionId, userId }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.delete(`/overtime/${sessionId}/employees/${userId}`)
            toast.success('Xóa nhân viên khỏi phiên thành công!')
            dispatch(getOvertimeSessionDetail(sessionId))
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Xóa nhân viên thất bại!')
            return rejectWithValue(message)
        }
    }
)

export const closeOvertimeSession = createAsyncThunk(
    'overtime/closeOvertimeSession',
    async ({ sessionId, endTime }, { rejectWithValue, dispatch }) => {
        try {
            const response = await api.post(`/overtime/${sessionId}/close`, { endTime })
            toast.success('Đóng phiên tăng ca thành công!')
            dispatch(getOvertimeSessionDetail(sessionId))
            dispatch(getOvertimeSessions())
            dispatch(getOvertimeStats())
            return response.data
        } catch (error) {
            const message = handleError(error)
            toast.error(message || 'Đóng phiên tăng ca thất bại!')
            return rejectWithValue(message)
        }
    }
)

const initialState = {
    sessions: [],
    sessionDetail: null,
    stats: null,
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

const overtimeSlice = createSlice({
    name: 'overtime',
    initialState,
    reducers: {
        clearSessionDetail: (state) => {
            state.sessionDetail = null
        }
    },
    extraReducers: (builder) => {
        builder
            // getOvertimeSessions
            .addCase(getOvertimeSessions.pending, handlePending)
            .addCase(getOvertimeSessions.fulfilled, (state, action) => {
                state.loading = false
                state.sessions = action.payload.data || action.payload
            })
            .addCase(getOvertimeSessions.rejected, handleRejected)

            // getOvertimeStats
            .addCase(getOvertimeStats.pending, handlePending)
            .addCase(getOvertimeStats.fulfilled, (state, action) => {
                state.loading = false
                state.stats = action.payload.data || action.payload
            })
            .addCase(getOvertimeStats.rejected, handleRejected)

            // getOvertimeSessionDetail
            .addCase(getOvertimeSessionDetail.pending, handlePending)
            .addCase(getOvertimeSessionDetail.fulfilled, (state, action) => {
                state.loading = false
                state.sessionDetail = action.payload.data || action.payload
            })
            .addCase(getOvertimeSessionDetail.rejected, handleRejected)

            // createOvertimeSession
            .addCase(createOvertimeSession.pending, handlePending)
            .addCase(createOvertimeSession.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createOvertimeSession.rejected, handleRejected)

            // updateOvertimeSession
            .addCase(updateOvertimeSession.pending, handlePending)
            .addCase(updateOvertimeSession.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateOvertimeSession.rejected, handleRejected)

            // deleteOvertimeSession
            .addCase(deleteOvertimeSession.pending, handlePending)
            .addCase(deleteOvertimeSession.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteOvertimeSession.rejected, handleRejected)

            // addEmployeesToOvertime
            .addCase(addEmployeesToOvertime.pending, handlePending)
            .addCase(addEmployeesToOvertime.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(addEmployeesToOvertime.rejected, handleRejected)

            // removeEmployeeFromOvertime
            .addCase(removeEmployeeFromOvertime.pending, handlePending)
            .addCase(removeEmployeeFromOvertime.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(removeEmployeeFromOvertime.rejected, handleRejected)

            // closeOvertimeSession
            .addCase(closeOvertimeSession.pending, handlePending)
            .addCase(closeOvertimeSession.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(closeOvertimeSession.rejected, handleRejected)
    }
})

export const { clearSessionDetail } = overtimeSlice.actions
export default overtimeSlice.reducer
