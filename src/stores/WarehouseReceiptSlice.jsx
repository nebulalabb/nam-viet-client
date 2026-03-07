import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getWarehouseReceipts = createAsyncThunk(
  'warehouseReceipt/get-warehouse-receipts',
  async ({ search, fromDate = null, toDate = null, page = 1, limit = 100, receiptType, status = null, creator = null } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/warehouse-receipts', {
        params: {
          search,
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
          page,
          limit,
          receiptType,
          status: Array.isArray(status) && status.length > 0 ? status.join(',') : status,
          creator: Array.isArray(creator) && creator.length > 0 ? creator.join(',') : creator,
        },
      })
      const responseData = response.data
      let data = responseData?.data?.data
      let pagination = responseData?.data?.pagination

      if (!Array.isArray(data) && Array.isArray(responseData?.data)) {
        data = responseData.data
        pagination = responseData.pagination || responseData
      }

      if (!data && Array.isArray(responseData)) {
        data = responseData
      }

      data = data || []

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

export const getWarehouseReceiptById = createAsyncThunk(
  'warehouseReceipt/get-warehouse-receipt-by-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/warehouse-receipts/${id}`)
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getWarehouseReceiptDetail = getWarehouseReceiptById

export const createWarehouseReceipt = createAsyncThunk(
  'warehouseReceipt/create-warehouse-receipt',
  async (data, { rejectWithValue }) => {
    try {
      await api.post('/warehouse-receipts', data)
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateWarehouseReceipt = createAsyncThunk(
  'warehouseReceipt/update-warehouse-receipt',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      await api.put(`/warehouse-receipts/${id}`, data)
      toast.success('Cập nhật thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteWarehouseReceipt = createAsyncThunk(
  'warehouseReceipt/delete-warehouse-receipt',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/warehouse-receipts/${id}`)
      toast.success('Xóa thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleWarehouseReceipts = createAsyncThunk(
  'warehouseReceipt/deleteMultiple',
  async (ids, { rejectWithValue }) => {
    try {
      await api.post('/warehouse-receipts/bulk-delete', { ids })
      toast.success('Xóa các phiếu kho đã chọn thành công')
      return ids
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const postWarehouseReceipt = createAsyncThunk(
  'warehouseReceipt/post-warehouse-receipt',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/warehouse-receipts/${id}/post`)
      toast.success('Duyệt phiếu thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const cancelWarehouseReceipt = createAsyncThunk(
  'warehouseReceipt/cancel-warehouse-receipt',
  async (id, { rejectWithValue }) => {
    try {
      await api.post(`/warehouse-receipts/${id}/cancel`)
      toast.success('Hủy phiếu thành công')
      return id
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const generateWarehouseReceiptFromPO = createAsyncThunk(
  'warehouseReceipt/generate-from-po',
  async ({ purchaseOrderId, selectedItemIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/warehouse-receipts/generate-from-purchase-order',
        {
          purchaseOrderId,
          selectedItemIds,
        },
      )
      toast.success('Tạo phiếu nhập kho thành công')
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const generateWarehouseReceiptFromInvoice = createAsyncThunk(
  'warehouseReceipt/generate-from-invoice',
  async ({ invoiceId, selectedItemIds, type = 'retail' }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        '/warehouse-receipts/generate-from-invoice',
        {
          invoiceId,
          selectedItemIds,
        },
        {
          params: { type },
        },
      )
      return response.data.data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  warehouseReceipt: {},
  warehouseReceipts: [],
  loading: false,
  detailLoading: false,
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

export const warehouseReceiptSlice = createSlice({
  name: 'warehouseReceipt',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all warehouse receipts
      .addCase(getWarehouseReceipts.pending, (state) => {
        state.loading = true
      })
      .addCase(getWarehouseReceipts.fulfilled, (state, action) => {
        state.loading = false
        state.warehouseReceipts = action.payload.data || []
        state.pagination = action.payload.meta || initialState.pagination
      })
      .addCase(getWarehouseReceipts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Get warehouse receipt by ID
      .addCase(getWarehouseReceiptById.pending, (state) => {
        state.detailLoading = true
      })
      .addCase(getWarehouseReceiptById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.warehouseReceipt = action.payload
      })
      .addCase(getWarehouseReceiptById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Create warehouse receipt
      .addCase(createWarehouseReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(createWarehouseReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createWarehouseReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Update warehouse receipt
      .addCase(updateWarehouseReceipt.pending, (state) => {
        state.loading = true
      })
      .addCase(updateWarehouseReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateWarehouseReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Delete warehouse receipt
      .addCase(deleteWarehouseReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteWarehouseReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteWarehouseReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Post warehouse receipt
      .addCase(postWarehouseReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postWarehouseReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(postWarehouseReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Cancel warehouse receipt
      .addCase(cancelWarehouseReceipt.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(cancelWarehouseReceipt.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(cancelWarehouseReceipt.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      // Generate warehouse receipt from invoice
      .addCase(generateWarehouseReceiptFromInvoice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateWarehouseReceiptFromInvoice.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(generateWarehouseReceiptFromInvoice.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export default warehouseReceiptSlice.reducer
