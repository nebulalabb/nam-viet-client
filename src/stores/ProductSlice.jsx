import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// =====================
// Thunks
// =====================

export const getProducts = createAsyncThunk(
  'product/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params })
      const { data, pagination, summary } = response.data
      return { data, pagination, summary }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getLowStockProducts = createAsyncThunk(
  'product/getLowStock',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/low-stock', { params })
      const { data, meta } = response.data
      return { data, meta }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getProductById = createAsyncThunk(
  'product/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getProductDetail = createAsyncThunk(
  'product/detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`)
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/products/${id}`)
      await dispatch(getProducts()).unwrap()
      toast.success('Xóa thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteMultipleProducts = createAsyncThunk(
  'product/deleteMultiple',
  async (ids, { rejectWithValue, dispatch }) => {
    try {
      await api.post('/products/bulk-delete', { ids })
      await dispatch(getProducts()).unwrap()
      toast.success('Xóa các sản phẩm đã chọn thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const copyProduct = createAsyncThunk(
  'product/copy',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/products/${id}/copy`)
      await dispatch(getProducts()).unwrap()
      toast.success('Sao chép sản phẩm thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const importProduct = createAsyncThunk(
  'product/import',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/products/import', data)
      await dispatch(getProducts()).unwrap()
      return response.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getProductSaleHistory = createAsyncThunk(
  'product/sale-history',
  async ({ id, params }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}/sale-history`, { params })
      const { data } = response.data
      return data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createProduct = createAsyncThunk(
  'product/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const { image, code, name, basePrice, price, minStockLevel, ...rest } = data

      const payload = {
        sku: code,
        productName: name,
        productType: 'goods',
        purchasePrice: basePrice,
        sellingPriceRetail: price,
        minStockLevel: minStockLevel ? Number(minStockLevel) : 0,
        ...rest
      }

      const response = await api.post('/products', payload)
      const newProduct = response.data.data

      if (image && image instanceof File) {
        await dispatch(uploadProductImages({ id: newProduct.id, files: [image] })).unwrap()
      }

      await dispatch(getProducts()).unwrap()
      toast.success('Tạo sản phẩm thành công')
      return newProduct
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const { image, code, name, basePrice, price, minStockLevel, ...rest } = data

      const payload = {
        sku: code,
        productName: name,
        productType: 'goods',
        purchasePrice: basePrice,
        sellingPriceRetail: price,
        minStockLevel: minStockLevel ? Number(minStockLevel) : 0,
        ...rest
      }

      await api.put(`/products/${id}`, payload)

      if (image && image instanceof File) {
        await dispatch(uploadProductImages({ id, files: [image] })).unwrap()
      }

      await dispatch(getProducts()).unwrap()
      toast.success('Cập nhật dữ liệu thành công')
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const uploadProductImages = createAsyncThunk(
  'product/uploadImages',
  async ({ id, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))
      const response = await api.post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Upload ảnh thành công')
      return response.data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

// =====================
// Initial State
// =====================

const initialState = {
  products: [],
  product: null,
  summary: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  },
  lowStockProducts: [],
  saleHistory: {
    data: [],
    pagination: null,
    totalsByUnit: {},
  },
  loading: false,
  error: null,
}

// =====================
// Slice
// =====================

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    // Update single product in store (for real-time updates)
    updateProductInStore: (state, action) => {
      const updatedProduct = action.payload
      const index = state.products.findIndex((p) => p.id === updatedProduct.id)
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updatedProduct }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── getProducts ──────────────────────────────────────
      .addCase(getProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.data || []
        state.summary = action.payload.summary || null
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination
        }
      })
      .addCase(getProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── getLowStockProducts ──────────────────────────────
      .addCase(getLowStockProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.loading = false
        state.lowStockProducts = action.payload.data
      })
      .addCase(getLowStockProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi lấy dữ liệu cảnh báo tồn kho'
        toast.error(state.error)
      })

      // ── getProductById ───────────────────────────────────
      .addCase(getProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── getProductDetail ─────────────────────────────────
      .addCase(getProductDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductDetail.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(getProductDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── createProduct ────────────────────────────────────
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── updateProduct ────────────────────────────────────
      .addCase(updateProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── deleteProduct ────────────────────────────────────
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── deleteMultipleProducts ───────────────────────────
      .addCase(deleteMultipleProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteMultipleProducts.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteMultipleProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── copyProduct ──────────────────────────────────────
      .addCase(copyProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(copyProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(copyProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── importProduct ────────────────────────────────────
      .addCase(importProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(importProduct.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(importProduct.rejected, (state, action) => {
        state.loading = false
        const payload = action.payload
        state.error = payload?.message || payload || 'Lỗi không xác định'
        const hasImportErrors =
          payload?.importErrors ||
          payload?.message?.importErrors ||
          (typeof payload === 'object' && 'importErrors' in payload)
        if (!hasImportErrors) {
          let msg = state.error
          if (typeof msg === 'object') {
            try { msg = JSON.stringify(msg) } catch (e) { msg = 'Lỗi không xác định' }
          }
          toast.error(String(msg))
        }
      })

      // ── uploadProductImages ──────────────────────────────
      .addCase(uploadProductImages.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(uploadProductImages.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(uploadProductImages.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })

      // ── getProductSaleHistory ────────────────────────────
      .addCase(getProductSaleHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getProductSaleHistory.fulfilled, (state, action) => {
        state.loading = false
        state.saleHistory.data = action.payload?.data
        state.saleHistory.pagination = action.payload?.pagination
        state.saleHistory.totalsByUnit = action.payload?.totalsByUnit
      })
      .addCase(getProductSaleHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload?.message || action.payload || 'Lỗi không xác định'
        toast.error(state.error)
      })
  },
})

export const { updateProductInStore } = productSlice.actions

export default productSlice.reducer