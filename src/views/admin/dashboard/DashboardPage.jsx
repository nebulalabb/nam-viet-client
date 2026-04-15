import React, { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { useDispatch, useSelector } from 'react-redux'
import {
  selectVisibleWidgets,
  selectIsEditMode,
  moveWidget,
  selectWidgets,
  toggleWidgetVisibility,
  getDashboardStats
} from '../../../stores/DashboardSlice'
import { SortableWidget } from './SortableWidget'
import { MetricCard } from './MetricCard'
import { DashboardFilters } from './DashboardFilters'
import { TrendingUp, ShoppingBag, CreditCard, Activity } from 'lucide-react'

// Import New Widget Components
import { RevenueChart } from './components/RevenueChart'
import { SalesChannelChart } from './components/SalesChannelChart'
import { InventoryByTypeChart } from './components/InventoryByTypeChart'
import { AlertsSection } from './components/AlertsSection'
import { RecentOrdersTable } from './components/RecentOrdersTable'
import { TopProductsTable } from './components/TopProductsTable'
import { LowStockTable } from './components/LowStockTable'
import { WidgetSkeleton } from './components/WidgetStates'
import { ActivityLogWidget } from './components/ActivityLogWidget'
import { useDashboardSocket } from '../../../hooks/useDashboardSocket'
import { KPIDetailDialog } from './components/KPIDetailDialog'
import { TodayStatsBar } from './components/TodayStatsBar'
import { TopProductsPieWidget } from './components/TopProductsPieWidget'
import { TopExportedWidget } from './components/TopExportedWidget'
import { DashboardHeader } from './components/DashboardHeader'

// Map of Widget IDs to their component renders, now accepting data props
const renderWidgetContent = (widgetId, { kpi, charts, recent, alerts, loading, onOpenDialog }) => {
  switch (widgetId) {
    case 'revenue-kpi':
      return <MetricCard title="Doanh thu thuần" value={`${new Intl.NumberFormat('vi-VN').format(kpi?.revenue?.current || 0)} ₫`} trend={kpi?.revenue?.growth_percent >= 0 ? "up" : "down"} trendValue={Math.abs(kpi?.revenue?.growth_percent || 0)} icon={TrendingUp} loading={loading} onClick={() => onOpenDialog('revenue')} widgetId="revenue-kpi" />
    case 'orders-kpi':
      return <MetricCard title="Đơn hàng" value={new Intl.NumberFormat('vi-VN').format(kpi?.orders?.current || 0)} trend={kpi?.orders?.growth_percent >= 0 ? "up" : "down"} trendValue={Math.abs(kpi?.orders?.growth_percent || 0)} icon={ShoppingBag} loading={loading} onClick={() => onOpenDialog('orders')} widgetId="orders-kpi" />
    case 'debts-kpi':
      return <MetricCard title="Công nợ phải thu" value={`${new Intl.NumberFormat('vi-VN').format(kpi?.debt?.receivables || 0)} ₫`} trend={kpi?.debt?.growth_percent >= 0 ? "up" : "down"} trendValue={Math.abs(kpi?.debt?.growth_percent || 0)} icon={CreditCard} loading={loading} onClick={() => onOpenDialog('debt')} widgetId="debts-kpi" />
    case 'production-kpi':
      return <MetricCard title="Lệnh SX đang chạy" value={kpi?.production?.active || 0} trend={kpi?.production?.growth_percent >= 0 ? "up" : "down"} trendValue={Math.abs(kpi?.production?.growth_percent || 0)} icon={Activity} loading={loading} onClick={() => onOpenDialog('production')} widgetId="production-kpi" />
    case 'top-products-pie':
      return <TopProductsPieWidget />
    case 'revenue-chart':
      return <RevenueChart initialData={charts?.revenue_trend} />
    case 'top-exported-chart':
      return <TopExportedWidget />
    case 'inventory-chart':
      return <InventoryByTypeChart data={charts?.inventory_share} />
    case 'activity-log':
      return <ActivityLogWidget activities={recent?.activities} loading={loading} />
    case 'alerts-section':
      return <AlertsSection alerts={alerts} loading={loading} onAlertClick={onOpenDialog} />
    case 'recent-orders':
      return <RecentOrdersTable orders={recent?.orders} loading={loading} onOpenDialog={onOpenDialog} />
    case 'top-products':
      return <TopProductsTable products={recent?.products} loading={loading} onOpenDialog={onOpenDialog} />
    case 'low-stock-table':
      return <LowStockTable products={alerts?.low_stock} loading={loading} onOpenDialog={onOpenDialog} />
    default:
      return <div className="p-4">Widget Not Found</div>
  }
}



const WidgetSettingsPanel = () => {
  const dispatch = useDispatch()
  const allWidgets = useSelector(selectWidgets)

  return (
    <div className="mb-6 p-4 rounded-xl bg-card border shadow-sm animate-in slide-in-from-top-4 duration-300">
      <h3 className="font-semibold mb-3 text-sm">Quản lý hiển thị Widget</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {allWidgets.map(widget => (
          <label key={widget.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md transition-colors">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 h-4 w-4"
              checked={widget.visible}
              onChange={() => dispatch(toggleWidgetVisibility(widget.id))}
            />
            <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{widget.title}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

const DashboardPage = () => {
  const dispatch = useDispatch()
  const visibleWidgets = useSelector(selectVisibleWidgets)
  const isEditMode = useSelector(selectIsEditMode)
  const allWidgets = useSelector(selectWidgets)

  // 1. Khởi tạo & State Management: Kết nối lấy Dữ liệu Thống kê từ Redux
  const { stats, loading } = useSelector((state) => state.dashboard)

  // 2. Header & Filters: Bắt tham số Filter người dùng chọn (Local State Tracking)
  const [period, setPeriod] = useState('month')
  const [warehouseId, setWarehouseId] = useState('all')
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })

  const [activeId, setActiveId] = useState(null)
  const { isConnected } = useDashboardSocket()

  // Lưu trữ dữ liệu sau khi Phân rã từ JSON để truyền xuống component dễ dàng hơn
  const kpi = stats?.kpi
  const charts = stats?.charts
  const recent = stats?.recent
  const alerts = stats?.alerts

  // 5. State for Drill-down Modal (KPIDetailDialog)
  const [dialogType, setDialogType] = useState(null)

  // 3. Trigger Cập nhật Dữ liệu qua Redux Thunk
  React.useEffect(() => {
    const payload = { period, warehouseId }

    // Ném payload cho action để Fetch API lấy JSON
    if (period !== 'custom' || (period === 'custom' && dateRange?.from && dateRange?.to)) {
      dispatch(getDashboardStats(payload))
    }
  }, [dispatch, period, warehouseId, dateRange])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (over && active.id !== over.id) {
      dispatch(moveWidget({ activeId: active.id, overId: over.id }))
    }
  }

  const renderWidget = (widget) => {
    // Determine grid span based on widget type
    let colSpanClass = 'col-span-12'
    if (widget.id === 'top-products-pie') colSpanClass = 'col-span-12 sm:col-span-6 lg:col-span-4'
    else if (widget.type === 'kpi') colSpanClass = 'col-span-12 sm:col-span-6 lg:col-span-3'
    else if (widget.id === 'revenue-chart') colSpanClass = 'col-span-12 lg:col-span-8'
    else if (widget.id === 'top-exported-chart') colSpanClass = 'col-span-12 lg:col-span-4'
    else if (widget.id === 'inventory-chart') colSpanClass = 'col-span-12 xl:col-span-4'
    else if (widget.id === 'activity-log') colSpanClass = 'col-span-12 lg:col-span-4 xl:col-span-4'
    else if (widget.id === 'alerts-section') colSpanClass = 'col-span-12 lg:col-span-8 xl:col-span-8'
    else if (widget.type === 'table') colSpanClass = 'col-span-12 lg:col-span-6'

    // override specific tables to span full width if needed to match design (e.g. low-stock-table is wide)
    if (widget.id === 'low-stock-table' || widget.id === 'recent-orders' || widget.id === 'top-products') colSpanClass = 'col-span-12'

    // If loading and no previous stats exist, render skeleton
    if (loading && !stats) {
      return (
        <div key={widget.id} className={colSpanClass}>
          <WidgetSkeleton type={widget.type} />
        </div>
      )
    }

    // Pass data downward to rendering engine, including onOpenDialog action
    const content = renderWidgetContent(widget.id, { kpi, charts, recent, alerts, loading, onOpenDialog: setDialogType })

    return (
      <div key={widget.id} className={colSpanClass}>
        <SortableWidget id={widget.id} isEditMode={isEditMode}>
          {content}
        </SortableWidget>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-6 w-full mx-auto max-w-[1600px] h-full overflow-auto bg-[#f6fbf2] dark:bg-[#090b0a] scrollbar-hide pb-20">
      <DashboardHeader
        onRefresh={() => dispatch(getDashboardStats({ period, warehouseId }))}
        loading={loading}
        isConnected={isConnected}
      />

      <DashboardFilters
        period={period}
        setPeriod={setPeriod}
        warehouseId={warehouseId}
        setWarehouseId={setWarehouseId}
      />

      {isEditMode && (
        <>
          <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center shadow-sm animate-in fade-in zoom-in duration-300">
            <div>
              <p className="font-semibold text-sm">Chế độ chỉnh sửa đang Bật</p>
              <p className="text-xs opacity-80">Kéo thả các khối để sắp xếp lại vị trí hoặc bật/tắt hiển thị trong bảng dưới.</p>
            </div>
          </div>
          <WidgetSettingsPanel />
        </>
      )}

    

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-12 gap-6 relative">
            {visibleWidgets.map(renderWidget)}
          </div>
        </SortableContext>
      </DndContext>

      <KPIDetailDialog
        open={!!dialogType}
        type={dialogType}
        onClose={() => setDialogType(null)}
      />
    </div>
  )
}

export default DashboardPage
