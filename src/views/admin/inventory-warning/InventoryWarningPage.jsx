import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getLowStockProducts, getProducts } from '@/stores/ProductSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { columns } from './components/Column'
import { ProductDataTable } from '../product/components/ProductDataTable'
import ViewProductDialog from '../product/components/ViewProductDialog'
import { AlertCircle, ChevronLeft, PackageX, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/button'

const InventoryWarningPage = () => {
  const dispatch = useDispatch()
  const lowStockProducts = useSelector((state) => state.product.lowStockProducts || [])
  const loading = useSelector((state) => state.product.loading)
  const warehouses = useSelector((state) => state.warehouse.warehouses || [])

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    document.title = 'Cảnh báo tồn kho'
    dispatch(getWarehouses({ limit: 1000 }))
    // Fetch low stock for ALL warehouses to determine which ones need an alert icon
    dispatch(getLowStockProducts({}))
    // Fetch all products so the Import Dialog dropdown has items
    dispatch(getProducts({ limit: 1000 }))
  }, [dispatch])

  // Calculate which warehouses have low stock products
  const warehouseAlerts = useMemo(() => {
    const alerts = new Set()
    lowStockProducts.forEach((product) => {
      product.inventory?.forEach((inv) => {
        const available = Number(inv.quantity) - Number(inv.reservedQuantity || 0)
        if (available < Number(product.minStockLevel)) {
          alerts.add(inv.warehouseId)
        }
      })
    })
    return alerts
  }, [lowStockProducts])

  // If a warehouse is selected, filter products specifically for it to pass to the data table
  const detailProducts = useMemo(() => {
    if (!selectedWarehouseId) return []

    const filtered = []
    lowStockProducts.forEach((product) => {
      const whInv = product.inventory?.find(i => i.warehouseId === selectedWarehouseId)
      if (whInv) {
        const available = Number(whInv.quantity) - Number(whInv.reservedQuantity || 0)
        if (available < Number(product.minStockLevel)) {
          // Create a localized copy of the product with specific warehouse quantites to pass to the table
          filtered.push({
            ...product,
            availableStock: available,
            shortfall: Number(product.minStockLevel) - available
          })
        }
      }
    })
    return filtered
  }, [lowStockProducts, selectedWarehouseId])

  const selectedWarehouse = warehouses.find(w => w.id === selectedWarehouseId)

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        {/* Header Section */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            {selectedWarehouseId ? (
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedWarehouseId(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Cảnh báo kho: {selectedWarehouse?.warehouseName}
                  </h2>
                  <p className="text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Danh sách các sản phẩm có số lượng khả dụng thấp
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  Cảnh báo tồn kho
                </h2>
                <p className="text-muted-foreground">
                  Danh sách các kho đang có sản phẩm chạm mức tồn tối thiểu
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="-mx-4 flex-1 overflow-hidden px-4 md:py-1">
          {!selectedWarehouseId ? (
            /* WAREHOUSE GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-6">
              {warehouses.length > 0 ? warehouses.map((warehouse) => {
                const hasAlert = warehouseAlerts.has(warehouse.id);
                return (
                  <div
                    key={warehouse.id}
                    onClick={() => setSelectedWarehouseId(warehouse.id)}
                    className={`relative group rounded-xl border p-6 flex flex-col items-center justify-center text-center transition-all duration-200 
                                            ${hasAlert
                        ? 'bg-red-50/50 hover:bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md cursor-pointer dark:bg-red-950/20 dark:hover:bg-red-900/30'
                        : 'bg-background opacity-70 hover:opacity-100 hover:bg-secondary cursor-pointer hover:shadow-sm'}
                                        `}
                  >
                    <div className={`p-4 rounded-full mb-4 ${hasAlert ? 'bg-red-100 text-red-600 dark:bg-red-900/50' : 'bg-muted text-muted-foreground'}`}>
                      <Warehouse className="w-8 h-8" />
                    </div>
                    <h3 className={`font-semibold text-lg mb-1 ${hasAlert ? 'text-red-900 dark:text-red-300' : ''}`}>
                      {warehouse.warehouseName}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {warehouse.address || 'Chưa cập nhật địa chỉ'}
                    </p>

                    {hasAlert ? (
                      <div className="flex items-center gap-2 text-red-600 font-medium bg-white px-3 py-1 rounded-full shadow-sm border border-red-100 dark:bg-black">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        Có sản phẩm thiếu hụt
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        Tồn kho ổn định
                      </div>
                    )}
                  </div>
                )
              }) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
                  <PackageX className="h-16 w-16 mb-4 opacity-20" />
                  <p>Không có kho nào trong hệ thống</p>
                </div>
              )}
            </div>
          ) : (
            /* WAREHOUSE DETAIL TABLE VIEW */
            <>
              <ProductDataTable
                data={detailProducts}
                columns={columns}
                loading={loading}
                pageCount={1}
                rowCount={detailProducts.length}
                hidePagination={true}
                hideCreateProduct={true}
                columnFilters={[]}
                globalFilter=""
                pagination={{ pageIndex: 0, pageSize: 100 }}
                onPaginationChange={() => { }}
                onColumnFiltersChange={() => { }}
                onGlobalFilterChange={() => { }}
                onRowClick={(product) => setSelectedProduct(product)}
              />

              <ViewProductDialog
                productId={selectedProduct?.id}
                open={!!selectedProduct}
                onOpenChange={(v) => !v && setSelectedProduct(null)}
              />
            </>
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default InventoryWarningPage
