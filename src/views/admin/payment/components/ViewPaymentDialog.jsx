import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
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
import { Separator } from '@/components/ui/separator'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, CreditCard, Package, Pencil, Trash2, Printer } from 'lucide-react'
import { useSelector } from 'react-redux'
import PrintPaymentView from './PrintPaymentView'
import MobilePaymentActions from './MobilePaymentActions'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import { getPaymentById, updatePaymentStatus } from '@/stores/PaymentSlice'
import UpdatePaymentStatusDialog from './UpdatePaymentStatusDialog'
import PaymentFormDialog from './PaymentDialog'
import { DeletePaymentDialog } from './DeletePaymentDialog'
import { paymentMethods } from '../../receipt/data'
import { paymentStatus } from '../data'
import { purchaseOrderPaymentStatuses } from '../../purchase-order/data'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import ViewProductDialog from '../../product/components/ViewProductDialog'
import ViewPurchaseOrderDialog from '../../purchase-order/components/ViewPurchaseOrderDialog'

const ViewPaymentDialog = ({
  paymentId,
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  onSuccess,
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [fetchedPayment, setFetchedPayment] = useState(null)

  const [loading, setLoading] = useState(false)
  const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
  const [showUpdatePaymentDialog, setShowUpdatePaymentDialog] = useState(false)
  const [printData, setPrintData] = useState(null)

  const setting = useSelector((state) => state.setting.setting)

  // View Product
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [showViewProductDialog, setShowViewProductDialog] = useState(false)


  // View Purchase Order
  const [selectedPurchaseOrderId, setSelectedPurchaseOrderId] = useState(null)
  const [showViewPurchaseOrderDialog, setShowViewPurchaseOrderDialog] = useState(false)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const payment = fetchedPayment

  // Determine source of items: PO -> Direct Products
  const purchaseOrder = payment?.purchaseOrder

  // Filter statuses logic matching UpdatePaymentStatusDialog
  const filteredStatuses = (status) => {
    const normalizedStatus = status === 'cancelled' ? 'cancelled' : status

    if (normalizedStatus === 'cancelled') {
      return paymentStatus.filter(
        (s) => s.value === 'cancelled',
      )
    }
    if (normalizedStatus === 'completed') {
      return paymentStatus.filter((s) => s.value !== 'draft')
    }
    return paymentStatus
  }

  const selectedStatusObj = paymentStatus.find((s) => s.value === payment?.status)

  let items = []
  if (purchaseOrder?.items?.length > 0) {
    items = purchaseOrder.items
  } else if (payment?.products?.length > 0) {
    items = payment.products
  }

  const dispatch = useDispatch()

  const handleUpdateStatus = async (newStatus, id) => {
    try {
      await dispatch(updatePaymentStatus({ id, status: newStatus })).unwrap()
      setShowUpdateStatusDialog(false)
      // Refetch payment to update view
      if (paymentId) {
        const result = await dispatch(getPaymentById(paymentId)).unwrap()
        setFetchedPayment(result)
        onSuccess?.()
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    if (open && paymentId) {
      const fetchPayment = async () => {
        setLoading(true)
        try {
          const result = await dispatch(getPaymentById(paymentId)).unwrap()
          setFetchedPayment(result)
        } catch (error) {
          console.error("Failed to fetch payment", error)
          toast.error("Không thể tải thông tin phiếu chi")
        } finally {
          setLoading(false)
        }
      }
      fetchPayment()
    } else if (!open) {
      // Reset state when closed
      setFetchedPayment(null)
    }
  }, [open, paymentId, dispatch])

  const handlePrintPayment = () => {
    if (!payment) return
    setPrintData(payment)
    setTimeout(() => setPrintData(null), 100)
  }

  // Helper to determine display name for receiver type
  const getReceiverLabel = () => {
    if (payment?.receiverType === 'customer') return 'Khách hàng'
    if (payment?.receiverType === 'supplier') return 'Nhà cung cấp'
    if (payment?.receiverType === 'employee') return 'Nhân viên'
    return 'Người nhận'
  }

  // Helper to get receiver data
  const getReceiverData = () => {
    if (payment?.receiver) return payment.receiver
    if (purchaseOrder?.supplier) return purchaseOrder.supplier
    // Add other cases if needed
    return {}
  }

  const receiverData = getReceiverData()
  const receiverLabel = getReceiverLabel()


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
          <DialogTitle className={cn(isMobile && "flex flex-col items-center gap-1")}>
            <span>Thông tin chi tiết phiếu chi: </span>
            <span>{payment?.code}</span>
          </DialogTitle>
          {!isMobile && (
            <DialogDescription>
              Dưới đây là thông tin chi tiết phiếu chi: {payment?.code}
            </DialogDescription>
          )}
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
                <h2 className={cn("text-lg font-semibold", isMobile && "flex flex-col gap-1")}>
                  Thông tin phiếu chi
                  {payment?.purchaseOrder && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      (Đơn hàng: <span
                        className="cursor-pointer text-primary hover:underline hover:text-blue-600"
                        onClick={() => {
                          setSelectedPurchaseOrderId(payment.purchaseOrder.id)
                          setShowViewPurchaseOrderDialog(true)
                        }}
                      >{payment.purchaseOrder.code}</span>)
                    </span>
                  )}

                </h2>

                <div className="space-y-6">
                  {/* Bảng sản phẩm (Nếu có thông tin đơn hàng đi kèm) */}
                  {items.length > 0 ? (
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
                              {/* <TableHead className="min-w-16">Thuế</TableHead> */}
                              {/* <TableHead className="min-w-28 md:w-16">
                                Giảm giá
                              </TableHead> */}
                              <TableHead className="min-w-28 text-right">Tổng cộng</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={item.id || index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                      {item.product?.image ? (
                                        <img
                                          src={getPublicUrl(item.product.image)}
                                          alt={item.productName || item.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                                          <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div
                                        className="font-medium cursor-pointer text-primary hover:underline hover:text-blue-600"
                                        onClick={() => {
                                          setSelectedProductId(item.productId || item.product?.id)
                                          setShowViewProductDialog(true)
                                        }}
                                      >
                                        {item.productName || item.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">{item.productCode || item.code}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>
                                  {item.unitName || item.unit || '—'}
                                </TableCell>
                                <TableCell>
                                  {moneyFormat(item.unitPrice || item.price)}
                                </TableCell>
                                {/* <TableCell className="text-end">
                                  {moneyFormat(item.taxAmount || 0)}
                                </TableCell>
                                <TableCell className="text-end">
                                  {moneyFormat(item.discountAmount || item.discount || 0)}
                                </TableCell> */}
                                <TableCell className="text-end">
                                  {moneyFormat(item.totalAmount || item.total)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="space-y-4">
                          {items.map((item, index) => (
                            <div
                              key={item.id || index}
                              className="rounded-lg border p-3 shadow-sm bg-card text-card-foreground"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/50">
                                  {item.product?.image ? (
                                    <img
                                      src={getPublicUrl(item.product.image)}
                                      alt={item.productName || item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-secondary">
                                      <Package className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer text-primary hover:underline hover:text-blue-600"
                                    onClick={() => {
                                      setSelectedProductId(item.productId || item.product?.id)
                                      setShowViewProductDialog(true)
                                    }}
                                  >
                                    {item.productName || item.name}
                                  </div>
                                  <div className="text-[10px] font-bold text-muted-foreground mt-1">
                                    {item.productCode || item.code}
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground text-xs">Số lượng</span>
                                  <span className="font-medium">{Number(item.quantity || 0)} {item.unitName || item.unit}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-muted-foreground text-xs">Đơn giá</span>
                                  <span className="font-medium">{moneyFormat(item.unitPrice || item.price)}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between items-end bg-secondary/30 p-2 rounded">
                                <span className="font-semibold text-sm">Thành tiền</span>
                                <span className="font-bold text-primary">{moneyFormat(item.totalAmount || item.total)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4 border rounded bg-secondary/20">
                      Không có thông tin sản phẩm
                    </div>
                  )}

                  {/* Tổng hợp & công nợ */}
                  <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div className="text-sm">
                      <strong className="text-destructive">Lý do chi: </strong>
                      <span className="text-primary">
                        {payment?.reason || payment?.note || 'Không có'}
                      </span>
                      {payment?.note && payment.note !== payment.reason && (
                        <div className="mt-1">
                          <strong>Ghi chú thêm: </strong> {payment.note}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="flex justify-between">
                        <strong>Số tiền chi:</strong>
                        <div className="font-bold text-lg">{moneyFormat(payment?.amount)}</div>
                      </div>
                      <div className="flex justify-start">
                        <div className="text-sm">
                          Số tiền viết bằng chữ:{' '}
                          <span className="font-medium italic">
                            {toVietnamese(payment?.amount || 0)}
                          </span>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <strong>Trạng thái:</strong>
                        {isMobile ? (
                          <div className='flex items-center justify-end'>
                            <Select
                              value={payment?.status}
                              onValueChange={(val) => handleUpdateStatus(val, payment.id)}
                            >
                              <SelectTrigger className="h-auto border-none bg-transparent p-0 text-xs focus:ring-0 focus:ring-offset-0">
                                <SelectValue placeholder="Chọn trạng thái">
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                      payment?.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        payment?.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                          'bg-yellow-100 text-yellow-700'
                                    )}
                                  >
                                    {selectedStatusObj?.label || payment?.status}
                                  </span>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent position="popper" align="end" className="w-[140px] z-[100070]">
                                {filteredStatuses(payment?.status).map((s) => (
                                  <SelectItem
                                    key={s.value}
                                    value={s.value}
                                    className="cursor-pointer text-xs"
                                  >
                                    <span
                                      className={cn(
                                        "inline-flex items-center gap-1 font-medium",
                                        s.value === 'completed' ? 'text-green-600' :
                                          s.value === 'cancelled' ? 'text-red-600' :
                                            'text-yellow-600'
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
                            className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                            onClick={() => setShowUpdateStatusDialog(true)}
                          >
                            <Badge
                              className={cn(
                                payment?.status === 'completed' ? 'bg-green-500' : (payment?.status === 'canceled' || payment?.status === 'cancelled') ? 'bg-red-500' : 'bg-yellow-500'
                              )}
                            >
                              {payment?.status === 'completed' ? 'Đã chi' : payment?.status === 'draft' ? 'Nháp' : payment?.status === 'cancelled' ? 'Đã hủy' : payment?.status || 'Không xác định'}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {showUpdateStatusDialog && (
                        <UpdatePaymentStatusDialog
                          open={showUpdateStatusDialog}
                          onOpenChange={setShowUpdateStatusDialog}
                          paymentId={payment?.id}
                          currentStatus={payment?.status}
                          statuses={paymentStatus}
                          onSubmit={handleUpdateStatus}
                          contentClassName="z-[100070]"
                          overlayClassName="z-[100069]"
                          selectContentClassName="z-[100080]"
                        />
                      )}

                      {/* Financial summary from related source */}
                      {(purchaseOrder) && (
                        <>
                          <div className="flex justify-between mt-2">
                            <strong>Tổng đơn hàng:</strong>
                            <div>{moneyFormat(purchaseOrder?.totalAmount)}</div>
                          </div>
                          <div className="flex justify-between">
                            <strong>Đã thanh toán:</strong>
                            <div>{moneyFormat(purchaseOrder?.paidAmount)}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lịch sử thanh toán */}
                  <Separator className="my-4" />
                  <h2 className="text-lg font-semibold">Thông tin thanh toán</h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <strong>Phương thức:</strong>
                      {(() => {
                        const method = payment?.paymentMethod
                        const methodObj = paymentMethods.find(m => m.value === method)
                        const Icon = methodObj?.icon

                        return (
                          <Badge variant="outline" className={`border-transparent bg-transparent px-0 font-medium ${methodObj?.color || 'text-slate-700'}`}>
                            {Icon && <Icon className="mr-1 h-3 w-3" />}
                            {methodObj?.label || (method === 'cash' ? 'Tiền mặt' : (method === 'transfer' || method === 'bank_transfer') ? 'Chuyển khoản' : method || 'Không xác định')}
                          </Badge>
                        )
                      })()}
                    </div>
                    <div className="flex items-center justify-between">
                      <strong>Ngày tạo phiếu:</strong>
                      <span>{dateFormat(payment?.paymentDate || payment?.createdAt, true)}</span>
                    </div>

                    {payment?.paymentMethod === 'transfer' && payment?.bankAccount && (
                      <div className="mt-2 rounded border border-dashed p-3">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Thông tin tài khoản nguồn (Ngân hàng Cty):</div>
                        <div className="space-y-1">
                          {payment.bankAccount?.bankName && <div><strong>Ngân hàng:</strong> {payment.bankAccount.bankName}</div>}
                          {payment.bankAccount?.accountNumber && <div><strong>Số TK:</strong> {payment.bankAccount.accountNumber}</div>}
                          {payment.bankAccount?.accountName && <div><strong>Chủ TK:</strong> {payment.bankAccount.accountName}</div>}
                        </div>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* ===== Right: Nhà cung cấp & Nhân viên ===== */}
              <div className="w-full rounded-lg border p-4 lg:w-80 h-fit bg-card lg:sticky lg:top-0">
                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">{receiverLabel}</h2>
                </div>

                <div className="space-y-6">
                  {receiverData?.name || payment?.receiverId ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${receiverData?.name || 'User'}`}
                            alt={receiverData?.name}
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{receiverData?.name || 'Người nhận'}</div>
                          {receiverData?.code && <div className="text-xs text-muted-foreground">{receiverData.code}</div>}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">Thông tin liên hệ</div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <MobileIcon className="h-4 w-4" />
                            </div>
                            <a href={`tel:${receiverData?.phone}`}>
                              {receiverData?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            {receiverData?.identityCard || 'Chưa cập nhật'}
                          </div>

                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${receiverData?.email}`}>
                              {receiverData?.email || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4 ">
                              <MapPin className="h-4 w-4" />
                            </div>
                            {receiverData?.address || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Không có thông tin người nhận</div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <h2 className="py-2 text-lg font-semibold">
                    Người tạo phiếu
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${payment?.createdByUser?.fullName}`}
                        alt={payment?.createdByUser?.fullName}
                      />
                      <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {payment?.createdByUser?.fullName || payment?.createdBy}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dateFormat(payment?.createdAt, true)}
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
                        <a href={`tel:${payment?.createdByUser?.phone}`}>
                          {payment?.createdByUser?.phone || 'Chưa cập nhật'}
                        </a>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <div className="mr-2 h-4 w-4 ">
                          <Mail className="h-4 w-4" />
                        </div>
                        <a href={`mailto:${payment?.createdByUser?.email}`}>
                          {payment?.createdByUser?.email || 'Chưa cập nhật'}
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
            <Button
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={handlePrintPayment}
            >
              <Printer className="h-4 w-4" />
              In phiếu
            </Button>

            {payment?.status === 'draft' && (
              <Button
                size="sm"
                className="gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setShowUpdatePaymentDialog(true)}
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
            )}

            {(payment?.status === 'draft' || payment?.status === 'cancelled' || payment?.status === 'canceled') && (
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

        <MobilePaymentActions
          payment={payment}
          isMobile={isMobile}
          handlePrintPayment={handlePrintPayment}
          setShowDeleteDialog={setShowDeleteDialog}
          setShowUpdateDialog={setShowUpdatePaymentDialog}
          className="z-[100070]"
          overlayClassName="z-[100069]"
        />
      </DialogContent>

      {selectedProductId && (
        <ViewProductDialog
          open={showViewProductDialog}
          onOpenChange={setShowViewProductDialog}
          productId={selectedProductId}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}



      {selectedPurchaseOrderId && (
        <ViewPurchaseOrderDialog
          open={showViewPurchaseOrderDialog}
          onOpenChange={setShowViewPurchaseOrderDialog}
          purchaseOrderId={selectedPurchaseOrderId}
          showTrigger={false}
          contentClassName="!z-[100070]"
          overlayClassName="!z-[100069]"
        />
      )}

      {payment && (
        <DeletePaymentDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          payment={payment}
          showTrigger={false}
          onSuccess={() => {
            setShowDeleteDialog(false)
            onOpenChange(false)
            onSuccess?.()
          }}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {showUpdatePaymentDialog && (
        <PaymentFormDialog
          open={showUpdatePaymentDialog}
          onOpenChange={setShowUpdatePaymentDialog}
          paymentId={payment?.id}
          onSuccess={() => {
            // Refetch payment
            if (paymentId) {
              dispatch(getPaymentById(paymentId)).then((result) => {
                setFetchedPayment(result.payload)
              })
            }
          }}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {/* Print View */}
      {printData && (
        <PrintPaymentView
          payment={printData}
          setting={setting}
        />
      )}
    </Dialog>
  )
}

export default ViewPaymentDialog
