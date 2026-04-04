import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/utils/axios'
import { handleError } from '@/utils/handle-error'

// Thunks
export const getWarehouses = createAsyncThunk(
    'warehouse/getWarehouses',
    async (params, { rejectWithValue }) => {
        try {
            const response = await api.get('/warehouses', { params })
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const getWarehouseById = createAsyncThunk(
    'warehouse/getWarehouseById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/warehouses/${id}`)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const createWarehouse = createAsyncThunk(
    'warehouse/createWarehouse',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/warehouses', data)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const updateWarehouse = createAsyncThunk(
    'warehouse/updateWarehouse',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/warehouses/${id}`, data)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const deleteWarehouse = createAsyncThunk(
    'warehouse/deleteWarehouse',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/warehouses/${id}`)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const updateWarehouseStatus = createAsyncThunk(
    'warehouse/updateWarehouseStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/warehouses/${id}/status`, { status })
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const getWarehouseStatistics = createAsyncThunk(
    'warehouse/getWarehouseStatistics',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/warehouses/${id}/statistics`)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const deleteMultipleWarehouses = createAsyncThunk(
    'warehouse/deleteMultipleWarehouses',
    async ({ ids, force = false }, { rejectWithValue }) => {
        try {
            const response = await api.post('/warehouses/bulk-delete', { ids, force })
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const checkWarehousesInventory = createAsyncThunk(
    'warehouse/checkWarehousesInventory',
    async (ids, { rejectWithValue }) => {
        try {
            const response = await api.post('/warehouses/check-inventory', { ids })
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)

export const importWarehouse = createAsyncThunk(
    'warehouse/importWarehouse',
    async (data, { rejectWithValue }) => {
        try {
            const response = await api.post('/warehouses/import', data)
            return response.data
        } catch (error) {
            return rejectWithValue(handleError(error))
        }
    }
)



const initialState = {
    warehouses: [],
    currentWarehouse: null,
    currentWarehouseStatistics: null,
    meta: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },
    loading: false,
    error: null,
}

const warehouseSlice = createSlice({
    name: 'warehouse',
    initialState,
    reducers: {
        clearCurrentWarehouse: (state) => {
            state.currentWarehouse = null
            state.currentWarehouseStatistics = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        // getWarehouses
        builder
            .addCase(getWarehouses.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getWarehouses.fulfilled, (state, action) => {
                state.loading = false
                state.warehouses = action.payload.data
                state.meta = action.payload.meta
            })
            .addCase(getWarehouses.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi lấy danh sách kho'
            })

        // getWarehouseById
        builder
            .addCase(getWarehouseById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getWarehouseById.fulfilled, (state, action) => {
                state.loading = false
                state.currentWarehouse = action.payload.data
            })
            .addCase(getWarehouseById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi lấy chi tiết kho'
            })

        // getWarehouseStatistics
        builder
            .addCase(getWarehouseStatistics.pending, (state) => {
                // Not setting full loading state to avoid blocking UI unnecessarily
            })
            .addCase(getWarehouseStatistics.fulfilled, (state, action) => {
                state.currentWarehouseStatistics = action.payload.data
            })
            .addCase(getWarehouseStatistics.rejected, (state, action) => {
                state.error = action.payload?.message || 'Có lỗi xảy ra khi lấy thống kê kho'
            })

        // createWarehouse
        builder
            .addCase(createWarehouse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createWarehouse.fulfilled, (state, action) => {
                state.loading = false
                // Assuming we refetch or handle via component
            })
            .addCase(createWarehouse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi tạo kho'
            })

        // updateWarehouse
        builder
            .addCase(updateWarehouse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateWarehouse.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(updateWarehouse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi cập nhật kho'
            })

        // deleteWarehouse
        builder
            .addCase(deleteWarehouse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteWarehouse.fulfilled, (state, action) => {
                state.loading = false
            })
            .addCase(deleteWarehouse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi xóa kho'
            })

        // updateWarehouseStatus
        builder
            .addCase(updateWarehouseStatus.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateWarehouseStatus.fulfilled, (state, action) => {
                state.loading = false
                const updatedIndex = state.warehouses.findIndex(
                    (w) => w.id === action.payload.data.id
                )
                if (updatedIndex !== -1) {
                    state.warehouses[updatedIndex] = action.payload.data
                }
            })
            .addCase(updateWarehouseStatus.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi cập nhật trạng thái kho'
            })

        // deleteMultipleWarehouses
        builder
            .addCase(deleteMultipleWarehouses.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteMultipleWarehouses.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(deleteMultipleWarehouses.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi xóa hàng loạt kho'
            })

        // importWarehouse
        builder
            .addCase(importWarehouse.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(importWarehouse.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(importWarehouse.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload?.message || 'Có lỗi xảy ra khi import kho'
            })
    },
})

export const { clearCurrentWarehouse, clearError } = warehouseSlice.actions

export default warehouseSlice.reducer
