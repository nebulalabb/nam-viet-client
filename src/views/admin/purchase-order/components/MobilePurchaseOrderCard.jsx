
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { ChevronDown, MoreVertical, Phone } from 'lucide-react'
import {
  IconFileTypePdf,
  IconPackageImport,
  IconCreditCard,
  IconCircleX,
  IconPencil,
  IconTrash,
  IconEye,
  IconFileText
} from '@tabler/icons-react'
import { useState, useMemo } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { purchaseOrderStatuses, purchaseOrderPaymentStatuses } from '../data'
import Can from '@/utils/can'
import DeletePurchaseOrderDialog from './DeletePurchaseOrderDialog'
import PurchaseOrderDialog from './PurchaseOrderDialog'
import ViewPurchaseOrderDialog from './ViewPurchaseOrderDialog'
import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import { useDispatch, useSelector } from 'react-redux'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderDetail
} from '@/stores/PurchaseOrderSlice'
import { toast } from 'sonner'
import PrintPurchaseOrderView from './PrintPurchaseOrderView'
import ConfirmImportWarehouseDialog from '../../warehouse-receipt/components/ConfirmImportWarehouseDialog'
import PaymentFormDialog from '../../payment/components/PaymentDialog'
import { createWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'

const MobilePurchaseOrderCard = ({
  purchaseOrder,
  isSelected,
  onSelectChange,
  onRowAction,
}) => {
  const dispatch = useDispatch()
  const setting = useSelector((state) => state.setting.setting)

  const filteredStatuses = useMemo(
    () => purchaseOrderStatuses.filter((s) => s.value !== 'completed'),
    []
  )

  const [expanded, setExpanded] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  // Print states
  const [showPrintOrder, setShowPrintOrder] = useState(false)

  const [fullPurchaseOrder, setFullPurchaseOrder] = useState(null)
  const [isOpeningPayment, setIsOpeningPayment] = useState(false)

  // Action states
  const [showImportWarehouseDialog, setShowImportWarehouseDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)

  const { supplier, totalAmount, paidAmount, status, paymentStatus, code, orderDate, items } = purchaseOrder



  const getPaymentStatusBadge = (paymentStatusValue) => {
    const paymentStatusObj = purchaseOrderPaymentStatuses.find(
      (s) => s.value === paymentStatusValue
    )
    return (
      <Badge variant="outline" className={`${paymentStatusObj?.color} border-0`}>
        <span className="mr-1 inline-flex h-3 w-3 items-center justify-center">
          {paymentStatusObj?.icon ? (
            <paymentStatusObj.icon className="h-3 w-3" />
          ) : null}
        </span>
        {paymentStatusObj?.label || 'Không xác định'}
      </Badge>
    )
  }

  const getDebtStatus = (order) => {
    const pStatus = order?.paymentStatus
    const tAmount = parseFloat(order?.totalAmount || 0)
    const pAmount = parseFloat(order?.paidAmount || 0)
    const remainingAmount = tAmount - pAmount

    if (pStatus === 'paid' || remainingAmount <= 0) {
      return <span className="text-xs text-green-500 font-medium">✓ Thanh toán toàn bộ</span>
    }

    if (pAmount > 0 && remainingAmount > 0) {
      return (
        <span className="text-xs text-yellow-600 font-medium">
          Còn nợ: {moneyFormat(remainingAmount)}
        </span>
      )
    }

    if (pAmount === 0) {
      return (
        <span className="text-xs text-red-500 font-medium">
          Còn nợ: {moneyFormat(remainingAmount)}
        </span>
      )
    }

    return <span className="text-xs text-muted-foreground">Chưa thanh toán</span>
  }

  const selectedStatusObj = purchaseOrderStatuses.find((s) => s.value === status)

  const handleStatusChange = async (nextStatus) => {
    try {
      if (nextStatus === 'ordered') {
        await dispatch(confirmPurchaseOrder(purchaseOrder.id)).unwrap()
      } else if (nextStatus === 'cancelled') {
        await dispatch(cancelPurchaseOrder(purchaseOrder.id)).unwrap()
      } else if (nextStatus === 'draft' && purchaseOrder.status === 'ordered') {
        await dispatch(revertPurchaseOrder(purchaseOrder.id)).unwrap()
      } else {
        await dispatch(
          updatePurchaseOrderStatus({ id: purchaseOrder.id, status: nextStatus }),
        ).unwrap()
      }
      toast.success('Cập nhật trạng thái đơn đặt hàng thành công')
      setShowUpdateStatusDialog(false)
    } catch (error) {
      console.log('Update status error:', error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }


  const handleCreateWarehouseReceipt = async (selectedItems) => {
    const payload = {
      // code: `NK-${purchaseOrder.code}-${Date.now().toString().slice(-4)}`,
      receiptType: 1, // IMPORT / RECEIPT
      businessType: 'purchase_in',

      reason: `Nhập kho từ đơn mua hàng ${purchaseOrder.code}`,
      note: purchaseOrder.note || '',
      warehouseId: null,
      supplierId: purchaseOrder.supplierId,
      purchaseOrderId: purchaseOrder.id,
      details: selectedItems.map(item => ({
        productId: item.productId || item.product?.id,
        unitId: item.unitId || item.unit?.id,
        movement: 'in',
        qtyActual: item.quantity,
        unitPrice: item.unitPrice || 0,
        content: `Nhập kho theo đơn mua ${purchaseOrder.code}`,
        purchaseOrderId: purchaseOrder.id,
        purchaseOrderItemId: item.id
      }))
    }

    try {
      await dispatch(createWarehouseReceipt(payload)).unwrap()
    } catch (error) {
      console.error(error)
    }
  }

  const canEdit = purchaseOrder?.status === 'draft'
  const canDelete = purchaseOrder?.status === 'draft'
  const canCancel = !['draft', 'cancelled', 'completed'].includes(purchaseOrder?.status)
  const canImportWarehouse = ['ordered', 'confirmed', 'partial'].includes(purchaseOrder?.status)
  const canPayment = !['draft', 'cancelled'].includes(purchaseOrder?.status) && purchaseOrder.paymentStatus !== 'paid'

  const handleShowPaymentDialog = async () => {
    try {
      setIsOpeningPayment(true)
      const poDetails = await dispatch(getPurchaseOrderDetail(purchaseOrder.id)).unwrap()

      const totalAmount = parseFloat(poDetails?.totalAmount || 0)
      const paidAmount = parseFloat(poDetails?.paidAmount || 0)
      const pendingAmount = (poDetails?.paymentVouchers || poDetails?.payments || [])
        .filter(p => p.status === 'pending' || p.status === 'draft')
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

      const remainingAmount = Math.max(0, totalAmount - paidAmount - pendingAmount)

      if (remainingAmount <= 0) {
        toast.error('Đơn hàng đã thanh toán đủ hoặc đang có phiếu chi nháp/chờ duyệt chờ xử lý hết số nợ.')
        setIsOpeningPayment(false)
        return
      }

      setFullPurchaseOrder(poDetails)
      setShowPaymentDialog(true)
    } catch (error) {
      console.error('Lỗi khi lấy thông tin đơn hàng', error)
      toast.error('Không thể lấy thông tin chi tiết đơn hàng')
    } finally {
      setIsOpeningPayment(false)
    }
  }

  return (
    <>
      {/* Dialogs */}
      {showViewDialog && (
        <ViewPurchaseOrderDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          purchaseOrderId={purchaseOrder.id}
          showTrigger={false}
          onEdit={() => {
            setShowViewDialog(false)
            setTimeout(() => setShowUpdateDialog(true), 100)
          }}
        />
      )}

      {showUpdateDialog && (
        <PurchaseOrderDialog
          open={showUpdateDialog}
          onOpenChange={setShowUpdateDialog}
          purchaseOrderId={purchaseOrder.id}
          showTrigger={false}
        />
      )}

      {showDeleteDialog && (
        <DeletePurchaseOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          purchaseOrder={purchaseOrder}
          showTrigger={false}
        />
      )}

      {showUpdateStatusDialog && (
        <UpdatePurchaseOrderStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          purchaseOrderId={purchaseOrder.id}
          currentStatus={status}
          statuses={purchaseOrderStatuses}
          onSubmit={handleStatusChange}
        />
      )}

      {showImportWarehouseDialog && (
        <ConfirmImportWarehouseDialog
          open={showImportWarehouseDialog}
          onOpenChange={setShowImportWarehouseDialog}
          purchaseOrderId={purchaseOrder.id}
          onConfirm={handleCreateWarehouseReceipt}
        />
      )}

      {showPaymentDialog && (
        <PaymentFormDialog
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          purchaseOrder={fullPurchaseOrder || purchaseOrder}
          showTrigger={false}
        />
      )}


      {showPrintOrder && (
        <PrintPurchaseOrderView
          purchaseOrder={purchaseOrder}
          setting={setting}
          onAfterPrint={() => setShowPrintOrder(false)}
        />
      )}

      <div className="border rounded-lg bg-card mb-3 overflow-hidden">
        {/* Header - Always Visible */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="h-4 w-4"
          />

          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-sm truncate text-primary cursor-pointer hover:underline"
              onClick={() => setShowViewDialog(true)}
            >
              {code}
            </div>
            <div className="text-xs text-muted-foreground">{dateFormat(orderDate)}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <Can permission="PURCHASE_ORDER_VIEW_ALL">
                <DropdownMenuItem onClick={() => setShowViewDialog(true)} className="text-slate-600">
                  <IconEye className="mr-2 h-4 w-4" />
                  Xem
                </DropdownMenuItem>
              </Can>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setShowPrintOrder(true)} className="text-purple-600">
                <IconFileTypePdf className="mr-2 h-4 w-4" />
                In đơn hàng
              </DropdownMenuItem>


              <DropdownMenuSeparator />

              {canImportWarehouse && (
                <Can permission="WAREHOUSE_IMPORT_CREATE">
                  <DropdownMenuItem onClick={() => setShowImportWarehouseDialog(true)} className="text-orange-600">
                    <IconPackageImport className="mr-2 h-4 w-4" />
                    Tạo phiếu nhập
                  </DropdownMenuItem>
                </Can>
              )}

              {canPayment && (
                <Can permission="PAYMENT_CREATE">
                  <DropdownMenuItem onClick={handleShowPaymentDialog} disabled={isOpeningPayment} className="text-emerald-600">
                    <IconCreditCard className="mr-2 h-4 w-4" />
                    Tạo phiếu chi
                  </DropdownMenuItem>
                </Can>
              )}

              <DropdownMenuSeparator />

              {canEdit && (
                <Can permission="PURCHASE_ORDER_UPDATE">
                  <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="text-blue-600">
                    <IconPencil className="mr-2 h-4 w-4" />
                    Sửa
                  </DropdownMenuItem>
                </Can>
              )}

              {canCancel && (
                <Can permission="PURCHASE_ORDER_CANCEL">
                  <DropdownMenuItem onClick={() => setShowUpdateStatusDialog(true)} className="text-red-600">
                    <IconCircleX className="mr-2 h-4 w-4" />
                    Hủy
                  </DropdownMenuItem>
                </Can>
              )}


              {canDelete && (
                <Can permission="PURCHASE_ORDER_DELETE">
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600"
                  >
                    <IconTrash className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </Can>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Supplier Section */}
        <div className="p-3 border-b bg-background/30 space-y-1.5">
          <div className="text-sm font-medium truncate">{supplier?.name}</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {supplier?.phone}
          </div>
          {supplier?.address && (
            <div className="text-xs text-muted-foreground px-1">
              {supplier?.address}
            </div>
          )}
        </div>

        {/* Amount Section */}
        <div className="p-3 border-b bg-background/30 space-y-1">
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Tổng tiền:</span>
            <span className="text-sm font-semibold text-primary">{moneyFormat(totalAmount)}</span>
          </div>
        </div>

        {/* Status & Debt Section */}
        <div className="p-3 border-b bg-background/30 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Trạng thái:</span>

            <div className="w-[140px]">
              <Select
                value={status}
                onValueChange={handleStatusChange}
                disabled={['cancelled', 'completed'].includes(status)}
              >
                <SelectTrigger className="h-7 text-xs px-2">
                  <SelectValue placeholder="Chọn trạng thái">
                    {selectedStatusObj ? (
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${selectedStatusObj.color || ''
                          }`}
                      >
                        {selectedStatusObj.icon ? (
                          <selectedStatusObj.icon className="h-3 w-3" />
                        ) : null}
                        {selectedStatusObj.label}
                      </span>
                    ) : null}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent position="popper" align="end" className="w-[140px] z-[10005]">
                  {filteredStatuses.map((s) => (
                    <SelectItem
                      key={s.value}
                      value={s.value}
                      className="cursor-pointer text-xs"
                    >
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${s.color || ''
                          }`}
                      >
                        {s.icon ? <s.icon className="h-3 w-3" /> : null}
                        {s.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Thanh toán:</span>
            {getPaymentStatusBadge(paymentStatus || 'unpaid')}
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs text-muted-foreground">Công nợ:</span>
            <div>{getDebtStatus(purchaseOrder)}</div>
          </div>
        </div>

        {/* Expanded Details - Items? Notes? */}
        {expanded && (
          <div className="p-3 bg-muted/30 space-y-2 border-t text-xs">
            {purchaseOrder.note && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span>{purchaseOrder.note}</span>
              </div>
            )}
            {/* Could list items summary here if needed */}
            <div className="text-muted-foreground text-center italic">
              {items?.length} sản phẩm
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MobilePurchaseOrderCard
