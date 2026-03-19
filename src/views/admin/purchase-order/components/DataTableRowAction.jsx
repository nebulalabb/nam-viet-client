import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconCircleX,
  IconFileTypePdf,
  IconPackageImport,
  IconCreditCard,
  IconCheck,
  IconPackage,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeletePurchaseOrderDialog from './DeletePurchaseOrderDialog'
import PurchaseOrderDialog from './PurchaseOrderDialog'


import UpdatePurchaseOrderStatusDialog from './UpdatePurchaseOrderStatusDialog'
import { useDispatch, useSelector } from 'react-redux'
import {
  updatePurchaseOrderStatus,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
  revertPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderDetail,
} from '@/stores/PurchaseOrderSlice'
import { createWarehouseReceipt, postWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { purchaseOrderStatuses } from '../data'
import { toast } from 'sonner'
import ConfirmImportWarehouseDialog from '../../warehouse-receipt/components/ConfirmImportWarehouseDialog'
import PaymentFormDialog from '../../payment/components/PaymentDialog'
import PrintPurchaseOrderView from './PrintPurchaseOrderView'

const DataTableRowActions = ({ row, table }) => {
  const purchaseOrder = row?.original || {}
  const setting = useSelector((state) => state.setting.setting)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  // const [showViewDialog, setShowViewDialog] = useState(false) // Moved to parent

  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)


  // New States
  const [showImportWarehouseDialog, setShowImportWarehouseDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showPrintOrder, setShowPrintOrder] = useState(false)
  const [fullPurchaseOrder, setFullPurchaseOrder] = useState(null)
  const [isOpeningPayment, setIsOpeningPayment] = useState(false)

  const dispatch = useDispatch()

  const handleUpdateStatus = async (status, id) => {
    try {
      if (status === 'ordered') {
        await dispatch(confirmPurchaseOrder(id)).unwrap()
      } else if (status === 'cancelled') {
        await dispatch(cancelPurchaseOrder(id)).unwrap()
      } else if (status === 'draft' && purchaseOrder.status === 'ordered') {
        await dispatch(revertPurchaseOrder(id)).unwrap()
      } else {
        // Fallback for other status updates if any
        await dispatch(updatePurchaseOrderStatus({ id, status })).unwrap()
      }
      setShowUpdateStatusDialog(false)
    } catch (error) {
      // Error handled in slice/toast
    }
  }





  const handleCreateWarehouseReceipt = async (selectedItems) => {
    // Construct payload
    const payload = {
      // code: `NK-${purchaseOrder.code}-${Date.now().toString().slice(-4)}`,
      receiptType: 1, // IMPORT / RECEIPT
      businessType: 'purchase_in',

      reason: `Nhập kho từ đơn mua hàng ${purchaseOrder.poCode}`,
      notes: purchaseOrder.notes || '',
      warehouseId: null,
      supplierId: purchaseOrder.supplierId,
      purchaseOrderId: purchaseOrder.id,
      details: selectedItems.map(item => ({
        productId: item.productId || item.product?.id,
        unitId: item.unitId || item.unit?.id,
        movement: 'in',
        qtyActual: item.quantity,
        unitPrice: item.unitPrice || 0,
        content: `Nhập kho theo đơn mua ${purchaseOrder.poCode}`,
        purchaseOrderId: purchaseOrder.id,
        purchaseOrderItemId: item.id
      }))
    }

    try {
      await dispatch(createWarehouseReceipt(payload)).unwrap()
      // Refresh list
      await dispatch(getPurchaseOrders({})).unwrap()
    } catch (error) {
      console.error(error)
      // Error handled in slice typically or toast here if needed
    }
  }

  const handlePostWarehouseReceipt = async () => {
    const warehouseReceiptId = purchaseOrder?.warehouseReceiptId
    if (!warehouseReceiptId) {
      toast.warning('Không tìm thấy phiếu nhập kho')
      return
    }

    try {
      await dispatch(postWarehouseReceipt(warehouseReceiptId)).unwrap()
      // Refresh list to update status
      // We might need to refresh purchase orders to see the new status if backend updates PO too
      // (Usually posting receipt updates receipt status, PO might track it via relation)
      // Refreshing PO list just in case
      await dispatch(getPurchaseOrders({})).unwrap() // Assuming generic fetch works or pass filters if needed
    } catch (error) {
      console.error('Post warehouse receipt error:', error)
    }
  }

  const canEdit = purchaseOrder?.status === 'pending'
  const canDelete = ['pending', 'cancelled', 'canceled'].includes(purchaseOrder?.status)
  const canCancel = !['pending', 'cancelled', 'completed'].includes(purchaseOrder?.status)

  const canImportWarehouse = ['approved', 'confirmed', 'partial'].includes(purchaseOrder?.status) && !purchaseOrder?.warehouseReceiptId
  const canPayment = !['pending', 'cancelled'].includes(purchaseOrder?.status) && purchaseOrder.paymentStatus !== 'paid'

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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <Can permission="GET_PURCHASE_ORDER">
            <DropdownMenuItem
              onClick={() => table.options.meta?.onView?.(purchaseOrder.id)}
              className="text-slate-600"
            >
              Xem
              <DropdownMenuShortcut>
                <IconEye className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowPrintOrder(true)} className="text-purple-600">
            In đơn hàng
            <DropdownMenuShortcut>
              <IconFileTypePdf className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>



          <DropdownMenuSeparator />

          {canImportWarehouse && (
            <Can permission="CREATE_WAREHOUSE_IMPORT">
              <DropdownMenuItem onClick={() => setShowImportWarehouseDialog(true)} className="text-orange-600">
                Tạo phiếu nhập
                <DropdownMenuShortcut>
                  <IconPackageImport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {canPayment && (
            <Can permission="CREATE_PAYMENT">
              <DropdownMenuItem onClick={handleShowPaymentDialog} disabled={isOpeningPayment} className="text-emerald-600">
                Tạo phiếu chi
                <DropdownMenuShortcut>
                  <IconCreditCard className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {canEdit && (
            <Can permission="UPDATE_PURCHASE_ORDER">
              <DropdownMenuItem onClick={() => setShowUpdateDialog(true)} className="text-amber-500 focus:text-amber-600 hover:text-amber-600 focus:bg-amber-50">
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* {canCancel && (
            <Can permission="UPDATE_PURCHASE_ORDER">
              <DropdownMenuItem onClick={() => setShowUpdateStatusDialog(true)} className="text-red-600">
                Hủy
                <DropdownMenuShortcut>
                  <IconCircleX className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )} */}

          {canDelete && (
            <Can permission="DELETE_PURCHASE_ORDER">
              <DropdownMenuItem onSelect={() => setShowDeleteDialog(true)} className="text-red-600">
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {/* Ghi Sổ Kho - Chỉ hiển thị khi có phiếu kho DRAFT */}
          {purchaseOrder?.warehouseReceipt?.status === 'DRAFT' && (
            <Can permission="CREATE_WAREHOUSE_IMPORT">
              <DropdownMenuItem
                onClick={handlePostWarehouseReceipt}
                className="text-orange-600"
              >
                Ghi Sổ Kho
                <DropdownMenuShortcut>
                  <IconCheck className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Xem Phiếu Kho - Hiển thị khi đã có phiếu kho */}
          {purchaseOrder?.warehouseReceiptId && (
            <DropdownMenuItem
              onClick={() => {
                // TODO: Navigate or show dialog. For now toast like invoice
                toast.info(`Phiếu kho: ${purchaseOrder?.warehouseReceipt?.code || purchaseOrder?.warehouseReceiptId}`)
              }}
              className="text-orange-600"
            >
              Xem Phiếu Kho
              <DropdownMenuShortcut>
                <IconPackage className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogs */}
      {showDeleteDialog && (
        <DeletePurchaseOrderDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          purchaseOrder={purchaseOrder}
          showTrigger={false}
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



      {showUpdateStatusDialog && (
        <UpdatePurchaseOrderStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={setShowUpdateStatusDialog}
          purchaseOrderId={purchaseOrder.id}
          currentStatus={purchaseOrder.status}
          statuses={purchaseOrderStatuses}
          onSubmit={handleUpdateStatus}
        />
      )}

      {/* New Dialogs */}


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
    </>
  )
}

export { DataTableRowActions }
