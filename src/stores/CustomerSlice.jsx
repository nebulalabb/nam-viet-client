import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCustomers = createAsyncThunk(
  'customer',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/customers', { params })
      const { data, pagination } = response.data
      return { data, pagination }
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customers', data)

      await dispatch(getCustomers()).unwrap()
      toast.success('Thêm mới thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteCustomer = createAsyncThunk(
  'customer/delete',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/customers/${data}`)
      await dispatch(getCustomers()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteMultipleCustomers = createAsyncThunk(
  'customer/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customers/bulk-delete', { ids })
      await dispatch(getCustomers()).unwrap()
      toast.success('Xóa các khách hàng đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateCustomerStatus = createAsyncThunk(
  'customer/updateStatus',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, status } = updateData
      await api.patch(`/customers/${id}/status`, { status })
      await dispatch(getCustomers()).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCustomer = createAsyncThunk(
  'customer/update',
  async (updateData, { rejectWithValue, dispatch }) => {
    try {
      const { id, data } = updateData
      await api.put(`/customers/${id}`, data)
      await dispatch(getCustomers()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const importCustomer = createAsyncThunk(
  'customer/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/customers/import', data)
      await dispatch(getCustomers()).unwrap()
      toast.success('Import dữ liệu thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  customer: {},
  customers: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
}

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.data
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateCustomerStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomerStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(importCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importCustomer.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export const getCustomerInvoices = createAsyncThunk(
  'customer/getInvoices',
  async (params, { rejectWithValue }) => {
    try {
      if (params.order && typeof params.order !== 'string') {
        params.order = JSON.stringify(params.order)
      }
      const { data } = await api.get('customers/invoices', { params })
      return data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getCustomerPurchasedProducts = createAsyncThunk(
  'customer/getPurchasedProducts',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await api.get('customers/purchased-products', { params })
      return data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export default customerSlice.reducer
