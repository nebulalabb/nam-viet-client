import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { warehouseReceiptStatuses } from '../data'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getWarehouseReceiptById, updateWarehouseReceipt, postWarehouseReceipt, cancelWarehouseReceipt } from '@/stores/WarehouseReceiptSlice'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { MobileIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, CreditCard, Package, Printer, FileSpreadsheet, Pencil, Trash, X, Save } from 'lucide-react'
import PrintWarehouseReceiptView from './PrintWarehouseReceiptView'
import { getPublicUrl } from '@/utils/file'
import { exportWarehouseReceiptToExcel } from '@/utils/export-warehouse-receipt'
import { UpdateWarehouseReceiptStatusDialog } from './UpdateWarehouseReceiptStatusDialog'
import { DeleteWarehouseReceiptDialog } from './DeleteWarehouseReceiptDialog'
import ExportWarehouseReceiptPreview from './ExportWarehouseReceiptPreview'
import MobileWarehouseReceiptActions from './MobileWarehouseReceiptActions'
import UpdateWarehouseReceiptDialog from './UpdateWarehouseReceiptDialog'
import { toast } from 'sonner'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'
import InvoiceDialog from '../../invoice/components/InvoiceDialog'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import CustomerDetailDialog from '../../customer/components/CustomerDetailDialog'
import ViewSupplierDialog from '../../supplier/components/ViewSupplierDialog'
import { getProducts } from '@/stores/ProductSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Can from '@/utils/can'

const ViewWarehouseReceiptDialog = ({
  receiptId,
  open,
  onOpenChange,
  showTrigger = true,
  isViewWarehouseDialog = true,
  contentClassName,
  overlayClassName,
  onSuccess,
  ...props
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [targetStatus, setTargetStatus] = useState(null)
  const [showExportPreview, setShowExportPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showUpdateReceiptDialog, setShowUpdateReceiptDialog] = useState(false)

  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showUpdateInvoiceDialog, setShowUpdateInvoiceDialog] = useState(false)
  const [printData, setPrintData] = useState(null)

  // View Product
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)
  const setting = useSelector((state) => state.setting.setting)
  const [details, setDetails] = useState([])

  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showSupplierDialog, setShowSupplierDialog] = useState(false)

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      if (newStatus === 'cancelled') {
        await dispatch(cancelWarehouseReceipt(id)).unwrap()
      } else if (newStatus === 'posted') {
        await dispatch(postWarehouseReceipt(id)).unwrap()
        dispatch(getProducts())
        dispatch(getWarehouses())
      } else {
        await dispatch(updateWarehouseReceipt({ id, data: { status: newStatus } })).unwrap()
      }

      toast.success(newStatus === 'cancelled' ? 'Hủy phiếu thành công' : newStatus === 'posted' ? 'Duyệt phiếu thành công' : 'Cập nhật trạng thái thành công')
      setShowUpdateStatusDialog(false)
      fetchData()
      onSuccess?.()
    } catch (error) {
      console.error(error)
    }
  }

  const handleStatusChange = (newStatus) => {
    setTargetStatus(newStatus)
    setShowUpdateStatusDialog(true)
  }

  const fetchData = useCallback(async () => {
    if (!receiptId) return

    setLoading(true)
    try {
      const data = await dispatch(
        getWarehouseReceiptById(receiptId)
      ).unwrap()
      setReceipt(data)
      // Parse quantities to avoid '1.0000' strings and ensure numbers for initial state
      const parsedDetails = (data?.details || []).map(d => ({
        ...d,
        qtyDocument: parseFloat(d.qtyDocument) || 0,
        qtyActual: parseFloat(d.qtyActual) || 0
      }))
      setDetails(parsedDetails)
    } catch (error) {
      console.error('Failed to fetch receipt details:', error)
    } finally {
      setLoading(false)
    }
  }, [receiptId, dispatch])

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...details]
    // Keep as string during typing to allow decimals
    newDetails[index] = { ...newDetails[index], [field]: value }

    // If changing qtyDocument, sync to qtyActual
    if (field === 'qtyDocument') {
      newDetails[index].qtyActual = value
    }

    setDetails(newDetails)
  }

  const handleSaveChanges = async () => {
    try {
      // Construct payload for update
      // Ensure details are numbers
      const cleanDetails = details.map(d => ({
        ...d,
        qtyDocument: parseFloat(d.qtyDocument) || 0,
        qtyActual: parseFloat(d.qtyActual) || 0
      }))

      const payload = {
        details: details.map((d) => ({
          productId: d.productId,
          unitId: d.unitId,
          qtyDocument: parseFloat(d.qtyDocument) || 0, // Ensure numbers
          qtyActual: parseFloat(d.qtyActual) || 0, // Ensure numbers
          unitPrice: d.unitPrice
        }))
      }

      await dispatch(updateWarehouseReceipt({ id: receipt.id, data: payload })).unwrap()
      toast.success('Cập nhật phiếu kho thành công')
      fetchData()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error('Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, fetchData])

  if (!open && !showTrigger) return null

  const partner = receipt?.supplier || receipt?.customer
  const status = warehouseReceiptStatuses.find((s) => s.value === receipt?.status)

  const handlePrintWarehouseReceipt = () => {
    if (!receipt) return
    setPrintData(receipt)
    setTimeout(() => setPrintData(null), 100)
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        className={cn(
          'bg-background md:h-auto md:max-w-7xl',
          isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col z-[10002]",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle className={cn(isMobile && "flex flex-col items-start gap-1 items-center")}>
            <span>Thông tin chi tiết phiếu kho: </span>
            <span>{receipt?.code}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Dưới đây là thông tin chi tiết phiếu kho: {receipt?.code}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isMobile ? "h-full px-4 pb-4 flex-1" : "max-h-[75vh]"
        )}>
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-1/3" />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton className="h-64 col-span-2" />
                <Skeleton className="h-64 col-span-1" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 lg:flex-row">
              {/* ===== Left: Thông tin phiếu + Sản phẩm ===== */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className="text-lg font-semibold">
                  Thông tin phiếu kho
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({receipt?.receiptType === 1 ? 'Nhập kho' : 'Xuất kho'})
                  </span>
                </h2>

                <div className="space-y-6">
                  {/* General Info Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Mã phiếu:</span>
                      <p className="font-medium">{receipt?.code}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Ngày lập:</span>
                      <p className="font-medium">{receipt?.createdAt ? dateFormat(receipt.createdAt, true) : 'Chưa cập nhật'}</p>
                    </div>
                    {receipt?.actualReceiptDate && (
                      <div>
                        <span className="text-sm text-muted-foreground">Ngày nhận hàng thực tế:</span>
                        <p className="font-medium text-blue-600">{dateFormat(receipt.actualReceiptDate)}</p>
                      </div>
                    )}

                    {receipt?.invoice && (
                      <div>
                        <span className="text-sm text-muted-foreground">Hóa đơn:</span>
                        <p
                          className="font-medium text-primary cursor-pointer hover:underline hover:text-blue-600"
                          onClick={() => setShowInvoiceDialog(true)}
                        >
                          {receipt.invoice.code}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-muted-foreground">Trạng thái:</span>
                      {isMobile ? (
                        <div className="mt-1 w-[140px]">
                          <Select
                            value={receipt?.status}
                            onValueChange={handleStatusChange}
                          >
                            <SelectTrigger className="h-7 text-xs px-2">
                              <SelectValue placeholder="Chọn trạng thái">
                                {status ? (
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 font-medium',
                                      status.value === 'posted' ? 'text-green-600' :
                                        status.value === 'confirmed' ? 'text-blue-600' :
                                          status.value === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                                    )}
                                  >
                                    {status.label}
                                  </span>
                                ) : null}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper" align="start" className="w-[140px] z-[10005]">
                              {warehouseReceiptStatuses.filter((s) => {
                                if (receipt?.status === 'posted') {
                                  return s.value === 'cancelled'
                                }
                                if (receipt?.status === 'cancelled') {
                                  return false
                                }
                                return true
                              }).map((s) => (
                                <SelectItem
                                  key={s.value}
                                  value={s.value}
                                  className="cursor-pointer text-xs"
                                >
                                  <span
                                    className={cn(
                                      'inline-flex items-center gap-1 font-medium',
                                      s.value === 'posted' ? 'text-green-600' :
                                        s.value === 'confirmed' ? 'text-blue-600' :
                                          s.value === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                                    )}
                                  >
                                    {s.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div
                          className="mt-1 flex items-center gap-2 cursor-pointer hover:opacity-80 w-fit"
                          onClick={() => setShowUpdateStatusDialog(true)}
                        >
                          <Badge className={status?.color}>
                            {status?.label}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Lý do:</span>
                      <p className="font-medium">{receipt?.reason || 'Không có'}</p>
                    </div>
                    {receipt?.note && (
                      <div className="sm:col-span-2">
                        <span className="text-sm text-muted-foreground">Ghi chú:</span>
                        <p className="font-medium">{receipt?.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Product Details List */}
                  {details && details.length > 0 && (
                    <div className="rounded-lg border">
                      <div className="bg-secondary px-4 py-2 text-xs font-semibold">
                        Chi tiết sản phẩm
                      </div>
                      <div className="divide-y">
                        {details.map((detail, index) => (
                          <div key={detail.id || index} className="p-3">
                            <div className="flex flex-col md:flex-row md:items-start gap-3">
                              {/* Left: Image & Info */}
                              <div className="flex items-start gap-3 flex-1">
                                {/* Image */}
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border">
                                  {detail.product?.image ? (
                                    <img src={getPublicUrl(detail.product.image)} alt={detail.productName} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div
                                    className="font-medium cursor-pointer text-primary hover:underline hover:text-blue-600 break-words"
                                    onClick={() => {
                                      setSelectedProductId(detail.productId)
                                      setShowViewProductDialog(true)
                                    }}
                                  >{detail.productName}</div>
                                  <div className="text-sm text-muted-foreground break-words">
                                    Mã: {detail.productCode}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Quantity & Price */}
                              <div className="flex flex-row md:flex-col justify-between md:justify-start items-center md:items-end gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-dashed">
                                {/* Editable Quantities */}
                                {receipt?.status === 'draft' ? (
                                  <div className="flex flex-col gap-2 items-end w-full md:w-auto">
                                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                                      <label className="text-xs text-muted-foreground">SL Chứng từ:</label>
                                      <input
                                        type="number"
                                        className="w-20 h-8 rounded-md border px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary bg-muted"
                                        value={detail.qtyDocument || 0}
                                        readOnly
                                      />
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                                      <label className="text-xs text-muted-foreground">SL Thực tế:</label>
                                      <input
                                        type="number"
                                        className="w-20 h-8 rounded-md border px-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={detail.qtyActual}
                                        onChange={(e) => handleDetailChange(index, 'qtyActual', e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                      />
                                    </div>
                                    {(detail.product?.currentStock !== undefined && detail.product?.currentStock !== null) && (
                                      <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
                                        <label className="text-xs text-muted-foreground">SL Tồn:</label>
                                        <input
                                          type="text"
                                          className="w-20 h-8 rounded-md border px-2 text-sm text-right focus:outline-none bg-muted"
                                          value={parseFloat(detail.product.currentStock).toLocaleString('vi-VN')}
                                          readOnly
                                        />
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex flex-col items-end gap-1 text-sm">
                                      <div className="flex items-center justify-end gap-2">
                                        <span className="text-muted-foreground">CT: {parseFloat(detail.qtyDocument || 0).toLocaleString('vi-VN')}</span>
                                        <span className="text-muted-foreground">|</span>
                                        <Badge variant="outline">
                                          TT: {parseFloat(detail.qtyActual).toLocaleString('vi-VN')} {detail.unitName}
                                        </Badge>
                                      </div>
                                      {(detail.product?.currentStock !== undefined && detail.product?.currentStock !== null) && (
                                        <div className="text-xs text-muted-foreground">
                                          Tồn: {parseFloat(detail.product.currentStock).toLocaleString('vi-VN')}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}

                                <div className="text-sm font-medium">
                                  {moneyFormat(detail.totalAmount)}
                                </div>
                              </div>
                            </div>

                            {/* Lot Allocation Removed */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals Section */}
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div className="hidden md:block"></div> {/* Spacer */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <strong>Tổng số lượng:</strong>
                        <span className="font-medium">
                          {parseFloat(receipt?.totalQuantity || 0).toLocaleString(
                            'vi-VN',
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Tổng tiền:</strong>
                        <span className="font-medium text-primary">
                          {moneyFormat(receipt?.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Right: Thông tin đối tác ===== */}
              <div className="w-full rounded-lg border p-4 lg:w-80 h-fit sticky top-0">
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    {receipt?.receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'}
                  </h2>
                </div>

                {partner ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${partner.name}`}
                          alt={partner.name}
                        />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className="font-medium cursor-pointer text-primary hover:underline hover:text-blue-600"
                          onClick={() => {
                            if (receipt?.receiptType === 1) {
                              setShowSupplierDialog(true)
                            } else {
                              setShowCustomerDialog(true)
                            }
                          }}
                        >
                          {partner.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{partner.code}</div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="font-medium">Thông tin chi tiết</div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {partner.phone && (
                          <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                            <MobileIcon className="mr-2 h-4 w-4" />
                            <a href={`tel:${partner.phone}`}>{partner.phone}</a>
                          </div>
                        )}

                        {partner.identityCard && (
                          <div className="flex items-center text-muted-foreground">
                            <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                            <span>{partner.identityCard}</span>
                          </div>
                        )}

                        {partner.email && (
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="mr-2 h-4 w-4" />
                            <a href={`mailto:${partner.email}`}>{partner.email}</a>
                          </div>
                        )}

                        {partner.address && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4 shrink-0" />
                            <span>{partner.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Chưa có thông tin</div>
                )}

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">Người tạo phiếu</h2>
                </div>

                {receipt?.createdByUser && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt.createdByUser.fullName}`}
                          alt={receipt.createdByUser.fullName}
                        />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{receipt.createdByUser.fullName}</div>
                        <div className="text-xs text-muted-foreground">
                          {dateFormat(receipt.createdAt, true)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      {receipt.createdByUser.phone && (
                        <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                          <MobileIcon className="mr-2 h-4 w-4" />
                          <a href={`tel:${receipt.createdByUser.phone}`}>{receipt.createdByUser.phone}</a>
                        </div>
                      )}
                      {receipt.createdByUser.email && (
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4" />
                          <a href={`mailto:${receipt.createdByUser.email}`}>{receipt.createdByUser.email}</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter
          className={cn(
            'hidden md:flex flex-col md:flex-row gap-2 md:space-x-0',
            contentClassName
          )}
        >
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            {receipt?.status === 'draft' && (
              <Can permission={receipt.receiptType === 1 ? 'WAREHOUSE_IMPORT_UPDATE' : 'WAREHOUSE_EXPORT_UPDATE'}>
                <Button
                  size="sm"
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  <Save className="h-4 w-4" />
                  Lưu
                </Button>
              </Can>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => setShowExportPreview(true)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={handlePrintWarehouseReceipt}
            >
              <Printer className="h-4 w-4" />
              In phiếu
            </Button>
            {receipt?.status === 'draft' && (
              <Can permission={receipt?.receiptType === 1 ? 'WAREHOUSE_IMPORT_UPDATE' : 'WAREHOUSE_EXPORT_UPDATE'}>
                <Button
                  size="sm"
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => setShowUpdateReceiptDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Button>
              </Can>
            )}
            {['draft', 'cancelled'].includes(receipt?.status) && (
              <Can permission={receipt?.receiptType === 1 ? 'WAREHOUSE_IMPORT_DELETE' : 'WAREHOUSE_EXPORT_DELETE'}>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="h-4 w-4" />
                  Xóa
                </Button>
              </Can>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>

        <MobileWarehouseReceiptActions
          receipt={receipt}
          isDesktop={isDesktop}
          canDelete={receipt?.status === 'draft'}
          onEdit={() => setShowUpdateReceiptDialog(true)}
          handlePrintWarehouseReceipt={handlePrintWarehouseReceipt}
          handleExportToExcel={() => setShowExportPreview(true)}
          handleUpdateStatus={() => setShowUpdateStatusDialog(true)}
          handleDeleteReceipt={() => setShowDeleteDialog(true)}
          onCloseParent={() => onOpenChange(false)}
          onSave={handleSaveChanges}
        />
      </DialogContent>

      {/* Update Status Dialog */}
      {showUpdateStatusDialog && (
        <UpdateWarehouseReceiptStatusDialog
          open={showUpdateStatusDialog}
          onOpenChange={(open) => {
            setShowUpdateStatusDialog(open)
            if (!open) setTargetStatus(null)
          }}
          receiptId={receipt.id}
          receiptCode={receipt.code}
          currentStatus={receipt.status}
          targetStatus={targetStatus}
          statuses={warehouseReceiptStatuses}
          onSubmit={handleUpdateStatus}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
          selectContentClassName="z-[100080]"
        />
      )}

      {/* View Invoice Dialog */}
      {showInvoiceDialog && receipt?.invoice && (
        <ViewInvoiceDialog
          invoiceId={receipt.invoice.id}
          open={showInvoiceDialog}
          onOpenChange={setShowInvoiceDialog}
          showTrigger={false}
          onEdit={() => {
            setShowInvoiceDialog(false)
            setTimeout(() => {
              setShowUpdateInvoiceDialog(true)
            }, 100)
          }}
        />
      )}

      {showUpdateInvoiceDialog && receipt?.invoice && (
        <InvoiceDialog
          open={showUpdateInvoiceDialog}
          onOpenChange={setShowUpdateInvoiceDialog}
          invoiceId={receipt.invoice.id}
          showTrigger={false}
        />
      )}

      {/* Print View */}
      {printData && (
        <PrintWarehouseReceiptView
          receipt={printData}
          setting={setting}
        />

      )}

      {
        selectedProductId && (
          <ViewProductDialog
            open={showViewProductDialog}
            onOpenChange={setShowViewProductDialog}
            productId={selectedProductId}
            showTrigger={false}
            contentClassName="z-[100070]"
            overlayClassName="z-[100069]"
          />
        )
      }

      {/* Export Preview Dialog */}
      {showExportPreview && (
        <ExportWarehouseReceiptPreview
          open={showExportPreview}
          onOpenChange={setShowExportPreview}
          receipt={receipt}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <DeleteWarehouseReceiptDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          receipt={receipt}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
          onSuccess={() => {
            onOpenChange?.(false)
            onSuccess?.()
          }}
        />
      )}

      {/* Update Warehouse Receipt Dialog */}
      {showUpdateReceiptDialog && receipt && (
        <UpdateWarehouseReceiptDialog
          open={showUpdateReceiptDialog}
          onOpenChange={setShowUpdateReceiptDialog}
          receiptId={receipt.id}
          onSuccess={() => {
            fetchData()
            onSuccess?.()
          }}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {showCustomerDialog && partner && (
        <CustomerDetailDialog
          open={showCustomerDialog}
          onOpenChange={setShowCustomerDialog}
          customer={partner}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {showSupplierDialog && partner && (
        <ViewSupplierDialog
          open={showSupplierDialog}
          onOpenChange={setShowSupplierDialog}
          supplierId={partner.id}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}



    </Dialog>
  )
}

export default ViewWarehouseReceiptDialog
