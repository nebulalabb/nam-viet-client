import { Button } from '@/components/custom/Button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { MobileIcon } from '@radix-ui/react-icons'
import React, { useEffect, useState, useMemo } from 'react'
import { purchaseOrderStatuses, purchaseOrderPaymentStatuses } from '../data'
import { paymentStatus } from '../../payment/data'
import { warehouseReceiptStatuses } from '../../warehouse-receipt/data'
import { Separator } from '@/components/ui/separator'
import { dateFormat } from '@/utils/date-format'
import { Skeleton } from '@/components/ui/skeleton'
import { useDispatch, useSelector } from 'react-redux'
import { getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getPublicUrl } from '@/utils/file'
import { Mail, MapPin, Pencil, Trash2, Printer, X, CreditCard, Receipt, PackagePlus, User } from 'lucide-react'
import { IconPlus, IconPencil, IconCheck } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ConfirmImportWarehouseDialog from '../../warehouse-receipt/components/ConfirmImportWarehouseDialog'
import PaymentFormDialog from '../../payment/components/PaymentDialog'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder,
  getPurchaseOrders,
  deletePurchaseOrder,
} from '@/stores/PurchaseOrderSlice'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import ViewWarehouseReceiptDialog from '../../warehouse-receipt/components/ViewWarehouseReceiptDialog'
import ViewPaymentDialog from '../../payment/components/ViewPaymentDialog'
import PrintPurchaseOrderView from './PrintPurchaseOrderView'
import MobilePurchaseOrderActions from './MobilePurchaseOrderActions'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import UpdatePaymentStatusDialog from '../../payment/components/UpdatePaymentStatusDialog'
import { DeletePaymentDialog } from '../../payment/components/DeletePaymentDialog'
import { UpdateWarehouseReceiptStatusDialog } from '../../warehouse-receipt/components/UpdateWarehouseReceiptStatusDialog'
import { DeleteWarehouseReceiptDialog } from '../../warehouse-receipt/components/DeleteWarehouseReceiptDialog'
import { updateWarehouseReceipt, postWarehouseReceipt, cancelWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { updatePaymentStatus } from '@/stores/PaymentSlice'
import ViewSupplierDialog from '../../supplier/components/ViewSupplierDialog'

const ViewPurchaseOrderDialog = ({
  open,
  onOpenChange,
  purchaseOrderId,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  onEdit,
  onRefresh,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [purchaseOrder, setPurchaseOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting.setting)

  // Dialog States
  const [showConfirmImportDialog, setShowConfirmImportDialog] = useState(false)

  const [showCreatePaymentDialog, setShowCreatePaymentDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  // Sub-detail Dialog States
  const [showWarehouseReceiptDetail, setShowWarehouseReceiptDetail] = useState(false)
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState(null)

  const [showPaymentDetail, setShowPaymentDetail] = useState(false)
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState(null)
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null)

  // Product View State
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const [showSupplierDetail, setShowSupplierDetail] = useState(false)

  // Status Update Dialog States (Sub-items)`
  const [showUpdatePaymentStatus, setShowUpdatePaymentStatus] = useState(false)
  const [selectedPaymentForUpdate, setSelectedPaymentForUpdate] = useState(null)

  const [showUpdateWarehouseReceiptStatus, setShowUpdateWarehouseReceiptStatus] = useState(false)
  const [selectedWarehouseReceiptForUpdate, setSelectedWarehouseReceiptForUpdate] = useState(null)

  // Delete Payment Dialog State
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false)
  const [paymentToDelete, setPaymentToDelete] = useState(null)

  // Delete Warehouse Receipt Dialog State
  const [showDeleteWarehouseReceiptDialog, setShowDeleteWarehouseReceiptDialog] = useState(false)
  const [warehouseReceiptToDelete, setWarehouseReceiptToDelete] = useState(null)



  const filteredStatuses = useMemo(
    () => purchaseOrderStatuses.filter((s) => s.value !== 'received'),
    []
  )

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await dispatch(getPurchaseOrderDetail(purchaseOrderId)).unwrap()
      setPurchaseOrder(data)
    } catch (error) {
      console.error('Fetch purchase order error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (status, id) => {
    try {
      if (status === 'approved') {
        await dispatch(confirmPurchaseOrder(id)).unwrap()
      } else if (status === 'cancelled') {
        await dispatch(cancelPurchaseOrder(id)).unwrap()
      } else if (status === 'pending' && purchaseOrder.status === 'approved') {
        await dispatch(revertPurchaseOrder(id)).unwrap()
      } else {
        await dispatch(updatePurchaseOrderStatus({ id, status })).unwrap()
      }
      toast.success('Cập nhật trạng thái đơn mua hàng thành công')
      fetchData()
      onRefresh?.()
      setShowUpdateStatusDialog(false)
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleUpdatePaymentStatus = async (status, id) => {
    try {
      await dispatch(updatePaymentStatus({ id, status })).unwrap()
      toast.success('Cập nhật trạng thái phiếu chi thành công')
      setShowUpdatePaymentStatus(false)
      fetchData()
      onRefresh?.()
    } catch (error) {
      console.error(error)
      // Toast handled in slice usually
    }
  }

  const handleUpdateWarehouseReceiptStatus = async (newStatus, id) => {
    try {
      if (newStatus === 'cancelled') {
        await dispatch(cancelWarehouseReceipt(id)).unwrap()
      } else if (newStatus === 'posted') {
        await dispatch(postWarehouseReceipt(id)).unwrap()
      } else {
        await dispatch(updateWarehouseReceipt({ id, data: { status: newStatus } })).unwrap()
      }

      toast.success(newStatus === 'cancelled' ? 'Hủy phiếu thành công' : newStatus === 'posted' ? 'Duyệt phiếu thành công' : 'Cập nhật trạng thái thành công')
      setShowUpdateWarehouseReceiptStatus(false)
      fetchData()
      onRefresh?.()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeletePurchaseOrder = async () => {
    try {
      await dispatch(deletePurchaseOrder(purchaseOrderId)).unwrap()
      toast.success('Xóa đơn mua hàng thành công')
      onOpenChange(false)
      dispatch(getPurchaseOrders({}))
    } catch (error) {
      console.error('Delete purchase order error:', error)
      toast.error('Xóa đơn mua hàng thất bại')
    }
  }

  const handlePrintOrder = () => {
    setShowPrintOrder(true)
  }

  useEffect(() => {
    if (open && purchaseOrderId) {
      // Refresh logic if needed
      fetchData()
    }
  }, [open, purchaseOrderId, dispatch])


  // Helpers
  const getStatusColor = (statusValue) => {
    const statusObj = purchaseOrderStatuses.find(s => s.value === statusValue)
    return statusObj?.color || ''
  }

  const getStatusLabel = (statusValue) => {
    const statusObj = purchaseOrderStatuses.find(s => s.value === statusValue)
    return statusObj?.label || statusValue
  }

  const getPaymentStatusLabel = (statusValue) => {
    const statusObj = purchaseOrderPaymentStatuses.find(s => s.value === statusValue)
    return statusObj?.label || statusValue
  }

  const getPaymentStatusColor = (statusValue) => {
    const statusObj = purchaseOrderPaymentStatuses.find(s => s.value === statusValue)
    return statusObj?.color || ''
  }

  // Handlers
  const handleCreateImport = () => {
    if (purchaseOrder?.status !== 'approved' && purchaseOrder?.status !== 'partial' && purchaseOrder?.status !== 'received') {
      toast.error('Chỉ có thể tạo phiếu nhập kho cho đơn hàng đã xác nhận (Đã đặt).')
      return
    }
    setShowConfirmImportDialog(true)
  }

  const handleCreatePayment = () => {
    if (purchaseOrder?.status !== 'approved' && purchaseOrder?.status !== 'partial' && purchaseOrder?.status !== 'received') {
      toast.error('Chỉ có thể tạo phiếu chi cho đơn hàng đã xác nhận (Đã đặt).')
      return
    }

    const totalAmount = parseFloat(purchaseOrder?.totalAmount || 0)
    const paidAmount = parseFloat(purchaseOrder?.paidAmount || 0)
    const pendingAmount = (purchaseOrder?.paymentVouchers || purchaseOrder?.payments || [])
      .filter(p => p.status === 'pending' || p.status === 'draft')
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

    const remainingAmount = Math.max(0, totalAmount - paidAmount - pendingAmount)

    if (remainingAmount <= 0) {
      toast.error('Đơn hàng đã thanh toán đủ hoặc đang có phiếu chi nháp/chờ duyệt chờ xử lý hết số nợ.')
      return
    }

    setShowCreatePaymentDialog(true)
  }

  const handleCreateWarehouseReceipt = async (selectedItems, actualReceiptDate, reason, notes) => {
    const payload = {
      // code: `NK-${purchaseOrder.code}-${Date.now().toString().slice(-4)}`,
      receiptType: 1, // IMPORT / RECEIPT
      businessType: 'purchase_in',

      actualReceiptDate: actualReceiptDate || null,
      reason: reason || `Nhập kho từ đơn mua hàng ${purchaseOrder.code}`,
      notes: notes || purchaseOrder.note || '',
      warehouseId: null,
      supplierId: purchaseOrder.supplierId,
      purchaseOrderId: purchaseOrder.id,
      details: selectedItems.map(item => ({
        productId: item.productId || item.product?.id,
        unitId: item.unitId || item.unit?.id,
        quantity: item.quantity,
        notes: `Nhập kho theo đơn mua ${purchaseOrder.code}`,
        purchaseOrderId: purchaseOrder.id,
        purchaseOrderItemId: item.id
      }))
    }

    try {
      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Tạo phiếu nhập kho thành công')
      fetchData()
      onRefresh?.()
    } catch (error) {
      console.error(error)
      toast.error('Tạo phiếu nhập kho thất bại')
    }
  }

  // Helper for Warehouse Receipt Status (assuming similar to Invoice)
  const getWarehouseReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'posted': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // Helper for Payment Voucher Status
  const getReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'posted': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          "md:h-screen md:max-w-full md:z-[10001] md:my-0 md:top-0 md:translate-y-0",
          !isDesktop && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none z-[9999] translate-x-0 translate-y-0 flex flex-col",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className={cn(!isDesktop && "px-4 pt-4")}>
          <DialogTitle className={cn(!isDesktop && "text-base")}>
            Thông tin chi tiết đơn mua hàng: <span className={cn(!isDesktop && "block")}>{purchaseOrder?.poCode}</span>
          </DialogTitle>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isDesktop ? "max-h-[75vh]" : "h-full px-4 pb-4 flex-1"
        )}>
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Skeleton className="h-[20px] w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : purchaseOrder ? (
            <div className={cn(
              "flex gap-6",
              isDesktop ? "flex-row" : "flex-col"
            )}>
              {/* MAIN CONTENT BLOCK */}
              <div className={cn(
                "flex-1 rounded-lg border",
                isDesktop ? "space-y-6 p-4" : "space-y-4 p-3"
              )}>
                <h2 className={cn(
                  "font-semibold",
                  isDesktop ? "text-lg" : "text-base"
                )}>Thông tin nguyên liệu</h2>

                <div className={cn("space-y-6", !isDesktop && "space-y-4")}>
                  {/* ITEMS TABLE */}
                  {isDesktop ? (
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8">STT</TableHead>
                            <TableHead className="min-w-40">Nguyên liệu</TableHead>
                            <TableHead className="min-w-16 text-right">Số lượng</TableHead>
                            <TableHead className="min-w-20">ĐVT</TableHead>
                            <TableHead className="min-w-20 text-right">Giá nhập</TableHead>
                            <TableHead className="min-w-28 text-right">Tổng tiền</TableHead>
                            <TableHead className="min-w-16 text-right">Thuế (%)</TableHead>
                            <TableHead className="min-w-24 text-right">Tiền thuế</TableHead>
                            <TableHead className="min-w-16 text-right">CK (%)</TableHead>
                            <TableHead className="min-w-24 text-right">Tiền CK</TableHead>
                            <TableHead className="min-w-28 text-right">Tổng cộng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseOrder.details?.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div
                                  className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                  onClick={() => {
                                    if (item.productId) {
                                      setSelectedProductId(item.productId)
                                      setShowViewProductDialog(true)
                                    }
                                  }}
                                >
                                  {item.product?.image && (
                                    <div className="size-16 overflow-hidden rounded-md border shrink-0">
                                      <img
                                        src={getPublicUrl(item.product?.image)}
                                        alt={item.product?.productName}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-medium text-blue-600 hover:underline">{item.product?.productName}</div>
                                    <div className="text-xs text-muted-foreground">{item.productCode || item.product?.code}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                              <TableCell>{item.unitName || item.product?.unit?.unitName || '—'}</TableCell>
                              <TableCell className="text-right">{moneyFormat(item.price)}</TableCell>
                              <TableCell className="text-right">{moneyFormat(Number(item.quantity) * Number(item.price))}</TableCell>
                              <TableCell className="text-right">{Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : '—'}</TableCell>
                              <TableCell className="text-right">{item.taxAmount > 0 ? moneyFormat(item.taxAmount) : '—'}</TableCell>
                              <TableCell className="text-right">{Number(item.discountRate) > 0 ? `${Number(item.discountRate)}%` : '—'}</TableCell>
                              <TableCell className="text-right text-destructive">{item.discountAmount > 0 ? moneyFormat(item.discountAmount) : '—'}</TableCell>
                              <TableCell className="text-right font-medium">{moneyFormat(item.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    // MOBILE ITEMS
                    <div className="space-y-3">
                      {purchaseOrder.details?.map((item, index) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2 bg-card">
                          <div
                            className="flex gap-3 items-start cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              if (item?.productId) {
                                setSelectedProductId(item.productId)
                                setShowViewProductDialog(true)
                              }
                            }}
                          >
                            {item.product?.image && (
                              <div className="size-16 rounded border overflow-hidden shrink-0">
                                <img src={getPublicUrl(item.product?.image)} alt={item.product?.productName} className="h-full w-full object-cover" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-sm text-blue-600 hover:underline">
                                {index + 1}. {item.product?.productName}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.productCode || item.product?.code}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">SL: </span>
                              <span className="font-medium">{Number(item.quantity)} {item.unitName || item.product?.unit?.unitName || '—'}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Giá: </span>
                              <span className="font-medium">{moneyFormat(item.price)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tổng tiền: </span>
                              <span className="font-medium">{moneyFormat(Number(item.quantity) * Number(item.price))}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Thuế: </span>
                              <span className="font-medium">{Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : '—'}</span>
                            </div>
                            {item.discountRate > 0 && (
                              <div>
                                <span className="text-muted-foreground">CK: </span>
                                <span className="font-medium text-destructive">{Number(item.discountRate)}%</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                            <span>Tổng cộng:</span>
                            <span className="text-primary">{moneyFormat(item.total)}</span>
                          </div>
                          <div className="text-xs space-y-1 border-t pt-2">
                            {item.notes && (
                              <div>
                                <span className="text-muted-foreground">Ghi chú: </span>
                                <span>{item.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className={cn(
                    "grid gap-4",
                    isDesktop ? "md:grid-cols-[2fr,1fr]" : "grid-cols-1"
                  )}>
                    {/* FINANCIALS (Right on Desktop) */}
                    <div className={cn(
                      "space-y-4 text-sm",
                      isDesktop ? "order-2" : "order-1"
                    )}>
                      <div className="flex justify-between">
                        <strong>Tổng tiền hàng:</strong>
                        <span>{moneyFormat(purchaseOrder.subTotalAmount ?? purchaseOrder.subTotal ?? 0)}</span>
                      </div>
                      {(purchaseOrder.discountAmount ?? purchaseOrder.totalDiscountAmount ?? purchaseOrder.discount ?? 0) > 0 && (
                        <div className="flex justify-between text-destructive">
                          <strong>Giảm giá:</strong>
                          <span>-{moneyFormat(purchaseOrder.discountAmount ?? purchaseOrder.totalDiscountAmount ?? purchaseOrder.discount ?? 0)}</span>
                        </div>
                      )}
                      {(purchaseOrder.totalTaxAmount ?? purchaseOrder.taxAmount ?? 0) > 0 && (
                        <div className="flex justify-between text-blue-600">
                          <strong>Tiền thuế:</strong>
                          <span>+{moneyFormat(purchaseOrder.totalTaxAmount ?? purchaseOrder.taxAmount ?? 0)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <strong>Chi phí khác:</strong>
                        <span>{moneyFormat(purchaseOrder.otherCosts || 0)}</span>
                      </div>

                      <div className="flex justify-between items-center text-lg border-t pt-2 mt-2">
                        <strong>Tổng cộng:</strong>
                        <span className="font-bold text-primary">
                          {moneyFormat(purchaseOrder.totalCurrentAmount ?? purchaseOrder.totalAmount ?? 0)}
                        </span>
                      </div>

                      <div className="flex justify-start border-t py-2">
                        <div className={cn("font-bold", isDesktop ? "text-sm" : "text-xs")}>
                          Số tiền viết bằng chữ:{' '}
                          <span className="font-bold">
                            {toVietnamese(purchaseOrder.totalCurrentAmount ?? purchaseOrder.totalAmount ?? 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-start border-t py-2">
                        <strong className="mr-2">Trạng thái đơn hàng: </strong>
                        <div className="w-[140px]">
                          {isDesktop ? (
                            (() => {
                              const currentStatus = purchaseOrder.status
                              const statusObj = purchaseOrderStatuses.find((s) => s.value === currentStatus)
                              const isTerminalStatus = ['cancelled', 'received'].includes(currentStatus)
                              return (
                                <Badge
                                  className={cn(
                                    'select-none',
                                    currentStatus === 'received'
                                      ? 'cursor-default bg-transparent p-0 text-green-600 hover:bg-transparent shadow-none border-0'
                                      : `cursor-pointer ${statusObj?.bgColor || ''}`,
                                  )}
                                  onClick={() => !isTerminalStatus && setShowUpdateStatusDialog(true)}
                                  title={!isTerminalStatus ? 'Bấm để cập nhật trạng thái' : ''}
                                >
                                  <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                                    {statusObj?.icon ? (
                                      <statusObj.icon className="h-4 w-4" />
                                    ) : null}
                                  </span>
                                  {statusObj?.label || 'Không xác định'}
                                </Badge>
                              )
                            })()
                          ) : (
                            <Select
                              value={purchaseOrder.status}
                              onValueChange={(val) => handleUpdateStatus(val, purchaseOrder.id)}
                              disabled={['cancelled', 'received'].includes(purchaseOrder.status)}
                            >
                              <SelectTrigger className="h-7 text-xs px-2">
                                <SelectValue placeholder="Chọn trạng thái">
                                  {(() => {
                                    const selectedStatusObj = purchaseOrderStatuses.find((s) => s.value === purchaseOrder.status)
                                    return selectedStatusObj ? (
                                      <span
                                        className={`inline-flex items-center gap-1 font-medium ${selectedStatusObj.color || ''}`}
                                      >
                                        {selectedStatusObj.icon ? <selectedStatusObj.icon className="h-3 w-3" /> : null}
                                        {selectedStatusObj.label}
                                      </span>
                                    ) : null
                                  })()}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent position="popper" align="start" className="w-[140px] z-[10005]">
                                {filteredStatuses.map((s) => (
                                  <SelectItem
                                    key={s.value}
                                    value={s.value}
                                    className="cursor-pointer text-xs"
                                  >
                                    <span
                                      className={`inline-flex items-center gap-1 font-medium ${s.color || ''}`}
                                    >
                                      {s.icon ? <s.icon className="h-3 w-3" /> : null}
                                      {s.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between">
                          <strong>Thanh toán: </strong>
                          <span className={cn("font-medium", getPaymentStatusColor(purchaseOrder.paymentStatus))}>
                            {getPaymentStatusLabel(purchaseOrder.paymentStatus)}
                          </span>
                        </div>
                        {purchaseOrder.paidAmount > 0 && (
                          <div className="flex justify-between">
                            <strong>Đã thanh toán:</strong>
                            <span className="font-medium text-green-600">
                              {moneyFormat(purchaseOrder.paidAmount)}
                            </span>
                          </div>
                        )}
                        {purchaseOrder.paidAmount < purchaseOrder.totalAmount && (
                          <div className="flex justify-between">
                            <strong>Còn nợ:</strong>
                            <span className="font-medium text-red-600">
                              {moneyFormat(purchaseOrder.totalAmount - (purchaseOrder.paidAmount || 0))}
                            </span>
                          </div>
                        )}
                        {purchaseOrder.expectedDeliveryDate && (
                          <div className="flex justify-between">
                            <strong>Ngày nhận hàng dự kiến: </strong>
                            <span className="text-orange-600 font-medium">
                              {dateFormat(purchaseOrder.expectedDeliveryDate)}
                            </span>
                          </div>
                        )}
                        {purchaseOrder.expectedReturnDate && (
                          <div className="flex justify-between">
                            <strong>Ngày trả hàng dự kiến: </strong>
                            <span className="text-orange-600 font-medium">
                              {dateFormat(purchaseOrder.expectedReturnDate)}
                            </span>
                          </div>
                        )}
                        <Separator className="" />
                        {purchaseOrder.paymentMethod && (
                          <div className="flex justify-between">
                            <strong>Phương thức thanh toán: </strong>
                            <span>
                              {purchaseOrder.paymentMethod === 'cash' ? 'Tiền mặt' :
                                purchaseOrder.paymentMethod === 'transfer' ? 'Chuyển khoản' : purchaseOrder.paymentMethod}
                            </span>
                          </div>
                        )}
                        {purchaseOrder.paymentTerms && (
                          <div className="flex justify-between">
                            <strong>Điều khoản thanh toán: </strong>
                            <span>{purchaseOrder.paymentTerms}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NOTES & CONTRACT (Left on Desktop) */}
                    <div className={cn(
                      "flex flex-col gap-2",
                      isDesktop ? "order-1" : "order-2"
                    )}>
                      <div className={cn(isDesktop ? "text-sm" : "text-xs")}>
                        <strong className="text-destructive">
                          Ghi chú:{' '}
                        </strong>
                        <span className="text-primary">
                          {purchaseOrder.notes || 'Không có'}
                        </span>
                      </div>


                    </div>
                  </div>

                  {/* PAYMENT VOUCHERS SECTION */}
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Phiếu chi</h3>
                        {!['pending', 'received', 'cancelled'].includes(purchaseOrder?.status) && purchaseOrder?.paymentStatus !== 'paid' && (
                          <Button
                            size="sm"
                            className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                            onClick={handleCreatePayment}
                          >
                            <IconPlus className="h-4 w-4" />
                            <span>
                              Thêm
                            </span>
                          </Button>
                        )}
                      </div>

                      {purchaseOrder?.paymentVouchers && purchaseOrder.paymentVouchers.length > 0 ? (
                        isDesktop ? (
                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                              <TableHeader>
                                <TableRow className="bg-secondary text-xs">
                                  <TableHead className="w-12">STT</TableHead>
                                  <TableHead className="min-w-32">Mã phiếu</TableHead>
                                  <TableHead className="min-w-28 text-right">Số tiền</TableHead>
                                  <TableHead className="min-w-24">PT thanh toán</TableHead>
                                  <TableHead className="min-w-20">Trạng thái</TableHead>
                                  {/* <TableHead className="min-w-20">Loại GD</TableHead> */}
                                  {/* <TableHead className="min-w-32">Người tạo</TableHead> */}
                                  <TableHead className="min-w-32">Ngày chi</TableHead>
                                  <TableHead className="min-w-32">Người lập/Ngày tạo</TableHead>
                                  <TableHead className="w-10"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {purchaseOrder.paymentVouchers.map((voucher, index) => (
                                  <TableRow key={voucher.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                      <span
                                        className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                        onClick={() => {
                                          setSelectedPaymentDetail(voucher)
                                          setShowPaymentDetail(true)
                                        }}
                                      >
                                        {voucher.voucherCode || voucher.code}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">{moneyFormat(voucher.amount)}</TableCell>
                                    <TableCell>
                                      {voucher.paymentMethod === 'cash' ? 'Tiền mặt' : voucher.paymentMethod === 'transfer' ? 'Chuyển khoản' : voucher.paymentMethod}
                                    </TableCell>
                                    <TableCell>
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getReceiptStatusColor(voucher.status)} cursor-pointer hover:opacity-80`}
                                        onClick={() => {
                                          setSelectedPaymentForUpdate(voucher)
                                          setShowUpdatePaymentStatus(true)
                                        }}
                                        title="Bấm để cập nhật trạng thái"
                                      >
                                        {(() => {
                                          const statusObj = paymentStatus.find(s => s.value === voucher.status)
                                          return statusObj?.icon ? <statusObj.icon className="h-3 w-3" /> : (voucher.status === 'draft' ? <IconPencil className="h-3 w-3" /> : (voucher.status === 'posted' ? <IconCheck className="h-3 w-3" /> : null))
                                        })()}
                                        {(() => {
                                          const statusObj = paymentStatus.find(s => s.value === voucher.status)
                                          return statusObj?.label || (voucher.status === 'draft' ? 'Nháp' : voucher.status === 'posted' ? 'Đã chi' : voucher.status === 'cancelled' ? 'Đã hủy' : voucher.status)
                                        })()}
                                      </span>
                                    </TableCell>
                                    {/* <TableCell>
                                      {voucher.voucherType === 'payment_out' ? 'Phiếu chi' : voucher.voucherType}
                                    </TableCell> */}
                                    {/* <TableCell>
                                      {voucher.createdByUser?.fullName || '—'}
                                    </TableCell> */}
                                    <TableCell>{dateFormat(voucher.paymentDate, true)}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-col">
                                        <span className="font-medium text-[13px]">{voucher.creator?.fullName || '—'}</span>
                                        <span className="text-muted-foreground text-xs">{dateFormat(voucher.createdAt, true)}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>

                                      {['draft', 'cancelled'].includes(voucher.status) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setPaymentToDelete(voucher)
                                            setShowDeletePaymentDialog(true)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {purchaseOrder.paymentVouchers.map((voucher) => (
                              <div key={voucher.id} className="space-y-2 rounded-lg border p-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <strong>Mã phiếu:</strong>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                      onClick={() => {
                                        setSelectedPaymentDetail(voucher)
                                        setShowPaymentDetail(true)
                                      }}
                                    >
                                      {voucher.voucherCode || voucher.code}
                                    </span>

                                    {['draft', 'cancelled'].includes(voucher.status) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10 -mr-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setPaymentToDelete(voucher)
                                          setShowDeletePaymentDialog(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <strong>Số tiền:</strong>
                                  <span className="font-semibold">{moneyFormat(voucher.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <strong>PT thanh toán:</strong>
                                  <span>
                                    {voucher.paymentMethod === 'cash' ? 'Tiền mặt' : voucher.paymentMethod === 'transfer' ? 'Chuyển khoản' : voucher.paymentMethod}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <strong>Trạng thái:</strong>
                                  <div className='flex items-center justify-end'>
                                    {/* Note: Update status logic not fully implemented in ViewPurchaseOrderDialog for Payment Vouchers directly, 
                                         usually done via ViewPaymentDialog. Showing status as badge/select for consistency. 
                                         Using Select but disabled or just display for now to match UI unless we implement handleUpdatePaymentStatus 
                                     */}
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getReceiptStatusColor(voucher.status)} cursor-pointer hover:opacity-80`}
                                      onClick={() => {
                                        setSelectedPaymentForUpdate(voucher)
                                        setShowUpdatePaymentStatus(true)
                                      }}
                                      title="Bấm để cập nhật trạng thái"
                                    >
                                      {(() => {
                                        const statusObj = paymentStatus.find(s => s.value === voucher.status)
                                        return statusObj?.icon ? <statusObj.icon className="h-3 w-3" /> : (voucher.status === 'draft' ? <IconPencil className="h-3 w-3" /> : (voucher.status === 'completed' ? <IconCheck className="h-3 w-3" /> : null))
                                      })()}
                                      {(() => {
                                        const statusObj = paymentStatus.find(s => s.value === voucher.status)
                                        return statusObj?.label || (voucher.status === 'draft' ? 'Nháp' : voucher.status === 'completed' ? 'Đã chi' : voucher.status === 'cancelled' ? 'Đã hủy' : voucher.status)
                                      })()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <strong>Ngày chi:</strong>
                                  <span>{dateFormat(voucher.paymentDate, true)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <strong>Người lập / Ngày tạo:</strong>
                                  <div className="flex flex-col text-right">
                                    <span className="font-medium">{voucher.creator?.fullName || '—'}</span>
                                    <span className="text-muted-foreground">{dateFormat(voucher.createdAt, true)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center text-sm text-muted-foreground italic py-2">
                          Chưa có dữ liệu phiếu chi
                        </div>
                      )}
                    </div>
                  </>

                  {/* WAREHOUSE RECEIPTS SECTION */}
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Phiếu nhập kho</h3>
                        {!['pending', 'received', 'cancelled'].includes(purchaseOrder?.status) && (
                          <Button
                            size="sm"
                            className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                            onClick={handleCreateImport}
                          >
                            <IconPlus className="h-4 w-4" />
                            <span>
                              Thêm
                            </span>
                          </Button>
                        )}
                      </div>

                      {purchaseOrder?.warehouseReceipts && purchaseOrder.warehouseReceipts.length > 0 ? (
                        isDesktop ? (
                          <div className="overflow-x-auto rounded-lg border">
                            <Table className="min-w-full">
                              <TableHeader>
                                <TableRow className="bg-secondary text-xs">
                                  <TableHead className="w-12">STT</TableHead>
                                  <TableHead className="min-w-32">Mã phiếu</TableHead>
                                  <TableHead className="min-w-32">Loại phiếu</TableHead>
                                  <TableHead className="min-w-32">Trạng thái</TableHead>
                                  <TableHead className="min-w-32 text-right">Tổng tiền</TableHead>
                                  <TableHead className="min-w-32">Ngày nhập TT</TableHead>
                                  <TableHead className="min-w-32">Ngày tạo</TableHead>
                                  <TableHead className="min-w-28">Người tạo</TableHead>
                                  <TableHead className="w-10"></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {purchaseOrder.warehouseReceipts.map((receipt, index) => (
                                  <TableRow key={receipt.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>
                                      <span
                                        className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                        onClick={() => {
                                          setSelectedReceiptDetail(receipt)
                                          setShowWarehouseReceiptDetail(true)
                                        }}
                                      >
                                        {receipt.code}
                                      </span>
                                    </TableCell>
                                    <TableCell>
                                      {receipt.receiptType === 1 ? 'Nhập kho' : receipt.receiptType}
                                    </TableCell>
                                    <TableCell>
                                      <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status)} cursor-pointer hover:opacity-80`}
                                        onClick={() => {
                                          setSelectedWarehouseReceiptForUpdate(receipt)
                                          setShowUpdateWarehouseReceiptStatus(true)
                                        }}
                                        title="Bấm để cập nhật trạng thái"
                                      >
                                        {receipt.status === 'draft' ? <IconPencil className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCheck className="h-3 w-3" /> : null)}
                                        {receipt.status === 'draft'
                                          ? 'Nháp'
                                          : receipt.status === 'posted'
                                            ? 'Đã ghi sổ'
                                            : receipt.status === 'cancelled'
                                              ? 'Đã hủy'
                                              : receipt.status}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {moneyFormat(receipt.totalAmount)}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {receipt.actualReceiptDate ? dateFormat(receipt.actualReceiptDate, false) : '—'}
                                    </TableCell>
                                    <TableCell className="text-sm">{dateFormat(receipt.receiptDate, true)}</TableCell>
                                    <TableCell className="text-sm">
                                      {receipt.createdByUser?.fullName || '—'}
                                    </TableCell>
                                    <TableCell>
                                      {['draft', 'cancelled'].includes(receipt.status) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setWarehouseReceiptToDelete(receipt)
                                            setShowDeleteWarehouseReceiptDialog(true)
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {purchaseOrder.warehouseReceipts.map((receipt) => (
                              <div key={receipt.id} className="space-y-2 rounded-lg border p-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <strong>Mã phiếu:</strong>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                      onClick={() => {
                                        setSelectedReceiptDetail(receipt)
                                        setShowWarehouseReceiptDetail(true)
                                      }}
                                    >
                                      {receipt.code}
                                    </span>
                                    {['draft', 'cancelled'].includes(receipt.status) && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10 -mr-2"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setWarehouseReceiptToDelete(receipt)
                                          setShowDeleteWarehouseReceiptDialog(true)
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <strong>Loại phiếu:</strong>
                                  <span>{receipt.receiptType === 1 ? 'Nhập kho' : receipt.receiptType}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <strong>Trạng thái:</strong>
                                  <div className='flex items-center justify-end'>
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status)} cursor-pointer hover:opacity-80`}
                                      onClick={() => {
                                        setSelectedWarehouseReceiptForUpdate(receipt)
                                        setShowUpdateWarehouseReceiptStatus(true)
                                      }}
                                      title="Bấm để cập nhật trạng thái"
                                    >
                                      {receipt.status === 'draft' ? <IconPencil className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCheck className="h-3 w-3" /> : null)}
                                      {receipt.status === 'draft'
                                        ? 'Nháp'
                                        : receipt.status === 'posted'
                                          ? 'Đã ghi sổ'
                                          : receipt.status === 'cancelled'
                                            ? 'Đã hủy'
                                            : receipt.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between">
                                  <strong>Tổng tiền:</strong>
                                  <span className="font-bold text-primary">{moneyFormat(receipt.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <strong>Ngày tạo:</strong>
                                  <span>{dateFormat(receipt.receiptDate, true)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="text-center text-sm text-muted-foreground italic py-2">
                          Chưa có dữ liệu phiếu nhập kho
                        </div>
                      )}
                    </div>
                  </>

                </div>
              </div>

              {/* SIDEBAR (Right) */}
              <div className={cn(
                "rounded-lg border p-4 bg-card",
                isDesktop ? "w-72 sticky top-0 h-fit" : "w-full"
              )}>
                {/* SUPPLIER / CUSTOMER INFO */}
                {(() => {
                  const party = purchaseOrder?.supplier || purchaseOrder?.customer
                  const isCustomer = !purchaseOrder?.supplier && !!purchaseOrder?.customer
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <h2 className={cn("py-2 font-semibold", isDesktop ? "text-lg" : "text-base")}>
                          {isCustomer ? 'Khách hàng' : 'Nhà cung cấp'}
                        </h2>
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-xs font-semibold',
                          isCustomer ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        )}>
                          {isCustomer ? 'KH' : 'NCC'}
                        </span>
                      </div>

                      <div className={cn(isDesktop ? "space-y-6" : "space-y-4")}>
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${party?.supplierName || party?.name}`}
                              alt={party?.supplierName || party?.name}
                            />
                            <AvatarFallback>{isCustomer ? 'KH' : 'NCC'}</AvatarFallback>
                          </Avatar>
                          <div>
                            {isCustomer ? (
                              <div className="font-medium">
                                <div>{party?.name}</div>
                                {party?.code && <div className="text-xs text-muted-foreground">{party.code}</div>}
                              </div>
                            ) : (
                              <div
                                className="font-medium cursor-pointer text-primary hover:underline"
                                onClick={() => setShowSupplierDetail(true)}
                              >
                                {party?.supplierName || party?.name}
                                {(party?.supplierCode || party?.code) && (
                                  <div className="text-xs text-muted-foreground">
                                    {party.supplierCode || party.code}
                                  </div>
                                )}
                              </div>
                            )}
                            {showSupplierDetail && purchaseOrder?.supplier && (
                              <ViewSupplierDialog
                                open={showSupplierDetail}
                                onOpenChange={setShowSupplierDetail}
                                supplierId={purchaseOrder?.supplier?.id}
                                showTrigger={false}
                                contentClassName="z-[100050]"
                                overlayClassName="z-[100049]"
                              />
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-medium">Thông tin liên hệ</div>
                          </div>
                          <div className="mt-4 space-y-2 text-sm">
                            {party?.contactName && (
                              <div className="flex items-center text-muted-foreground">
                                <div className="mr-2 h-4 w-4">
                                  <User className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-foreground">
                                  Liên hệ: {party.contactName}
                                </span>
                              </div>
                            )}
                            <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${party?.phone}`}>
                                {party?.phone || 'Chưa cập nhật'}
                              </a>
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${party?.email}`}>
                                {party?.email || 'Chưa cập nhật'}
                              </a>
                            </div>
                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {party?.address || 'Chưa cập nhật'}
                            </div>
                            {isCustomer && party?.identityCard && (
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <CreditCard className="h-3 w-3 shrink-0" />
                                {party.identityCard}
                              </div>
                            )}
                            {!isCustomer && party?.taxCode && (
                              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                                <Receipt className="h-3 w-3 shrink-0" />
                                {party.taxCode}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}

                <Separator className="my-4" />

                {/* CREATOR INFO */}
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    Người lập đơn
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${purchaseOrder?.creator?.fullName || purchaseOrder?.createdByUser?.fullName}`}
                        alt={purchaseOrder?.creator?.fullName || purchaseOrder?.createdByUser?.fullName}
                      />
                      <AvatarFallback>{(purchaseOrder?.creator?.fullName || purchaseOrder?.createdByUser?.fullName)?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {purchaseOrder?.creator?.fullName || purchaseOrder?.createdByUser?.fullName}
                        {(purchaseOrder?.creator?.employeeCode || purchaseOrder?.createdByUser?.code) && ` (${purchaseOrder?.creator?.employeeCode || purchaseOrder?.createdByUser?.code})`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateFormat(purchaseOrder?.createdAt, true)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">Thông tin nhân viên</div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <MobileIcon className="h-4 w-4" />
                        </div>
                        <a href={`tel:${purchaseOrder?.creator?.phone || purchaseOrder?.createdByUser?.phone}`}>
                          {purchaseOrder?.creator?.phone || purchaseOrder?.createdByUser?.phone || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <Mail className="h-4 w-4" />
                        </div>
                        <a href={`mailto:${purchaseOrder?.creator?.email || purchaseOrder?.createdByUser?.email}`}>
                          {purchaseOrder?.creator?.email || purchaseOrder?.createdByUser?.email || 'Chưa cập nhật'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {purchaseOrder.updatedByUser && (
                  <div>
                    <Separator className="my-4" />
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-medium">Người cập nhật</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${purchaseOrder?.updatedByUser?.fullName}`}
                          alt={purchaseOrder?.updatedByUser?.fullName}
                        />
                        <AvatarFallback>UP</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {purchaseOrder?.updatedByUser?.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dateFormat(purchaseOrder?.updatedAt, true)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Không tìm thấy dữ liệu đơn hàng</p>
          )}
        </div>

        <DialogFooter className={cn(
          "hidden md:flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2 !space-x-0"
        )}>
          {purchaseOrder && (
            <>
              {(!['pending', 'cancelled'].includes(purchaseOrder.status) && purchaseOrder.paymentStatus !== 'paid') && (
                <Button
                  size="sm"
                  className="gap-2 bg-green-600 text-white hover:bg-green-700"
                  onClick={handleCreatePayment}
                >
                  <CreditCard className="h-4 w-4" />
                  Tạo Phiếu Chi
                </Button>
              )}

              {['approved'].includes(purchaseOrder.status) && (
                <Button
                  size="sm"
                  className="gap-2 bg-blue-600 text-white hover:bg-blue-700"
                  onClick={handleCreateImport}
                >
                  <PackagePlus className="h-4 w-4" />
                  Tạo Phiếu Nhập Kho
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                className="gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                onClick={handlePrintOrder}
              >
                <Printer className="h-4 w-4" />
                In Đơn Hàng
              </Button>

              {purchaseOrder.status === 'draft' && (
                <Button
                  size="sm"
                  className="gap-2 bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => onEdit?.()}
                >
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Button>
              )}

              {['draft', 'cancelled'].includes(purchaseOrder.status) && (
                <ConfirmActionButton
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa đơn mua hàng này?"
                  confirmText="Xóa"
                  onConfirm={handleDeletePurchaseOrder}
                  contentClassName="z-[100020]"
                  overlayClassName="z-[100019]"
                  confirmBtnVariant="destructive"
                >
                  <Button variant="destructive" size="sm" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </Button>
                </ConfirmActionButton>
              )}
            </>
          )}

          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>

        <MobilePurchaseOrderActions
          purchaseOrder={purchaseOrder}
          isDesktop={isDesktop}
          canDelete={['draft', 'cancelled'].includes(purchaseOrder?.status)}
          onEdit={() => onEdit?.()}
          handleCreatePayment={handleCreatePayment}
          handleCreateImport={handleCreateImport}
          handlePrintOrder={handlePrintOrder}
          handleDeletePurchaseOrder={handleDeletePurchaseOrder}
        />
      </DialogContent>

      {/* Confirm Import Dialog */}
      {showConfirmImportDialog && (
        <ConfirmImportWarehouseDialog
          open={showConfirmImportDialog}
          onOpenChange={setShowConfirmImportDialog}
          purchaseOrderId={purchaseOrder.id}
          onConfirm={handleCreateWarehouseReceipt}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {/* View Warehouse Receipt Detail Dialog */}
      {showWarehouseReceiptDetail && (
        <ViewWarehouseReceiptDialog
          open={showWarehouseReceiptDetail}
          onOpenChange={setShowWarehouseReceiptDetail}
          receiptId={selectedReceiptDetail?.id}
          contentClassName="z-[100030]"
          overlayClassName="z-[100029]"
          onSuccess={() => {
            fetchData()
            onRefresh?.()
          }}
        />
      )}

      {/* View Payment Detail Dialog */}
      {showPaymentDetail && (
        <ViewPaymentDialog
          open={showPaymentDetail}
          onOpenChange={setShowPaymentDetail}
          paymentId={selectedPaymentDetail?.id}

          contentClassName="z-[100030]"
          overlayClassName="z-[100029]"
          onSuccess={() => {
            fetchData()
            onRefresh?.()
          }}
        />
      )}

      {/* Create Payment Dialog */}
      {showCreatePaymentDialog && (
        <PaymentFormDialog
          open={showCreatePaymentDialog}
          onOpenChange={setShowCreatePaymentDialog}
          purchaseOrder={purchaseOrder}
          onSuccess={() => {
            fetchData()
            onRefresh?.()
          }}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {/* Edit Payment Dialog */}
      {selectedPaymentForEdit && (
        <PaymentFormDialog
          open={!!selectedPaymentForEdit}
          onOpenChange={(open) => !open && setSelectedPaymentForEdit(null)}
          paymentId={selectedPaymentForEdit.id}
          onSuccess={() => {
            fetchData()
            onRefresh?.()
          }}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}



      {/* Update Purchase Order Status Dialog */}
      {showUpdateStatusDialog && (
        <UpdatePurchaseOrderStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={(value) => {
            if (!value) {
              setShowUpdateStatusDialog(false)
            }
          }}
          purchaseOrderId={purchaseOrder.id}
          currentStatus={purchaseOrder.status}
          statuses={purchaseOrderStatuses}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
          selectContentClassName="z-[100050]"
        />
      )}

      {/* View Product Dialog */}
      {showViewProductDialog && (
        <ViewProductDialog
          open={showViewProductDialog}
          onOpenChange={setShowViewProductDialog}
          productId={selectedProductId}
          showTrigger={false}
          contentClassName="z-[100021]"
          overlayClassName="z-[100020]"
        />
      )}
      {/* Update Payment Status Dialog */}
      {selectedPaymentForUpdate && (
        <UpdatePaymentStatusDialog
          open={showUpdatePaymentStatus}
          onOpenChange={setShowUpdatePaymentStatus}
          paymentId={selectedPaymentForUpdate.code || selectedPaymentForUpdate.id}
          currentStatus={selectedPaymentForUpdate.status}
          statuses={paymentStatus}
          onSubmit={(status) => handleUpdatePaymentStatus(status, selectedPaymentForUpdate.id)}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
          selectContentClassName="z-[100050]"
        />
      )}

      {/* Delete Payment Dialog */}
      {paymentToDelete && (
        <DeletePaymentDialog
          open={showDeletePaymentDialog}
          onOpenChange={setShowDeletePaymentDialog}
          payment={paymentToDelete}
          showTrigger={false}
          onSuccess={() => {
            setShowDeletePaymentDialog(false)
            fetchData()
            onRefresh?.()
          }}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {/* Update Warehouse Receipt Status Dialog */}
      {selectedWarehouseReceiptForUpdate && (
        <UpdateWarehouseReceiptStatusDialog
          open={showUpdateWarehouseReceiptStatus}
          onOpenChange={setShowUpdateWarehouseReceiptStatus}
          receiptId={selectedWarehouseReceiptForUpdate.id}
          receiptCode={selectedWarehouseReceiptForUpdate.code}
          currentStatus={selectedWarehouseReceiptForUpdate.status}
          statuses={warehouseReceiptStatuses}
          onSubmit={handleUpdateWarehouseReceiptStatus}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
          selectContentClassName="z-[100050]"
        />
      )}

      {/* Delete Warehouse Receipt Dialog */}
      {warehouseReceiptToDelete && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteWarehouseReceiptDialog}
          onOpenChange={setShowDeleteWarehouseReceiptDialog}
          receipt={warehouseReceiptToDelete}
          showTrigger={false}
          onSuccess={() => {
            setShowDeleteWarehouseReceiptDialog(false)
            fetchData()
            onRefresh?.()
          }}
          contentClassName="z-[100020]"
          overlayClassName="z-[100019]"
        />
      )}

      {/* Print Order Preview */}
      {showPrintOrder && purchaseOrder && (
        <>
          <PrintPurchaseOrderView
            purchaseOrder={purchaseOrder}
            setting={setting}
            onAfterPrint={() => setShowPrintOrder(false)}
          />
        </>
      )}
    </Dialog>
  )
}

export default ViewPurchaseOrderDialog
