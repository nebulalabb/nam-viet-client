import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getTasks = createAsyncThunk(
    'task/getList',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/tasks', { params })
            const { data, meta } = response.data
            return { data, meta }
        } catch (error) {
            const errorObj = handleError(error)
            return rejectWithValue(errorObj?.message || 'Có lỗi xảy ra')
        }
    },
)

export const createTask = createAsyncThunk(
    'task/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/tasks', payload)
            toast.success('Thêm mới thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const updateTask = createAsyncThunk(
    'task/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tasks/${id}`, data)
            toast.success('Cập nhật thành công!')
            return response.data
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

export const deleteTask = createAsyncThunk(
    'task/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/tasks/${id}`)
            toast.success('Xóa thành công!')
            return id
        } catch (error) {
            const errorObj = handleError(error)
            const errorMessage = errorObj?.message || 'Có lỗi xảy ra'
            toast.error(errorMessage)
            return rejectWithValue(errorMessage)
        }
    },
)

const initialState = {
    tasks: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getTasks
            .addCase(getTasks.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getTasks.fulfilled, (state, action) => {
                state.loading = false
                state.tasks = action.payload.data || []
                if (action.payload.meta) {
                    state.pagination = action.payload.meta
                }
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
                toast.error(state.error)
            })
            // createTask
            .addCase(createTask.pending, (state) => {
                state.loading = true
            })
            .addCase(createTask.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createTask.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // updateTask
            .addCase(updateTask.pending, (state) => {
                state.loading = true
            })
            .addCase(updateTask.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // deleteTask
            .addCase(deleteTask.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteTask.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default taskSlice.reducer
