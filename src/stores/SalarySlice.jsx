import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "sonner";

// Setting up the base URL from env
const API_URL = import.meta.env.VITE_API_URL + "/api/salary";

// Helper for auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
}

// Thunks
export const getSalaries = createAsyncThunk(
    "salary/getSalaries",
    async (params, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams()
            if (params.page) queryParams.append('page', params.page)
            if (params.limit) queryParams.append('limit', params.limit)
            if (params.month) queryParams.append('month', params.month)
            if (params.search) queryParams.append('search', params.search)
            if (params.userId) queryParams.append('userId', params.userId)
            if (params.status && params.status !== 'all') queryParams.append('status', params.status)
            if (params.roleId) queryParams.append('roleId', params.roleId)
            if (params.warehouseId) queryParams.append('warehouseId', params.warehouseId)

            const response = await axios.get(`${API_URL}?${queryParams.toString()}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy danh sách lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getSalarySummary = createAsyncThunk(
    "salary/getSalarySummary",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/summary`, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy thống kê lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getSalaryById = createAsyncThunk(
    "salary/getSalaryById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy chi tiết lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const getSalaryByUserAndMonth = createAsyncThunk(
    "salary/getSalaryByUserAndMonth",
    async ({ userId, month }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_URL}/${userId}/${month}`, getAuthHeaders());
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lấy lương theo nhân viên");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const calculateSalary = createAsyncThunk(
    "salary/calculateSalary",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/calculate`, data, getAuthHeaders());
            toast.success("Tính lương thành công");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tính lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const recalculateSalary = createAsyncThunk(
    "salary/recalculateSalary",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${id}/recalculate`, data, getAuthHeaders());
            toast.success("Tính lại lương thành công");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi tính lại lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const updateSalary = createAsyncThunk(
    "salary/updateSalary",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeaders());
            toast.success("Cập nhật lương thành công");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const approveSalary = createAsyncThunk(
    "salary/approveSalary",
    async ({ id, notes }, { rejectWithValue, dispatch }) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/approve`, { notes }, getAuthHeaders());
            toast.success("Phê duyệt lương thành công");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi phê duyệt lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const paySalary = createAsyncThunk(
    "salary/paySalary",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/${id}/pay`, data, getAuthHeaders());
            toast.success("Thanh toán lương thành công");
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi thanh toán lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

export const deleteSalary = createAsyncThunk(
    "salary/deleteSalary",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
            toast.success("Xóa bảng lương thành công");
            return id;
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi xóa bảng lương");
            return rejectWithValue(error.response?.data);
        }
    }
);

// Initial State
const initialState = {
    salaries: [],
    meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    },
    stats: {
        pending: 0,
        approved: 0,
        paid: 0,
        totalAmount: 0
    },
    currentSalary: null,
    loading: false,
    error: null,
};

// Slice
const salarySlice = createSlice({
    name: "salary",
    initialState,
    reducers: {
        clearCurrentSalary: (state) => {
            state.currentSalary = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // getSalaries
            .addCase(getSalaries.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSalaries.fulfilled, (state, action) => {
                state.loading = false;
                state.salaries = action.payload.data;
                state.meta = action.payload.meta;
            })
            .addCase(getSalaries.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // getSalarySummary
            .addCase(getSalarySummary.fulfilled, (state, action) => {
                state.stats = action.payload.data;
            })
            // getSalaryById
            .addCase(getSalaryById.pending, (state) => {
                state.loading = true;
            })
            .addCase(getSalaryById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentSalary = action.payload.data;
            })
            .addCase(getSalaryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // calculateSalary & recalculate (optimistic update or let component handle)
            .addCase(calculateSalary.pending, (state) => {
                state.loading = true;
            })
            .addCase(calculateSalary.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(calculateSalary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(recalculateSalary.pending, (state) => {
                state.loading = true;
            })
            .addCase(recalculateSalary.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(recalculateSalary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // approveSalary
            .addCase(approveSalary.fulfilled, (state, action) => {
                const updatedSalary = action.payload.data;
                const index = state.salaries.findIndex(s => s.id === updatedSalary.id);
                if (index !== -1) {
                    state.salaries[index] = updatedSalary;
                }
                if (state.currentSalary && state.currentSalary.id === updatedSalary.id) {
                    state.currentSalary = updatedSalary;
                }
            })
            // paySalary
            .addCase(paySalary.fulfilled, (state, action) => {
                const updatedSalary = action.payload.data;
                const index = state.salaries.findIndex(s => s.id === updatedSalary.id);
                if (index !== -1) {
                    state.salaries[index] = updatedSalary;
                }
                if (state.currentSalary && state.currentSalary.id === updatedSalary.id) {
                    state.currentSalary = updatedSalary;
                }
            })
            // deleteSalary
            .addCase(deleteSalary.fulfilled, (state, action) => {
                state.salaries = state.salaries.filter(s => s.id !== action.payload);
            });
    },
});

export const { clearCurrentSalary } = salarySlice.actions;

export default salarySlice.reducer;
