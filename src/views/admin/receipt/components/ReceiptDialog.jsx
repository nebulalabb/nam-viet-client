import { Button } from '@/components/custom/Button'
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
import { IdCardIcon, MobileIcon, PlusIcon, CaretSortIcon } from '@radix-ui/react-icons'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useState } from 'react'
import { getInvoiceDetail } from '@/stores/InvoiceSlice'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Mail, MapPin, User, RefreshCcw, CheckIcon } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentMethods, receiptTypes } from '../data'
import { createReceiptSchema } from '../schema'
import { useDispatch, useSelector } from 'react-redux'
import { createReceipt, updateReceipt, getReceiptById, getReceiptQRCode } from '@/stores/ReceiptSlice'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/utils/file'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getCustomers } from '@/stores/CustomerSlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import { toast } from 'sonner'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import PaymentQRCodeDialog from '../../receipt/components/PaymentQRCodeDialog'
import { ChevronsUpDown } from 'lucide-react'

const ReceiptDialog = ({
  invoiceId,
  receiptId,
  receipt: propReceipt,
  open,
  onOpenChange,
  showTrigger = true,
  table,
  contentClassName,
  overlayClassName,
  qrContentClassName, // New prop
  qrOverlayClassName, // New prop
  onSuccess,
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)
  const [qrCodeData, setQrCodeData] = useState(null)
  const [showQrDialog, setShowQrDialog] = useState(false)
  const [createdReceiptId, setCreatedReceiptId] = useState(null)
  const setting = useSelector((state) => state.setting.setting)

  const [customTypes, setCustomTypes] = useState([])
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const allReceiptTypes = [...receiptTypes, ...customTypes]

  const handleAddType = () => {
    if (!newTypeName.trim()) return
    const isExist = allReceiptTypes.find((t) => t.label.toLowerCase() === newTypeName.trim().toLowerCase())
    if (!isExist) {
       const newType = { value: 'custom_' + newTypeName.trim(), label: newTypeName.trim() }
       setCustomTypes([...customTypes, newType])
       form.setValue('receiptType', newType.value)
    } else {
       form.setValue('receiptType', isExist.value)
    }
    setNewTypeName('')
    setIsAddTypeOpen(false)
  }

  const customers = useSelector((state) => state.customer.customers)
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [openCustomerPopover, setOpenCustomerPopover] = useState(false)
  const [selectedRefundSupplier, setSelectedRefundSupplier] = useState(null)
  const [openRefundSupplierPopover, setOpenRefundSupplierPopover] = useState(false)

  const effectiveReceiptId = receiptId || propReceipt?.id
  const isEditMode = !!effectiveReceiptId

  const [fetchedReceipt, setFetchedReceipt] = useState(null)
  const receipt = fetchedReceipt || propReceipt

  const invoiceItems = invoiceData?.details || invoiceData?.invoiceItems || []
  const customer = invoiceData?.customer
  const banks = setting?.banks || []
  const isStandaloneMode = !invoiceId && !receipt?.invoiceId && !effectiveReceiptId

  const totalAmountFromInvoice = parseFloat(invoiceData?.totalAmount || invoiceData?.amount || 0)
  const totalTaxAmount = parseFloat(invoiceData?.taxAmount || 0)
  const totalDiscount = parseFloat(invoiceData?.discountAmount || 0)
  const paidAmount = parseFloat(invoiceData?.paidAmount || 0)

  const pendingAmount = (() => {
    if (!invoiceData) return 0
    const vouchers = invoiceData.paymentReceipts || invoiceData.receiptVouchers || invoiceData.receipts || invoiceData.paymentVouchers || []
    return vouchers
      .filter(p => (!p.isPosted || p.status === 'draft') && p.id !== effectiveReceiptId)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
  })()

  const remainingAmount = Math.max(0, totalAmountFromInvoice - paidAmount - pendingAmount)

  const isPostedReceipt = receipt?.status === 'posted'
  const maxAllowableAmount = remainingAmount + (isEditMode && isPostedReceipt ? parseFloat(receipt?.amount || 0) : 0)

  const form = useForm({
    resolver: zodResolver(createReceiptSchema),
    defaultValues: async () => ({
      note: '',
      receiptType: isStandaloneMode ? 'debt_collection' : 'sales',
      totalAmount: remainingAmount > 0 ? remainingAmount : 0,
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      bankAccount: null,

      receiptDate: new Date().toISOString().split('T')[0],
      isDeposit: false,
    }),
  })

  const selectedReceiptType = form.watch('receiptType')

  const fetchData = useCallback(async () => {
    const targetId = invoiceId || receipt?.invoiceId
    if (!targetId) return

    setLoading(true)
    try {
      const getAdminInvoice = JSON.parse(
        localStorage.getItem('permissionCodes') || '[]',
      ).includes('GET_INVOICE')

      const data = await dispatch(getInvoiceDetail(targetId)).unwrap()

      console.log('Invoice data:', data)
      setInvoiceData(data || null)
    } catch (error) {
      setLoading(false)
      console.log('Failed to fetch data: ', error)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hook/exhaustive-deps
  }, [dispatch, invoiceId, receipt?.invoiceId])

  useEffect(() => {
    if (open) {
      fetchData()
      table?.resetRowSelection?.()
    }
    // eslint-disable-next-line react-hook/exhaustive-deps
  }, [fetchData, table, open])

  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  useEffect(() => {
    if (open && isStandaloneMode) {
      dispatch(getCustomers())
      dispatch(getSuppliers())
    }
  }, [open, dispatch, isStandaloneMode])

  useEffect(() => {
    if (open && effectiveReceiptId) {
      dispatch(getReceiptById(effectiveReceiptId))
        .unwrap()
        .then((data) => {
          setFetchedReceipt(data)
        })
        .catch((error) => {
          console.error('Failed to fetch receipt details:', error)
        })
    } else if (!open) {
      setFetchedReceipt(null)
      setSelectedCustomer(null)
      setOpenCustomerPopover(false)
    }
  }, [open, effectiveReceiptId, dispatch])

  useEffect(() => {
    if (open) {
      if (isEditMode && receipt) {
        let bankAccount = receipt.bankAccount
        if (!bankAccount && receipt.bankName) {
          try {
            // Try parsing as JSON (new format)
            bankAccount = JSON.parse(receipt.bankName)
          } catch (e) {
            // Fallback for old flattened fields
            if (receipt.bankAccountNumber) {
              bankAccount = {
                bankName: receipt.bankName,
                accountNumber: receipt.bankAccountNumber,
                accountName: receipt.bankAccountName,
                bankBranch: receipt.bankBranch,
              }
            }
          }
        }

        form.reset({
          note: receipt.reason || '',
          receiptType: receipt.receiptType || (isStandaloneMode ? 'debt_collection' : 'sales'),
          totalAmount: parseFloat(receipt.amount || 0),
          paymentMethod: receipt.paymentMethod || 'cash',
          paymentNote: receipt.note || '',
          bankAccount: bankAccount || null,
          receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isDeposit: receipt.transactionType === 'deposit',
        })
      } else if (invoiceData) {
        // Default to remaining amount for payment input
        const defaultCode = invoiceData.orderCode || invoiceData.code || ''
        form.reset({
          ...form.getValues(),
          note: defaultCode ? `Thu tiền đơn hàng ${defaultCode}` : 'Thu tiền đơn hàng',
          totalAmount: remainingAmount > 0 ? remainingAmount : 0
        })
      }
    }
  }, [open, isEditMode, receipt, invoiceData, form, remainingAmount])
  const navigate = useNavigate()

  const onSubmit = async (data) => {
    const amountToReceive = parseFloat(data.totalAmount) || 0

    // Only validate amount limit when linked to an invoice
    if (!isStandaloneMode && amountToReceive > maxAllowableAmount) {
      form.setError('totalAmount', {
        type: 'manual',
        message: `Số tiền thu không được vượt quá số nợ còn lại (${moneyFormat(maxAllowableAmount)})`,
      })
      return
    }

    // Validate customer selection in standalone mode
    if (isStandaloneMode && !selectedCustomer) {
      toast.error('Vui lòng chọn khách hàng')
      return
    }

    const customerId = isStandaloneMode
      ? selectedCustomer?.id
      : parseInt(invoiceData?.customerId || customer?.id || receipt?.customerId)

    // Build payload matching backend requirements
    const actualType = data.receiptType.startsWith('custom_') ? 'other' : data.receiptType;
    const customTypeName = data.receiptType.startsWith('custom_') ? data.receiptType.replace('custom_', '') : '';
    const defaultCode = invoiceData?.orderCode || invoiceData?.code || '';
    const fallbackNote = isStandaloneMode ? 'Thu tiền công nợ' : (defaultCode ? `Thu tiền đơn hàng ${defaultCode}` : 'Thu tiền bán hàng');
    const finalNote = customTypeName ? `[Loại: ${customTypeName}] ${data.note || ''}`.trim() : (data.note || fallbackNote);

    // For refund type, add supplier name to note
    const refundNote = actualType === 'refund' && selectedRefundSupplier
      ? `[Hoàn tiền NCC: ${selectedRefundSupplier.supplierName}] ${finalNote}`.trim()
      : finalNote

    const dataToSend = {
      receiptType: actualType,
      customerId: parseInt(customerId),
      orderId: isStandaloneMode ? undefined : (invoiceId || receipt?.orderId || receipt?.invoiceId || invoiceData?.id),
      amount: parseInt(data.totalAmount) || 0,
      paymentMethod: data.paymentMethod,
      bankName: data.paymentMethod === 'transfer' && data.bankAccount
        ? JSON.stringify(data.bankAccount)
        : null,
      receiptDate: data.receiptDate || new Date().toISOString(),
      notes: refundNote,
      transactionReference: data.paymentNote || null,
    }

    try {
      if (isEditMode) {
        const dataToUpdate = {
          id: effectiveReceiptId,
          amount: parseInt(data.totalAmount) || 0,
          paymentMethod: data.paymentMethod,
          bankName: data.paymentMethod === 'transfer' && data.bankAccount
            ? JSON.stringify(data.bankAccount)
            : null,
          notes: refundNote,
          transactionReference: data.paymentNote || null,
          receiptDate: data.receiptDate || new Date().toISOString(),
          receiptType: actualType,
        }
        await dispatch(updateReceipt(dataToUpdate)).unwrap()

        navigateAway()
      } else {
        const result = await dispatch(createReceipt(dataToSend)).unwrap()
        const receiptId = result?.id

        // If payment method is transfer, fetch and show QR code
        if (data.paymentMethod === 'transfer' && receiptId) {
          setCreatedReceiptId(receiptId)
          try {
            const qrData = await dispatch(getReceiptQRCode(receiptId)).unwrap()
            setQrCodeData(qrData)
            setShowQrDialog(true)
          } catch (qrError) {
            console.error('Failed to fetch QR code:', qrError)
            navigateAway()
          }
        } else {
          // Cash payment or no receipt ID, navigate immediately
          navigateAway()
        }
      }
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  const navigateAway = () => {
    if (onSuccess) {
      form.reset()
      setSelectedCustomer(null)
      onSuccess()
      return
    }

    const getAdminReceipt = JSON.parse(
      localStorage.getItem('permissionCodes'),
    ).includes('RECEIPT_VIEW_ALL')
    getAdminReceipt ? navigate('/receipt') : navigate('/receipt-user')
    form.reset()
    onOpenChange?.(false)
  }

  const handleCloseQrDialog = () => {
    setShowQrDialog(false)
    setQrCodeData(null)
    navigateAway()
  }

  const paymentMethod = form.watch('paymentMethod')

  const dialogTitle = isEditMode ? `Chỉnh sửa phiếu thu ${receipt?.voucherCode || ''}` : 'Thêm phiếu thu mới'
  const dialogDesc = isEditMode ? 'Cập nhật thông tin phiếu thu' : 'Kiểm tra và hoàn thành thông tin bên dưới để thêm phiếu thu mới'
  const submitLabel = isEditMode ? 'Cập nhật' : 'Thêm mới'

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && !isEditMode && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          </DialogTrigger>
        )}

        <DialogContent
          className={cn(
            "md:h-auto md:max-w-full",
            isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col",
            contentClassName
          )}
          overlayClassName={overlayClassName}
        >
          <DialogHeader className={cn("px-6 py-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-t-lg shadow-lg relative overflow-hidden", isMobile && "rounded-none")}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl" />
            
            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{dialogTitle}</span>
            </DialogTitle>
            <DialogDescription className="text-emerald-50 opacity-90 font-medium">
              {dialogDesc}
            </DialogDescription>
          </DialogHeader>

          <div className={cn(
            "overflow-auto",
            isMobile ? "h-full px-4 pb-4 flex-1" : "max-h-[65vh] md:max-h-[75vh]"
          )}>
            <Form {...form}>
              <form id="create-receipt" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <div className="flex flex-col gap-6 lg:flex-row">
                      <div className="flex-1 space-y-6 rounded-lg border p-4">
                        <h2 className="text-lg font-semibold">
                          Thông tin chi tiết phiếu thu
                        </h2>

                        <div className="space-y-6">
                          {(!isStandaloneMode && invoiceData && invoiceItems.length > 0) && (
                          <div className={cn("overflow-x-auto rounded-lg border", isMobile && "border-0 overflow-visible")}>
                            {!isMobile ? (
                              <Table className="min-w-full">
                                <TableHeader>
                                  <TableRow className="bg-secondary text-xs">
                                    <TableHead className="w-8">STT</TableHead>
                                    <TableHead className="min-w-[250px]">
                                      Sản phẩm
                                    </TableHead>
                                    <TableHead className="min-w-20">Số Lượng</TableHead>
                                    <TableHead className="min-w-16">ĐVT</TableHead>
                                    <TableHead className="min-w-20">Giá</TableHead>
                                    <TableHead className="min-w-16">Thuế</TableHead>
                                    <TableHead className="min-w-28 md:w-16">
                                      Giảm giá
                                    </TableHead>
                                    <TableHead className="min-w-28">
                                      Tổng cộng
                                    </TableHead>
                                    <TableHead className="min-w-28 md:w-20">
                                      Bảo Hành
                                    </TableHead>
                                    <TableHead className="min-w-28">
                                      Ghi chú
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {invoiceItems.map((product, index) => (
                                    <TableRow key={product.id}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-10 w-10 rounded-lg border bg-muted/50">
                                            <AvatarImage
                                              src={getPublicUrl(product?.product?.image)}
                                              alt={product?.product?.productName}
                                              className="object-cover"
                                            />
                                            <AvatarFallback className="rounded-lg text-xs">
                                              {product?.product?.productName?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-bold text-muted-foreground leading-none">
                                              {product.product?.code || product.productCode || '—'}
                                            </span>
                                            <span className="font-medium text-sm leading-tight line-clamp-2">
                                              {product?.product?.productName}
                                            </span>
                                            {product?.options && (
                                              <div className="break-words text-xs text-muted-foreground">
                                                {product?.options
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
                                      <TableCell className="text-center">
                                        {moneyFormat(product.price)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {moneyFormat(product.taxAmount)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {moneyFormat(product.discountAmount)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {moneyFormat(product.total)}
                                      </TableCell>
                                      <TableCell>
                                        {product.periodMonths ? product.periodMonths + ' tháng' : 'Không có'}
                                      </TableCell>
                                      <TableCell>
                                        {product.product.note || 'Không có'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <div className="space-y-4">
                                {invoiceItems.map((product, index) => (
                                  <div
                                    key={product.id}
                                    className="rounded-lg border p-3 shadow-sm bg-card text-card-foreground"
                                  >
                                    {/* Header: Image + Name + Code */}
                                    <div className="flex items-start gap-3 mb-3">
                                      <Avatar className="h-12 w-12 rounded-lg border bg-muted/50 shrink-0">
                                        <AvatarImage
                                          src={getPublicUrl(product?.image)}
                                          alt={product.productName}
                                          className="object-cover"
                                        />
                                        <AvatarFallback className="rounded-lg text-xs">
                                          {product.productName?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                          {product.product?.code || product.productCode || '—'}
                                        </div>
                                        <div className="font-medium text-sm leading-tight line-clamp-2">
                                          {product.productName}
                                        </div>
                                        {product?.options && (
                                          <div className="break-words text-xs text-muted-foreground mt-1">
                                            {product?.options
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
                                          {product.quantity} {product.unitName}
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
                          )}
                          <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                            <FormField
                              control={form.control}
                              name="note"
                              render={({ field }) => (
                                <FormItem className="mb-2 space-y-1">
                                  <FormLabel>Ghi chú phiếu thu</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={3}
                                      placeholder="Nhập ghi chú nếu có"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-4 text-sm">
                              <div className="flex justify-between">
                                <strong>Tổng giá trị đơn hàng:</strong>
                                <span>{moneyFormat(totalAmountFromInvoice)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground">
                                <strong>Đã thanh toán:</strong>
                                <span>{moneyFormat(paidAmount)}</span>
                              </div>
                              {pendingAmount > 0 && (
                                <div className="flex justify-between text-amber-600">
                                  <strong>Đang chờ duyệt/Nháp:</strong>
                                  <span>{moneyFormat(pendingAmount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-destructive">
                                <strong>Còn nợ:</strong>
                                <span>{moneyFormat(remainingAmount)}</span>
                              </div>
                              {pendingAmount > 0 && (
                                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-800">
                                  <p>
                                    <strong>Lưu ý:</strong> Đang có <strong>{moneyFormat(pendingAmount)}</strong> chờ duyệt hoặc nháp.
                                    Số tiền tối đa có thể thu thêm là <strong>{moneyFormat(remainingAmount)}</strong>.
                                  </p>
                                </div>
                              )}

                              <Separator />

                              <div className="flex justify-between text-muted-foreground text-xs">
                                <strong>Giá trên đã bao gồm:</strong>
                              </div>
                              <div className="flex justify-between text-muted-foreground text-xs">
                                <span>- Giảm giá:</span>
                                <span>{moneyFormat(totalDiscount)}</span>
                              </div>
                              <div className="flex justify-between text-muted-foreground text-xs">
                                <span>- Thuế:</span>
                                <span>{moneyFormat(totalTaxAmount)}</span>
                              </div>

                              <Separator />

                              <div className="mb-3">
                                <FormField
                                  control={form.control}
                                  name="receiptType"
                                  render={({ field }) => (
                                    <FormItem className="mb-3 space-y-1">
                                      <div className="flex items-center justify-between">
                                        <FormLabel required={true}>Loại phiếu thu</FormLabel>
                                        <button 
                                          type="button" 
                                          onClick={() => setIsAddTypeOpen(true)}
                                          className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                                        >
                                          <PlusIcon className="w-3 h-3" /> Thêm loại mới
                                        </button>
                                      </div>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại phiếu thu" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="z-[100020]">
                                          <SelectGroup>
                                            {allReceiptTypes?.map((type) => (
                                              <SelectItem
                                                key={type.value}
                                                value={type.value}
                                              >
                                                {type.label}
                                              </SelectItem>
                                            ))}
                                          </SelectGroup>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {/* Show supplier combobox when refund type selected */}
                                {selectedReceiptType === 'refund' && (
                                  <div className="mb-3">
                                    <FormLabel>Nhà cung cấp (hoàn tiền)</FormLabel>
                                    <Popover open={openRefundSupplierPopover} onOpenChange={setOpenRefundSupplierPopover}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          role="combobox"
                                          className="w-full justify-between mt-1 text-sm bg-background font-normal border-input"
                                        >
                                          {selectedRefundSupplier ? selectedRefundSupplier.supplierName : 'Chọn nhà cung cấp...'}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-full p-0 z-[100100]" align="start">
                                        <Command>
                                          <CommandInput placeholder="Tìm nhà cung cấp..." />
                                          <CommandList>
                                            <CommandEmpty>Không tìm thấy NCC.</CommandEmpty>
                                            <CommandGroup>
                                              {suppliers?.map((s) => (
                                                <CommandItem
                                                  key={s.id}
                                                  value={s.supplierName}
                                                  onSelect={() => {
                                                    setSelectedRefundSupplier(s)
                                                    setOpenRefundSupplierPopover(false)
                                                  }}
                                                >
                                                  <CheckIcon
                                                    className={cn(
                                                      'mr-2 h-4 w-4',
                                                      selectedRefundSupplier?.id === s.id ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                  />
                                                  {s.supplierName} - {s.phone}
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                )}

                                <FormField
                                  control={form.control}
                                  name="totalAmount"
                                  render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                      <FormLabel required={true}>
                                        Số tiền thu
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          value={moneyFormat(field.value)}
                                          placeholder="0"
                                          className="w-full text-end"
                                          onFocus={(e) => isMobile && e.target.select()}
                                          onChange={(e) => {
                                            const rawValue =
                                              e.target.value.replace(/\D/g, '')
                                            form.setValue('totalAmount', rawValue)
                                          }}
                                        />
                                      </FormControl>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        Bằng chữ: <span className="font-medium">{toVietnamese(field.value)}</span>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="receiptDate"
                                  render={({ field }) => (
                                    <FormItem className="mb-2 space-y-1">
                                      <FormLabel required={true}>
                                        Ngày thu
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="date"
                                          className="w-full"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="mb-3 mt-3">
                                  <FormField
                                    control={form.control}
                                    name="paymentMethod"
                                    render={({ field }) => (
                                      <FormItem className="mb-3 space-y-1">
                                        <FormLabel required={true}>
                                          Phương thức thanh toán
                                        </FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Chọn phương thức" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent className="z-[100020]">
                                            <SelectGroup>
                                              {paymentMethods.map((method) => (
                                                <SelectItem
                                                  key={method.label}
                                                  value={method.value}
                                                >
                                                  <div className="flex items-center">
                                                    <div className="mr-2 h-4 w-4">
                                                      <method.icon className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {method.label}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                            </SelectGroup>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  {paymentMethod === 'transfer' && (
                                    <FormField
                                      control={form.control}
                                      name="bankAccount"
                                      render={({ field }) => (
                                        <FormItem className="mb-3 space-y-1">
                                          <FormLabel required={true}>
                                            Tài khoản nhận tiền
                                          </FormLabel>

                                          <Select
                                            onValueChange={(value) => {
                                              const selectedBank = banks.find(
                                                (b) => String(b.accountNumber) === value,
                                              )
                                              field.onChange(selectedBank)
                                            }}
                                          >
                                            <FormControl>
                                              <SelectTrigger>
                                                <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                              </SelectTrigger>
                                            </FormControl>

                                            <SelectContent className="z-[100020]">
                                              <SelectGroup>
                                                {banks.map((bank, index) => (
                                                  <SelectItem
                                                    key={`${index}-${bank.accountNumber}`}
                                                    value={String(bank.accountNumber)}
                                                  >
                                                    <div className="flex flex-col">
                                                      <span className="font-medium">
                                                        {bank.bankName} –{' '}
                                                        {bank.accountNumber}
                                                      </span>
                                                      <span className="text-xs text-muted-foreground">
                                                        {bank.accountName} ·{' '}
                                                        {bank.bankBranch}
                                                      </span>
                                                    </div>
                                                  </SelectItem>
                                                ))}
                                              </SelectGroup>
                                            </SelectContent>
                                          </Select>

                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}


                                </div>


                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full rounded-lg border p-4 lg:w-72 lg:sticky lg:top-0 lg:h-fit">
                        <div className="flex items-center justify-between">
                          <h2 className="py-2 text-lg font-semibold">
                            Khách hàng
                          </h2>
                        </div>

                        <div className="space-y-6">
                          {isStandaloneMode ? (
                            /* Standalone mode: Customer selection dropdown */
                            <>
                              {selectedCustomer ? (
                                <div className="border rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer?.customerName || selectedCustomer?.name}`}
                                        alt={selectedCustomer?.customerName || selectedCustomer?.name}
                                      />
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">
                                        {selectedCustomer?.customerName || selectedCustomer?.name}
                                      </div>
                                      {(selectedCustomer?.customerCode || selectedCustomer?.code) && (
                                        <div className="text-xs text-muted-foreground">
                                          {selectedCustomer?.customerCode || selectedCustomer?.code}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setSelectedCustomer(null)}
                                    >
                                      <RefreshCcw className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <Separator />

                                  <div className="space-y-1.5 text-xs">
                                    {selectedCustomer?.phone && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <MobileIcon className="h-3 w-3" />
                                        <a href={`tel:${selectedCustomer?.phone}`} className="hover:text-primary">
                                          {selectedCustomer?.phone}
                                        </a>
                                      </div>
                                    )}
                                    {selectedCustomer?.email && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <a href={`mailto:${selectedCustomer?.email}`} className="hover:text-primary truncate">
                                          {selectedCustomer?.email}
                                        </a>
                                      </div>
                                    )}
                                    {selectedCustomer?.address && (
                                      <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{selectedCustomer?.address}</span>
                                      </div>
                                    )}
                                    {(selectedCustomer?.cccd || selectedCustomer?.identityCard) && (
                                      <div className="flex items-center gap-2 text-muted-foreground">
                                        <IdCardIcon className="h-3 w-3" />
                                        <span>CCCD: {selectedCustomer?.cccd || selectedCustomer?.identityCard}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Show current debt info */}
                                  {selectedCustomer?.currentDebt !== undefined && (
                                    <>
                                      <Separator />
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Công nợ hiện tại:</span>
                                        <span className={cn(
                                          "font-bold",
                                          Number(selectedCustomer.currentDebt) > 0 ? "text-destructive" : Number(selectedCustomer.currentDebt) < 0 ? "text-green-600" : "text-muted-foreground"
                                        )}>
                                          {Number(selectedCustomer.currentDebt) < 0
                                            ? `+${moneyFormat(Math.abs(selectedCustomer.currentDebt))} (trả trước)`
                                            : moneyFormat(selectedCustomer.currentDebt)
                                          }
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <Popover open={openCustomerPopover} onOpenChange={setOpenCustomerPopover}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full justify-between font-normal"
                                    >
                                      Chọn khách hàng
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" style={{ zIndex: 100020 }}>
                                    <Command>
                                      <CommandInput placeholder="Tìm kiếm theo tên, SĐT, CCCD..." className="h-9" />
                                      <CommandEmpty>Không tìm thấy khách hàng</CommandEmpty>
                                      <CommandGroup>
                                        <CommandList>
                                          {customers.map((cust) => (
                                            <CommandItem
                                              value={`${cust.customerName || cust.name || ''} ${cust.phone || ''} ${cust.cccd || ''}`}
                                              key={cust.id}
                                              onSelect={() => {
                                                setSelectedCustomer(cust)
                                                setOpenCustomerPopover(false)
                                              }}
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium">{cust.customerName || cust.name}</span>
                                                <span className="text-xs text-muted-foreground">{cust.phone} · {cust.customerCode || cust.code}</span>
                                              </div>
                                              <CheckIcon
                                                className={cn(
                                                  'ml-auto h-4 w-4',
                                                  selectedCustomer?.id === cust.id ? 'opacity-100' : 'opacity-0'
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                        </CommandList>
                                      </CommandGroup>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </>
                          ) : (
                            /* Invoice-based customer display */
                            <>
                              <div className="flex items-center gap-4">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={`https://ui-avatars.com/api/?bold=true&background=random&name=${customer?.customerName}`}
                                    alt={customer?.customerName}
                                  />
                                  <AvatarFallback>AD</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{customer?.customerName}</div>
                                </div>
                              </div>

                              <div>
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="font-medium">
                                    Thông tin khách hàng
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2 text-sm">
                                  <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                                    <div className="mr-2 h-4 w-4 ">
                                      <MobileIcon className="h-4 w-4" />
                                    </div>
                                    <a href={`tel:${customer?.phone}`}>
                                      {customer?.phone || 'Chưa cập nhật'}
                                    </a>
                                  </div>

                                  <div className="flex items-center text-muted-foreground">
                                    <div className="mr-2 h-4 w-4 ">
                                      <IdCardIcon className="h-4 w-4" />
                                    </div>
                                    {customer?.cccd || 'Chưa cập nhật'}
                                  </div>

                                  <div className="flex items-center text-muted-foreground">
                                    <div className="mr-2 h-4 w-4 ">
                                      <Mail className="h-4 w-4" />
                                    </div>
                                    <a href={`mailto:${customer?.email}`}>
                                      {customer?.email || 'Chưa cập nhật'}
                                    </a>
                                  </div>

                                  <div className="flex items-center text-primary hover:text-secondary-foreground">
                                    <div className="mr-2 h-4 w-4 ">
                                      <MapPin className="h-4 w-4" />
                                    </div>
                                    {customer?.address || 'Chưa cập nhật'}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </form>
            </Form>
          </div>


          <DialogFooter className={cn("flex gap-2 sm:space-x-0", isMobile && "pb-4 px-4 flex-row")}>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                }}
                className={cn(isMobile && "flex-1")}
              >
                Hủy
              </Button>
            </DialogClose>

            <Button form="create-receipt" loading={loading} className={cn("bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 text-white shadow-md hover:shadow-lg", isMobile && "flex-1")}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Type Dialog */}
      <Dialog open={isAddTypeOpen} onOpenChange={setIsAddTypeOpen}>
        <DialogContent className="sm:max-w-[425px] z-[100100]">
          <DialogHeader>
            <DialogTitle>Thêm loại phiếu thu mới</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newTypeName} 
              onChange={e => setNewTypeName(e.target.value)} 
              placeholder="Nhập tên loại phiếu thu..."
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddType()
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTypeOpen(false)}>Hủy</Button>
            <Button onClick={handleAddType} disabled={!newTypeName.trim()}>Thêm mới</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <PaymentQRCodeDialog
        open={showQrDialog}
        onOpenChange={handleCloseQrDialog}
        qrCodeData={qrCodeData}
        className={qrContentClassName}
        overlayClassName={qrOverlayClassName}
      />
    </>
  )
}

export default ReceiptDialog
