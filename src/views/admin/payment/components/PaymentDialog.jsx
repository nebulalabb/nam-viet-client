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
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import { Mail, MapPin } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { paymentMethods } from '../../receipt/data'
import { createPaymentSchema } from '../../receipt/schema'
import { useDispatch, useSelector } from 'react-redux'
import { createPayment, updatePayment, getPaymentById } from '@/stores/PaymentSlice'
import { Input } from '@/components/ui/input'
import { getSetting } from '@/stores/SettingSlice'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/utils/file'

const PaymentDialog = ({
  paymentId, // Optional: for Edit mode
  payment: propPayment, // Legacy: may contains object with id
  purchaseOrder, // If provided (and no payment), create mode from PO
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  onSuccess,
  supplier: propSupplier,
  ...props
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.payment.loading)
  const setting = useSelector((state) => state.setting.setting)
  const banks = setting?.banks || []

  const effectivePaymentId = paymentId || propPayment?.id
  const isEditMode = !!effectivePaymentId

  // State for fetched payment data
  const [fetchedPayment, setFetchedPayment] = useState(null)
  const payment = fetchedPayment || propPayment

  const [isFetching, setIsFetching] = useState(false)

  // Determine source of items and supplier/receiver
  const effectivePurchaseOrder = payment?.purchaseOrder || purchaseOrder
  const salesContract = payment?.salesContract

  // Determine if this is a customer purchase order
  const isCustomerPO = !!(effectivePurchaseOrder?.customer || effectivePurchaseOrder?.customerId) && !effectivePurchaseOrder?.supplier
  const party = propSupplier || payment?.receiver ||
    (isCustomerPO ? effectivePurchaseOrder?.customer : effectivePurchaseOrder?.supplier) ||
    effectivePurchaseOrder?.supplier
  const supplier = party // keep alias for backward compat below

  let items = []
  if (effectivePurchaseOrder?.items?.length > 0) {
    items = effectivePurchaseOrder.items
  } else if (salesContract?.items?.length > 0) {
    items = salesContract.items
  } else if (payment?.products?.length > 0) {
    items = payment.products
  }



  const totalAmount = parseFloat(effectivePurchaseOrder?.totalAmount || salesContract?.totalAmount || payment?.amount || 0)
  const paidAmount = parseFloat(effectivePurchaseOrder?.paidAmount || salesContract?.paidAmount || 0)

  // Tính tổng số tiền đang chờ duyệt (pending/draft) từ các phiếu chi của Đơn mua hàng (hoặc hợp đồng bán)
  const pendingAmount = (
    effectivePurchaseOrder?.paymentVouchers ||
    effectivePurchaseOrder?.payments ||
    salesContract?.paymentVouchers ||
    salesContract?.payments ||
    []
  )
    .filter(p => (p.status === 'pending' || p.status === 'draft') && p.id !== effectivePaymentId)
    .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)

  // For Create Mode: calculate remaining. For Edit Mode: usually we edit existing amount, validation against debt might be tricky if we don't know original state.
  // We should allow max = total - paid - pending, BUT for edit mode, the CURRENT payment's amount shouldn't be subtracted from remaining capacity.
  // Actually, our pendingAmount calculation already EXCLUDES the current payment (p.id !== effectivePaymentId).
  // So remainingAmount is exactly how much MORE capacity exists. The max allowed for this payment is remainingAmount + (isEditMode ? parseFloat(payment?.amount || 0) : 0).
  // But wait, pendingAmount excludes current payment, so remainingAmount = total - paid - pending. This remainingAmount is the exact max amount this specific payment (new or edited) can be.
  const remainingAmount = Math.max(0, totalAmount - paidAmount - pendingAmount)

  const form = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      note: '',
      paymentAmount: 0,
      paymentMethod: 'cash',
      paymentNote: '',
      bankAccount: null,
      status: 'success', // Default for new payments often 'success' or 'draft' depending on workflow. Keep 'success' from original create dialog?
      dueDate: null,
    },
  })

  // Fetch Payment Detail on Open if Edit Mode
  useEffect(() => {
    if (open && effectivePaymentId) {
      setIsFetching(true)
      dispatch(getPaymentById(effectivePaymentId))
        .unwrap()
        .then((data) => {
          setFetchedPayment(data)
          setIsFetching(false)
        })
        .catch((error) => {
          console.error('Failed to fetch payment details:', error)
          setIsFetching(false)
        })
    } else if (!open) {
      setFetchedPayment(null)
    }
  }, [open, effectivePaymentId, dispatch])

  useEffect(() => {
    if (open) {
      dispatch(getSetting('general_information'))
    }
  }, [open, dispatch])

  useEffect(() => {
    if (open) {
      if (isEditMode && payment) {
        // Edit Mode: Prioritize fetchedPayment if available
        const dataToUse = payment

        let bankAccount = dataToUse.bankAccount
        if (!bankAccount && dataToUse.bankName) {
          try {
            // Try parsing as JSON (new format)
            bankAccount = JSON.parse(dataToUse.bankName)
          } catch (e) {
            // Fallback for old flattened fields
            if (dataToUse.bankAccountNumber) {
              bankAccount = {
                bankName: dataToUse.bankName,
                accountNumber: dataToUse.bankAccountNumber,
                accountName: dataToUse.bankAccountName,
                bankBranch: dataToUse.bankBranch,
              }
            }
          }
        }

        form.reset({
          note: dataToUse.reason || '',
          paymentAmount: parseFloat(dataToUse.amount || 0),
          paymentMethod: dataToUse.paymentMethod || 'cash',
          paymentNote: dataToUse.note || '',
          bankAccount: bankAccount || null,
          status: dataToUse.status || 'draft',
          dueDate: dataToUse.dueDate || null,
        })
      } else if (effectivePurchaseOrder) {
        // Create Mode
        const initialAmount = remainingAmount > 0 ? remainingAmount : 0
        form.reset({
          note: '',
          paymentAmount: initialAmount,
          paymentMethod: 'cash',
          paymentNote: '',
          bankAccount: null,
          status: 'success',
        })
      }
    }
  }, [open, isEditMode, payment, fetchedPayment, effectivePurchaseOrder, remainingAmount, form])


  const onSubmit = async (data) => {
    // Shared Validation for Create and Edit Mode avoiding overpayments
    const amountToPay = parseFloat(data.paymentAmount) || 0
    if (amountToPay > remainingAmount) {
      form.setError('paymentAmount', {
        type: 'manual',
        message: `Số tiền chi không được vượt quá số nợ còn lại (${moneyFormat(remainingAmount)})`,
      })
      return
    }

    const commonData = {
      amount: parseInt(data.paymentAmount) || 0,
      paymentMethod: data.paymentMethod,
      bankName: data.paymentMethod === 'transfer' && data.bankAccount
        ? JSON.stringify(data.bankAccount)
        : null,
      reason: data.note || (effectivePurchaseOrder ? `Chi trả đơn hàng ${effectivePurchaseOrder.code}` : ''),
      note: data.paymentNote,
    }

    try {
      if (isEditMode) {
        // UPDATE
        const dataToSend = {
          ...data, // includes status etc from form if needed
          id: effectivePaymentId,
          ...commonData
        }
        await dispatch(updatePayment(dataToSend)).unwrap()
        toast.success('Cập nhật phiếu chi thành công')
      } else {
        // CREATE
        const dataToSend = {
          ...data,
          ...commonData,
          purchaseOrderId: effectivePurchaseOrder?.id,
          voucherType: 'payment_out',
          transactionType: 'payment',
          receiverType: isCustomerPO ? 'customer' : 'supplier',
          receiverId: party?.id,
          voucherDate: new Date().toISOString(),
          paymentDate: new Date().toISOString(),
        }
        await dispatch(createPayment(dataToSend)).unwrap()
        // Create usually handles its own toast in slice, typically.
        // But CreatePurchaseOrderPaymentDialog had a toast.success in slice too?
        // Checking slice: yes, toast.success('Tạo thanh toán thành công')
      }

      if (onSuccess) {
        onSuccess()
      }
      if (!isEditMode) {
        form.reset()
      }
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
      // Toast handled by slice mostly, or catch here
      // Slice uses handleError and returns rejectWithValue.
    }
  }

  const paymentMethod = form.watch('paymentMethod')

  const dialogTitle = isEditMode ? `Chỉnh sửa phiếu chi: ${payment?.code}` : 'Tạo phiếu chi mới'
  const dialogDesc = isEditMode ? 'Cập nhật thông tin phiếu chi' : 'Kiểm tra và hoàn thành thông tin bên dưới để tạo phiếu chi'
  const submitLabel = isEditMode ? 'Cập nhật' : 'Tạo phiếu chi'

  return (
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
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDesc}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isMobile ? "h-full px-4 pb-4 flex-1" : "max-h-[65vh] md:max-h-[75vh]"
        )}>
          <Form {...form}>
            <form id="payment-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-6 rounded-lg border p-4">
                  <h2 className="text-lg font-semibold">
                    Thông tin chi tiết phiếu chi
                  </h2>

                  <div className="space-y-6">
                    <div className={cn("overflow-x-auto rounded-lg border", isMobile && "border-0 overflow-visible")}>
                      {!isMobile ? (
                        <Table className="min-w-full">
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead className="w-8">TT</TableHead>
                              <TableHead className="min-w-40">Sản phẩm</TableHead>
                              <TableHead className="min-w-20">SL</TableHead>
                              <TableHead className="min-w-16">ĐVT</TableHead>
                              <TableHead className="min-w-20 text-right">Đơn giá</TableHead>
                              <TableHead className="min-w-28 text-right">Thành tiền</TableHead>
                              <TableHead className="min-w-28">Ghi chú</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow key={item.id || index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                                      {item.product?.image ? (
                                        <AvatarImage src={getPublicUrl(item.product.image)} alt={item.productName || item.name} className="object-cover h-full w-full" />
                                      ) : (
                                        <AvatarFallback className="rounded-md text-xs">
                                          {(item.productName || item.name)?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">{item.productName || item.name}</div>
                                      <div className="text-xs text-muted-foreground">{item.productCode || item.code}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{Number(item.quantity)}</TableCell>
                                <TableCell>{item.unitName || item.unit || '—'}</TableCell>
                                <TableCell className="text-end">{moneyFormat(item.unitPrice || item.price)}</TableCell>
                                <TableCell className="text-end">{moneyFormat((item.total || item.totalAmount) || (item.quantity * (item.unitPrice || item.price)))}</TableCell>
                                <TableCell>{item.note || '—'}</TableCell>
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
                                <Avatar className="h-12 w-12 rounded-lg border bg-muted/50 shrink-0">
                                  {item.product?.image ? (
                                    <AvatarImage src={getPublicUrl(item.product.image)} alt={item.productName} />
                                  ) : (
                                    <AvatarFallback className="rounded-lg text-xs">
                                      {(item.productName || item.name)?.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[10px] font-bold text-muted-foreground leading-none mb-1">
                                    {item.productCode || item.code || '—'}
                                  </div>
                                  <div className="font-medium text-sm leading-tight line-clamp-2">
                                    {item.productName || item.name}
                                  </div>
                                </div>
                              </div>

                              <Separator className="my-2" />

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex flex-col">
                                  <span className="text-muted-foreground text-xs">
                                    Số lượng
                                  </span>
                                  <span className="font-medium">
                                    {Number(item.quantity)} {item.unitName || item.unit || '—'}
                                  </span>
                                </div>
                                <div className="flex flex-col text-right">
                                  <span className="text-muted-foreground text-xs">
                                    Đơn giá
                                  </span>
                                  <span className="font-medium">
                                    {moneyFormat(item.unitPrice || item.price)}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2 flex justify-between items-end bg-secondary/30 p-2 rounded">
                                <span className="font-semibold text-sm">
                                  Thành tiền
                                </span>
                                <span className="font-bold text-primary">
                                  {moneyFormat((item.total || item.totalAmount) || (item.quantity * (item.unitPrice || item.price)))}
                                </span>
                              </div>

                              {item.note && (
                                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                                  <div className="flex gap-1">
                                    <span className="font-semibold">GC:</span>{' '}
                                    {item.note}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                      <FormField
                        control={form.control}
                        name="note"
                        render={({ field }) => (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel>Lý do chi</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Nhập lý do chi"
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
                          <span>{moneyFormat(totalAmount)}</span>
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
                              Số tiền tối đa có thể chi thêm là <strong>{moneyFormat(remainingAmount)}</strong>.
                            </p>
                          </div>
                        )}


                        <Separator />

                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="paymentAmount"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel required={true}>Số tiền chi</FormLabel>
                                <FormControl>
                                  <Input
                                    value={moneyFormat(field.value)}
                                    placeholder="0"
                                    className="w-full text-end font-bold"
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(/\D/g, '')
                                      form.setValue('paymentAmount', rawValue)
                                    }}
                                  />
                                </FormControl>
                                <div className="text-xs text-muted-foreground">
                                  Bằng chữ: <span className="font-medium">{toVietnamese(field.value)}</span>
                                </div>
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
                                  <FormLabel required={true}>Phương thức</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn phương thức" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-[100100]">
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
                                    <FormLabel required={true}>Tài khoản nguồn</FormLabel>
                                    <Select
                                      value={field.value?.accountNumber}
                                      onValueChange={(value) => {
                                        const selectedBank = banks.find(
                                          (b) => b.accountNumber === value,
                                        )
                                        field.onChange(selectedBank)
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Chọn tài khoản" />
                                        </SelectTrigger>
                                      </FormControl>

                                      <SelectContent className="z-[100100]">
                                        <SelectGroup>
                                          {banks.map((bank, index) => (
                                            <SelectItem
                                              key={index}
                                              value={bank.accountNumber}
                                            >
                                              <div className="flex flex-col">
                                                <span className="font-medium">
                                                  {bank.bankName} – {bank.accountNumber}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                  {bank.accountName}
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

                          <div className="mb-3">
                            <FormField
                              control={form.control}
                              name="paymentNote"
                              render={({ field }) => (
                                <FormItem className="mb-2 space-y-1">
                                  <FormLabel>Ghi chú thanh toán</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={2}
                                      placeholder="Ghi chú thêm về thanh toán..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {party && (
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">
                        {isCustomerPO || payment?.receiverType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}
                      </h2>
                      <span className={cn(
                        'rounded px-1.5 py-0.5 text-xs font-semibold',
                        isCustomerPO || payment?.receiverType === 'customer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      )}>
                        {isCustomerPO || payment?.receiverType === 'customer' ? 'KH' : 'NCC'}
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${party?.name}`}
                            alt={party?.name}
                          />
                          <AvatarFallback>
                            {isCustomerPO || payment?.receiverType === 'customer' ? 'KH' : 'NCC'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{party?.name}</div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">Thông tin liên hệ</div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
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
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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

          <Button form="payment-form" loading={loading} className={cn(isMobile && "flex-1")}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentDialog
