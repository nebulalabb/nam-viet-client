import React, { useState, useEffect, useMemo } from 'react'
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
import { Package } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { useDispatch, useSelector } from 'react-redux'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { AlertTriangle } from 'lucide-react'
import { getWarehouseReceiptById } from '@/stores/WarehouseReceiptSlice'

/**
 * Dialog trả hàng mua – xuất kho hàng trả lại cho nhà cung cấp.
 * Props:
 *  - purchaseOrder: full PO object (including details + warehouseReceipts)
 *  - onConfirm(selectedItems, actualDate, warehouseId, reason, notes): callback
 */
const ReturnPurchaseOrderDialog = ({
  open,
  onOpenChange,
  purchaseOrder,
  onConfirm,
  loading = false,
  contentClassName,
  overlayClassName,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const [selectedItems, setSelectedItems] = useState({})
  const [actualReceiptDate, setActualReceiptDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [returnQuantities, setReturnQuantities] = useState({})
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [enrichedReceipts, setEnrichedReceipts] = useState([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const warehouses = useSelector((state) => state.warehouse.warehouses) || []

  // Fetch warehouses every time dialog opens
  useEffect(() => {
    if (open) {
      dispatch(getWarehouses({ limit: 100 }))
    }
  }, [open, dispatch])

  // Fetch full receipt details for each warehouse receipt
  useEffect(() => {
    if (!open || !purchaseOrder?.warehouseReceipts?.length) {
      setEnrichedReceipts([])
      return
    }
    const fetchDetails = async () => {
      setIsLoadingDetails(true)
      try {
        const results = await Promise.all(
          purchaseOrder.warehouseReceipts.map(async (r) => {
            if (r.details && r.details.length > 0) return r
            try {
              const detail = await dispatch(getWarehouseReceiptById(r.id)).unwrap()
              return detail
            } catch {
              return r
            }
          })
        )
        setEnrichedReceipts(results)
      } finally {
        setIsLoadingDetails(false)
      }
    }
    fetchDetails()
  }, [open, purchaseOrder?.warehouseReceipts, dispatch])

  // Auto-select warehouse from first import receipt
  useEffect(() => {
    if (enrichedReceipts.length > 0) {
      const firstImport = enrichedReceipts.find(
        (r) => (r.receiptType === 1 || r.transactionType === 'import') && (r.isPosted || r.status === 'posted')
      )
      if (firstImport?.warehouseId) {
        setSelectedWarehouseId(String(firstImport.warehouseId))
      }
    }
  }, [enrichedReceipts])

  /**
   * Calculate how much of each product has already been imported (posted receipts only).
   */
  const calculateTotalImported = (item) => {
    let total = 0
    enrichedReceipts.forEach((receipt) => {
      const isImport = receipt.receiptType === 1 || receipt.transactionType === 'import'
      const isPosted = receipt.isPosted || receipt.status === 'posted'
      const isNormalImport = receipt.referenceType === 'purchase_order'
      if (isImport && isPosted && isNormalImport && receipt.details) {
        receipt.details.forEach((d) => {
          if (String(d.productId) === String(item.productId)) {
            total += Number(d.quantity || 0)
          }
        })
      }
    })
    return total
  }

  /**
   * Calculate how much of each product has already been returned (posted export refunds).
   */
  const calculateTotalReturned = (item) => {
    let total = 0
    enrichedReceipts.forEach((receipt) => {
      const isExport = receipt.receiptType === 2 || receipt.transactionType === 'export'
      const isPosted = receipt.isPosted || receipt.status === 'posted'
      const isRefund = receipt.referenceType === 'purchase_refunds'
      if (isExport && isPosted && isRefund && receipt.details) {
        receipt.details.forEach((d) => {
          if (String(d.productId) === String(item.productId)) {
            total += Number(d.quantity || 0)
          }
        })
      }
    })
    return total
  }

  /**
   * Max returnable = ordered - already returned.
   * Allows returning unimported items too (to cancel them).
   */
  const getMaxReturnable = (item) => {
    const ordered = Number(item.quantity || 0)
    const returned = calculateTotalReturned(item)
    return Math.max(0, ordered - returned)
  }

  const splitReturnQty = (item, returnQty) => {
    const ordered = Number(item.quantity || 0)
    const imported = calculateTotalImported(item)
    const unimported = Math.max(0, ordered - imported)
    const cancelQty = Math.min(returnQty, unimported)
    const exportQty = Math.max(0, returnQty - unimported)
    return { cancelQty, exportQty }
  }

  /**
   * Default return qty = ordered - imported (i.e., unimported qty).
   * Clamped to [0, maxReturnable].
   */
  const getDefaultReturnQty = (item) => {
    const ordered = Number(item.quantity || 0)
    const imported = calculateTotalImported(item)
    const returned = calculateTotalReturned(item)
    const unimported = Math.max(0, ordered - imported)
    const maxReturnable = Math.min(ordered, Math.max(0, imported - returned))
    // Show unimported as default, but clamp to what we can actually return
    return Math.min(unimported > 0 ? unimported : maxReturnable, maxReturnable)
  }

  const isItemSelectable = (item) => {
    return getMaxReturnable(item) > 0
  }

  // Initialize selection and quantities from PO details
  useEffect(() => {
    if (!purchaseOrder?.details) return
    const initialSelection = {}
    const initialQuantities = {}
    purchaseOrder.details.forEach((item) => {
      if (isItemSelectable(item)) {
        initialSelection[item.id] = false
        initialQuantities[item.id] = getDefaultReturnQty(item)
      }
    })
    setSelectedItems(initialSelection)
    setReturnQuantities(initialQuantities)
    setReason('')
    setNotes('')
  }, [purchaseOrder?.details, enrichedReceipts])

  const totalRefundAmount = useMemo(() => {
    let sum = 0
    if (purchaseOrder?.details) {
      purchaseOrder.details.forEach((item) => {
        if (selectedItems[item.id]) {
          const qty = Number(returnQuantities[item.id] || 0)
          const { exportQty } = splitReturnQty(item, qty)
          const price = Number(item.price || 0)
          sum += exportQty * price
        }
      })
    }
    return sum
  }, [purchaseOrder, selectedItems, returnQuantities, enrichedReceipts])

  if (!purchaseOrder) return null

  const handleConfirm = async () => {
    if (!selectedWarehouseId) {
      toast.error('Vui lòng chọn kho xuất hàng trả')
      return
    }

    const selectedIds = Object.keys(selectedItems).filter((id) => selectedItems[id])
    const selectedItemObjects = purchaseOrder.details
      .filter((item) => selectedIds.includes(String(item.id)))
      .map((item) => {
        const qty = Number(returnQuantities[item.id] || 0)
        const { cancelQty, exportQty } = splitReturnQty(item, qty)
        return {
          ...item,
          quantity: qty,
          cancelQty,
          exportQty
        }
      })

    if (selectedItemObjects.some((item) => item.quantity <= 0)) {
      toast.error('Số lượng trả hàng phải lớn hơn 0')
      return
    }

    await onConfirm?.(selectedItemObjects, actualReceiptDate || null, selectedWarehouseId, reason, notes)
    onOpenChange(false)
  }

  const handleQuantityChange = (itemId, val, max) => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      setReturnQuantities((prev) => ({ ...prev, [itemId]: val }))
      return
    }
    if (num > max) {
      toast.warning(`Số lượng không thể vượt quá ${max}`)
      setReturnQuantities((prev) => ({ ...prev, [itemId]: max }))
    } else {
      setReturnQuantities((prev) => ({ ...prev, [itemId]: num }))
    }
  }

  const toggleItem = (itemId) => {
    setSelectedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const toggleAll = (checked) => {
    const newSelection = {}
    purchaseOrder.details.forEach((item) => {
      if (isItemSelectable(item)) {
        newSelection[item.id] = checked
      }
    })
    setSelectedItems(newSelection)
  }

  const validItemsCount = purchaseOrder.details?.filter(isItemSelectable).length || 0
  const selectedCount = Object.values(selectedItems).filter(Boolean).length
  const productWarehouses = warehouses.filter((w) => w.warehouseType === 'product')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0',
          isMobile && 'fixed inset-0 w-screen h-[100dvh] max-h-[100dvh] top-0 left-0 right-0 max-w-none m-0 rounded-none translate-x-0 translate-y-0',
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-red-50">
          <DialogTitle className="text-red-700 flex items-center gap-2">
            <IconPackageExport className="h-5 w-5" /> Trả hàng nhà cung cấp
          </DialogTitle>
          <DialogDescription>
            Chọn sản phẩm cần trả lại cho nhà cung cấp từ đơn mua hàng này
          </DialogDescription>
        </DialogHeader>

        <div className={cn('space-y-4 flex-1 overflow-y-auto p-6', isMobile && 'h-full px-4 pb-4')}>
          {/* PO Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <div className="font-medium">{purchaseOrder.supplier?.supplierName || '—'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã đơn mua:</span>
                <div className="font-medium">{purchaseOrder.poCode || purchaseOrder.code}</div>
              </div>
            </div>
          </div>

          {/* Warehouse Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Chọn kho xuất hàng trả <span className="text-red-500">*</span>
            </label>
            <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
              <SelectTrigger className="w-full border-red-200 focus:ring-red-500">
                <SelectValue placeholder="Chọn kho xuất hàng" />
              </SelectTrigger>
              <SelectContent>
                {productWarehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{warehouse.warehouseName}</span>
                        <span className="text-xs text-slate-500">({warehouse.warehouseCode})</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products to return */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm trả lại NCC:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{validItemsCount}
              </span>
            </div>
            <div className={cn('overflow-auto rounded-lg border border-red-100', isMobile && 'border-0 h-full')}>
              {!isMobile ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCount === validItemsCount && validItemsCount > 0}
                          onCheckedChange={toggleAll}
                          disabled={validItemsCount === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Trả (Hủy / Xuất kho)</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Giá trị hoàn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDetails ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Đang tải thông tin...
                        </TableCell>
                      </TableRow>
                    ) : (
                      purchaseOrder.details?.map((item, index) => {
                        const selectable = isItemSelectable(item)
                        const maxReturn = getMaxReturnable(item)
                        const imported = calculateTotalImported(item)
                        const returned = calculateTotalReturned(item)
                        const qtyVal = Number(returnQuantities[item.id] || 0)
                        const { cancelQty, exportQty } = splitReturnQty(item, qtyVal)
                        const refundVal = exportQty * Number(item.price || 0)

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
                                  {item?.product?.image ? (
                                    <img
                                      src={getPublicUrl(item.product.image)}
                                      alt={item.product?.productName}
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
                                    {item.product?.code || '—'}
                                  </div>
                                  <div className="font-medium">{item.product?.productName || item.productName}</div>
                                  <div className="text-[10px] text-muted-foreground mt-1">
                                    Đặt: {Number(item.quantity)} | Nhập: {imported} | Đã trả: {returned}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right align-top">
                              <div className="flex flex-col items-end gap-1">
                                <Input
                                  type="number"
                                  className="h-8 w-24 text-right"
                                  value={returnQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, maxReturn)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                />
                                {qtyVal > 0 && (
                                  <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap mt-1">
                                    Hủy: <span className="text-orange-500">{cancelQty}</span> | Thực xuất: <span className="text-blue-600">{exportQty}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] font-medium align-top pt-[18px]">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                            </TableCell>
                            <TableCell className="text-[13px] font-bold text-red-600 align-top pt-[18px]">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundVal)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              ) : (
                /* Mobile layout */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-red-50/50 rounded-lg">
                    <Checkbox
                      checked={selectedCount === validItemsCount && validItemsCount > 0}
                      onCheckedChange={toggleAll}
                      disabled={validItemsCount === 0}
                      id="select-all-mobile-return"
                    />
                    <label htmlFor="select-all-mobile-return" className="text-sm font-medium cursor-pointer">
                      Chọn tất cả ({validItemsCount} sản phẩm)
                    </label>
                  </div>
                  {isLoadingDetails ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>
                  ) : (
                    purchaseOrder.details?.map((item) => {
                      const selectable = isItemSelectable(item)
                      const maxReturn = getMaxReturnable(item)
                      const imported = calculateTotalImported(item)
                      const returned = calculateTotalReturned(item)

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            'flex gap-3 rounded-lg border p-3 shadow-sm',
                            !selectable ? 'bg-muted/30 opacity-80' : 'bg-card border-red-100'
                          )}
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
                                {item?.product?.image ? (
                                  <img
                                    src={getPublicUrl(item.product.image)}
                                    alt={item.product?.productName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 flex justify-between">
                                <div>
                                  <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                    {item.product?.code || '—'}
                                  </div>
                                  <div className="font-medium text-sm">{item.product?.productName || item.productName}</div>
                                </div>
                                <div className="text-right text-[10px] text-muted-foreground mt-1">
                                  <div>Đặt: {Number(item.quantity)}</div>
                                  <div>Nhập: {imported}</div>
                                  <div>Đã trả: {returned}</div>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col gap-1">
                                <span className="text-muted-foreground">Số lượng trả</span>
                                <Input
                                  type="number"
                                  className="h-8 w-20 text-right"
                                  value={returnQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, maxReturn)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                {Number(returnQuantities[item.id] || 0) > 0 && (
                                  <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap mt-1">
                                    Hủy: <span className="text-orange-500">{splitReturnQty(item, Number(returnQuantities[item.id] || 0)).cancelQty}</span> | Thực xuất: <span className="text-blue-600">{splitReturnQty(item, Number(returnQuantities[item.id] || 0)).exportQty}</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col text-right justify-center">
                                <span className="text-muted-foreground">Giá trị hoàn</span>
                                <span className="text-red-600 font-bold">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                    splitReturnQty(item, Number(returnQuantities[item.id] || 0)).exportQty * Number(item.price || 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col items-end gap-1 px-2 border-t pt-2">
              <span className="text-sm font-medium text-muted-foreground">TỔNG GIÁ TRỊ TRẢ HÀNG (PHIẾU THU HOÀN TIỀN)</span>
              <span className="text-2xl font-black text-red-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRefundAmount)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm font-medium whitespace-nowrap shrink-0">Ngày trả hàng thực tế:</label>
            <input
              type="date"
              className="flex h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:ring-red-500"
              value={actualReceiptDate}
              onChange={(e) => setActualReceiptDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Lý do trả hàng</label>
            <Input
              placeholder="Nhập lý do trả hàng cho nhà cung cấp..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="focus-visible:ring-red-500"
            />
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mt-4">
            <p className="font-medium flex items-center text-xs gap-1">
              <AlertTriangle className="w-4 h-4" /> Lưu ý quan trọng:
            </p>
            <ul className="ml-5 mt-1 list-disc space-y-1 text-xs">
              <li>Phiếu xuất trả hàng sẽ ở trạng thái <strong>Chưa ghi sổ</strong></li>
              <li>Một phiếu thu hoàn tiền mua sẽ được tự động tạo kèm theo.</li>
              <li>Kho hàng và Công nợ NCC chỉ được cập nhật sau khi bạn <strong>Duyệt Ghi sổ</strong> phiếu trả hàng.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className={cn('px-6 py-4 border-t gap-2 shrink-0 bg-background', isMobile ? 'pb-4 px-4 flex-row' : '')}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className={cn(isMobile && 'flex-1')}>
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || selectedCount === 0 || totalRefundAmount <= 0}
            loading={loading}
            className={cn('bg-red-600 hover:bg-red-700', isMobile && 'flex-1')}
          >
            <IconPackageExport className="mr-2 h-4 w-4" />
            Lập phiếu trả hàng ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReturnPurchaseOrderDialog
