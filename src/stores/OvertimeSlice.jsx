import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL + '/api/overtime';

// Helper to get auth header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const getOvertimeSessions = createAsyncThunk(
    'overtime/getSessions',
    async ({ page = 1, limit = 20, search = '', status, month }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (month) params.append('month', month);

            const response = await axios.get(`${API_URL}?${params.toString()}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải danh sách phiên tăng ca');
        }
    }
);

export const getOvertimeSession = createAsyncThunk(
    'overtime/getSession',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải cấu hình phiên tăng ca');
        }
    }
);

// We need a separate stats thunk if available, but for now we'll derive stats locally or use a specific endpoint 
export const getOvertimeStats = createAsyncThunk(
    'overtime/getStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/stats`, getAuthHeaders());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thống kê');
        }
    }
);

export const createOvertimeSession = createAsyncThunk(
    'overtime/createSession',
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_URL, data, getAuthHeaders());
            toast.success('Tạo phiên tăng ca thành công');
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Tạo phiên tăng ca thất bại');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const addEmployeesToSession = createAsyncThunk(
    'overtime/addEmployees',
    async ({ sessionId, userIds }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${sessionId}/employees`, { userIds }, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Thêm nhân viên thất bại');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const removeEmployeeFromSession = createAsyncThunk(
    'overtime/removeEmployee',
    async ({ sessionId, userId }, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/${sessionId}/employees/${userId}`, getAuthHeaders());
            return { sessionId, userId, data: response.data };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xóa nhân viên thất bại');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const closeSession = createAsyncThunk(
    'overtime/closeSession',
    async ({ sessionId, endTime }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${sessionId}/close`, { endTime }, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đóng phiên thất bại');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

const overtimeSlice = createSlice({
    name: 'overtime',
    initialState: {
        sessions: [],
        currentSession: null,
        stats: null,
        meta: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentSession: (state) => {
            state.currentSession = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // getOvertimeSessions
            .addCase(getOvertimeSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOvertimeSessions.fulfilled, (state, action) => {
                state.loading = false;
                state.sessions = action.payload.data || [];
                state.meta = action.payload.meta || null;
            })
            .addCase(getOvertimeSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // getOvertimeSession
            .addCase(getOvertimeSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOvertimeSession.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSession = action.payload.data;
            })
            .addCase(getOvertimeSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // getOvertimeStats
            .addCase(getOvertimeStats.fulfilled, (state, action) => {
                state.stats = action.payload.data;
            })

            // createOvertimeSession
            .addCase(createOvertimeSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOvertimeSession.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(createOvertimeSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // addEmployeesToSession
            .addCase(addEmployeesToSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(addEmployeesToSession.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(addEmployeesToSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // removeEmployeeFromSession
            .addCase(removeEmployeeFromSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeEmployeeFromSession.fulfilled, (state, action) => {
                state.loading = false;
                const { userId } = action.payload;
                if (state.currentSession && state.currentSession.entries) {
                    state.currentSession.entries = state.currentSession.entries.filter(e => e.userId !== userId);
                }
            })
            .addCase(removeEmployeeFromSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // closeSession
            .addCase(closeSession.pending, (state) => {
                state.loading = true;
            })
            .addCase(closeSession.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentSession && state.currentSession.id === action.payload.data?.id) {
                    state.currentSession = action.payload.data;
                }
            })
            .addCase(closeSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCurrentSession } = overtimeSlice.actions;
export default overtimeSlice.reducer;
