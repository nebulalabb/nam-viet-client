import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/axios'

const initialState = {
    widgets: [
        { id: 'revenue-kpi', type: 'kpi', visible: true, order: 1, title: 'Doanh thu thuần' },
        { id: 'orders-kpi', type: 'kpi', visible: true, order: 2, title: 'Đơn hàng mới' },
        { id: 'debts-kpi', type: 'kpi', visible: true, order: 3, title: 'Công nợ phải thu' },
        { id: 'production-kpi', type: 'kpi', visible: true, order: 4, title: 'Lệnh SX đang chạy' },
        { id: 'top-products-pie', type: 'kpi', visible: true, order: 5, title: 'Tỷ trọng Doanh thu Sản phẩm' },
        { id: 'revenue-chart', type: 'chart', visible: true, order: 6, title: 'Biểu đồ doanh thu' },
        { id: 'top-exported-chart', type: 'chart', visible: true, order: 7, title: 'Sản lượng xuất kho nhiều nhất' },
        { id: 'inventory-chart', type: 'chart', visible: true, order: 8, title: 'Tỷ trọng tồn kho' },
        { id: 'activity-log', type: 'list', visible: true, order: 9, title: 'Nhật ký hoạt động' },
        { id: 'alerts-section', type: 'list', visible: true, order: 10, title: 'Cảnh báo & Hành động' },
        { id: 'recent-orders', type: 'table', visible: true, order: 11, title: 'Đơn hàng gần đây' },
        { id: 'top-products', type: 'table', visible: true, order: 12, title: 'Sản phẩm bán chạy' },
        { id: 'low-stock-table', type: 'table', visible: true, order: 13, title: 'Sản phẩm sắp hết hàng' }
    ],
    isEditMode: false,
    stats: null,
    loading: false,
    error: null,
}

// Thunk gọi API thực tế từ backend
export const getDashboardStats = createAsyncThunk(
    'dashboard/getStats',
    async (payload, { rejectWithValue }) => {
        try {
            const { period = 'month', warehouseId } = payload || {}
            const params = new URLSearchParams()
            if (period && period !== 'custom') params.append('period', period)
            if (warehouseId && warehouseId !== 'all') params.append('warehouseId', warehouseId)

            const response = await api.get(`/reports/dashboard/stats?${params.toString()}`)
            const serverData = response.data?.data

            if (!serverData) throw new Error('No data from server')

            // Map server response format to internal dashboard format
            const result = {
                kpi: {
                    revenue: {
                        current: serverData.kpi?.revenue?.current || 0,
                        previous: serverData.kpi?.revenue?.previous || 0,
                        growth_percent: serverData.kpi?.revenue?.growth_percent || 0,
                    },
                    orders: {
                        current: serverData.kpi?.orders?.current || 0,
                        pending: serverData.kpi?.orders?.pending || 0,
                        growth_percent: 0,
                    },
                    debt: {
                        receivables: serverData.kpi?.debt?.receivables || 0,
                        overdue_count: serverData.kpi?.debt?.overdue_count || 0,
                        growth_percent: 0,
                    },
                    production: {
                        active: serverData.kpi?.production?.active || 0,
                        growth_percent: 0,
                    },
                },
                charts: {
                    revenue_trend: serverData.charts?.revenue_trend || [],
                    sales_channels: serverData.charts?.sales_channels || [],
                    inventory_share: serverData.charts?.inventory_share || [],
                },
                alerts: {
                    low_stock: serverData.alerts?.low_stock || [],
                    overdue_debts: serverData.alerts?.overdue_debts || [],
                    // pending_orders: build a count-based array to show in AlertsSection
                    pending_orders: serverData.alerts?.pending_orders_count > 0
                        ? Array(serverData.alerts.pending_orders_count).fill({ placeholder: true })
                        : [],
                    expiring: serverData.alerts?.expiring || [],
                    delayed_production: [],
                    cash_fund: serverData.alerts?.cash_fund || 0,
                },
                recent: {
                    orders: serverData.recent?.orders || [],
                    products: serverData.recent?.products || [],
                    activities: serverData.recent?.activities || [],
                },
            }

            return result
        } catch (error) {
            console.error('[DashboardSlice] Failed to fetch stats:', error.message)
            return rejectWithValue(error.message || 'Failed to fetch dashboard stats')
        }
    }
)

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        toggleEditMode: (state) => {
            state.isEditMode = !state.isEditMode
        },
        toggleWidgetVisibility: (state, action) => {
            const widgetId = action.payload
            const widget = state.widgets.find(w => w.id === widgetId)
            if (widget) {
                widget.visible = !widget.visible
            }
        },
        moveWidget: (state, action) => {
            const { activeId, overId } = action.payload
            const oldIndex = state.widgets.findIndex((w) => w.id === activeId)
            const newIndex = state.widgets.findIndex((w) => w.id === overId)
            if (oldIndex !== -1 && newIndex !== -1) {
                const item = state.widgets.splice(oldIndex, 1)[0]
                state.widgets.splice(newIndex, 0, item)
                state.widgets.forEach((w, index) => {
                    w.order = index + 1
                })
            }
        },
        resetLayout: (state) => {
            state.widgets = initialState.widgets
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDashboardStats.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(getDashboardStats.fulfilled, (state, action) => {
                state.loading = false
                state.stats = action.payload
            })
            .addCase(getDashboardStats.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { toggleEditMode, toggleWidgetVisibility, moveWidget, resetLayout } = dashboardSlice.actions

export const selectWidgets = (state) => state.dashboard.widgets
export const selectIsEditMode = (state) => state.dashboard.isEditMode
export const selectVisibleWidgets = (state) => state.dashboard.widgets.filter(w => w.visible).sort((a, b) => a.order - b.order)

export default dashboardSlice.reducer
