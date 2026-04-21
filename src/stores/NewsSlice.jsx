import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'sonner'

// =====================
// Thunks
// =====================

export const getNews = createAsyncThunk(
  'news/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/news/admin/all', { params })
      const { data, pagination } = response.data
      return { data, pagination }
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const getNewsById = createAsyncThunk(
  'news/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/news/admin/${id}`)
      return response.data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createNews = createAsyncThunk(
  'news/create',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/news/admin', data)
      await dispatch(getNews()).unwrap()
      toast.success('Tạo bài viết thành công')
      return response.data.data
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateNews = createAsyncThunk(
  'news/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/news/admin/${id}`, data)
      await dispatch(getNews()).unwrap()
      toast.success('Cập nhật bài viết thành công')
      return response.data.data
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteNews = createAsyncThunk(
  'news/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/news/admin/${id}`)
      await dispatch(getNews()).unwrap()
      toast.success('Xóa bài viết thành công')
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const publishNews = createAsyncThunk(
  'news/publish',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/news/admin/${id}/publish`)
      await dispatch(getNews()).unwrap()
      toast.success('Xuất bản bài viết thành công')
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const archiveNews = createAsyncThunk(
  'news/archive',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.post(`/news/admin/${id}/archive`)
      await dispatch(getNews()).unwrap()
      toast.success('Lưu trữ bài viết thành công')
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const uploadNewsImage = createAsyncThunk(
  'news/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data.url
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên')
      return rejectWithValue(handleError(error))
    }
  },
)

// =====================
// News Category Thunks
// =====================

export const getNewsCategories = createAsyncThunk(
  'news/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/news-categories')
      return response.data.data
    } catch (error) {
      return rejectWithValue(handleError(error))
    }
  },
)

export const createNewsCategory = createAsyncThunk(
  'news/createCategory',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/news-categories', data)
      await dispatch(getNewsCategories()).unwrap()
      toast.success('Tạo danh mục thành công')
      return response.data.data
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const updateNewsCategory = createAsyncThunk(
  'news/updateCategory',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/news-categories/${id}`, data)
      await dispatch(getNewsCategories()).unwrap()
      toast.success('Cập nhật danh mục thành công')
      return response.data.data
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

export const deleteNewsCategory = createAsyncThunk(
  'news/deleteCategory',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/news-categories/${id}`)
      await dispatch(getNewsCategories()).unwrap()
      toast.success('Xóa danh mục thành công')
    } catch (error) {
      toast.error(handleError(error))
      return rejectWithValue(handleError(error))
    }
  },
)

// =====================
// Slice
// =====================

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    news: [],
    categories: [],
    currentNews: null,
    loading: false,
    categoriesLoading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
    error: null,
  },
  reducers: {
    clearCurrentNews: (state) => {
      state.currentNews = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Get News
      .addCase(getNews.pending, (state) => {
        state.loading = true
      })
      .addCase(getNews.fulfilled, (state, action) => {
        state.loading = false
        state.news = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(getNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get News By ID
      .addCase(getNewsById.pending, (state) => {
        state.loading = true
      })
      .addCase(getNewsById.fulfilled, (state, action) => {
        state.loading = false
        state.currentNews = action.payload
      })
      .addCase(getNewsById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create News
      .addCase(createNews.pending, (state) => {
        state.loading = true
      })
      .addCase(createNews.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update News
      .addCase(updateNews.pending, (state) => {
        state.loading = true
      })
      .addCase(updateNews.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete News
      .addCase(deleteNews.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteNews.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get Categories
      .addCase(getNewsCategories.pending, (state) => {
        state.categoriesLoading = true
      })
      .addCase(getNewsCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false
        state.categories = action.payload
      })
      .addCase(getNewsCategories.rejected, (state, action) => {
        state.categoriesLoading = false
        state.error = action.payload
      })
  },
})

export const { clearCurrentNews } = newsSlice.actions
export default newsSlice.reducer
