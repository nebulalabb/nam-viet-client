import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const createReceipt = createAsyncThunk(
  'receipt/create-receipt',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/payment-receipts', data)
      toast.success('Thêm mới phiếu thu thành công')
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceipts = createAsyncThunk(
  'receipt/get-receipts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20, ...rest } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-receipts', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          ...rest
        },
      })
      return response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getMyReceipts = createAsyncThunk(
  'receipt/get-my-receipts',
  async ({ fromDate = null, toDate = null, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/payment-receipts/my-receipts', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
        },
      })
      // API returns: { data: { data: [...], pagination: {...} } }
      // We need to extract the data array
      return response.data.data || response.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceiptById = createAsyncThunk(
  'receipt/get-receipt-by-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-receipts/${id}`)
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteReceipt = createAsyncThunk(
  'receipt/delete-receipt',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payment-receipts/${id}`)
      toast.success('Xóa phiếu thu thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleReceipts = createAsyncThunk(
  'receipt/delete-multiple-receipts',
  async (ids, { rejectWithValue }) => {
    try {
      await api.post('/payment-vouchers/bulk-delete', {
        ids,
        voucherType: 'receipt_in',
      })

      toast.success(`Đã xóa ${ids.length} phiếu thu thành công`)
      return ids
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getReceiptQRCode = createAsyncThunk(
  'receipt/get-qr-code',
  async (receiptId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment-receipts/${receiptId}/qr-code`)
      // API returns: { status: 200, data: { qrLink, amount, voucherCode, description } }
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const approveReceipt = createAsyncThunk(
  'receipt/approve-receipt',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payment-receipts/${id}/approve`, { notes })
      toast.success('Duyệt phiếu thu thành công')
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const postReceipt = createAsyncThunk(
  'receipt/post-receipt',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payment-receipts/${id}/post`, { notes })
      toast.success('Ghi sổ phiếu thu thành công')
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateReceiptStatus = createAsyncThunk(
  'receipt/update-status',
  async ({ id, status, notes }, { dispatch, rejectWithValue }) => {
    try {
      let response
      if (status === 'approved') {
        response = await api.put(`/payment-receipts/${id}/approve`, { notes })
      } else if (status === 'posted' || status === 'completed') {
        response = await api.post(`/payment-receipts/${id}/post`, { notes })
      } else if (status === 'draft') {
        response = await api.post(`/payment-receipts/${id}/unpost`, { notes })
      } else if (status === 'cancelled' || status === 'canceled') {
        response = await api.delete(`/payment-receipts/${id}`)
        // Delete returns { message }
        return { id, status: 'canceled', deletedAt: new Date().toISOString() }
      } else {
        response = await api.put(`/payment-receipts/${id}`, { status, notes })
      }
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateReceipt = createAsyncThunk(
  'receipt/update-receipt',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payment-receipts/${id}`, data)
      toast.success('Cập nhật phiếu thu thành công')
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  receipt: {},
  receipts: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  qrCodeData: null,
  loading: false,
  error: null,
}

export const receiptSlice = createSlice({
  name: 'receipt',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(createReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(getReceipts.fulfilled, (state, action) => {
        state.loading = false
        const mapReceipt = (r) => ({
          ...r,
          status: r.isPosted ? 'posted' : 'draft'
        })

        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.receipts = action.payload.data.map(mapReceipt)
          state.pagination = action.payload.meta || action.payload.pagination || state.pagination
        } else if (Array.isArray(action.payload)) {
          state.receipts = action.payload.map(mapReceipt)
        } else {
          state.receipts = []
        }
      })
      .addCase(getReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getMyReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(getMyReceipts.fulfilled, (state, action) => {
        state.loading = false
        const mapReceipt = (r) => ({
          ...r,
          status: r.isPosted ? 'posted' : 'draft'
        })

        if (action.payload?.data && Array.isArray(action.payload.data)) {
          state.receipts = action.payload.data.map(mapReceipt)
          state.pagination = action.payload.meta || action.payload.pagination || state.pagination
        } else if (Array.isArray(action.payload)) {
          state.receipts = action.payload.map(mapReceipt)
        } else {
          state.receipts = []
        }
      })
      .addCase(getMyReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteReceipt.fulfilled, (state, action) => {
        state.loading = false
        state.receipts = state.receipts.filter((r) => r.id !== action.payload)
        // Check if pagination exists before updating
        if (state.pagination) state.pagination.total -= 1
      })
      .addCase(deleteReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })

      .addCase(deleteMultipleReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteMultipleReceipts.fulfilled, (state, action) => {
        state.loading = false
        state.receipts = state.receipts.filter((r) => !action.payload.includes(r.id))
        // Check if pagination exists before updating
        if (state.pagination) state.pagination.total -= action.payload.length
      })
      .addCase(deleteMultipleReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getReceiptQRCode.pending, (state) => {
        // Do not set global loading to true to avoid unmounting table rows
        state.error = null
      })
      .addCase(getReceiptQRCode.fulfilled, (state, action) => {
        state.qrCodeData = action.payload
      })
      .addCase(getReceiptQRCode.rejected, (state, action) => {
        state.error = action.payload.message || 'Không lấy được mã QR'
        state.qrCodeData = null
      })
      .addCase(postReceipt.fulfilled, (state, action) => {
        const updatedReceipt = {
          ...action.payload,
          status: action.payload.isPosted ? 'posted' : 'draft'
        }
        const index = state.receipts.findIndex((r) => r.id === updatedReceipt.id)
        if (index !== -1) {
          state.receipts[index] = { ...state.receipts[index], ...updatedReceipt }
        }
      })
      .addCase(updateReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(updateReceipt.fulfilled, (state, action) => {
        state.loading = false
        const updatedReceipt = {
          ...action.payload,
          status: action.payload.isPosted ? 'posted' : 'draft'
        }
        const index = state.receipts.findIndex((r) => r.id === updatedReceipt.id)
        if (index !== -1) {
          state.receipts[index] = { ...state.receipts[index], ...updatedReceipt }
        }
      })
      .addCase(updateReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateReceiptStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(updateReceiptStatus.fulfilled, (state, action) => {
        state.loading = false
        const updatedReceipt = {
          ...action.payload,
          status: action.payload.isPosted ? 'posted' : 'draft'
        }
        const index = state.receipts.findIndex((r) => r.id === updatedReceipt.id)
        if (index !== -1) {
          state.receipts[index] = { ...state.receipts[index], ...updatedReceipt }
        }
        toast.success('Cập nhật trạng thái thành công')
      })
      .addCase(updateReceiptStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default receiptSlice.reducer
