import api from '@/utils/axios'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getInvoices = createAsyncThunk(
  'invoice/get-invoices',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '', status = null, creator = null }, { rejectWithValue }) => {
    try {
      const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
      const hasAdminPerm = permissions.includes('GET_INVOICE')
      const endpoint = hasAdminPerm ? '/invoices' : '/invoices/by-user'

      const response = await api.get(endpoint, {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search,
          status: Array.isArray(status) && status.length > 0 ? status.join(',') : status,
          creator: Array.isArray(creator) && creator.length > 0 ? creator.join(',') : creator
        },
      })
      const responseData = response.data
      let data = responseData?.data
      let meta = responseData?.meta

      data = Array.isArray(data) ? data : []

      return { data, meta }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  }
)

export const getInvoiceDetail = createAsyncThunk(
  'invoice/get-invoice-detail',
  async (id, { rejectWithValue }) => {
    try {
      const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
      const hasAdminPerm = permissions.includes('GET_INVOICE')
      const endpoint = hasAdminPerm ? `/invoices/${id}` : `/invoices/${id}/by-user`

      const response = await api.get(endpoint)
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyInvoices = createAsyncThunk(
  'invoice/get-my-invoices',
  async ({ fromDate = null, toDate = null, page = 1, limit = 15, search = '', status = null, creator = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/invoices/by-user', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          search,
          status: Array.isArray(status) && status.length > 0 ? status.join(',') : status,
          creator: Array.isArray(creator) && creator.length > 0 ? creator.join(',') : creator
        },
      })

      const responseData = response.data
      // Robust extraction of data and pagination
      let data = responseData?.data?.data
      let pagination = responseData?.data?.pagination

      // Fallback: if data is directly in responseData.data (and it's an array)
      if (!Array.isArray(data) && Array.isArray(responseData?.data)) {
        data = responseData.data
        // Pagination might be at root or missing
        pagination = responseData.pagination || responseData
      }

      // Fallback: if responseData itself is the array
      if (!data && Array.isArray(responseData)) {
        data = responseData
      }

      data = data || []

      // Map pagination to internal structure
      const meta = pagination ? {
        ...pagination,
        last_page: pagination.totalPages,
        current_page: pagination.page,
        per_page: pagination.limit
      } : undefined

      return { data, meta }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteInvoice = createAsyncThunk(
  'invoice/delete-invoice',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const deleteAdminInvoices = JSON.parse(
        localStorage.getItem('permissionCodes') || '[]',
      ).includes('DELETE_INVOICE')

      deleteAdminInvoices
        ? await api.delete(`/invoices/${id}/delete`)
        : await api.delete(`/invoices/${id}/delete-by-user`)

      // Just notify success, let the component handle refresh with current pagination
      toast.success('Xóa thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleInvoices = createAsyncThunk(
  'invoice/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/invoices/bulk-delete', { ids })
      await dispatch(getInvoices({})).unwrap()
      toast.success('Xóa các đơn bán đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createInvoice = createAsyncThunk(
  'invoice/create-invoice',
  async (dataToSend, { rejectWithValue }) => {
    try {
      const response = await api.post('/invoices', dataToSend)
      toast.success('Tạo đơn bán thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateInvoice = createAsyncThunk(
  'invoice/update-invoice',
  async (dataToSend, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/invoices/${dataToSend.invoiceId}/update-pending`,
        dataToSend,
      )
      toast.success('Cập nhật thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateInvoiceStatus = createAsyncThunk(
  'invoice/update-invoice-status',
  async (data, { rejectWithValue }) => {
    try {
      let response
      if (data.status === 'pending') {
        response = await api.post(`/invoices/${data.id}/revert`)
      } else {
        response = await api.put(`/invoices/${data.id}/update`, data)
      }
      toast.success('Cập nhật trạng thái thành công')

      // Return response data including warehouseInfo
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)



export const importInvoice = createAsyncThunk(
  'invoice/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/invoices/import', data)
      await dispatch(getInvoices({})).unwrap()
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)



const initialState = {
  invoices: [],
  invoice: null,
  loading: false,
  error: null,
  pagination: {
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0
  }
}

export const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(getInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.invoices = []
      })
      .addCase(getMyInvoices.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyInvoices.fulfilled, (state, action) => {
        state.loading = false
        state.invoices = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getMyInvoices.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.invoices = []
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false
        // Remove deleted invoice from local state immediately
        if (action.payload) {
          state.invoices = state.invoices.filter((inv) => inv.id !== action.payload)
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false
        // Update the invoice in local state without re-fetching
        if (action.payload?.id) {
          const index = state.invoices.findIndex((inv) => inv.id === action.payload.id)
          if (index !== -1) {
            state.invoices[index] = { ...state.invoices[index], ...action.payload }
          }
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(importInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.loading = false
        const { id, status } = action.meta.arg
        const index = state.invoices.findIndex((inv) => inv.id === id)
        if (index !== -1) {
          state.invoices[index].status = status
        }
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateInvoiceStatus.pending, (state) => {
        // Do not set global loading to true to prevent table remounting which closes dialogs
        state.error = null
      })
      .addCase(getInvoiceDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getInvoiceDetail.fulfilled, (state, action) => {
        state.loading = false
        state.invoice = action.payload
      })
      .addCase(getInvoiceDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })


  },
})

export default invoiceSlice.reducer
