import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { IconPackageExport } from '@tabler/icons-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Package } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import { cn } from '@/lib/utils'

import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { getInvoiceDetail } from '@/stores/InvoiceSlice'
import { useDispatch, useSelector } from 'react-redux'
import { getWarehouseReceiptDetail } from '@/stores/WarehouseReceiptSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { getInventory } from '@/stores/ProductSlice'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Check, AlertTriangle } from 'lucide-react'

const ConfirmWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
  loading = false,
  contentClassName,
  overlayClassName,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const [selectedItems, setSelectedItems] = useState({})
  const [detailInvoice, setDetailInvoice] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [actualReceiptDate, setActualReceiptDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [exportQuantities, setExportQuantities] = useState({}) // { itemDetailId: quantity }
  const [inventoryData, setInventoryData] = useState([])
  const [isFetchingInventory, setIsFetchingInventory] = useState(false)
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [detailNotes, setDetailNotes] = useState({}) // { itemDetailId: note }

  const warehouses = useSelector((state) => state.warehouse.warehouses) || []

  // Determine which invoice object to use: the fetched detail or the passed prop
  const activeInvoice = detailInvoice || invoice

  // Fetch full details when opened
  useEffect(() => {
    if (open && invoice?.id) {
      const fetchData = async () => {
        setIsLoadingDetails(true)
        try {
          let data = null

          // In retail mode, fetch fresh invoice details
          data = await dispatch(getInvoiceDetail(invoice.id)).unwrap()

          let invoiceData = { ...data }
          // Fetch details for existing warehouse receipts if they exist but don't have details
          if (invoiceData.warehouseReceipts && invoiceData.warehouseReceipts.length > 0) {
            const receiptsWithDetails = await Promise.all(invoiceData.warehouseReceipts.map(async (receipt) => {
              try {
                // If we already have details, skip
                if (receipt.details && receipt.details.length > 0) return receipt;

                const detail = await dispatch(getWarehouseReceiptDetail(receipt.id)).unwrap();
                return detail.data || detail;
              } catch (e) {
                console.error(`Failed to fetch receipt ${receipt.id}`, e);
                return receipt;
              }
            }));

            // Update data with fetched details
            invoiceData.warehouseReceipts = receiptsWithDetails;
          }

          setDetailInvoice(invoiceData)
          
          if (invoiceData.details && invoiceData.details.length > 0) {
            const productIds = invoiceData.details
              .map(item => item.productId)
              .filter(id => !!id)
              .join(',')
            
            if (productIds) {
              setIsFetchingInventory(true)
              dispatch(getInventory({ productIds, limit: 1000 }))
                .unwrap()
                .then(res => {
                  setInventoryData(res.data || [])
                })
                .finally(() => setIsFetchingInventory(false))
            }
          }
        } catch (error) {
          console.error('Failed to fetch details:', error)
          toast.error('Không thể tải thông tin chi tiết')
        } finally {
          setIsLoadingDetails(false)
        }
      }

      fetchData()
      dispatch(getWarehouses({ limit: 100 }))
    } else if (!open) {
      // Reset when closed
      setDetailInvoice(null)
      setInventoryData([])
    }
  }, [open, invoice?.id, dispatch])

  const calculateTotalShipped = (item) => {
    let totalShipped = 0
    if (activeInvoice?.warehouseReceipts) {
      activeInvoice.warehouseReceipts.forEach(receipt => {
        if (receipt.isPosted) {
          if (receipt.details) {
            const match = receipt.details.filter(d =>
              (d.invoiceItemId && d.invoiceItemId === item.id) ||
              (
                !d.invoiceItemId &&
                String(d.productId) === String(item.productId) &&
                (!d.unitId || !item.unitId || String(d.unitId) === String(item.unitId))
              )
            )

            match.forEach(m => {
              totalShipped += Number(m.qtyActual || m.quantity || 0)
            })
          }
        }
      })
    }
    return totalShipped
  }

  // Helper to check if item is selectable
  const isItemSelectable = (item) => {
    const totalOrdered = Number(item.quantity || 0)
    const totalShipped = calculateTotalShipped(item)
    return totalShipped < totalOrdered
  }

  useEffect(() => {
    if (activeInvoice?.details) {
      const initialSelection = {}
      const initialQuantities = {}
      activeInvoice.details.forEach((item) => {
        if (isItemSelectable(item)) {
          initialSelection[item.id] = true
          const totalShipped = calculateTotalShipped(item)
          const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)
          initialQuantities[item.id] = remaining
        }
      })
      setSelectedItems(initialSelection)
      setExportQuantities(initialQuantities)
      
      const initialDetailNotes = {}
      activeInvoice.details.forEach(item => {
        initialDetailNotes[item.id] = ''
      })
      setDetailNotes(initialDetailNotes)
      
      // Default reason and notes
      if (invoice) {
        setReason('')
        setNotes('')
      }
    }
  }, [activeInvoice])

  if (!invoice) return null

  const handleConfirm = async () => {
    if (!selectedWarehouseId) {
      toast.error('Vui lòng chọn kho xuất hàng')
      return
    }

    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id],
    )

    const selectedItemObjects = activeInvoice.details
      .filter(item => selectedIds.includes(String(item.id)))
      .map(item => {
        return {
          ...item,
          quantity: Number(exportQuantities[item.id] || 0),
          notes: detailNotes[item.id] || ''
        }
      })

    if (selectedItemObjects.some(item => item.quantity <= 0)) {
      toast.error('Số lượng xuất phải lớn hơn 0')
      return
    }

    await onConfirm?.(selectedItemObjects, actualReceiptDate || null, selectedWarehouseId, reason, notes)
    onOpenChange(false)
  }

  const handleQuantityChange = (itemId, val, max) => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      setExportQuantities(prev => ({ ...prev, [itemId]: val }))
      return
    }
    
    if (num > max) {
      toast.warning(`Số lượng không thể vượt quá số lượng còn lại (${max})`)
      setExportQuantities(prev => ({ ...prev, [itemId]: max }))
    } else {
      setExportQuantities(prev => ({ ...prev, [itemId]: num }))
    }
  }

  const toggleItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const toggleAll = (checked) => {
    const newSelection = {}
    activeInvoice.details.forEach((item) => {
      if (isItemSelectable(item)) {
        newSelection[item.id] = checked
      }
    })
    setSelectedItems(newSelection)
  }

  const validItemsCount = activeInvoice.details?.filter(isItemSelectable).length || 0
  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  const getWarehouseStockStatus = (warehouseId) => {
    if (!inventoryData?.length) return null

    const warehouseInv = inventoryData.filter(inv => (inv.warehouseId || inv.warehouse?.id) === Number(warehouseId))
    const availableProductIds = warehouseInv
      .filter(inv => (Number(inv.quantity) - Number(inv.reservedQuantity)) > 0)
      .map(inv => inv.productId || inv.product?.id)
    
    const invoiceProducts = activeInvoice?.details || []
    // Use fallback for item.productId
    const totalDistinctProducts = [...new Set(invoiceProducts.map(i => i.productId || i.product?.id))].filter(id => !!id).length
    
    const productsInStock = invoiceProducts.filter(item => 
      availableProductIds.includes(item.productId || item.product?.id)
    )
    const distinctProductsInStock = [...new Set(productsInStock.map(p => p.productId || p.product?.id))].filter(id => !!id).length

    return {
      availableCount: distinctProductsInStock,
      totalCount: totalDistinctProducts,
      hasSome: distinctProductsInStock > 0,
      isFullyAvailable: distinctProductsInStock === totalDistinctProducts && totalDistinctProducts > 0,
    }
  }

  // Lọc chỉ lấy kho sản phẩm
  const productWarehouses = warehouses.filter(w => w.warehouseType === 'product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0",
          isMobile && "fixed inset-0 w-screen h-[100dvh] max-h-[100dvh] top-0 left-0 right-0 max-w-none m-0 rounded-none translate-x-0 translate-y-0",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Xác nhận tạo phiếu xuất kho</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm cần xuất kho từ đơn bán này
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "space-y-4 flex-1 overflow-y-auto p-6",
          isMobile && "h-full px-4 pb-4"
        )}>
          {/* Invoice Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Khách hàng:</span>
                <div className="font-medium">{activeInvoice.customer?.customerName || activeInvoice.customer?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã đơn bán:</span>
                <div className="font-medium">{activeInvoice.orderCode || activeInvoice.code}</div>
              </div>
            </div>
          </div>

          {/* Warehouse Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn kho xuất hàng <span className="text-red-500">*</span></label>
            <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn kho chứa sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {productWarehouses.map((warehouse) => {
                  const stockStatus = getWarehouseStockStatus(warehouse.id)
                  const isDisabled = !stockStatus || stockStatus.availableCount === 0

                  return (
                    <SelectItem 
                      key={warehouse.id} 
                      value={warehouse.id.toString()}
                      disabled={isDisabled}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{warehouse.warehouseName}</span>
                          <span className="text-xs text-slate-500">({warehouse.warehouseCode})</span>
                          {stockStatus?.isFullyAvailable && (
                            <Badge variant="success" className="h-5 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                              Đủ hàng
                            </Badge>
                          )}
                        </div>
                        
                        {stockStatus ? (
                          <div className={`mt-0.5 flex items-center gap-1.5 text-[11px] ${stockStatus.availableCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {stockStatus.availableCount > 0 ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Sẵn có {stockStatus.availableCount}/{stockStatus.totalCount} loại sản phẩm</span>
                              </>
                            ) : (
                              <span>Không có sẵn sản phẩm nào trong đơn hàng</span>
                            )}
                          </div>
                        ) : (
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>Đang kiểm tra tồn kho...</span>
                          </div>
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for existing receipts */}
          {(activeInvoice.warehouseReceiptId || (activeInvoice.warehouseReceipts && activeInvoice.warehouseReceipts.length > 0)) && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
              <p className="font-medium flex items-center">
                <InfoCircledIcon className="mr-2 h-4 w-4" />
                Đơn hàng này đã có phiếu xuất kho!
              </p>
              <p className="mt-1 text-xs ml-6">
                Vui lòng kiểm tra kỹ các sản phẩm để tránh xuất trùng.
              </p>
            </div>
          )}

          {/* Products to export */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm sẽ xuất kho:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{validItemsCount}
              </span>
            </div>
            <div className={cn("overflow-auto rounded-lg border", isMobile && "border-0 h-full")}>
              {!isMobile ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCount === validItemsCount && validItemsCount > 0}
                          onCheckedChange={toggleAll}
                          disabled={validItemsCount === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng xuất</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDetails ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Đang tải thông tin sản phẩm...
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeInvoice.details?.map((item, index) => {
                        const selectable = isItemSelectable(item)
                        const totalShipped = calculateTotalShipped(item)
                        const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)

                        return (
                          <TableRow key={item.id} className={!selectable ? 'bg-muted/30' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={!!selectedItems[item.id]}
                                onCheckedChange={() => toggleItem(item.id)}
                                disabled={!selectable}
                              />
                            </TableCell>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border text-center">
                                  {item?.product?.image || item?.image ? (
                                    <img
                                      src={getPublicUrl(item.product?.image || item.image)}
                                      alt={item.product?.productName || item.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                    {item.product?.code || item.productCode || '—'}
                                  </div>
                                  <div className="font-medium">{item.product?.productName || item.productName}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col items-end gap-1">
                                <Input
                                  type="number"
                                  className="h-8 w-24 text-right"
                                  value={exportQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                />
                                <div className="text-[10px] text-muted-foreground">
                                  Tổng: {Number(item.quantity)} | Còn: {remaining}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{item.unitName || 'N/A'}</TableCell>
                            <TableCell>
                              <Input
                                className="h-8 min-w-[150px]"
                                value={detailNotes[item.id] || ''}
                                onChange={(e) => setDetailNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                disabled={!selectable || !selectedItems[item.id]}
                              />
                            </TableCell>
                            <TableCell>
                              {!selectable ? (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <InfoCircledIcon className="h-3 w-3" />
                                  Đã xuất đủ
                                </div>
                              ) : (
                                <span className="text-xs text-green-600">Sẵn sàng ({remaining})</span>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Checkbox
                      checked={selectedCount === validItemsCount && validItemsCount > 0}
                      onCheckedChange={toggleAll}
                      disabled={validItemsCount === 0}
                      id="select-all-mobile"
                    />
                    <label htmlFor="select-all-mobile" className="text-sm font-medium cursor-pointer">
                      Chọn tất cả ({validItemsCount} sản phẩm)
                    </label>
                  </div>
                  {isLoadingDetails ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>
                  ) : (
                    activeInvoice.details?.map((item) => {
                      const selectable = isItemSelectable(item)
                      const totalShipped = calculateTotalShipped(item)
                      const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)

                      return (
                        <div
                          key={item.id}
                          className={cn("flex gap-3 rounded-lg border p-3 shadow-sm", !selectable ? "bg-muted/30 opacity-80" : "bg-card")}
                          onClick={() => selectable && toggleItem(item.id)}
                        >
                          <div className="flex pt-1">
                            <Checkbox
                              checked={!!selectedItems[item.id]}
                              onCheckedChange={() => toggleItem(item.id)}
                              disabled={!selectable}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                                {item?.product?.image || item?.image ? (
                                  <img
                                    src={getPublicUrl(item.product?.image || item.image)}
                                    alt={item.product?.productName || item.productName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                  {item.product?.code || item.productCode || '—'}
                                </div>
                                <div className="font-medium text-sm">{item.product?.productName || item.productName}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Số lượng xuất</span>
                                <Input
                                  type="number"
                                  className="h-8 w-20 text-right"
                                  value={exportQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-[10px] text-muted-foreground">Đặt: {Number(item.quantity)} | Còn: {remaining}</span>
                              </div>
                              <div className="flex flex-col text-right justify-center">
                                <span className="text-muted-foreground">Trạng thái</span>
                                {!selectable ? (
                                  <span className="text-muted-foreground italic flex items-center justify-end gap-1">
                                    <InfoCircledIcon className="h-3 w-3" /> Đã xuất đủ
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium">Có thể xuất ({remaining})</span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] text-muted-foreground">Ghi chú sản phẩm</span>
                              <Input
                                className="h-8 text-sm"
                                value={detailNotes[item.id] || ''}
                                onChange={(e) => setDetailNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                disabled={!selectable || !selectedItems[item.id]}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap shrink-0">Ngày xuất hàng thực tế:</label>
            <input
              type="date"
              className="flex h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              value={actualReceiptDate}
              onChange={(e) => setActualReceiptDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do xuất kho</label>
            <Input 
              placeholder="Nhập lý do..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <Textarea 
              placeholder="Nhập ghi chú thêm..." 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <p className="font-medium text-xs">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1 text-xs">
              <li>Phiếu xuất kho sẽ ở trạng thái <strong>Chưa ghi sổ (isPosted: false)</strong></li>
              <li>Tồn kho chỉ bị trừ sau khi thực hiện <strong>Ghi sổ</strong></li>
            </ul>
          </div>
        </div>

        <DialogFooter className={cn("px-6 py-4 border-t gap-2 shrink-0 bg-background", isMobile ? "pb-4 px-4 flex-row" : "")}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className={cn(isMobile && "flex-1")}>Hủy</Button>
          <Button type="button" onClick={handleConfirm} disabled={loading || selectedCount === 0} loading={loading} className={cn(isMobile && "flex-1")}>
            <IconPackageExport className="mr-2 h-4 w-4" />
            Tạo phiếu ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmWarehouseReceiptDialog