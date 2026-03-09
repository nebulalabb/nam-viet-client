import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'sonner'

export const getCreditNotes = createAsyncThunk(
  'credit-note/get-credit-notes',
  async ({ fromDate = null, toDate = null }, { rejectWithValue }) => {
    try {
      const response = await api.get('/credit-note', {
        params: {
          fromDate: fromDate ?? undefined,
          toDate: toDate ?? undefined,
        },
      })
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getCreditNoteDetail = createAsyncThunk(
  'credit-note/get-credit-note-detail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/credit-note/${id}`)

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const getCreditNotesByInvoiceId = createAsyncThunk(
  'credit-note/get-credit-notes-by-invoice-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/credit-note/invoice/${id}`)

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const createCreditNote = createAsyncThunk(
  'credit-note/create-credit-note',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/credit-note', dataToSend)
      await dispatch(getCreditNotes({})).unwrap()
      toast.success('Tạo hóa đơn âm thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCreditNote = createAsyncThunk(
  'credit-note/update-credit-note',
  async (dataToSend, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(
        `/credit-note/${dataToSend?.id}`,
        dataToSend,
      )
      await dispatch(getCreditNotes({})).unwrap()
      toast.success('Cập nhật hóa đơn âm thành công')
      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const updateCreditNoteStatus = createAsyncThunk(
  'credit-note/update-credit-note-status',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      await api.put(`/credit-note/${data?.id}/status`, data)
      await dispatch(getCreditNotes({})).unwrap()
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

export const deleteCreditNoteById = createAsyncThunk(
  'credit-note/delete-credit-by-id',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/credit-note/${id}`)

      const { data } = response.data
      return data
    } catch (error) {
      const message = handleError(error)
      return rejectWithValue(message)
    }
  },
)

const initialState = {
  creditNotes: [],
  creditNotesByInvoiceId: [],
  creditNote: null,
  loading: false,
  error: null,
}

export const creditNoteSlice = createSlice({
  name: 'creditNote',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get credit notes
      .addCase(getCreditNotes.pending, (state) => {
        state.loading = true
      })
      .addCase(getCreditNotes.fulfilled, (state, action) => {
        state.loading = false
        state.creditNotes = action.payload
      })
      .addCase(getCreditNotes.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get credit note detail by id
      .addCase(getCreditNoteDetail.pending, (state) => {
        state.loading = true
      })
      .addCase(getCreditNoteDetail.fulfilled, (state, action) => {
        state.loading = false
        state.creditNote = action.payload
      })
      .addCase(getCreditNoteDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create credit note
      .addCase(createCreditNote.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createCreditNote.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(createCreditNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Update credit note
      .addCase(updateCreditNote.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCreditNote.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateCreditNote.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Update credit note status
      .addCase(updateCreditNoteStatus.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(updateCreditNoteStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(updateCreditNoteStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Get credit notes by invoice id
      .addCase(getCreditNotesByInvoiceId.fulfilled, (state, action) => {
        state.loading = false
        state.creditNotesByInvoiceId = action.payload
      })
      .addCase(getCreditNotesByInvoiceId.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(getCreditNotesByInvoiceId.pending, (state) => {
        state.loading = true
        state.error = null
      })
      // Get credit notes by invoice id
      .addCase(deleteCreditNoteById.fulfilled, (state, action) => {
        state.loading = false
      })
      .addCase(deleteCreditNoteById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload.message || 'Lỗi không xác định'
        toast.error(state.error)
      })
      .addCase(deleteCreditNoteById.pending, (state) => {
        state.loading = true
        state.error = null
      })
  },
})

export default creditNoteSlice.reducer
