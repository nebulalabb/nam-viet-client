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
import { IconPencil, IconPlus, IconTrash, IconEye, IconPackageExport, IconTruck } from '@tabler/icons-react'
import { Printer } from 'lucide-react'
import Can from '@/utils/can'
import { useState } from 'react'
import DeleteInvoiceDialog from './DeleteInvoiceDialog'
import RejectInvoiceDialog from './RejectInvoiceDialog'
import InvoiceDialog from './InvoiceDialog'
import CreateCreditNoteDialog from './CreateCreditNoteDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import ReceiptDialog from '../../receipt/components/ReceiptDialog'
import CreateDeliveryDialog from '../../delivery/components/CreateDeliveryDialog'

import {
  createWarehouseReceipt,
} from '@/stores/WarehouseReceiptSlice'
import { getInvoiceDetail, getInvoices } from '@/stores/InvoiceSlice'
import {
  getEndOfCurrentMonth,
  getStartOfCurrentMonth,
} from '@/utils/date-format'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import PrintInvoiceView from './PrintInvoiceView'
const DataTableRowActions = ({ row, table }) => {
  const invoice = row?.original || {}
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.setting.loading)
  const setting = useSelector((state) => state.setting.setting)
  const [showDeleteInvoiceDialog, setShowDeleteInvoiceDialog] = useState(false)
  const [showRejectInvoiceDialog, setShowRejectInvoiceDialog] = useState(false)
  const [showUpdatePendingInvoiceDialog, setShowUpdatePendingInvoiceDialog] =
    useState(false)
  const [showCreateCreditNoteDialog, setShowCreateCreditNoteDialog] =
    useState(false)
  const [warehouseLoading, setWarehouseLoading] = useState(false)
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [showCreateDeliveryDialog, setShowCreateDeliveryDialog] = useState(false)

  // Print state
  const [printInvoice, setPrintInvoice] = useState(null)


  // ===== WAREHOUSE RECEIPT HANDLERS =====
  const handleCreateWarehouseReceipt = async () => {
    const invoiceStatus = invoice?.orderStatus
    if (invoiceStatus !== 'preparing') {
      toast.warning('Chỉ có thể tạo phiếu xuất kho cho đơn hàng đã duyệt')
      return
    }



    // Show confirmation dialog
    setShowConfirmWarehouseDialog(true)
  }

  const handleConfirmCreateWarehouseReceipt = async (selectedItems, actualReceiptDate, warehouseId, reason, notes) => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    try {
      setWarehouseLoading(true)

      const selectedDetails = selectedItems
        .map(item => ({
          productId: item.productId || item.id,
          unitId: item.unitId || item.unit?.id,
          quantity: Number(item.quantity),
          notes: item.notes || reason || `Xuất kho theo đơn bán ${invoice.orderCode}`,
          salesContractId: invoice.salesContractId,
          salesContractItemId: item.salesContractItemId
        }))

      if (selectedDetails.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      const payload = {
        receiptType: 2,
        businessType: 'sale_out',

        actualReceiptDate: actualReceiptDate || null,
        reason: reason || `Xuất kho cho đơn bán ${invoice.orderCode}`,
        notes: notes || invoice.notes || 'Xuất kho từ hóa đơn',
        warehouseId: parseInt(warehouseId),
        customerId: invoice.customerId,
        salesContractId: invoice.salesContractId,
        referenceType: 'invoice',
        referenceId: invoice.id,
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()

      toast.success('Đã tạo phiếu xuất kho thành công')

      await dispatch(
        getInvoices({
          fromDate: getStartOfCurrentMonth(),
          toDate: getEndOfCurrentMonth(),
        }),
      ).unwrap()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
    }
  }

  // ===== PRINT HANDLERS =====
  const handlePrintInvoice = async () => {
    const invoiceId = invoice?.id
    try {
      const data = await dispatch(getInvoiceDetail(invoiceId)).unwrap()
      setPrintInvoice(data)
      setTimeout(() => setPrintInvoice(null), 0)
    } catch (error) {
      console.log('Print invoice error: ', error)
      toast.error('Lỗi in hóa đơn')
    }
  }

  const handleCreateReceipt = () => {
    if (invoice?.paymentStatus === 'paid' || invoice?.orderStatus === 'cancelled') {
      toast.warning('Không thể tạo phiếu thu cho hóa đơn đã thanh toán hoặc bị hủy')
      return
    }
    setShowReceiptDialog(true)
  }


  const handleView = () => {
    if (table?.options?.meta?.onView) {
      table.options.meta.onView(invoice.id)
    }
  }

  return (
    <>
      {showDeleteInvoiceDialog && (
        <DeleteInvoiceDialog
          open={showDeleteInvoiceDialog}
          onOpenChange={setShowDeleteInvoiceDialog}
          invoice={row.original}
          showTrigger={false}
          onSuccess={() => {
            if (table.options.meta?.onDeleted) {
              table.options.meta.onDeleted()
            }
          }}
        />
      )}
      {showRejectInvoiceDialog && (
        <RejectInvoiceDialog
          open={showRejectInvoiceDialog}
          onOpenChange={setShowRejectInvoiceDialog}
          invoice={row.original}
          showTrigger={false}
        />
      )}

      {/* Confirm Warehouse Receipt Dialog */}
      {showConfirmWarehouseDialog && (
        <ConfirmWarehouseReceiptDialog
          open={showConfirmWarehouseDialog}
          onOpenChange={setShowConfirmWarehouseDialog}
          invoice={invoice}
          onConfirm={handleConfirmCreateWarehouseReceipt}
          loading={warehouseLoading}
        />
      )}

      {showReceiptDialog && (
        <ReceiptDialog
          invoiceId={invoice.id}
          open={showReceiptDialog}
          onOpenChange={setShowReceiptDialog}
          showTrigger={false}
          table={{ resetRowSelection: () => { } }} // Mock table object needed for dialog
          onSuccess={() => {
            setShowReceiptDialog(false)
            toast.success('Đã tạo phiếu thu thành công')
            dispatch(getInvoices({
              fromDate: getStartOfCurrentMonth(),
              toDate: getEndOfCurrentMonth(),
            }))
          }}
        />
      )}


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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={handleView}
            className="text-slate-600"
          >
            Xem
            <DropdownMenuShortcut>
              <IconEye className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          {row?.original?.orderStatus === 'pending' && (
            <Can permission="CREATE_INVOICE">
              <DropdownMenuItem
                onClick={() => setShowUpdatePendingInvoiceDialog(true)}
                className="text-amber-500 focus:text-amber-600 hover:text-amber-600 focus:bg-amber-50"
              >
                Sửa
                <DropdownMenuShortcut>
                  <IconPencil className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {/* In Hóa Đơn */}
          <DropdownMenuItem onClick={handlePrintInvoice} className="text-purple-600">
            In Hóa Đơn
            <DropdownMenuShortcut>
              <Printer className="h-4 w-4" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Tạo Phiếu Thu - Hiển thị khi đã duyệt hoặc đang giao, chưa thanh toán đủ */}
          {(invoice?.orderStatus === 'preparing' || invoice?.orderStatus === 'delivering') && invoice?.paymentStatus !== 'paid' && (
            <Can permission="CREATE_RECEIPT">
              <DropdownMenuItem onClick={handleCreateReceipt} className="text-emerald-600">
                Tạo Phiếu Thu
                <DropdownMenuShortcut>
                  <IconPlus className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Tạo Phiếu Xuất Kho - Chỉ hiển thị khi status = preparing (đã duyệt) */}
          {row?.original?.orderStatus === 'preparing' && (
            <Can permission="CREATE_WAREHOUSE_EXPORT">
              <DropdownMenuItem
                onClick={handleCreateWarehouseReceipt}
                disabled={warehouseLoading}
                className="text-orange-600"
              >
                Tạo Phiếu Xuất Kho
                <DropdownMenuShortcut>
                  <IconPackageExport className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {/* Giao hàng - Chỉ hiện cho đơn cần giao (isPickupOrder=false) và status = preparing */}
          {row?.original?.orderStatus === 'preparing' && !row?.original?.isPickupOrder && (
            <Can permission="CREATE_DELIVERY">
              <DropdownMenuItem
                onClick={() => setShowCreateDeliveryDialog(true)}
                className="text-blue-600"
              >
                Giao hàng
                <DropdownMenuShortcut>
                  <IconTruck className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          <DropdownMenuSeparator />

          {(row?.original?.orderStatus === 'pending' || row?.original?.orderStatus === 'cancelled') && (
            <Can permission="DELETE_INVOICE" permission2="DELETE_INVOICE_USER" isOwner={true} ownerId={row?.original?.createdById || row?.original?.creator?.id}>
              <DropdownMenuItem
                onSelect={() => setShowDeleteInvoiceDialog(true)}
                className="text-red-600"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {showUpdatePendingInvoiceDialog && (
        <InvoiceDialog
          open={showUpdatePendingInvoiceDialog}
          onOpenChange={setShowUpdatePendingInvoiceDialog}
          invoiceId={row.original.id}
          showTrigger={false}
        />
      )}

      {showCreateCreditNoteDialog && (
        <CreateCreditNoteDialog
          open={showCreateCreditNoteDialog}
          onOpenChange={setShowCreateCreditNoteDialog}
          showTrigger={false}
          originalInvoice={row.original}
          type={row.original.type}
        />
      )}

      {/* Print Invoice Dialog */}
      {printInvoice && setting && (
        <PrintInvoiceView invoice={printInvoice} setting={setting} />
      )}
      {showCreateDeliveryDialog && (
        <CreateDeliveryDialog
          open={showCreateDeliveryDialog}
          onOpenChange={setShowCreateDeliveryDialog}
          invoice={row.original}
          onSuccess={() => {
            dispatch(getInvoices({
              fromDate: getStartOfCurrentMonth(),
              toDate: getEndOfCurrentMonth(),
            }))
          }}
        />
      )}
    </>
  )
}

export { DataTableRowActions }
