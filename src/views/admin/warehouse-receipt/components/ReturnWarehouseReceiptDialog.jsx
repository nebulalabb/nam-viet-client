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

const ReturnWarehouseReceiptDialog = ({
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
  const [returnQuantities, setReturnQuantities] = useState({}) // { itemDetailId: quantity }
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
    }
  }, [open, invoice?.id, dispatch])

  const calculateTotalShipped = (item) => {
    let totalShipped = 0
    if (activeInvoice?.warehouseReceipts) {
      activeInvoice.warehouseReceipts.forEach(receipt => {
        if (receipt.isPosted && receipt.receiptType === 2) { // export
          if (receipt.details) {
            const match = receipt.details.filter(d =>
              (d.invoiceItemId && d.invoiceItemId === item.id) ||
              (
                !d.invoiceItemId &&
                String(d.productId) === String(item.productId) &&
                (!d.unitId || !item.unitId || String(d.unitId) === String(item.unitId))
              )
            )
            match.forEach(m => { totalShipped += Number(m.qtyActual || m.quantity || 0) })
          }
        }
      })
    }
    return totalShipped
  }

  const calculateTotalReturned = (item) => {
    let totalReturned = 0
    if (activeInvoice?.warehouseReceipts) {
      activeInvoice.warehouseReceipts.forEach(receipt => {
        if (receipt.isPosted && receipt.receiptType === 3) { // import refund
          if (receipt.details) {
            const match = receipt.details.filter(d =>
              (d.invoiceItemId && d.invoiceItemId === item.id) ||
              (
                !d.invoiceItemId &&
                String(d.productId) === String(item.productId) &&
                (!d.unitId || !item.unitId || String(d.unitId) === String(item.unitId))
              )
            )
            match.forEach(m => { totalReturned += Number(m.qtyActual || m.quantity || 0) })
          }
        }
      })
    }
    return totalReturned
  }

  // Helper to check if item is selectable (has shipped quantity that hasn't been returned)
  const isItemSelectable = (item) => {
    if (item.gift || item.isGift) return false
    const totalShipped = calculateTotalShipped(item)
    const totalReturned = calculateTotalReturned(item)
    return totalShipped > totalReturned
  }

  useEffect(() => {
    if (activeInvoice?.details) {
      const initialSelection = {}
      const initialQuantities = {}
      activeInvoice.details.forEach((item) => {
        if (isItemSelectable(item)) {
          initialSelection[item.id] = false
          initialQuantities[item.id] = 0
        }
      })
      setSelectedItems(initialSelection)
      setReturnQuantities(initialQuantities)
      
      const initialDetailNotes = {}
      activeInvoice.details.forEach(item => {
        initialDetailNotes[item.id] = ''
      })
      setDetailNotes(initialDetailNotes)
      
      if (invoice) {
        setReason('')
        setNotes('')
      }
      
      if (activeInvoice.warehouseReceipts) {
        const firstExport = activeInvoice.warehouseReceipts.find(r => r.receiptType === 2 && r.isPosted)
        if (firstExport?.warehouseId) {
          setSelectedWarehouseId(String(firstExport.warehouseId))
        }
      }
    }
  }, [activeInvoice])

  const totalRefundAmount = useMemo(() => {
    let sum = 0
    if (activeInvoice?.details) {
      activeInvoice.details.forEach(item => {
        if (selectedItems[item.id]) {
          const qty = Number(returnQuantities[item.id] || 0)
          const price = Number(item.price || 0)
          sum += qty * price
        }
      })
    }
    return sum
  }, [activeInvoice, selectedItems, returnQuantities])

  if (!invoice) return null

  const handleConfirm = async () => {
    if (!selectedWarehouseId) {
      toast.error('Vui lòng chọn kho nhận hàng')
      return
    }

    const selectedIds = Object.keys(selectedItems).filter(id => selectedItems[id])

    const selectedItemObjects = activeInvoice.details
      .filter(item => selectedIds.includes(String(item.id)))
      .map(item => {
        return {
          ...item,
          quantity: Number(returnQuantities[item.id] || 0),
          notes: detailNotes[item.id] || ''
        }
      })

    if (selectedItemObjects.some(item => item.quantity <= 0)) {
      toast.error('Số lượng trả hàng phải lớn hơn 0')
      return
    }

    await onConfirm?.(selectedItemObjects, actualReceiptDate || null, selectedWarehouseId, reason, notes)
    onOpenChange(false)
  }

  const handleQuantityChange = (itemId, val, max) => {
    const num = parseFloat(val)
    if (isNaN(num)) {
      setReturnQuantities(prev => ({ ...prev, [itemId]: val }))
      return
    }
    
    if (num > max) {
      toast.warning(`Số lượng không thể vượt quá số lượng còn lại có thể trả (${max})`)
      setReturnQuantities(prev => ({ ...prev, [itemId]: max }))
    } else {
      setReturnQuantities(prev => ({ ...prev, [itemId]: num }))
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
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-orange-50">
          <DialogTitle className="text-orange-700 flex items-center gap-2"><IconPackageExport className="h-5 w-5" /> Tạo phiếu nhập trả hàng</DialogTitle>
          <DialogDescription>
            Chọn sản phẩm khách hoàn trả từ đơn bán này để nhập lại vào kho
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
            <label className="text-sm font-medium">Chọn kho nhận hàng trả <span className="text-red-500">*</span></label>
            <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
              <SelectTrigger className="w-full border-orange-200 focus:ring-orange-500">
                <SelectValue placeholder="Chọn kho bảo quản sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                {productWarehouses.map((warehouse) => (
                  <SelectItem 
                    key={warehouse.id} 
                    value={warehouse.id.toString()}
                  >
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
              <h4 className="text-sm font-semibold">Sản phẩm khách hàng trả:</h4>
              <span className="text-sm text-muted-foreground">
                Đã chọn: {selectedCount}/{validItemsCount}
              </span>
            </div>
            <div className={cn("overflow-auto rounded-lg border border-orange-100", isMobile && "border-0 h-full")}>
              {!isMobile ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-50/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCount === validItemsCount && validItemsCount > 0}
                          onCheckedChange={toggleAll}
                          disabled={validItemsCount === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng trả</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Giá trị trả</TableHead>
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
                      activeInvoice.details?.filter(item => !(item.gift || item.isGift)).map((item, index) => {
                        const selectable = isItemSelectable(item)
                        const totalShipped = calculateTotalShipped(item)
                        const totalReturned = calculateTotalReturned(item)
                        const remaining = Math.max(0, totalShipped - totalReturned)
                        const qtyVal = Number(returnQuantities[item.id] || 0)
                        const refundVal = qtyVal * Number(item.price || 0)

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
                                  value={returnQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                />
                                <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                  Đã giao: {totalShipped} | KH trả: {totalReturned}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-[13px] font-medium">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                            </TableCell>
                            <TableCell className="text-[13px] font-bold text-orange-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(refundVal)}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-orange-50/50 rounded-lg">
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
                      const totalReturned = calculateTotalReturned(item)
                      const remaining = Math.max(0, totalShipped - totalReturned)

                      return (
                        <div
                          key={item.id}
                          className={cn("flex gap-3 rounded-lg border p-3 shadow-sm", !selectable ? "bg-muted/30 opacity-80" : "bg-card border-orange-100")}
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
                                <span className="text-muted-foreground">Số lượng trả</span>
                                <Input
                                  type="number"
                                  className="h-8 w-20 text-right"
                                  value={returnQuantities[item.id] ?? ''}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value, remaining)}
                                  disabled={!selectable || !selectedItems[item.id]}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <span className="text-[10px] text-muted-foreground">Được trả tối đa: {remaining}</span>
                              </div>
                              <div className="flex flex-col text-right justify-center">
                                <span className="text-muted-foreground">Hoàn tiền</span>
                                <span className="text-orange-600 font-bold">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(returnQuantities[item.id] || 0) * Number(item.unitPrice || 0))}
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
                <span className="text-sm font-medium text-muted-foreground">TỔNG GIÁ TRỊ TRẢ HÀNG KHẤU TRỪ VÀO CÔNG NỢ</span>
                <span className="text-2xl font-black text-orange-600">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRefundAmount)}
                </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <label className="text-sm font-medium whitespace-nowrap shrink-0">Ngày trả hàng thực tế:</label>
            <input
              type="date"
              className="flex h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:ring-orange-500"
              value={actualReceiptDate}
              onChange={(e) => setActualReceiptDate(e.target.value)}
            />
          </div>

          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Lý do trả hàng</label>
            <Input 
              placeholder="Nhập lý do khách trả lại..." 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              className="focus-visible:ring-orange-500"
            />
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 mt-4">
            <p className="font-medium flex items-center text-xs gap-1">
                <AlertTriangle className="w-4 h-4"/> 
                Lưu ý quan trọng:
            </p>
            <ul className="ml-5 mt-1 list-disc space-y-1 text-xs">
              <li>Phiếu nhập trả hàng sẽ ở trạng thái <strong>Chưa ghi sổ</strong></li>
              <li>Kho hàng và Công nợ khách hàng (trừ nợ) chỉ được cập nhật sau khi bạn thực hiện <strong>Duyệt Ghi sổ</strong> phiếu trả hàng này.</li>
            </ul>
          </div>
        </div>

        <DialogFooter className={cn("px-6 py-4 border-t gap-2 shrink-0 bg-background", isMobile ? "pb-4 px-4 flex-row" : "")}>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className={cn(isMobile && "flex-1")}>Hủy</Button>
          <Button type="button" onClick={handleConfirm} disabled={loading || selectedCount === 0 || totalRefundAmount <= 0} loading={loading} className={cn("bg-orange-600 hover:bg-orange-700", isMobile && "flex-1")}>
            <IconPackageExport className="mr-2 h-4 w-4" />
            Lập phiếu trả hàng ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReturnWarehouseReceiptDialog