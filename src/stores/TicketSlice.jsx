import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getTickets = createAsyncThunk(
    'ticket/getList',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/tickets', { params })
            const { data, meta } = response.data
            return { data, meta }
        } catch (error) {
            const errorObj = handleError(error)
            return rejectWithValue(errorObj?.message || 'Có lỗi xảy ra')
        }
    },
)

export const createTicket = createAsyncThunk(
    'ticket/create',
    async (payload, { rejectWithValue }) => {
        try {
            const response = await api.post('/tickets', payload)
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

export const updateTicket = createAsyncThunk(
    'ticket/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/tickets/${id}`, data)
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

export const deleteTicket = createAsyncThunk(
    'ticket/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/tickets/${id}`)
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
    tickets: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
    },
    loading: false,
    error: null,
}

export const ticketSlice = createSlice({
    name: 'ticket',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // getTickets
            .addCase(getTickets.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getTickets.fulfilled, (state, action) => {
                state.loading = false
                state.tickets = action.payload.data || []
                if (action.payload.meta) {
                    state.pagination = action.payload.meta
                }
            })
            .addCase(getTickets.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Lỗi không xác định'
                toast.error(state.error)
            })
            // createTicket
            .addCase(createTicket.pending, (state) => {
                state.loading = true
            })
            .addCase(createTicket.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(createTicket.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // updateTicket
            .addCase(updateTicket.pending, (state) => {
                state.loading = true
            })
            .addCase(updateTicket.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(updateTicket.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // deleteTicket
            .addCase(deleteTicket.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteTicket.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteTicket.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export default ticketSlice.reducer
