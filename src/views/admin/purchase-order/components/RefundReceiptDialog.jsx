import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useDispatch, useSelector } from 'react-redux'
import { getSetting } from '@/stores/SettingSlice'
import { createReceipt } from '@/stores/ReceiptSlice'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { getPublicUrl } from '@/utils/file'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileIcon } from '@radix-ui/react-icons'
import { Mail, MapPin, User, Info, Package } from 'lucide-react'
import { paymentMethods } from '../../receipt/data'
import * as z from 'zod'

const formSchema = z.object({
  amount: z.coerce.number().min(0, 'Số tiền không hợp lệ'),
  paymentMethod: z.string().min(1, 'Vui lòng chọn phương thức'),
  bankAccount: z.any().optional(),
  receiptDate: z.string().min(1, 'Vui lòng chọn ngày'),
  notes: z.string().optional(),
  reason: z.string().optional(),
})

const RefundReceiptDialog = ({
  open,
  onOpenChange,
  purchaseOrder,
  onSuccess,
  contentClassName,
  overlayClassName,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.receipt?.loading || false)
  const setting = useSelector((state) => state.setting.setting)
  const banks = setting?.banks || []

  // Supplier info
  const supplier = purchaseOrder?.supplier

  // Items - return receipt details
  const returnReceipts = useMemo(() => {
    return (purchaseOrder?.warehouseReceipts || []).filter(
      r => r.referenceType === 'purchase_refunds' && r.status === 'posted'
    )
  }, [purchaseOrder])

  // Build return items list from return receipts
  const returnItems = useMemo(() => {
    const poDetails = purchaseOrder?.details || []
    const items = []

    returnReceipts.forEach(receipt => {
      if (receipt.details) {
        receipt.details.forEach(d => {
          const poDetail = poDetails.find(pd => pd.productId === d.productId)
          items.push({
            ...d,
            productName: d.product?.productName || poDetail?.product?.productName || poDetail?.productName || 'Sản phẩm',
            productCode: d.product?.productCode || poDetail?.product?.productCode || poDetail?.productCode || '',
            productImage: d.product?.image || poDetail?.product?.image,
            unitName: d.unitName || poDetail?.unitName || poDetail?.product?.unit?.unitName || '',
            unitPrice: poDetail ? Number(poDetail.price || 0) : 0,
            total: Number(d.quantity || 0) * (poDetail ? Number(poDetail.price || 0) : 0),
          })
        })
      }
    })

    return items
  }, [purchaseOrder, returnReceipts])

  /**
   * Tính toán hoàn tiền dựa trên 2 điều kiện:
   */
  const refundCalc = useMemo(() => {
    if (!purchaseOrder) return { returnValue: 0, paidAmount: 0, newTotal: 0, refundAmount: 0, debtReduction: 0, isFullyPaid: false, alreadyRefunded: 0, maxRefundable: 0 }

    const originalTotal = Number(purchaseOrder.totalAmount || 0)

    // Tính giá trị hàng đã trả
    let returnValue = 0
    returnItems.forEach(item => {
      returnValue += item.total
    })

    // Giá trị đơn hàng sau khi trừ hàng trả
    const newTotal = Math.max(0, originalTotal - returnValue)

    // Tổng đã thanh toán (chỉ phiếu chi đã ghi sổ, không phải refund)
    const paidAmount = (purchaseOrder.paymentVouchers || [])
      .filter(pv => pv.status === 'posted' && pv.voucherType !== 'refund')
      .reduce((sum, pv) => sum + Number(pv.amount || 0), 0)

    // Tổng đã hoàn tiền trước đó
    const alreadyRefunded = (purchaseOrder.paymentVouchers || [])
      .filter(pv => pv.voucherType === 'refund' && pv.status !== 'cancelled')
      .reduce((sum, pv) => sum + Number(pv.amount || 0), 0)

    const isFullyPaid = paidAmount >= originalTotal

    let refundAmount = 0
    let debtReduction = 0

    if (isFullyPaid) {
      refundAmount = returnValue
    } else {
      if (paidAmount > newTotal) {
        refundAmount = paidAmount - newTotal
      } else {
        refundAmount = 0
      }
      debtReduction = returnValue - refundAmount
    }

    const maxRefundable = Math.max(0, refundAmount - alreadyRefunded)

    return {
      originalTotal,
      returnValue,
      paidAmount,
      newTotal,
      refundAmount,
      debtReduction,
      isFullyPaid,
      alreadyRefunded,
      maxRefundable,
      originalDebt: originalTotal - paidAmount,
      newDebt: Math.max(0, newTotal - paidAmount + alreadyRefunded),
    }
  }, [purchaseOrder, returnItems])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: refundCalc.maxRefundable,
      paymentMethod: 'cash',
      bankAccount: null,
      receiptDate: new Date().toISOString().substring(0, 10),
      notes: '',
      reason: purchaseOrder ? `Hoàn tiền trả hàng cho đơn mua ${purchaseOrder.poCode || purchaseOrder.code}` : '',
    },
  })

  useEffect(() => {
    if (open) {
      dispatch(getSetting('general_information'))
      form.reset({
        amount: refundCalc.maxRefundable,
        paymentMethod: 'cash',
        bankAccount: null,
        receiptDate: new Date().toISOString().substring(0, 10),
        notes: '',
        reason: purchaseOrder ? `Hoàn tiền trả hàng cho đơn mua ${purchaseOrder.poCode || purchaseOrder.code}` : '',
      })
    }
  }, [open, dispatch, refundCalc.maxRefundable, purchaseOrder, form])

  const onSubmit = async (data) => {
    const amountToReceive = parseFloat(data.amount) || 0

    if (amountToReceive > refundCalc.maxRefundable) {
      form.setError('amount', {
        type: 'manual',
        message: `Số tiền hoàn không được vượt quá ${moneyFormat(refundCalc.maxRefundable)}`,
      })
      return
    }

    const payload = {
      receiptType: 'refund',
      supplierId: purchaseOrder?.supplierId || purchaseOrder?.supplier?.id,
      purchaseOrderId: purchaseOrder?.id,
      amount: amountToReceive,
      paymentMethod: data.paymentMethod,
      bankName: data.paymentMethod === 'transfer' && data.bankAccount
        ? JSON.stringify(data.bankAccount)
        : undefined,
      receiptDate: data.receiptDate ? new Date(data.receiptDate).toISOString() : new Date().toISOString(),
      notes: data.reason
        ? `${data.reason}${data.notes ? ' | ' + data.notes : ''}`
        : (data.notes || `Hoàn tiền trả hàng cho đơn mua ${purchaseOrder?.poCode || purchaseOrder?.code}`),
    }

    try {
      await dispatch(createReceipt(payload)).unwrap()
      if (onSuccess) onSuccess()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const paymentMethod = form.watch('paymentMethod')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "md:h-auto md:max-w-full",
          isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle>Tạo phiếu thu hoàn tiền</DialogTitle>
          <DialogDescription>
            Kiểm tra và hoàn thành thông tin bên dưới để tạo phiếu thu hoàn tiền từ nhà cung cấp
            {purchaseOrder && (
              <span className="ml-1 text-primary font-medium">
                (Đơn mua: {purchaseOrder.poCode || purchaseOrder.code})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isMobile ? "h-full px-4 pb-4 flex-1" : "max-h-[65vh] md:max-h-[75vh]"
        )}>
          <Form {...form}>
            <form id="refund-receipt-form" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-6 lg:flex-row">
                {/* ===== Left: Phiếu + bảng hàng hoá ===== */}
                <div className="flex-1 space-y-6 rounded-lg border p-4">
                  <h2 className="text-lg font-semibold">
                    Thông tin phiếu thu hoàn tiền
                  </h2>

                  <div className="space-y-6">
                    {/* Bảng sản phẩm trả hàng */}
                    {returnItems.length > 0 ? (
                      <div className={cn("overflow-x-auto rounded-lg border", isMobile && "border-0 overflow-visible")}>
                        {!isMobile ? (
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">TT</TableHead>
                                <TableHead className="min-w-40">Sản phẩm trả</TableHead>
                                <TableHead className="min-w-16 text-right">SL trả</TableHead>
                                <TableHead className="min-w-16">ĐVT</TableHead>
                                <TableHead className="min-w-20 text-right">Đơn giá</TableHead>
                                <TableHead className="min-w-28 text-right">Thành tiền</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {returnItems.map((item, index) => (
                                <TableRow key={item.id || index}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                                        {item.productImage ? (
                                          <img
                                            src={getPublicUrl(item.productImage)}
                                            alt={item.productName}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <div className="font-medium">{item.productName}</div>
                                        <div className="text-xs text-muted-foreground">{item.productCode}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                                  <TableCell>{item.unitName || '—'}</TableCell>
                                  <TableCell className="text-right">{moneyFormat(item.unitPrice)}</TableCell>
                                  <TableCell className="text-right font-medium">{moneyFormat(item.total)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        ) : (
                          <div className="space-y-4">
                            {returnItems.map((item, index) => (
                              <div
                                key={item.id || index}
                                className="rounded-lg border p-3 shadow-sm bg-card text-card-foreground"
                              >
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/50">
                                    {item.productImage ? (
                                      <img
                                        src={getPublicUrl(item.productImage)}
                                        alt={item.productName}
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
                                      {item.productCode || '—'}
                                    </div>
                                    <div className="font-medium text-sm leading-tight line-clamp-2">
                                      {item.productName}
                                    </div>
                                  </div>
                                </div>

                                <Separator className="my-2" />

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="flex flex-col">
                                    <span className="text-muted-foreground text-xs">SL trả</span>
                                    <span className="font-medium">{Number(item.quantity)} {item.unitName || '—'}</span>
                                  </div>
                                  <div className="flex flex-col text-right">
                                    <span className="text-muted-foreground text-xs">Đơn giá</span>
                                    <span className="font-medium">{moneyFormat(item.unitPrice)}</span>
                                  </div>
                                </div>
                                <div className="mt-2 flex justify-between items-end bg-secondary/30 p-2 rounded">
                                  <span className="font-semibold text-sm">Thành tiền</span>
                                  <span className="font-bold text-primary">{moneyFormat(item.total)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4 border rounded bg-secondary/20">
                        Không có thông tin sản phẩm trả hàng
                      </div>
                    )}

                    {/* Tổng hợp & form fields */}
                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem className="mb-2 space-y-1">
                            <FormLabel>Lý do thu (hoàn tiền)</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Nhập lý do thu hoàn tiền"
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
                          <span>{moneyFormat(refundCalc.originalTotal)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <strong>Giá trị hàng trả:</strong>
                          <span>-{moneyFormat(refundCalc.returnValue)}</span>
                        </div>
                        <div className="flex justify-between items-center text-base border-t pt-2 mt-2">
                          <strong>Giá trị đơn sau trả hàng:</strong>
                          <span className="font-bold text-primary">{moneyFormat(refundCalc.newTotal)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <strong>Đã thanh toán (phiếu chi):</strong>
                          <span>{moneyFormat(refundCalc.paidAmount)}</span>
                        </div>
                        <div className="flex justify-between text-destructive">
                          <strong>Còn nợ:</strong>
                          <span>{moneyFormat(Math.max(0, refundCalc.newTotal - refundCalc.paidAmount))}</span>
                        </div>

                        {refundCalc.alreadyRefunded > 0 && (
                          <div className="flex justify-between text-blue-600">
                            <strong>Đã hoàn tiền trước đó:</strong>
                            <span>{moneyFormat(refundCalc.alreadyRefunded)}</span>
                          </div>
                        )}

                        {/* Giải thích logic */}
                        <div className="border-t pt-2 mt-2">
                          {refundCalc.isFullyPaid ? (
                            <div className="rounded-md bg-green-50 border border-green-200 p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-green-700 font-medium text-xs">
                                <Info className="h-3.5 w-3.5" />
                                Đã thanh toán đủ → Hoàn tiền theo giá trị hàng trả
                              </div>
                              <div className="flex justify-between text-green-700">
                                <span>Số tiền hoàn:</span>
                                <span className="font-bold">{moneyFormat(refundCalc.refundAmount)}</span>
                              </div>
                            </div>
                          ) : refundCalc.maxRefundable > 0 ? (
                            <div className="rounded-md bg-amber-50 border border-amber-200 p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-amber-700 font-medium text-xs">
                                <Info className="h-3.5 w-3.5" />
                                Chưa thanh toán đủ → Hoàn phần dư sau khi trừ nợ
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Giảm nợ:</span>
                                <span className="font-semibold text-amber-700">{moneyFormat(refundCalc.debtReduction)}</span>
                              </div>
                              <div className="flex justify-between text-amber-700">
                                <span>Số tiền hoàn lại:</span>
                                <span className="font-bold">{moneyFormat(refundCalc.refundAmount)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-md bg-blue-50 border border-blue-200 p-3 space-y-1">
                              <div className="flex items-center gap-1.5 text-blue-700 font-medium text-xs">
                                <Info className="h-3.5 w-3.5" />
                                Chưa thanh toán đủ → Trừ toàn bộ vào nợ, không hoàn tiền
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Giảm nợ:</span>
                                <span className="font-semibold text-blue-700">{moneyFormat(refundCalc.returnValue)}</span>
                              </div>
                              <div className="flex justify-between text-xs mt-1 pt-1 border-t border-blue-200">
                                <span>Nợ cũ:</span>
                                <span className="text-red-600 font-medium">{moneyFormat(refundCalc.originalDebt)}</span>
                              </div>
                              <div className="flex justify-between text-xs">
                                <span>Nợ mới (sau trả hàng):</span>
                                <span className="text-primary font-medium">{moneyFormat(Math.max(0, refundCalc.newTotal - refundCalc.paidAmount))}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {refundCalc.maxRefundable > 0 && (
                          <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold">Còn có thể hoàn:</span>
                            <span className="font-bold text-lg text-primary">{moneyFormat(refundCalc.maxRefundable)}</span>
                          </div>
                        )}

                        <Separator />

                        {/* Form fields */}
                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="receiptDate"
                            render={({ field }) => (
                              <FormItem className="mb-3 flex flex-col pt-1">
                                <FormLabel required={true}>Ngày thu</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {refundCalc.maxRefundable > 0 && (
                            <FormField
                              control={form.control}
                              name="amount"
                              render={({ field }) => (
                                <FormItem className="mb-2 space-y-1">
                                  <FormLabel required={true}>Số tiền thu (hoàn trả)</FormLabel>
                                  <FormControl>
                                    <Input
                                      value={moneyFormat(field.value)}
                                      placeholder="0"
                                      className="w-full text-end font-bold"
                                      onFocus={(e) => e.target.select()}
                                      onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, '')
                                        form.setValue('amount', rawValue)
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
                          )}

                          <div className="mb-3 mt-3">
                            <FormField
                              control={form.control}
                              name="paymentMethod"
                              render={({ field }) => (
                                <FormItem className="mb-3 space-y-1">
                                  <FormLabel required={true}>Phương thức thanh toán</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn phương thức" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="z-[100200]">
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

                                      <SelectContent className="z-[100200]">
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
                              name="notes"
                              render={({ field }) => (
                                <FormItem className="mb-2 space-y-1">
                                  <FormLabel>Ghi chú thanh toán</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      rows={2}
                                      placeholder="Ghi chú thêm về phiếu thu hoàn tiền..."
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

                {/* ===== Right: Nhà cung cấp ===== */}
                {supplier && (
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">Nhà cung cấp</h2>
                      <span className="rounded px-1.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700">
                        NCC
                      </span>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?bold=true&background=random&name=${supplier?.supplierName || supplier?.name}`}
                            alt={supplier?.supplierName || supplier?.name}
                          />
                          <AvatarFallback>NCC</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{supplier?.supplierName || supplier?.name}</div>
                          {(supplier?.supplierCode || supplier?.code) && (
                            <div className="text-xs text-muted-foreground">{supplier.supplierCode || supplier.code}</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="font-medium">Thông tin liên hệ</div>
                        </div>

                        <div className="mt-4 space-y-2 text-sm">
                          {supplier?.contactName && (
                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4">
                                <User className="h-4 w-4" />
                              </div>
                              <span className="font-medium text-foreground">
                                Liên hệ: {supplier.contactName}
                              </span>
                            </div>
                          )}
                          <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <MobileIcon className="h-4 w-4" />
                            </div>
                            <a href={`tel:${supplier?.phone}`}>
                              {supplier?.phone || 'Chưa cập nhật'}
                            </a>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <div className="mr-2 h-4 w-4">
                              <Mail className="h-4 w-4" />
                            </div>
                            <a href={`mailto:${supplier?.email}`}>
                              {supplier?.email || 'Chưa cập nhật'}
                            </a>
                          </div>

                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <MapPin className="h-4 w-4" />
                            </div>
                            {supplier?.address || 'Chưa cập nhật'}
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
              onClick={() => form.reset()}
              className={cn(isMobile && "flex-1")}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button
            form="refund-receipt-form"
            loading={loading}
            className={cn(isMobile && "flex-1")}
          >
            {refundCalc.maxRefundable > 0 ? 'Tạo phiếu thu hoàn tiền' : 'Xác nhận giảm nợ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RefundReceiptDialog
