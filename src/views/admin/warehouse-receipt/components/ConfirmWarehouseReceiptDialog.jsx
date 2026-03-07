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
import { useDispatch } from 'react-redux'
import { getWarehouseReceiptDetail } from '@/stores/WarehouseReceiptSlice'
import { toast } from 'sonner'

const ConfirmWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  invoice,
  onConfirm,
  loading = false,
  type = 'retail', // 'retail' | 'contract'
  contentClassName,
  overlayClassName,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const [selectedItems, setSelectedItems] = useState({})
  const [detailInvoice, setDetailInvoice] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [actualReceiptDate, setActualReceiptDate] = useState(() => new Date().toISOString().split('T')[0])

  // Determine which invoice object to use: the fetched detail or the passed prop
  const activeInvoice = detailInvoice || invoice

  // Fetch full details when opened
  useEffect(() => {
    if (open && invoice?.id) {
      const fetchData = async () => {
        setIsLoadingDetails(true)
        try {
          let data = null

          if (type === 'contract') {
            // In contract mode, use the passed invoice object (which contains contract data)
            // Do NOT fetch invoice details from API as it would overwrite the contract mapping
            data = { ...invoice }
          } else {
            // In retail mode, fetch fresh invoice details
            data = await dispatch(getInvoiceDetail(invoice.id)).unwrap()
          }

          // Fetch details for existing warehouse receipts if they exist but don't have details
          if (data.warehouseReceipts && data.warehouseReceipts.length > 0) {
            const receiptsWithDetails = await Promise.all(data.warehouseReceipts.map(async (receipt) => {
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
            data.warehouseReceipts = receiptsWithDetails;
          }

          setDetailInvoice(data)
        } catch (error) {
          console.error('Failed to fetch details:', error)
          toast.error('Không thể tải thông tin chi tiết')
        } finally {
          setIsLoadingDetails(false)
        }
      }

      fetchData()
    } else if (!open) {
      // Reset when closed
      setDetailInvoice(null)
    }
  }, [open, invoice?.id, type])

  const calculateTotalShipped = (item) => {
    let totalShipped = 0
    if (activeInvoice?.warehouseReceipts) {
      activeInvoice.warehouseReceipts.forEach(receipt => {
        if (receipt.status !== 'cancelled' && receipt.status !== 'canceled') {
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
    // Check quantity
    const totalOrdered = Number(item.quantity || 0)

    // Calculate shipped quantity from warehouse receipts
    const totalShipped = calculateTotalShipped(item)

    if (totalShipped >= totalOrdered) return false

    if (type === 'contract') {
      // In contract mode, ONLY select contract items
      return !!item.salesContractItemId
    }
    // In retail mode, only select items NOT in a contract
    return !item.salesContractItemId
  }

  useEffect(() => {
    if (activeInvoice?.invoiceItems) {
      const initialSelection = {}
      activeInvoice.invoiceItems.forEach((item) => {
        if (isItemSelectable(item)) {
          // Double check to ensure we don't select fully shipped items
          initialSelection[item.id] = true
        }
      })
      setSelectedItems(initialSelection)
    }
  }, [activeInvoice, type])

  if (!invoice) return null

  const handleConfirm = async () => {
    const selectedIds = Object.keys(selectedItems).filter(
      (id) => selectedItems[id],
    )

    // Get the actual item objects
    const selectedItemObjects = activeInvoice.invoiceItems
      .filter(item => selectedIds.includes(String(item.id)))
      .map(item => {
        const totalShipped = calculateTotalShipped(item)
        const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)
        return {
          ...item,
          quantity: remaining // Pass remaining quantity as default to export
        }
      })

    await onConfirm?.(selectedItemObjects, actualReceiptDate || null)
    onOpenChange(false)
  }

  const toggleItem = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const toggleAll = (checked) => {
    const newSelection = {}
    invoice.invoiceItems.forEach((item) => {
      if (isItemSelectable(item)) {
        newSelection[item.id] = checked
      }
    })
    setSelectedItems(newSelection)
  }

  const validItemsCount = activeInvoice.invoiceItems?.filter(isItemSelectable).length

  const selectedCount = Object.values(selectedItems).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0", // Fixed height, flex col, reset default padding to handle scroll better
          isMobile && "fixed inset-0 w-screen h-[100dvh] max-h-[100dvh] top-0 left-0 right-0 max-w-none m-0 rounded-none translate-x-0 translate-y-0",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle>Xác nhận tạo phiếu xuất kho</DialogTitle>
          <DialogDescription>
            {type === 'contract'
              ? 'Chọn sản phẩm cần xuất kho từ hợp đồng bán này'
              : 'Chọn sản phẩm cần xuất kho từ đơn bán này'}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "space-y-4 flex-1 overflow-y-auto p-6", // content scrollable
          isMobile && "h-full px-4 pb-4"
        )}>
          {/* Invoice Info */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Khách hàng:</span>
                <div className="font-medium">{activeInvoice.customer?.name}</div>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {type === 'contract' ? 'Mã hợp đồng:' : 'Mã đơn bán:'}
                </span>
                <div className="font-medium">{activeInvoice.code}</div>
              </div>
            </div>
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
                          checked={
                            selectedCount === validItemsCount &&
                            validItemsCount > 0
                          }
                          onCheckedChange={toggleAll}
                          disabled={validItemsCount === 0}
                        />
                      </TableHead>
                      <TableHead className="w-12">STT</TableHead>
                      <TableHead>Sản phẩm</TableHead>
                      <TableHead className="text-right">Số lượng</TableHead>
                      <TableHead>Đơn vị</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingDetails ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Đang s-tải thông tin sản phẩm...
                        </TableCell>
                      </TableRow>
                    ) : (
                      activeInvoice.invoiceItems?.map((item, index) => {
                        const selectable = isItemSelectable(item)
                        const isContractItem = !!item.salesContractItemId

                        // Calculate shipped for display
                        const totalShipped = calculateTotalShipped(item)

                        const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)


                        return (
                          <TableRow
                            key={item.id}
                            className={!selectable ? 'bg-muted/30' : ''}
                          >
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
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                  {item?.image ? (
                                    <img
                                      src={getPublicUrl(item.image)}
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
                                  <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                    {item.product?.code || item.productCode || '—'}
                                  </div>
                                  <div className="font-medium">{item.productName}</div>
                                  {isContractItem && type === 'retail' && (
                                    <span className="text-xs text-orange-600 block">
                                      (Thuộc hợp đồng)
                                    </span>
                                  )}
                                  {isContractItem && type === 'contract' && (
                                    <span className="text-xs text-blue-600 block">
                                      (Theo hợp đồng)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              <div>{Number(item.quantity)}</div>
                              {totalShipped > 0 && (
                                <div className="text-xs text-muted-foreground font-normal">
                                  Đã xuất: {totalShipped}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{item.unitName || 'N/A'}</TableCell>
                            <TableCell>
                              {!selectable ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <InfoCircledIcon className="h-3 w-3" />
                                        Không thể xuất
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        Sản phẩm này nằm trong hợp đồng <br /> không
                                        thể xuất tại đây
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-xs text-green-600">
                                  Có thể xuất ({remaining})
                                </span>
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
                  {/* Mobile Select All Header */}
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <Checkbox
                      checked={
                        selectedCount === validItemsCount &&
                        validItemsCount > 0
                      }
                      onCheckedChange={toggleAll}
                      disabled={validItemsCount === 0}
                      id="select-all-mobile"
                    />
                    <label
                      htmlFor="select-all-mobile"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Chọn tất cả ({validItemsCount} sản phẩm)
                    </label>
                  </div>

                  {/* Mobile Cards List */}
                  {isLoadingDetails ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Đang tải thông tin...
                    </div>
                  ) : (
                    activeInvoice.invoiceItems?.map((item, index) => {
                      const selectable = isItemSelectable(item)
                      const isContractItem = !!item.salesContractItemId
                      const totalShipped = calculateTotalShipped(item)
                      const remaining = Math.max(0, Number(item.quantity || 0) - totalShipped)

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex gap-3 rounded-lg border p-3 shadow-sm",
                            !selectable ? "bg-muted/30 opacity-80" : "bg-card"
                          )}
                          onClick={() => selectable && toggleItem(item.id)}
                        >
                          <div className="flex pt-1">
                            <Checkbox
                              checked={!!selectedItems[item.id]}
                              onCheckedChange={() => toggleItem(item.id)}
                              disabled={!selectable}
                              onClick={(e) => e.stopPropagation()} // Prevent double toggle
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                                {item?.image ? (
                                  <img
                                    src={getPublicUrl(item.image)}
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
                                {isContractItem && type === 'retail' && (
                                  <div className="text-xs text-orange-600 mt-0.5">
                                    (Thuộc hợp đồng)
                                  </div>
                                )}
                                {isContractItem && type === 'contract' && (
                                  <div className="text-xs text-blue-600 mt-0.5">
                                    (Theo hợp đồng)
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground">Số lượng</span>
                                <span className="font-semibold text-blue-600 text-sm">
                                  {Number(item.quantity)} {item.unitName}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-muted-foreground">Trạng thái</span>
                                {!selectable ? (
                                  <span className="text-muted-foreground italic flex items-center justify-end gap-1">
                                    <InfoCircledIcon className="h-3 w-3" />
                                    Không thể xuất
                                  </span>
                                ) : (
                                  <span className="text-green-600 font-medium whitespace-nowrap">
                                    Có thể xuất ({remaining})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }))}
                </div>
              )}
            </div>
          </div>

          {/* Warning for existing receipts */}
          {(invoice.warehouseReceiptId || (invoice.warehouseReceipts && invoice.warehouseReceipts.length > 0)) && (
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

          {/* Actual Receipt Date */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium whitespace-nowrap shrink-0">Ngày xuất hàng thực tế:</label>
            <input
              type="date"
              className="flex h-9 max-w-[180px] rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={actualReceiptDate}
              onChange={(e) => setActualReceiptDate(e.target.value)}
            />
          </div>

          {/* Warning */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <p className="font-medium">⚠️ Lưu ý:</p>
            <ul className="ml-4 mt-1 list-disc space-y-1">
              <li>
                Phiếu xuất kho sẽ được tạo ở trạng thái <strong>Nháp</strong>
              </li>
              <li>
                Tồn kho chưa bị trừ cho đến khi <strong>Ghi sổ kho</strong>
              </li>
              <li>Bạn có thể xem và chỉnh sửa phiếu kho sau khi tạo</li>
            </ul>
          </div>
        </div>

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
            <IconPackageExport className="mr-2 h-4 w-4" />
            Tạo phiếu xuất kho ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmWarehouseReceiptDialog