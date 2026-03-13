import { getInvoiceDetail, updateInvoiceStatus, deleteInvoice } from '@/stores/InvoiceSlice'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { statuses, paymentStatuses } from '../data'
import { receiptStatus } from '../../receipt/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CreditCard, Mail, MapPin, Pencil, Trash2, QrCode, Printer, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { IconPlus, IconFileText, IconCircleCheck, IconCircleX } from '@tabler/icons-react'
import { dateFormat } from '@/utils/date-format'
import { Skeleton } from '@/components/ui/skeleton'
import { useDispatch, useSelector } from 'react-redux'
import {
  updateWarehouseReceipt,
  postWarehouseReceipt,
  cancelWarehouseReceipt,
  createWarehouseReceipt,
} from '@/stores/WarehouseReceiptSlice'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import UpdateInvoiceStatusDialog from './UpdateInvoiceStatusDialog'
import { DeleteWarehouseReceiptDialog } from '../../warehouse-receipt/components/DeleteWarehouseReceiptDialog'
import { UpdateWarehouseReceiptStatusDialog } from '../../warehouse-receipt/components/UpdateWarehouseReceiptStatusDialog'
import ConfirmWarehouseReceiptDialog from '../../warehouse-receipt/components/ConfirmWarehouseReceiptDialog'
import ViewWarehouseReceiptDialog from '../../warehouse-receipt/components/ViewWarehouseReceiptDialog'
import ReceiptDialog from '../../receipt/components/ReceiptDialog'
import ViewReceiptDialog from '../../receipt/components/ViewReceiptDialog'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/utils/file'
import { updateReceiptStatus, getReceiptQRCode } from '@/stores/ReceiptSlice'
import UpdateReceiptStatusDialog from '../../receipt/components/UpdateReceiptStatusDialog'
import { DeleteReceiptDialog } from '../../receipt/components/DeleteReceiptDialog'
import { warehouseReceiptStatuses } from '../../warehouse-receipt/data'
import PrintInvoiceView from './PrintInvoiceView'
import MobileInvoiceActions from './MobileInvoiceActions'
import PaymentQRCodeDialog from '../../receipt/components/PaymentQRCodeDialog'
import { Badge } from '@/components/ui/badge'
import CustomerDetailDialog from '../../customer/components/CustomerDetailDialog'

const ViewInvoiceDialog = ({ invoiceId, showTrigger = true, onEdit, onSuccess, contentClassName, overlayClassName, ...props }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [invoice, setInvoice] = useState(null)

  // QR Display State
  const [openQrDisplayDialog, setOpenQrDisplayDialog] = useState(false)
  const [qrCodeData, setQrCodeData] = useState(null)

  const handleGenerateQR = async (receipt) => {
    if (receipt.orderStatus !== 'draft') {
      toast.warning('Chỉ có thể tạo mã QR cho phiếu thu nháp')
      return
    }

    try {
      const qrData = await dispatch(getReceiptQRCode(receipt.id)).unwrap()
      setQrCodeData(qrData)
      setOpenQrDisplayDialog(true)
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
      toast.error('Không lấy được mã QR thanh toán')
    }
  }
  const [loading, setLoading] = useState(false)
  const setting = useSelector((state) => state.setting.setting)
  const dispatch = useDispatch()
  const isViewInvoiceDialog = true

  // State for updating invoice status
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

  // State specific for ViewInvoiceDialog actions
  const [printInvoice, setPrintInvoice] = useState(null)

  // State for updating receipt status
  const [showUpdateReceiptStatus, setShowUpdateReceiptStatus] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  // State for deleting receipt
  const [showDeleteReceiptDialog, setShowDeleteReceiptDialog] = useState(false)
  const [receiptToDelete, setReceiptToDelete] = useState(null)

  // State for customer detail
  const [showCustomerDetailDialog, setShowCustomerDetailDialog] = useState(false)

  // -- LOGIC FOR MOBILE SELECT STATUS --
  const isPaid = invoice?.paymentStatus === 'paid'
  const isLocked = ['completed', 'cancelled'].includes(invoice?.orderStatus)
  const isActionDisabled = isPaid || isLocked

  const permissions = JSON.parse(localStorage.getItem('permissionCodes') || '[]')
  const canDeleteAll = permissions.includes('DELETE_INVOICE')
  const canDeleteMine = permissions.includes('DELETE_INVOICE_USER')
  const isOwner = invoice?.createdById === JSON.parse(localStorage.getItem('user'))?.id ||
    invoice?.user?.id === JSON.parse(localStorage.getItem('user'))?.id

  const canDelete = canDeleteAll || (canDeleteMine && isOwner)

  const handleDeleteInvoice = async () => {
    try {
      await dispatch(deleteInvoice(invoiceId)).unwrap()
      toast.success('Xóa đơn bán thành công')
      onSuccess?.()
      props.onOpenChange(false) // Close the ViewInvoiceDialog
    } catch (error) {
      console.error('Delete invoice error:', error)
      toast.error('Xóa đơn bán thất bại')
    }
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dispatch(getInvoiceDetail(invoiceId)).unwrap()
      setInvoice(data)
    } catch (error) {
      console.log('Fetch invoice detail error:', error)
    } finally {
      setLoading(false)
    }
  }, [invoiceId, dispatch])

  useEffect(() => {
    fetchData()
  }, [invoiceId, fetchData, dispatch])

  // Handle update warehouse receipt status (Mobile)
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
      onSuccess?.()
    } catch (error) {
      console.error(error)
      // Toast error is usually handled in the slice
    }
  }


  const handlePrintInvoice = async () => {
    try {
      // Reuse fetched invoice data if complete enough, or use 'invoice' state
      if (!invoice) return
      setPrintInvoice(invoice)
      setTimeout(() => setPrintInvoice(null), 0)
    } catch (error) {
      console.log('Print invoice error: ', error)
      toast.error('Lỗi in đơn bán')
    }
  }

  // View Product Dialog
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const handleUpdateStatus = async (status, id) => {
    try {
      await dispatch(updateInvoiceStatus({ id, status })).unwrap()
      toast.success('Cập nhật trạng thái đơn bán thành công')
      fetchData()
      onSuccess?.()
    } catch (error) {
      console.log('Update status error: ', error)
      toast.error('Cập nhật trạng thái thất bại')
    }
  }

  const handleUpdateReceiptStatus = async (status, receiptId) => {
    try {
      await dispatch(updateReceiptStatus({ id: receiptId, status })).unwrap()
      setShowUpdateReceiptStatus(false)
      // Refresh invoice data to reflect new receipt status
      fetchData()
      onSuccess?.()
    } catch (error) {
      // toast handled in slice
    }
  }

  const getReceiptStatusObj = (statusValue) => {
    return receiptStatus.find(s => s.value === statusValue)
  }

  const getReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'canceled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const [selectedWarehouseReceipt, setSelectedWarehouseReceipt] = useState(null)
  const [showUpdateWarehouseReceiptStatus, setShowUpdateWarehouseReceiptStatus] = useState(false)

  // Detail Dialogs State
  const [showWarehouseReceiptDetailDialog, setShowWarehouseReceiptDetailDialog] = useState(false)
  const [selectedWarehouseReceiptDetailId, setSelectedWarehouseReceiptDetailId] = useState(null)
  const [showReceiptDetailDialog, setShowReceiptDetailDialog] = useState(false)
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState(null)

  const handleOpenWarehouseReceiptDetail = (id) => {
    setSelectedWarehouseReceiptDetailId(id)
    setShowWarehouseReceiptDetailDialog(true)
  }

  const handleOpenReceiptDetail = (receipt) => {
    // Ensure we have invoice info in receipt if needed by ViewReceiptDialog
    const receiptWithInvoice = {
      ...receipt,
      invoice: invoice || receipt.invoice
    }
    setSelectedReceiptDetail(receiptWithInvoice)
    setShowReceiptDetailDialog(true)
  }
  const [warehouseReceiptToDelete, setWarehouseReceiptToDelete] = useState(null)
  const [showDeleteWarehouseReceiptDialog, setShowDeleteWarehouseReceiptDialog] = useState(false)

  // Create Receipt Dialog State
  const [showConfirmWarehouseDialog, setShowConfirmWarehouseDialog] = useState(false)
  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [receiptToEdit, setReceiptToEdit] = useState(null)
  const [warehouseLoading, setWarehouseLoading] = useState(false)


  const handleCreateWarehouseReceipt = () => {
    const invoiceStatus = invoice?.status
    if (invoiceStatus !== 'accepted') {
      toast.warning('Chỉ có thể tạo phiếu xuất kho cho đơn hàng đã duyệt')
      return
    }

    // Check if fully exported
    // Logic moved to ConfirmWarehouseReceiptDialog to allow partial exports and visual filtering


    if (invoice?.warehouseReceiptId) {
      // Logic for legacy or inconsistent data
      const hasReceiptInArray = invoice?.warehouseReceipts?.some(r => r.id === invoice.warehouseReceiptId && (r.status !== 'cancelled' && r.status !== 'canceled'));

      // If not already caught by the array check above (e.g. array missing but ID present)
      if (!hasReceiptInArray) {
        toast.warning('Đơn hàng này đã có phiếu xuất kho')
        return
      }
    }

    // Show confirmation dialog
    setShowConfirmWarehouseDialog(true)
  }

  const handleConfirmCreateWarehouseReceipt = async (selectedItems, actualReceiptDate) => {
    const invoiceId = invoice?.id
    if (!invoiceId) return

    try {
      setWarehouseLoading(true)

      // Selected items details
      const selectedDetails = selectedItems
        .map(item => ({
          productId: item.productId || item.id,
          unitId: item.unitId || item.unit?.id,
          movement: 'out',
          qtyActual: item.quantity,
          unitPrice: item.price || 0,
          content: `Xuất kho theo đơn bán ${invoice.code}`,
          salesContractId: invoice.salesContractId,
          salesContractItemId: item.salesContractItemId
        }))

      if (selectedDetails.length === 0) {
        toast.error('Vui lòng chọn ít nhất một sản phẩm')
        return
      }

      const payload = {
        // code: `XK-${invoice.code}-${Date.now().toString().slice(-4)}`,
        receiptType: 2, // ISSUE
        businessType: 'sale_out',

        actualReceiptDate: actualReceiptDate || null,
        reason: `Xuất kho cho đơn bán ${invoice.code}`,
        note: invoice.note || 'Xuất kho từ hóa đơn',
        warehouseId: null,
        customerId: invoice.customerId,
        salesContractId: invoice.salesContractId,
        invoiceId: invoice.id,
        details: selectedDetails
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Đã tạo phiếu xuất kho thành công')

      // Refresh invoice data
      fetchData()
      onSuccess?.()
    } catch (error) {
      console.error('Create warehouse receipt error:', error)
      toast.error('Tạo phiếu xuất kho thất bại')
    } finally {
      setWarehouseLoading(false)
      setShowConfirmWarehouseDialog(false)
    }
  }

  const handleCreateReceipt = () => {
    // Only allow for accepted invoices
    if (invoice?.status !== 'accepted') {
      toast.warning('Chỉ có thể tạo phiếu thu cho đơn hàng đã được duyệt')
      return
    }

    // Calculate total including drafts
    const draftAmount = invoice?.paymentVouchers
      ?.filter(v => v.status === 'draft' || v.status === 'pending')
      ?.reduce((sum, v) => sum + parseFloat(v.amount || 0), 0) || 0

    // Check payment status or amount considering drafts
    if (invoice?.paymentStatus === 'paid' || ((invoice?.paidAmount || 0) + draftAmount >= invoice?.amount)) {
      toast.warning('Đơn hàng này đã thu đủ tiền (bao gồm cả các phiếu nháp)')
      return
    }

    setShowReceiptDialog(true)
  }



  const getWarehouseReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'posted': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'canceled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <Dialog {...props}>
        {showTrigger ? (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            </Button>
          </DialogTrigger>
        ) : null}

        <DialogContent
          isViewInvoiceDialog={isViewInvoiceDialog}
          className={cn(
            "md:h-screen md:max-w-full md:z-[10001] md:my-0 md:top-0 md:translate-y-0",
            !isDesktop && isViewInvoiceDialog && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none z-[9999] translate-x-0 translate-y-0 flex flex-col",
            contentClassName
          )}
          overlayClassName={overlayClassName}
          onInteractOutside={(e) => {
            // Prevent Radix from closing the parent dialog when interacting with child dialogs/selects
            e.preventDefault();
          }}
          onPointerDownOutside={(e) => {
            // Additional prevention for mobile touch events on child overlays
            const target = e.target;
            // If the user clicked inside a dialog overlay/content that is not THIS dialog, we prevent closing.
            if (target.closest('[role="dialog"]') || target.closest('[data-radix-popper-content-wrapper]')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className={cn(!isDesktop && "px-4 pt-4")}>
            <DialogTitle className={cn(!isDesktop && "text-base")}>
              Thông tin chi tiết đơn bán: <span className={cn(!isDesktop && "block")}>{invoice?.orderCode}</span>
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
            ) : (
              <>
                <div className={cn(
                  "flex gap-6",
                  isDesktop ? "flex-row" : "flex-col"
                )}>
                  <div className={cn(
                    "flex-1 rounded-lg border",
                    isDesktop ? "space-y-6 p-4" : "space-y-4 p-3"
                  )}>
                    <h2 className={cn(
                      "font-semibold",
                      isDesktop ? "text-lg" : "text-base"
                    )}>Thông tin đơn</h2>



                    <div className={cn("space-y-6", !isDesktop && "space-y-4")}>
                      {/* Product Items - Table on Desktop, Cards on Mobile */}
                      {isDesktop ? (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">TT</TableHead>
                                <TableHead className="min-w-40">Sản phẩm</TableHead>
                                <TableHead className="min-w-20 text-right">Số Lượng</TableHead>
                                <TableHead className="min-w-16">Đơn Vị Tính</TableHead>
                                <TableHead className="min-w-20 text-right">Giá</TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Tổng tiền
                                </TableHead>
                                <TableHead className="min-w-16 text-right">Thuế (%)</TableHead>
                                <TableHead className="min-w-24 text-right">Tiền thuế</TableHead>
                                <TableHead className="min-w-28 md:w-16 text-right">
                                  Giảm giá (%)
                                </TableHead>
                                <TableHead className="min-w-28 md:w-20 text-right">
                                  Tiền giảm
                                </TableHead>
                                <TableHead className="min-w-28 text-right">
                                  Tổng cộng
                                </TableHead>
                                <TableHead className="min-w-28 md:w-20">
                                  Bảo Hành
                                </TableHead>
                                {/* <TableHead className="min-w-28">Ghi chú</TableHead> */}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {invoice?.details?.map((item, index) => (
                                <TableRow key={item.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div
                                      className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                      onClick={() => {
                                        if (item?.productId) {
                                          setSelectedProductId(item.productId)
                                          setShowViewProductDialog(true)
                                        }
                                      }}
                                    >
                                      {item?.product?.image && (
                                        <div className="size-16 overflow-hidden rounded-md border shrink-0">
                                          <img
                                            src={getPublicUrl(item.product.image)}
                                            alt={item?.product?.productName}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium text-blue-600 flex items-center gap-2 flex-wrap">
                                          <span className="hover:underline">{item?.product?.productName}</span>
                                          {item.gift && (
                                            <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200 leading-none whitespace-nowrap">
                                              Quà tặng
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {item?.product?.code || item?.product?.productCode}
                                        </div>
                                        {item?.options && (
                                          <div className="break-words text-sm text-muted-foreground">
                                            {item?.options
                                              ?.filter((option) => !!option.code)
                                              ?.map(
                                                (option) =>
                                                  `${option.name} ${option?.pivot?.value || ''}`,
                                              )
                                              .join(', ')}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-end">{item.quantity}</TableCell>
                                  <TableCell>
                                    {item.unitName || item.product?.unit?.unitName || 'Không có'}
                                  </TableCell>
                                  {item.gift ? (
                                    <TableCell colSpan={8} className="pr-5 text-end text-purple-600 font-semibold italic border-l border-dashed bg-muted/20">
                                      Hàng Quà Tặng
                                    </TableCell>
                                  ) : (
                                    <>
                                      <TableCell className="text-end">
                                        {moneyFormat(item.price || item.unitPrice)}
                                      </TableCell>
                                      <TableCell className="text-end">
                                        {moneyFormat(Number(item.quantity) * Number(item.price || item.unitPrice))}
                                      </TableCell>
                                      <TableCell className="text-end">
                                        {Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : '—'}
                                      </TableCell>
                                      <TableCell className="text-end">
                                        {item.taxAmount > 0 ? moneyFormat(item.taxAmount) : '—'}
                                      </TableCell>
                                      <TableCell className="text-end">
                                        {Number(item.discountRate) > 0 ? `${Number(item.discountRate)}%` : '—'}
                                      </TableCell>
                                      <TableCell className="text-end text-destructive">
                                        {item.discountAmount > 0 ? moneyFormat(item.discountAmount) : '—'}
                                      </TableCell>
                                      <TableCell className="text-end">
                                        {moneyFormat(item.total || item.totalAmount)}
                                      </TableCell>
                                      <TableCell>
                                        {item.periodMonths
                                          ? `${item.periodMonths} tháng`
                                          : 'Không có'}
                                      </TableCell>
                                    </>
                                  )}
                                  {/* <TableCell>
                                    {product.note || 'Không có'}
                                  </TableCell> */}

                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {invoice?.details?.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-3 space-y-2 bg-card">
                              {/* Header: STT + Image + Product Name */}
                              <div
                                className="flex gap-3 items-start cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => {
                                  if (item?.productId) {
                                    setSelectedProductId(item.productId)
                                    setShowViewProductDialog(true)
                                  }
                                }}
                              >
                                {item?.product?.image && (
                                  <div className="size-16 rounded border overflow-hidden shrink-0">
                                    <img src={getPublicUrl(item.product.image)} alt={item?.product?.productName} className="h-full w-full object-cover" />
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium text-sm text-blue-600 flex items-center gap-2 flex-wrap">
                                    <span className="hover:underline">{index + 1}. {item?.product?.productName}</span>
                                    {item.gift && (
                                      <span className="rounded-md bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-200 leading-none whitespace-nowrap">
                                        Quà tặng
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item?.product?.code || item?.product?.productCode}
                                  </div>
                                </div>
                              </div>

                              {/* Options if any */}
                              {item?.options && (
                                <div className="text-xs text-muted-foreground">
                                  {item.options
                                    ?.filter((option) => !!option.code)
                                    ?.map((option) => `${option.name} ${option?.pivot?.value || ''}`)
                                    .join(', ')}
                                </div>
                              )}

                              {/* Grid of details */}
                              {item.gift ? (
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded border border-dashed text-purple-600 font-semibold italic">
                                  <div>
                                    <span className="text-muted-foreground mr-1">SL:</span>{item.quantity}
                                    <span className="text-muted-foreground mx-1">| ĐVT:</span>{item.unitName || item.product?.unit?.unitName || 'Không có'}
                                  </div>
                                  <div className="text-end">Hàng Quà Tặng</div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-muted-foreground">SL: </span>
                                      <span className="font-medium">{item.quantity}</span>
                                    </div>

                                    <div>
                                      <span className="text-muted-foreground">ĐVT: </span>
                                      <span className="font-medium">{item.unitName || item.product?.unit?.unitName || 'Không có'}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Giá: </span>
                                      <span className="font-medium">{moneyFormat(item.price || item.unitPrice)}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Thuế: </span>
                                      <span className="font-medium">
                                        {Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : '—'}
                                      </span>
                                    </div>
                                    {item.taxAmount > 0 && (
                                      <div>
                                        <span className="text-muted-foreground">Tiền thuế: </span>
                                        <span className="font-medium">{moneyFormat(item.taxAmount)}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-muted-foreground">Tổng trước giảm: </span>
                                      <span className="font-medium">{moneyFormat(Number(item.quantity) * Number(item.price || item.unitPrice))}</span>
                                    </div>
                                    {item.discountRate > 0 && (
                                      <>
                                        <div>
                                          <span className="text-muted-foreground">Giảm: </span>
                                          <span className="font-medium text-destructive">{Number(item.discountRate)}%</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Tiền giảm: </span>
                                          <span className="font-medium text-destructive">{moneyFormat(item.discountAmount)}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* Total - prominent */}
                                  <div className="flex justify-between border-t pt-2 font-semibold text-sm">
                                    <span>Tổng cộng:</span>
                                    <span className="text-primary">{moneyFormat(item.total || item.totalAmount)}</span>
                                  </div>

                                  {/* Warranty & Note */}
                                  <div className="text-xs space-y-1 border-t pt-2">
                                    <div>
                                      <span className="text-muted-foreground">BH: </span>
                                      <span>{item.periodMonths ? `${item.periodMonths} tháng` : 'Không có'}</span>
                                    </div>
                                    {item.note && (
                                      <div>
                                        <span className="text-muted-foreground">Ghi chú: </span>
                                        <span>{item.note}</span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className={cn(
                        "grid gap-4",
                        isDesktop ? "md:grid-cols-[2fr,1fr]" : "grid-cols-1"
                      )}>
                        {/* Totals Section - Order 1 on mobile, Order 2 on desktop */}
                        <div className={cn(
                          "space-y-4 text-sm",
                          isDesktop ? "order-2" : "order-1"
                        )}>
                          <div className="flex justify-between">
                            <strong>Tổng tiền: </strong>
                            <span>
                              {moneyFormat(invoice?.amount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Giảm giá:</strong>
                            <span className='text-red-600'>{moneyFormat(invoice?.discountAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Thuế:</strong>
                            <span>{moneyFormat(invoice?.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Tổng cộng:</strong>
                            <span>{moneyFormat(invoice?.totalAmount)}</span>
                          </div>
                          <div className="flex justify-start border-t py-2">
                            <div className={cn("font-bold", isDesktop ? "text-sm" : "text-xs")}>
                              Số tiền viết bằng chữ:{' '}
                              <span className="font-bold">
                                {toVietnamese(invoice?.totalAmount)}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-start border-t py-2 items-center">
                            <strong>Trạng thái đơn bán: </strong>
                            {invoice?.orderStatus && (
                              <div className="ml-2 flex flex-col gap-2">
                                {(() => {
                                  const statusObj = statuses.find(s => s.value === invoice.orderStatus)
                                  const paymentStatusObj = paymentStatuses.find(s => s.value === invoice.paymentStatus)
                                  return (
                                    <>
                                      <Badge
                                        variant={['completed', 'cancelled'].includes(invoice.orderStatus) ? 'outline' : 'default'}
                                        className={cn(
                                          ['completed', 'cancelled'].includes(invoice.orderStatus)
                                            ? `cursor-default select-none border-0 bg-transparent ${invoice.orderStatus === 'completed' ? (statusObj?.textColor || 'text-green-500') : 'text-slate-500'} hover:bg-transparent`
                                            : `cursor-pointer select-none ${statusObj?.color || ''}`,
                                          isActionDisabled && !['completed', 'cancelled'].includes(invoice.orderStatus) ? "opacity-70 cursor-not-allowed" : ""
                                        )}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          if (!isActionDisabled && !['completed', 'cancelled'].includes(invoice.orderStatus)) {
                                            setShowUpdateStatusDialog(true)
                                          }
                                        }}
                                        title={['completed', 'cancelled'].includes(invoice.orderStatus) ? '' : "Bấm để cập nhật trạng thái"}
                                      >
                                        <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                                          {statusObj?.icon ? <statusObj.icon className="h-4 w-4" /> : null}
                                        </span>
                                        {statusObj?.label || 'Không xác định'}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={`cursor-default select-none border-0 ${paymentStatusObj?.color || 'text-gray-500'}`}
                                      >
                                        <span className="mr-1 inline-flex h-4 w-4 items-center justify-center">
                                          {paymentStatusObj?.icon ? <paymentStatusObj.icon className="h-4 w-4" /> : null}
                                        </span>
                                        {paymentStatusObj?.label || 'Không xác định'}
                                      </Badge>
                                    </>
                                  )
                                })()}
                              </div>
                            )}
                          </div>

                          <Separator className="my-3" />

                          {/* Payment Status & Info */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <strong>Trạng thái thanh toán:</strong>
                              {invoice?.paymentStatus && (
                                <span
                                  className={`font-medium ${invoice.paymentStatus === 'paid'
                                    ? 'text-green-600'
                                    : invoice.paymentStatus === 'partial'
                                      ? 'text-orange-600'
                                      : 'text-red-600'
                                    }`}
                                >
                                  {invoice.paymentStatus === 'paid'
                                    ? 'Đã thanh toán'
                                    : invoice.paymentStatus === 'partial'
                                      ? 'Thanh toán một phần'
                                      : 'Chưa thanh toán'}
                                </span>
                              )}
                            </div>

                            {invoice?.paidAmount > 0 && (
                              <div className="flex justify-between">
                                <strong>Đã thanh toán:</strong>
                                <span className="font-medium text-green-600">
                                  {moneyFormat(invoice.paidAmount)}
                                </span>
                              </div>
                            )}

                            {invoice?.remainingAmount > 0 && (
                              <div className="flex justify-between">
                                <strong>Còn lại:</strong>
                                <span className="font-medium text-red-600">
                                  {moneyFormat(invoice.remainingAmount || 0)}
                                </span>
                              </div>
                            )}

                            {invoice?.paymentMethod && (
                              <div className="flex justify-between">
                                <strong>Phương thức thanh toán:</strong>
                                <span>
                                  {invoice.paymentMethod === 'cash'
                                    ? 'Tiền mặt'
                                    : invoice.paymentMethod === 'transfer'
                                      ? 'Chuyển khoản'
                                      : invoice.paymentMethod}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Notes Section - Order 2 on mobile, Order 1 on desktop */}
                        <div className={cn(
                          "flex flex-col gap-2",
                          isDesktop ? "order-1" : "order-2"
                        )}>
                          <div className={cn(isDesktop ? "text-sm" : "text-xs")}>
                            <strong className="text-destructive">
                              Ghi chú:{' '}
                            </strong>
                            <span className="text-primary">
                              {invoice?.notes || 'Không có'}
                            </span>
                          </div>
                          {invoice?.expires?.length > 0 && (
                            <div className={cn(isDesktop ? "text-sm" : "text-xs")}>
                              <strong className="text-destructive">
                                Thông tin quản lý hạn dùng:
                              </strong>
                              <ul className="ml-4 list-disc text-primary">
                                {invoice.expires.map((exp) => {
                                  const matchedProduct =
                                    invoice.invoiceItems?.find(
                                      (item) => item.productId === exp.productId,
                                    )

                                  return (
                                    <li key={exp.id}>
                                      <span className="font-medium">
                                        {matchedProduct?.productName ||
                                          `Sản phẩm ID ${exp.productId}`}
                                      </span>
                                      {': '}
                                      từ{' '}
                                      <strong>
                                        {dateFormat(exp.startDate)}
                                      </strong>{' '}
                                      đến{' '}
                                      <strong>{dateFormat(exp.endDate)}</strong>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )}


                        </div>
                      </div>



                      {/* ========== PHIẾU THU ========== */}
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Phiếu thu</h3>
                            {!['pending', 'completed', 'cancelled'].includes(invoice?.orderStatus) ? (
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                                onClick={handleCreateReceipt}
                              >
                                <IconPlus className="h-4 w-4" />
                                <span>
                                  Thêm
                                </span>
                              </Button>
                            ) : (
                              invoice?.orderStatus === 'pending' ? (
                                <span className="text-[12px] text-gray-500">Đơn hàng chưa được duyệt</span>
                              ) : null
                            )}
                          </div>

                          {invoice?.paymentVouchers && invoice.paymentVouchers.length > 0 ? (
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
                                      <TableHead className="min-w-20">Loại GD</TableHead>
                                      <TableHead className="min-w-32">Người tạo</TableHead>
                                      <TableHead className="min-w-32">Ngày tạo</TableHead>
                                      <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {invoice.paymentVouchers.map((voucher, index) => (
                                      <TableRow key={voucher.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          <span
                                            className="cursor-pointer font-medium text-primary hover:underline hover:text-blue-600"
                                            onClick={() => handleOpenReceiptDetail(voucher)}
                                          >
                                            {voucher.code}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {moneyFormat(voucher.amount)}
                                        </TableCell>
                                        <TableCell>
                                          {voucher.paymentMethod === 'cash'
                                            ? 'Tiền mặt'
                                            : voucher.paymentMethod === 'transfer'
                                              ? 'Chuyển khoản'
                                              : voucher.paymentMethod}
                                        </TableCell>
                                        <TableCell>
                                          <div
                                            className="cursor-pointer"
                                            onClick={() => {
                                              setSelectedReceipt(voucher)
                                              setShowUpdateReceiptStatus(true)
                                            }}
                                          >
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getReceiptStatusColor(voucher.status)}`}
                                            >
                                              {getReceiptStatusObj(voucher.status)?.icon &&
                                                React.createElement(getReceiptStatusObj(voucher.status).icon, { className: "h-3 w-3" })
                                              }
                                              {getReceiptStatusObj(voucher.status)?.label || voucher.status}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          {voucher.transactionType === 'payment'
                                            ? 'Thanh toán'
                                            : voucher.transactionType === 'deposit'
                                              ? 'Đặt cọc'
                                              : voucher.transactionType === 'refund'
                                                ? 'Hoàn tiền'
                                                : voucher.transactionType}
                                        </TableCell>
                                        <TableCell>
                                          {voucher.createdByUser?.fullName || '—'}
                                        </TableCell>
                                        <TableCell>{dateFormat(voucher.createdAt, true)}</TableCell>
                                        <TableCell>
                                          {voucher.status === 'draft' && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-100"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setReceiptToEdit(voucher)
                                                setShowReceiptDialog(true)
                                              }}
                                              title="Sửa phiếu thu"
                                            >
                                              <Pencil className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {voucher.status === 'draft' && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-primary/10"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleGenerateQR(voucher)
                                              }}
                                              title="Tạo mã QR"
                                            >
                                              <QrCode className="h-4 w-4" />
                                            </Button>
                                          )}
                                          {(voucher.status === 'draft' || voucher.status === 'cancelled' || voucher.status === 'canceled') && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                setReceiptToDelete(voucher)
                                                setShowDeleteReceiptDialog(true)
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
                                {invoice.paymentVouchers.map((voucher) => (
                                  <div key={voucher.id} className="space-y-2 rounded-lg border p-3 text-sm">
                                    <div className="flex justify-between items-center">
                                      <strong>Mã phiếu:</strong>
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                          onClick={() => handleOpenReceiptDetail(voucher)}
                                        >
                                          {voucher.code}
                                        </span>
                                        {voucher.status === 'draft' && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-orange-500 hover:text-orange-600 hover:bg-orange-100 -mr-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setReceiptToEdit(voucher)
                                              setShowReceiptDialog(true)
                                            }}
                                            title="Sửa phiếu thu"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        )}
                                        {voucher.status === 'draft' && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-primary hover:text-primary/90 hover:bg-primary/10 -mr-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleGenerateQR(voucher)
                                            }}
                                            title="Tạo mã QR"
                                          >
                                            <QrCode className="h-4 w-4" />
                                          </Button>
                                        )}
                                        {(voucher.status === 'draft' || voucher.status === 'cancelled' || voucher.status === 'canceled') && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10 -mr-2"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setReceiptToDelete(voucher)
                                              setShowDeleteReceiptDialog(true)
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
                                        {voucher.paymentMethod === 'cash'
                                          ? 'Tiền mặt'
                                          : voucher.paymentMethod === 'transfer'
                                            ? 'Chuyển khoản'
                                            : voucher.paymentMethod}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <strong>Trạng thái:</strong>
                                      <div className='flex items-center justify-end'>
                                        <Select
                                          value={voucher.status}
                                          onValueChange={(val) => handleUpdateReceiptStatus(val, voucher.id)}
                                        >
                                          <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                            <SelectValue>
                                              <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium ${getReceiptStatusColor(voucher.status).replace(/bg-[^ ]+/, '').trim()}`}
                                              >
                                                {getReceiptStatusObj(voucher.status)?.icon &&
                                                  React.createElement(getReceiptStatusObj(voucher.status).icon, { className: "h-3 w-3" })
                                                }
                                                {getReceiptStatusObj(voucher.status)?.label || voucher.status}
                                              </span>
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent align="end" className="w-[140px]">
                                            {receiptStatus
                                              .filter((s) => {
                                                const currentStatus = voucher.status
                                                if (
                                                  currentStatus === 'canceled' ||
                                                  currentStatus === 'cancelled'
                                                ) {
                                                  return (
                                                    s.value === 'canceled' ||
                                                    s.value === 'cancelled'
                                                  )
                                                }
                                                if (currentStatus === 'completed') {
                                                  return s.value !== 'draft'
                                                }
                                                return true
                                              })
                                              .map((s) => (
                                                <SelectItem
                                                  key={s.value}
                                                  value={s.value}
                                                  className="text-xs"
                                                >
                                                  <div
                                                    className={`flex items-center gap-1 rounded-full px-2 py-1 ${getReceiptStatusColor(s.value)}`}
                                                  >
                                                    {s.icon &&
                                                      React.createElement(
                                                        s.icon,
                                                        { className: 'h-3 w-3' },
                                                      )}
                                                    <span>{s.label}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex justify-between">
                                      <strong>Loại GD:</strong>
                                      <span>
                                        {voucher.transactionType === 'payment'
                                          ? 'Thanh toán'
                                          : voucher.transactionType === 'deposit'
                                            ? 'Đặt cọc'
                                            : voucher.transactionType === 'refund'
                                              ? 'Hoàn tiền'
                                              : voucher.transactionType}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2">
                                      <strong>Người tạo:</strong>
                                      <span>{voucher.createdByUser?.fullName || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <strong>Ngày tạo:</strong>
                                      <span>{dateFormat(voucher.createdAt, true)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="text-center text-sm text-muted-foreground italic py-2">
                              Chưa có dữ liệu phiếu thu
                            </div>
                          )}
                        </div>
                      </>

                      {/* ========== PHIẾU XUẤT KHO ========== */}
                      <>
                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Phiếu xuất kho</h3>
                            {invoice?.orderStatus === 'preparing' ? (
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-green-600 text-white hover:bg-green-700 border-transparent"
                                onClick={handleCreateWarehouseReceipt}
                              >
                                <IconPlus className="h-4 w-4" />
                                <span>
                                  Thêm
                                </span>
                              </Button>
                            ) : (
                              invoice?.orderStatus === 'pending' ? (
                                <span className="text-[12px] text-gray-500">Đơn hàng chưa được duyệt</span>
                              ) : null
                            )}
                          </div>

                          {invoice?.warehouseReceipts && invoice.warehouseReceipts.length > 0 ? (
                            isDesktop ? (
                              <div className="overflow-x-auto rounded-lg border">
                                <Table className="min-w-full">
                                  <TableHeader>
                                    <TableRow className="bg-secondary text-xs">
                                      <TableHead className="w-8">STT</TableHead>
                                      <TableHead className="min-w-32">Mã phiếu</TableHead>
                                      <TableHead className="min-w-32">Loại phiếu</TableHead>
                                      <TableHead className="min-w-32">Trạng thái</TableHead>
                                      <TableHead className="min-w-32 text-right">Tổng tiền</TableHead>
                                      <TableHead className="min-w-32">Ngày xuất TT</TableHead>
                                      <TableHead className="min-w-28">Người tạo</TableHead>
                                      <TableHead className="min-w-32">Ngày tạo</TableHead>
                                      <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {invoice.warehouseReceipts.map((receipt, index) => (
                                      <TableRow key={receipt.id}>
                                        <TableCell className="text-center text-sm">{index + 1}</TableCell>
                                        <TableCell>
                                          <span
                                            className="cursor-pointer font-medium text-primary hover:underline hover:text-blue-600"
                                            onClick={() => handleOpenWarehouseReceiptDetail(receipt.id)}
                                          >
                                            {receipt.code}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          {receipt.receiptType === 1
                                            ? 'Nhập kho'
                                            : receipt.receiptType === 2
                                              ? 'Xuất kho'
                                              : receipt.receiptType === 3
                                                ? 'Nhập trả hàng'
                                                : receipt.receiptType}
                                        </TableCell>
                                        <TableCell>
                                          <div
                                            className="cursor-pointer"
                                            onClick={() => {
                                              setSelectedWarehouseReceipt(receipt)
                                              setShowUpdateWarehouseReceiptStatus(true)
                                            }}
                                          >
                                            <span
                                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status)}`}
                                            >
                                              {receipt.status === 'draft' ? <IconFileText className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCircleCheck className="h-3 w-3" /> : (receipt.status === 'cancelled' || receipt.status === 'canceled' ? <IconCircleX className="h-3 w-3" /> : null))}
                                              {receipt.status === 'draft'
                                                ? 'Nháp'
                                                : receipt.status === 'posted'
                                                  ? 'Đã ghi sổ'
                                                  : (receipt.status === 'cancelled' || receipt.status === 'canceled')
                                                    ? 'Đã hủy'
                                                    : receipt.status}
                                            </span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {moneyFormat(receipt.totalAmount)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {receipt.actualReceiptDate ? dateFormat(receipt.actualReceiptDate) : '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {receipt.createdByUser?.fullName || receipt.user?.fullName || '—'}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          {dateFormat(receipt.receiptDate, true)}
                                        </TableCell>
                                        <TableCell>
                                          {/* Action buttons */}
                                          <div className="flex items-center justify-end gap-1">
                                            {(receipt.status === 'draft' || receipt.status === 'cancelled') && (
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
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {invoice.warehouseReceipts.map((receipt) => (
                                  <div key={receipt.id} className="space-y-3 rounded-lg border p-4 text-sm">
                                    <div className="flex justify-between items-center">
                                      <strong>Mã phiếu kho:</strong>
                                      <div className='flex items-center gap-2'>
                                        <span
                                          className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                                          onClick={() => handleOpenWarehouseReceiptDetail(receipt.id)}
                                        >
                                          {receipt.code}
                                        </span>
                                        {receipt.status === 'draft' && (
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
                                      <span className="font-medium">
                                        {receipt.receiptType === 1
                                          ? 'Nhập kho'
                                          : receipt.receiptType === 2
                                            ? 'Xuất kho'
                                            : receipt.receiptType === 3
                                              ? 'Nhập trả hàng'
                                              : receipt.receiptType}
                                      </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                      <strong>Trạng thái:</strong>
                                      <div className='flex items-center justify-end'>
                                        <Select
                                          value={receipt.status}
                                          onValueChange={(val) => handleUpdateWarehouseReceiptStatus(val, receipt.id)}
                                        >
                                          <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                            <SelectValue>
                                              <span
                                                className={`inline-flex items-center gap-1 text-xs font-medium ${getWarehouseReceiptStatusColor(receipt.status).replace('bg-', 'text-')}`}
                                              >
                                                {receipt.status === 'draft' ? <IconFileText className="h-3 w-3" /> : (receipt.status === 'posted' ? <IconCircleCheck className="h-3 w-3" /> : (receipt.status === 'cancelled' || receipt.status === 'canceled' ? <IconCircleX className="h-3 w-3" /> : null))}
                                                {receipt.status === 'draft'
                                                  ? 'Nháp'
                                                  : receipt.status === 'posted'
                                                    ? 'Đã ghi sổ'
                                                    : (receipt.status === 'cancelled' || receipt.status === 'canceled')
                                                      ? 'Đã hủy'
                                                      : receipt.status}
                                              </span>
                                            </SelectValue>
                                          </SelectTrigger>
                                          <SelectContent align="end" className="w-[140px]">
                                            {warehouseReceiptStatuses
                                              .filter((s) => {
                                                // Should possibly filter transitions here if needed
                                                // For now showing all options similar to UpdateWarehouseReceiptStatusDialog
                                                return true
                                              })
                                              .map((s) => (
                                                <SelectItem
                                                  key={s.value}
                                                  value={s.value}
                                                  className="text-xs"
                                                >
                                                  <div
                                                    className={cn("flex items-center gap-1 rounded-full px-2 py-1 font-medium", getWarehouseReceiptStatusColor(s.value))}
                                                  >
                                                    {s.icon && <s.icon className="h-3 w-3" />}
                                                    <span>{s.label}</span>
                                                  </div>
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="flex justify-between">
                                      <strong>Ngày phiếu:</strong>
                                      <span>{dateFormat(receipt.receiptDate)}</span>
                                    </div>

                                    <div className="flex justify-between border-t pt-2">
                                      <strong>Tổng tiền:</strong>
                                      <span className="font-bold text-primary">
                                        {moneyFormat(receipt.totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          ) : (
                            <div className="text-center text-sm text-muted-foreground italic py-2">
                              Chưa có dữ liệu phiếu xuất kho
                            </div>
                          )}
                        </div>
                      </>

                      <Separator className="my-4" />

                      <div className={cn(
                        "grid gap-4",
                        isDesktop ? "md:grid-cols-2" : "grid-cols-1"
                      )}>
                        {/* Cột trái: Lịch sử */}
                        <div>
                          <h3 className={cn(
                            "mb-2 font-semibold",
                            isDesktop ? "text-base" : "text-sm"
                          )}>Lịch sử</h3>
                          <ol className="relative border-s border-primary dark:border-primary">
                            {invoice?.invoiceHistories?.length ? (
                              invoice?.invoiceHistories.map((history) => (
                                <li className="mb-3 ms-4" key={history.id}>
                                  <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-primary bg-primary dark:border-primary dark:bg-primary"></div>
                                  <time className="mb-1 text-sm font-normal leading-none">
                                    {dateFormat(history.createdAt, true)}
                                  </time>
                                  <p className="text-xs">{history.description}</p>
                                </li>
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                Không có lịch sử thay đổi
                              </p>
                            )}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-lg border p-4 bg-card",
                    isDesktop ? "w-72 sticky top-0 h-fit" : "w-full"
                  )}>
                    <div className="flex items-center justify-between">
                      <h2 className={cn(
                        "py-2 font-semibold",
                        isDesktop ? "text-lg" : "text-base"
                      )}>Khách hàng</h2>
                    </div>

                    <div className={cn(isDesktop ? "space-y-6" : "space-y-4")}>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.customer?.customerName}`}
                            alt={invoice?.customer?.customerName}
                          />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className="font-medium cursor-pointer text-primary hover:underline"
                            onClick={() => setShowCustomerDetailDialog(true)}
                          >
                            {invoice?.customer?.customerName}
                          </div>
                          {showCustomerDetailDialog && invoice?.customer && (
                            <CustomerDetailDialog
                              open={showCustomerDetailDialog}
                              onOpenChange={setShowCustomerDetailDialog}
                              customer={invoice.customer}
                              showTrigger={false}
                              contentClassName="z-[100020]"
                              overlayClassName="z-[100019]"
                            />
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">Thông tin khách hàng</div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <MobileIcon className="h-4 w-4" />
                            </div>
                            <a href={`tel:${invoice?.customer?.phone}`}>
                              {invoice?.customer?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <span>
                              {invoice?.customer?.cccd || 'Chưa cập nhật'}
                            </span>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${invoice?.customer?.email}`}>
                              {invoice?.customer?.email || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <MapPin className="h-4 w-4" />
                            </div>
                            {invoice?.customer?.address || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">
                        Người lập đơn bán
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${invoice?.creator?.fullName}`}
                            alt={invoice?.creator?.fullName}
                          />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {invoice?.creator?.fullName} ({invoice?.creator?.employeeCode})
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {dateFormat(invoice?.createdAt, true)}
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
                            <a href={`tel:${invoice?.creator?.phone}`}>
                              {invoice?.creator?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${invoice?.creator?.email}`}>
                              {invoice?.creator?.email || 'Chưa cập nhật'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className={cn(
            "hidden md:flex flex-row flex-wrap items-center justify-center sm:justify-end gap-2 !space-x-0"
          )}>
            {invoice && (
              <>
                {(!['pending', 'cancelled', 'completed'].includes(invoice?.orderStatus) && invoice?.paymentStatus !== 'paid') && (
                  <Button
                    size="sm"
                    className={cn("gap-2 bg-green-600 text-white hover:bg-green-700", !isDesktop && "w-full")}
                    onClick={handleCreateReceipt}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Tạo Phiếu Thu
                  </Button>
                )}
                {invoice?.orderStatus === 'preparing' && (
                  <Button
                    size="sm"
                    className={cn("gap-2 bg-orange-600 text-white hover:bg-orange-700", !isDesktop && "w-full")}
                    onClick={handleCreateWarehouseReceipt}
                  >
                    <PlusIcon className="h-4 w-4" />
                    Tạo Phiếu xuất kho
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  className={cn("gap-2 text-blue-600 border-blue-200 hover:bg-blue-50", !isDesktop && "w-full")}
                  onClick={handlePrintInvoice}
                >
                  <Printer className="h-4 w-4" />
                  In Hóa Đơn
                </Button>

                {invoice.orderStatus === 'pending' && (
                  <Button
                    size="sm"
                    className={cn("gap-2 bg-amber-500 text-white hover:bg-amber-600", !isDesktop && "w-full")}
                    onClick={() => onEdit?.()}
                  >
                    <Pencil className="h-4 w-4" />
                    Sửa
                  </Button>
                )}

                {(canDelete && ['pending', 'cancelled'].includes(invoice.orderStatus)) && (
                  <ConfirmActionButton
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa đơn bán này? Hành động này không thể hoàn tác."
                    confirmText="Xóa"
                    onConfirm={handleDeleteInvoice}
                    contentClassName="z-[100020]"
                    overlayClassName="z-[100019]"
                    confirmBtnVariant="destructive"
                  >
                    <Button
                      variant="destructive"
                      size="sm"
                      className={cn("gap-2", !isDesktop && "w-full")}
                    >
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
                className={cn("gap-2", !isDesktop && (invoice?.orderStatus === 'pending' && canDelete ? "w-full" : "w-full col-span-2"))}
              >
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </DialogFooter>
          <MobileInvoiceActions
            invoice={invoice}
            isDesktop={isDesktop}
            canDelete={canDelete}
            onEdit={onEdit}
            handleCreateReceipt={handleCreateReceipt}
            handleCreateWarehouseReceipt={handleCreateWarehouseReceipt}
            handlePrintInvoice={handlePrintInvoice}

            handleDeleteInvoice={handleDeleteInvoice}
            onCloseDialog={() => props.onOpenChange && props.onOpenChange(false)}
          />
        </DialogContent>
      </Dialog >



      {
        selectedReceipt && (
          <UpdateReceiptStatusDialog
            open={showUpdateReceiptStatus}
            onOpenChange={setShowUpdateReceiptStatus}
            receiptId={selectedReceipt.code || selectedReceipt.id}
            currentStatus={selectedReceipt.status}
            statuses={receiptStatus}
            onSubmit={(status) => handleUpdateReceiptStatus(status, selectedReceipt.id)}
            contentClassName="z-[10003]"
            overlayClassName="z-[10002]"
          />
        )
      }

      {/* QR Code Display Dialog */}
      <PaymentQRCodeDialog
        open={openQrDisplayDialog}
        onOpenChange={setOpenQrDisplayDialog}
        qrCodeData={qrCodeData}
        overlayClassName="z-[100019]"
        className="z-[100020]"
      />



      {/* Delete Receipt Dialog */}
      {
        receiptToDelete && (
          <DeleteReceiptDialog
            open={showDeleteReceiptDialog}
            onOpenChange={setShowDeleteReceiptDialog}
            receipt={receiptToDelete}
            showTrigger={false}
            onSuccess={() => {
              setShowDeleteReceiptDialog(false)
              fetchData()
              onSuccess?.()
            }}
            contentClassName="z-[10003]"
            overlayClassName="z-[10002]"
          />
        )
      }


      {/* Update Invoice Status Dialog */}
      {
        showUpdateStatusDialog && (
          <UpdateInvoiceStatusDialog
            open={showUpdateStatusDialog}
            onOpenChange={setShowUpdateStatusDialog}
            invoiceId={invoice?.id}
            currentStatus={invoice?.orderStatus}
            paymentStatus={invoice?.paymentStatus}
            statuses={statuses}
            onSubmit={handleUpdateStatus}
            className="z-[10003]"
            overlayClassName="z-[10002]"
          />
        )
      }

      {/* View Warehouse Receipt Detail Dialog */}
      {
        showWarehouseReceiptDetailDialog && (
          <ViewWarehouseReceiptDialog
            open={showWarehouseReceiptDetailDialog}
            onOpenChange={setShowWarehouseReceiptDetailDialog}
            receiptId={selectedWarehouseReceiptDetailId}
            contentClassName="!z-[10005]"
            overlayClassName="z-[10004]"
          />
        )
      }

      {/* View Receipt Detail Dialog */}
      {
        showReceiptDetailDialog && (
          <ViewReceiptDialog
            open={showReceiptDetailDialog}
            onOpenChange={setShowReceiptDetailDialog}
            receiptId={selectedReceiptDetail?.id}
            contentClassName="z-[10005]"
            overlayClassName="z-[10004]"
          />
        )
      }

      {
        selectedWarehouseReceipt && (
          <UpdateWarehouseReceiptStatusDialog
            open={showUpdateWarehouseReceiptStatus}
            onOpenChange={setShowUpdateWarehouseReceiptStatus}
            receiptId={selectedWarehouseReceipt.id}
            receiptCode={selectedWarehouseReceipt.code}
            currentStatus={selectedWarehouseReceipt.status}
            statuses={warehouseReceiptStatuses}
            onSubmit={handleUpdateWarehouseReceiptStatus}
            contentClassName="z-[10003]"
            overlayClassName="z-[10002]"
          />
        )
      }

      {
        warehouseReceiptToDelete && (
          <DeleteWarehouseReceiptDialog
            open={showDeleteWarehouseReceiptDialog}
            onOpenChange={setShowDeleteWarehouseReceiptDialog}
            receipt={warehouseReceiptToDelete}
            showTrigger={false}
            onSuccess={() => {
              setShowDeleteWarehouseReceiptDialog(false)
              fetchData()
              onSuccess?.()
            }}
            contentClassName="z-[10003]"
            overlayClassName="z-[10002]"
          />
        )
      }

      {/* Create Warehouse Receipt Confirm Dialog */}
      <ConfirmWarehouseReceiptDialog
        open={showConfirmWarehouseDialog}
        onOpenChange={setShowConfirmWarehouseDialog}
        onConfirm={handleConfirmCreateWarehouseReceipt}
        loading={warehouseLoading}
        invoice={invoice}
        contentClassName="z-[100010]"
        overlayClassName="z-[100009]"
      />

      {/* Create Receipt Dialog */}
      <ReceiptDialog
        open={showReceiptDialog}
        onOpenChange={(open) => {
          setShowReceiptDialog(open)
          if (!open) {
            setTimeout(() => setReceiptToEdit(null), 300)
          }
        }}
        invoices={[invoice?.id]}
        receipt={receiptToEdit}
        invoiceCode={invoice?.orderCode}
        amount={invoice?.remainingAmount}
        onSuccess={() => {
          fetchData()
          setShowReceiptDialog(false)
          setTimeout(() => setReceiptToEdit(null), 300)
          onSuccess?.()
          toast.success('Đã tạo phiếu thu thành công')
        }}
        contentClassName="z-[100010]"
        overlayClassName="z-[100009]"
        qrContentClassName="z-[100020]"
        qrOverlayClassName="z-[100019]"
      />


      {/* Print Invoice View */}
      {
        printInvoice && setting && (
          <PrintInvoiceView invoice={printInvoice} setting={setting} />
        )
      }

      {/* View Product Dialog */}
      {
        selectedProductId && (
          <ViewProductDialog
            open={showViewProductDialog}
            onOpenChange={setShowViewProductDialog}
            productId={selectedProductId}
            showTrigger={false}
            contentClassName="z-[100020]"
            overlayClassName="z-[100019]"
          />
        )
      }

    </>
  )
}

export default ViewInvoiceDialog