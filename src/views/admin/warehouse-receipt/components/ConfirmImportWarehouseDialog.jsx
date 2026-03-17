import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import { getWarehouseReceiptDetail } from '@/stores/WarehouseReceiptSlice'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IconPackageImport } from '@tabler/icons-react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Package } from 'lucide-react'
import { getPublicUrl } from '@/utils/file'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

const ConfirmImportWarehouseDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  purchaseContractId,
  onConfirm,
  contentClassName,
  overlayClassName,
}) => {
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState({})
  const [receiptDetailsMap, setReceiptDetailsMap] = useState({})
  const [actualReceiptDate, setActualReceiptDate] = useState(() => new Date().toISOString().split('T')[0])
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [detailNotes, setDetailNotes] = useState({}) // { itemDetailId: note }
  const dispatch = useDispatch()
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Fetch PO/Contract data and then Warehouse Receipt details
  useEffect(() => {
    if (open) {
      setLoading(true)
      setSelectedItems({})
      setReceiptDetailsMap({})

      const fetchData = async () => {
        try {
          let data = null
          if (purchaseOrderId) {
            data = await dispatch(getPurchaseOrderDetail(purchaseOrderId)).unwrap()
          }

          if (data) {
            setPurchaseOrder(data)
            
            // Set default reason and notes
            setReason(`Nhập kho từ đơn mua hàng ${data.code}`)
            setNotes(data.note || 'Nhập kho từ đơn mua')
            
            const initialDetailNotes = {}
            if (data.items) {
              data.items.forEach(item => {
                initialDetailNotes[item.id] = `Nhập kho theo đơn mua ${data.code}`
              })
            }
            setDetailNotes(initialDetailNotes)

            // Fetch details for all related warehouse receipts to calculate accurate imported quantities
            if (data.warehouseReceipts && data.warehouseReceipts.length > 0) {
              const detailsMap = {}
              await Promise.all(data.warehouseReceipts.map(async (receipt) => {
                if (receipt.status === 'cancelled') return // Skip cancelled receipts

                try {
                  // If details are already present, use them
                  if (receipt.details && receipt.details.length > 0) {
                    detailsMap[receipt.id] = receipt.details
                  } else {
                    // Otherwise fetch them
                    const detailRes = await dispatch(getWarehouseReceiptDetail(receipt.id)).unwrap()
                    detailsMap[receipt.id] = detailRes.details || []
                  }
                } catch (err) {
                  console.error(`Failed to fetch receipt details for ${receipt.id}`, err)
                }
              }))
              setReceiptDetailsMap(detailsMap)
            }
          }
        } catch (error) {
          console.error("Failed to fetch order/contract details", error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [open, purchaseOrderId, purchaseContractId, dispatch])

  // Normalize items to display
  const itemsToDisplay = (purchaseOrder?.items && purchaseOrder.items.length > 0)
    ? purchaseOrder.items
    : (purchaseOrder?.purchaseOrders ? purchaseOrder.purchaseOrders.flatMap(po => po.items.map(item => ({ ...item, purchaseOrderId: po.id }))) : [])

  // Helper to calculate total imported quantity from receipts (including drafts)
  const calculateTotalImported = (item) => {
    let totalImported = 0
    if (purchaseOrder?.warehouseReceipts) {
      purchaseOrder.warehouseReceipts.forEach(receipt => {
        if (receipt.status !== 'cancelled' && receiptDetailsMap[receipt.id]) {
          const details = receiptDetailsMap[receipt.id]
          // Find matching detail item
          // Match by ID if possible, otherwise by ProductID + UnitID
          const matches = details.filter(d =>
            (d.purchaseOrderItemId && d.purchaseOrderItemId === item.id) ||
            (!d.purchaseOrderItemId && d.productId === item.productId && d.unitId === item.unitId)
          )

          matches.forEach(m => {
            totalImported += Number(m.qtyActual || m.quantity || 0)
          })
        }
      })
    }
    return totalImported
  }

  // Initial selection based on calculated quantities
  useEffect(() => {
    if (itemsToDisplay.length > 0 && !loading) {
      const initialSelection = {}
      itemsToDisplay.forEach((item) => {
        const imported = calculateTotalImported(item)
        const total = Number(item.quantity || 0)
        // Auto-select if not fully imported
        if (imported < total) {
          initialSelection[item.id] = true
        }
      })
      setSelectedItems(initialSelection)
    }
  }, [purchaseOrder, receiptDetailsMap, loading])

  const itemsCount = itemsToDisplay.length || 0

  // Calculate available items (not fully received)
  const availableItemsCount = itemsToDisplay.filter(item => {
    const imported = calculateTotalImported(item)
    const total = Number(item.quantity || 0)
    return imported < total
  }).length

  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  const toggleItem = (itemId) => {
    const item = itemsToDisplay.find(i => i.id === itemId)
    const imported = calculateTotalImported(item)
    const total = Number(item?.quantity || 0)

    if (imported >= total) return // Prevent selecting fully received items

    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const toggleAll = (checked) => {
    const newSelection = {}
    itemsToDisplay.forEach((item) => {
      const imported = calculateTotalImported(item)
      const total = Number(item.quantity || 0)
      if (imported < total) {
        newSelection[item.id] = checked
      }
    })
    setSelectedItems(newSelection)
  }

  if (!open) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      const selectedIds = Object.keys(selectedItems).filter((id) => selectedItems[id])

      // Get the actual item objects
      const selectedItemObjects = itemsToDisplay
        .filter(item => selectedIds.includes(String(item.id)))
        .map(item => {
          const imported = calculateTotalImported(item)
          const remaining = Math.max(0, Number(item.quantity || 0) - imported)
          return {
            ...item,
            quantity: remaining,
            notes: detailNotes[item.id] || reason || `Nhập kho theo đơn mua ${purchaseOrder.code}`
          }
        })

      await onConfirm?.(selectedItemObjects, actualReceiptDate || null, reason, notes)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

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
          <DialogTitle>Xác nhận tạo phiếu nhập kho</DialogTitle>
          <DialogDescription>
            Tạo phiếu nhập kho từ đơn mua hàng này. Tất cả sản phẩm sẽ được nhập vào kho.
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "space-y-4 flex-1 overflow-y-auto p-6",
          isMobile && "h-full px-4 pb-4"
        )}>
          {/* Purchase Order Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Nhà cung cấp:</span>
                <div className="font-medium">{purchaseOrder?.supplier?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <div className="font-medium">{purchaseOrder?.code}</div>
              </div>
            </div>
          </div>

          {/* Products to import */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Sản phẩm sẽ nhập kho:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{itemsCount} sản phẩm
              </span>
            </div>
            <div className={cn("overflow-auto rounded-lg border", isMobile && "border-0 h-full")}>
              {!isMobile ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCount === availableItemsCount && availableItemsCount > 0}
                          onCheckedChange={toggleAll}
                          disabled={availableItemsCount === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead className="text-right">Đã nhập</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsToDisplay.map((item, index) => {
                      const imported = calculateTotalImported(item)
                      const total = Number(item.quantity || 0)
                      const isFullyImported = imported >= total

                      return (
                        <TableRow key={item.id} className={isFullyImported ? "opacity-60 bg-muted/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={!!selectedItems[item.id]}
                              onCheckedChange={() => toggleItem(item.id)}
                              disabled={isFullyImported}
                            />
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                {item?.product?.image ? (
                                  <img
                                    src={getPublicUrl(item.product.image)}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-secondary">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{item.productName}</div>
                                {isFullyImported && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Đã nhập đủ</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-600">
                            {Number(item.quantity)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {Number(imported)}
                          </TableCell>
                          <TableCell>{item.unitName || item.unit?.name || '—'}</TableCell>
                          <TableCell>
                            <Input
                              className="h-8 min-w-[150px]"
                              value={detailNotes[item.id] || ''}
                              onChange={(e) => setDetailNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              disabled={isFullyImported || !selectedItems[item.id]}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {itemsToDisplay.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Không có sản phẩm nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Checkbox
                      checked={selectedCount === availableItemsCount && availableItemsCount > 0}
                      onCheckedChange={toggleAll}
                      disabled={availableItemsCount === 0}
                      id="select-all-mobile"
                    />
                    <label htmlFor="select-all-mobile" className="text-sm font-medium">
                      Chọn tất cả ({availableItemsCount}/{itemsCount} khả dụng)
                    </label>
                  </div>
                  {itemsToDisplay.map((item, index) => {
                    const imported = calculateTotalImported(item)
                    const total = Number(item.quantity || 0)
                    const isFullyImported = imported >= total

                    return (
                      <div
                        key={item.id}
                        className="flex gap-3 rounded-lg border p-3 shadow-sm bg-card"
                        onClick={() => toggleItem(item.id)}
                      >
                        <div className="flex pt-1">
                          <Checkbox
                            checked={!!selectedItems[item.id]}
                            onCheckedChange={() => toggleItem(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={isFullyImported}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                              {item?.product?.image ? (
                                <img
                                  src={getPublicUrl(item.product.image)}
                                  alt={item.productName}
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
                              <div className="font-medium text-sm leading-tight">
                                {item.productName}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex flex-col">
                              <span className="text-muted-foreground">Số lượng</span>
                              <span className="font-semibold text-blue-600 text-sm">
                                {item.quantity} {item.unitName || item.unit?.name}
                              </span>
                            </div>
                            <div className="flex flex-col text-right">
                              <span className="text-muted-foreground">Đã nhập</span>
                              <span className="font-medium">
                                {imported} {isFullyImported && '(Đủ)'}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground">Ghi chú sản phẩm</span>
                            <Input
                              className="h-8 text-sm"
                              value={detailNotes[item.id] || ''}
                              onChange={(e) => setDetailNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              disabled={isFullyImported || !selectedItems[item.id]}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {itemsToDisplay.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Không có sản phẩm nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actual Receipt Date Input */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap shrink-0">Ngày nhận hàng thực tế:</label>
            <input
              type="date"
              className="flex h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={actualReceiptDate}
              onChange={(e) => setActualReceiptDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Lý do nhập kho</label>
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

          {/* Warning for existing receipts */}
          {
            (purchaseOrder?.warehouseReceiptId || (purchaseOrder?.warehouseReceipts && purchaseOrder.warehouseReceipts.length > 0)) && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
                <p className="font-medium flex items-center">
                  <InfoCircledIcon className="mr-2 h-4 w-4" />
                  Đơn hàng này đã có phiếu nhập kho!
                </p>
                <p className="mt-1 text-xs ml-6">
                  Vui lòng kiểm tra kỹ để tránh nhập trùng.
                </p>
              </div>
            )
          }

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                Phiếu nhập kho sẽ được tạo ở trạng thái <strong>Chờ duyệt</strong> với toàn bộ sản phẩm.
              </li>
              <li>
                Tồn kho chưa được cộng cho đến khi <strong>Ghi sổ kho</strong>.
              </li>
              <li>Bạn có thể xem và chỉnh sửa phiếu kho sau khi tạo.</li>
            </ul>
          </div>
        </div >

        <DialogFooter className={cn("px-6 py-4 border-t gap-2 shrink-0 bg-background", isMobile ? "pb-4 px-4 flex-row" : "")}>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={cn(isMobile && "flex-1")}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading || selectedCount === 0}
            loading={loading}
            className={cn(isMobile && "flex-1")}
          >
            <IconPackageImport className="mr-2 h-4 w-4" />
            Tạo phiếu nhập kho ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent >
    </Dialog >
  )
}

export default ConfirmImportWarehouseDialog
