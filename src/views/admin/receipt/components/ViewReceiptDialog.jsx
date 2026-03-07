import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { Button } from '@/components/custom/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { React } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, CreditCard, Package, Pencil, Trash2 } from 'lucide-react'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'
import { Printer } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import { getReceiptById, updateReceiptStatus, getReceiptQRCode } from '@/stores/ReceiptSlice'
import UpdateReceiptStatusDialog from './UpdateReceiptStatusDialog'
import { DeleteReceiptDialog } from './DeleteReceiptDialog'
import { receiptStatus, paymentMethods } from '../data'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { QrCode } from 'lucide-react'
import PaymentQRCodeDialog from './PaymentQRCodeDialog'
import PrintReceiptView from './PrintReceiptView'
import MobileReceiptActions from './MobileReceiptActions'
const ViewReceiptDialog = ({
  receiptId,
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [receipt, setReceipt] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [printData, setPrintData] = useState(null)

  const [qrCodeData, setQrCodeData] = useState(null)
  const [openQrDisplayDialog, setOpenQrDisplayDialog] = useState(false)

  const handleGenerateQR = async (receiptData) => {
    // If called from mobile actions, receiptData is passed. If from button, use state receipt.
    const targetReceipt = receiptData || receipt

    if (!targetReceipt) return

    if (targetReceipt.status !== 'draft') {
      toast.warning('Chỉ có thể tạo mã QR cho phiếu thu nháp')
      return
    }

    try {
      // Reuse loading state or add specific one if needed. 
      // Using global loading might hide dialog content, so maybe just toast errors/success or separate loader.
      // For now, fast enough or blocks user interaction slightly?
      // DataTableRowActions uses local qrLoading.

      const qrData = await dispatch(getReceiptQRCode(targetReceipt.id)).unwrap()
      setQrCodeData(qrData)
      setOpenQrDisplayDialog(true)
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
      toast.error('Không lấy được mã QR thanh toán')
    }
  }

  // View Product
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)

  // View Invoice
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null)
  const [showViewInvoiceDialog, setShowViewInvoiceDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const setting = useSelector((state) => state.setting.setting)

  const invoiceItems = receipt?.invoice?.items || []

  const dispatch = useDispatch()

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      await dispatch(updateReceiptStatus({ id, status: newStatus })).unwrap()
      setShowUpdateStatusDialog(false)
      // Refetch receipt to update view
      const result = await dispatch(getReceiptById(receiptId)).unwrap()
      setReceipt(result)
      toast.success('Cập nhật trạng thái thành công')
    } catch (error) {
      console.error(error)
      // Toast is handled in slice usually, but adding success here
    }
  }

  const getReceiptStatusObj = (statusValue) => {
    return receiptStatus.find(s => s.value === statusValue)
  }

  const getReceiptStatusColor = (statusValue) => {
    switch (statusValue) {
      case 'draft': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'canceled':
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  useEffect(() => {
    if (open && receiptId) {
      const fetchReceipt = async () => {
        setLoading(true)
        try {
          const result = await dispatch(getReceiptById(receiptId)).unwrap()
          setReceipt(result)
        } catch (error) {
          console.error("Failed to fetch receipt", error)
          toast.error("Không thể tải thông tin phiếu thu")
        } finally {
          setLoading(false)
        }
      }
      fetchReceipt()
    } else {
      setReceipt(null)
    }
  }, [open, receiptId, dispatch])

  const handlePrintReceipt = () => {
    if (!receipt) return
    setPrintData(receipt)
    // small timeout to clear print data if needed, but react-to-print handles ref logic
    setTimeout(() => setPrintData(null), 100)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className={cn(
          "md:h-auto md:max-w-7xl",
          isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle className={cn(isMobile && "flex flex-col items-start gap-1 items-center")}>
            <span>Thông tin chi tiết phiếu thu: </span>
            <span>{receipt?.code}</span>
          </DialogTitle>
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
              {/* ===== Left: Phiếu + bảng hàng hoá ===== */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className={cn("text-lg font-semibold flex", isMobile ? "flex-col items-start gap-1" : "items-center")}>
                  Thông tin phiếu thu
                  {receipt?.invoice && (
                    <span className={cn("text-sm text-muted-foreground", isMobile ? "ml-0" : "ml-2")}>
                      (Hóa đơn: <div
                        className="inline cursor-pointer text-primary hover:underline hover:text-blue-600"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedInvoiceId(receipt.invoice.id)
                          setShowViewInvoiceDialog(true)
                        }}
                      >{receipt.invoice.code}</div>)
                    </span>
                  )}
                  {/* {receipt?.salesContract && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Hợp đồng: {receipt.salesContract.code})
                    </span>
                  )} */}
                </h2>

                <div className="space-y-6">
                  {/* Bảng sản phẩm */}
                  <div className={cn("rounded-lg border", isMobile && "border-0")}>
                    {!isMobile ? (
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
                            <TableHead className="w-8">TT</TableHead>
                            <TableHead className="min-w-40">Sản phẩm</TableHead>
                            <TableHead className="min-w-20">SL</TableHead>
                            <TableHead className="min-w-16">ĐVT</TableHead>
                            <TableHead className="min-w-20">Giá</TableHead>
                            <TableHead className="min-w-16">Thuế</TableHead>
                            <TableHead className="min-w-28 md:w-16">
                              Giảm giá
                            </TableHead>
                            <TableHead className="min-w-28">Tổng cộng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceItems.map((product, index) => (
                            <TableRow key={product.id || index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                    {product?.image ? (
                                      <img
                                        src={getPublicUrl(product.image)}
                                        alt={product.productName}
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
                                      {product.product?.code || product.productCode || '—'}
                                    </div>
                                    <div
                                      className="font-medium cursor-pointer text-primary hover:underline hover:text-blue-600"
                                      onClick={() => {
                                        setSelectedProductId(product.productId)
                                        setShowViewProductDialog(true)
                                      }}
                                    >
                                      {product.productName}
                                    </div>
                                    {product?.options && (
                                      <div className="break-words text-sm text-muted-foreground">
                                        {product.options
                                          ?.map(
                                            (option) =>
                                              `${option.name}: ${option.pivot.value}`,
                                          )
                                          .join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell>
                                {product.unitName || 'Không có'}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.price)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.taxAmount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.discount)}
                              </TableCell>
                              <TableCell className="text-end">
                                {moneyFormat(product.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="space-y-4">
                        {invoiceItems.map((product, index) => (
                          <div
                            key={product.id || index}
                            className="rounded-lg border p-3 shadow-sm bg-card text-card-foreground"
                          >
                            {/* Header: Image + Name + Code */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/50">
                                {product?.image ? (
                                  <img
                                    src={getPublicUrl(product.image)}
                                    alt={product.productName}
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
                                  {product.product?.code || product.productCode || '—'}
                                </div>
                                <div
                                  className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer text-primary hover:underline hover:text-blue-600"
                                  onClick={() => {
                                    setSelectedProductId(product.productId)
                                    setShowViewProductDialog(true)
                                  }}
                                >
                                  {product.productName}
                                </div>
                                {product?.options && (
                                  <div className="break-words text-xs text-muted-foreground mt-1">
                                    {product.options
                                      ?.map(
                                        (option) =>
                                          `${option.name}: ${option.pivot.value}`,
                                      )
                                      .join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">
                                  Số lượng
                                </span>
                                <span className="font-medium">
                                  {Number(product.quantity)} {product.unitName}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-muted-foreground text-xs">
                                  Đơn giá
                                </span>
                                <span className="font-medium">
                                  {moneyFormat(product.price)}
                                </span>
                              </div>

                              <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">
                                  Giảm giá
                                </span>
                                <span className="font-medium">
                                  {moneyFormat(product.discount)}
                                </span>
                              </div>
                              <div className="flex flex-col text-right">
                                <span className="text-muted-foreground text-xs">
                                  Thuế
                                </span>
                                <span className="font-medium">
                                  {moneyFormat(product.taxAmount)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-2 flex justify-between items-end bg-secondary/30 p-2 rounded">
                              <span className="font-semibold text-sm">
                                Thành tiền
                              </span>
                              <span className="font-bold text-primary">
                                {moneyFormat(product.total)}
                              </span>
                            </div>

                            {/* Note/Warranty if exists */}
                            {(product.note || product.warranty) && (
                              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                {product.warranty && (
                                  <div className="flex gap-1">
                                    <span className="font-semibold">BH:</span>{' '}
                                    {product.warranty}
                                  </div>
                                )}
                                {product.note && (
                                  <div className="flex gap-1">
                                    <span className="font-semibold">GC:</span>{' '}
                                    {product.note}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tổng hợp & công nợ */}
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div className="text-sm">
                      <strong className="text-destructive">Ghi chú: </strong>
                      <span className="text-primary">
                        {receipt?.note || 'Không có'}
                      </span>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <strong>Tổng tiền:</strong>
                        <div>{moneyFormat(receipt?.amount || receipt?.invoice?.totalAmount)}</div>
                      </div>
                      <div className="flex justify-start">
                        <div className="text-sm">
                          Số tiền viết bằng chữ:{' '}
                          <span className="font-medium italic">
                            {toVietnamese(receipt?.amount || receipt?.invoice?.totalAmount || 0)}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between">
                        <strong>Trạng thái:</strong>
                        {isMobile ? (
                          <div className='flex items-center justify-end'>
                            <Select
                              value={receipt?.status === 'cancelled' ? 'canceled' : receipt?.status}
                              onValueChange={(val) => handleUpdateStatus(val, receipt.id)}
                            >
                              <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                <SelectValue>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                      getReceiptStatusColor(receipt?.status)
                                    )}
                                  >
                                    {getReceiptStatusObj(receipt?.status === 'cancelled' ? 'canceled' : receipt?.status)?.icon &&
                                      // Using standard icon rendering if available in data, or fallback
                                      // actually data.js has icons as components
                                      ((Icon) => Icon && <Icon className="h-3 w-3" />)(getReceiptStatusObj(receipt?.status === 'cancelled' ? 'canceled' : receipt?.status)?.icon)
                                    }
                                    {getReceiptStatusObj(receipt?.status)?.label || receipt?.status}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent align="end" className="w-[140px] z-[100060]">
                                {receiptStatus
                                  .filter((s) => {
                                    const currentStatus = receipt?.status === 'cancelled' ? 'canceled' : receipt?.status
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
                                        className={cn(
                                          "flex items-center gap-1 rounded-full px-2 py-1",
                                          getReceiptStatusColor(s.value)
                                        )}
                                      >
                                        {s.icon && <s.icon className="h-3 w-3" />}
                                        <span>{s.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                            onClick={() => setShowUpdateStatusDialog(true)}
                          >
                            <Badge
                              className={cn(
                                receipt?.status === 'completed' ? 'bg-green-500' : (receipt?.status === 'canceled' || receipt?.status === 'cancelled') ? 'bg-red-500' : 'bg-yellow-500'
                              )}
                            >
                              {receipt?.status === 'completed' ? 'Đã thu' : receipt?.status === 'draft' ? 'Nháp' : (receipt?.status === 'cancelled' || receipt?.status === 'canceled') ? 'Đã hủy' : receipt?.status || 'Không xác định'}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {showUpdateStatusDialog && (
                        <UpdateReceiptStatusDialog
                          open={showUpdateStatusDialog}
                          onOpenChange={setShowUpdateStatusDialog}
                          receiptId={receipt.id}
                          currentStatus={receipt.status}
                          statuses={receiptStatus}
                          onSubmit={handleUpdateStatus}
                          contentClassName="z-[10006]"
                          overlayClassName="z-[10005]"
                        />
                      )}
                      <div className="flex justify-between">
                        <strong>Đã thanh toán:</strong>
                        <div>{moneyFormat(receipt?.invoice?.paidAmount ?? receipt?.invoice?.paid_amount ?? 0)}</div>
                      </div>
                      <div className="flex justify-between">
                        <strong>Còn lại:</strong>
                        <div>
                          {(() => {
                            const total = parseFloat(receipt?.amount || receipt?.invoice?.totalAmount || 0)
                            const paid = parseFloat(receipt?.invoice?.paidAmount ?? receipt?.invoice?.paid_amount ?? 0)
                            const remaining = total - paid
                            return (
                              <Badge
                                className={
                                  remaining > 0
                                    ? 'border-transparent shadow-none text-destructive bg-transparent px-0 text-sm hover:bg-transparent'
                                    : 'border-transparent shadow-none text-green-600 bg-transparent px-0 text-sm hover:bg-transparent'
                                }
                              >
                                {remaining > 0 ? moneyFormat(remaining) : 'Đã thanh toán hết'}
                              </Badge>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lịch sử thanh toán */}
                  <Separator className="my-4" />
                  <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <strong>Phương thức:</strong>
                      {(() => {
                        const method = receipt?.paymentMethod
                        const methodObj = paymentMethods.find((m) => m.value === method)
                        const IconComponent = methodObj?.icon

                        return (
                          <Badge className={cn("border-transparent shadow-none bg-transparent px-0 hover:bg-transparent", methodObj?.color)}>
                            {IconComponent && <IconComponent className="mr-1.5 h-3.5 w-3.5" />}
                            {methodObj?.label || method || 'Không xác định'}
                          </Badge>
                        )
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <strong>Ngày thanh toán:</strong>
                      <span>{dateFormat(receipt?.paymentDate, true)}</span>
                    </div>

                    {receipt?.paymentMethod === 'transfer' && receipt?.bankName && (
                      <div className="mt-2 rounded border border-dashed p-3">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Thông tin chuyển khoản:</div>
                        <div className="space-y-1">
                          <div><strong>Ngân hàng:</strong> {receipt.bankName}</div>
                          {receipt.bankBranch && <div><strong>Chi nhánh:</strong> {receipt.bankBranch}</div>}
                          {receipt.bankAccountNumber && <div><strong>Số TK:</strong> {receipt.bankAccountNumber}</div>}
                          {receipt.bankAccountName && <div><strong>Chủ TK:</strong> {receipt.bankAccountName}</div>}
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* ===== Right: Khách hàng & Nhân viên ===== */}
              <div className="w-full rounded-lg border p-4 lg:w-80 h-fit sticky top-0">
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.receiver?.name}`}
                        alt={receipt?.receiver?.name}
                      />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{receipt?.receiver?.name}</div>
                      {receipt?.receiver?.code && (
                        <div className="text-xs text-muted-foreground">{receipt.receiver.code}</div>
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
                        <a href={`tel:${receipt?.receiver?.phone}`}>
                          {receipt?.receiver?.phone || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        {receipt?.receiver?.identityCard || 'Chưa cập nhật'}
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <Mail className="h-4 w-4" />
                        </div>
                        <a href={`mailto:${receipt?.receiver?.email}`}>
                          {receipt?.receiver?.email || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-primary hover:text-secondary-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <MapPin className="h-4 w-4" />
                        </div>
                        {receipt?.receiver?.address || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    Người lập phiếu thu
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receipt?.createdByUser?.fullName}`}
                        alt={receipt?.createdByUser?.fullName}
                      />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {receipt?.createdByUser?.fullName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateFormat(receipt?.createdAt, true)}
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
                        <a href={`tel:${receipt?.createdByUser?.phone}`}>
                          {receipt?.createdByUser?.phone || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <Mail className="h-4 w-4" />
                        </div>
                        <a href={`mailto:${receipt?.createdByUser?.email}`}>
                          {receipt?.createdByUser?.email || 'Chưa cập nhật'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* ===== End right ===== */}
            </div>
          )}
        </div>

        <DialogFooter className={cn("hidden md:flex sm:space-x-0")}>
          <div className={cn("w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end")}>
            {(receipt?.status === 'draft') && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 w-full sm:w-auto text-primary border-primary hover:bg-primary/10"
                onClick={() => handleGenerateQR(receipt)}
              >
                <QrCode className="h-4 w-4" />
                Tạo QR
              </Button>
            )}

            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={handlePrintReceipt}
            >
              <Printer className="h-4 w-4" />
              In phiếu
            </Button>

            {(receipt?.status === 'draft' || receipt?.status === 'cancelled' || receipt?.status === 'canceled') && (
              <Button
                size="sm"
                variant="destructive"
                className="gap-2 w-full sm:w-auto"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            )}

            <DialogClose asChild>
              <Button size="sm" type="button" variant="outline" className="w-full sm:w-auto">
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>

        <MobileReceiptActions
          receipt={receipt}
          isMobile={isMobile}
          handlePrintReceipt={handlePrintReceipt}
          setShowDeleteDialog={setShowDeleteDialog}
          handleGenerateQR={handleGenerateQR}
        />
      </DialogContent>

      {/* Print View */}
      {printData && (
        <PrintReceiptView
          receipt={printData}
          setting={setting}
        />
      )}

      {/* QR Code Dialog */}
      <PaymentQRCodeDialog
        open={openQrDisplayDialog}
        onOpenChange={setOpenQrDisplayDialog}
        qrCodeData={qrCodeData}
        overlayClassName="z-[100060]"
        className="z-[100061]"
      />

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

      {
        selectedInvoiceId && (
          <ViewInvoiceDialog
            open={showViewInvoiceDialog}
            onOpenChange={setShowViewInvoiceDialog}
            invoiceId={selectedInvoiceId}
            showTrigger={false}
            contentClassName="!z-[100060]"
            overlayClassName="!z-[100059]"
          />
        )
      }
      {
        receipt && (
          <DeleteReceiptDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            receipt={receipt}
            showTrigger={false}
            onSuccess={() => {
              setShowDeleteDialog(false)
              onOpenChange(false)
            }}
            contentClassName="z-[100060]"
            overlayClassName="z-[100059]"
          />
        )
      }
    </Dialog>
  )
}

export default ViewReceiptDialog


