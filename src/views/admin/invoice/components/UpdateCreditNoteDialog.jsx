import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { IconFileTypePdf, IconDatabasePlus } from '@tabler/icons-react'
import { Mail, MapPin, Pencil } from 'lucide-react'
import { MobileIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'

import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { updateCreditNoteSchema } from '../schema'
import { getSetting } from '@/stores/SettingSlice'
import { updateCreditNote, getCreditNoteDetail } from '@/stores/CreditNoteSlice'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'

const UpdateCreditNoteDialog = ({
  open,
  onOpenChange,
  creditNote,
  showTrigger = false,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.creditNote.loading)

  // ---------- helper ----------
  const numOr = (v, fallback = 0) => {
    if (v === undefined || v === null || v === '') return fallback
    const n = Number(String(v).replace(/,/g, ''))
    return isNaN(n) ? fallback : n
  }

  const baseOriginal = creditNote?.original || null
  const initialCustomer = creditNote?.customer || null
  const initialItems = creditNote?.invoiceItems || []

  // ---------- local state ----------
  const [selectedCustomer] = useState(initialCustomer)
  const [selectedProducts, setSelectedProducts] = useState(initialItems)
  const [quantities, setQuantities] = useState({})
  const [prices, setPrices] = useState({})
  const [discounts, setDiscounts] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [warranties, setWarranties] = useState({})
  const [notes, setNotes] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})
  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [generalInformation, setGeneralInformation] = useState(null)

  const form = useForm({
    resolver: zodResolver(updateCreditNoteSchema),
    defaultValues: {
      note: creditNote?.note || '',
      status: creditNote?.status || 'pending',
    },
  })

  useEffect(() => {
    if (!creditNote) return
    const items = creditNote.invoiceItems || []
    const q = {},
      p = {},
      d = {},
      g = {},
      w = {},
      n = {},
      t = {}
    items.forEach((item) => {
      q[item.productId] = item.quantity
      p[item.productId] = item.price
      d[item.productId] = item.discount || 0
      g[item.productId] = item.giveaway || 0
      w[item.productId] = item.warranty || ''
      n[item.productId] = item.note || ''
      t[item.productId] =
        item.product?.prices?.[0]?.taxes?.map((tx) => tx.id) || []
    })
    setQuantities(q)
    setPrices(p)
    setDiscounts(d)
    setGiveaway(g)
    setWarranties(w)
    setNotes(n)
    setSelectedTaxes(t)
  }, [creditNote])

  useEffect(() => {
    if (!creditNote) return

    const items = creditNote.invoiceItems || []
    const q = {},
      p = {},
      d = {},
      g = {},
      w = {},
      n = {},
      t = {}

    items.forEach((item) => {
      q[item.productId] = item.quantity
      p[item.productId] = item.price
      d[item.productId] = item.discount || 0
      g[item.productId] = item.giveaway || 0
      w[item.productId] = item.warranty || ''
      n[item.productId] = item.note || ''
      t[item.productId] =
        item.product?.prices?.[0]?.taxes?.map((tx) => tx.id) || []
    })

    setQuantities(q)
    setPrices(p)
    setDiscounts(d)
    setGiveaway(g)
    setWarranties(w)
    setNotes(n)
    setSelectedTaxes(t)
    form.reset({
      note: creditNote.note || '',
      status: creditNote.status || 'pending',
    })
  }, [creditNote, form])

  // ---------- handlers ----------
  const handleChange = (setter) => (productId, value) =>
    setter((prev) => ({ ...prev, [productId]: value }))

  const handleTaxChange = (productId, taxId, isChecked) =>
    setSelectedTaxes((prev) => {
      const current = prev[productId] || []
      return {
        ...prev,
        [productId]: isChecked
          ? [...current, taxId]
          : current.filter((id) => id !== taxId),
      }
    })

  // ---------- calculations ----------
  const calcTax = (p) => {
    const q = numOr(quantities[p.productId], 1)
    const price = numOr(prices[p.productId], p.price)
    const base = q * price - numOr(discounts[p.productId], 0)
    const sel = selectedTaxes[p.productId] || []
    const taxes = p.product?.prices?.[0]?.taxes || []
    return taxes
      .filter((t) => sel.includes(t.id))
      .reduce((s, t) => s + (base * t.percentage) / 100, 0)
  }

  const calcSubTotal = (p) => {
    const q = numOr(quantities[p.productId], 1)
    const price = numOr(prices[p.productId], p.price)
    const discount = numOr(discounts[p.productId], 0)
    return Math.max(q * price - discount, 0)
  }

  const totalSub = () =>
    selectedProducts.reduce((s, p) => s + calcSubTotal(p), 0)
  const totalDiscount = () =>
    selectedProducts.reduce((s, p) => s + numOr(discounts[p.productId]), 0)
  const totalTax = () => selectedProducts.reduce((s, p) => s + calcTax(p), 0)
  const totalAmount = () => totalSub() + totalTax()

  // ---------- submit ----------
  const onSubmit = async (data) => {
    if (!selectedCustomer) return toast.error('Vui lòng chọn khách hàng')

    const items = selectedProducts.map((p) => ({
      id: p.id,
      productId: p.productId,
      image: p.image || null,
      productName: p.productName,
      productType: p.productType,
      unitId: p.unitId || p.product?.prices?.[0]?.unitId,
      unitName: p.unitName,
      quantity: numOr(quantities[p.productId], 1),
      price: numOr(prices[p.productId], p.price),
      taxAmount: calcTax(p),
      subTotal: calcSubTotal(p),
      discount: numOr(discounts[p.productId], 0),
      total: calcSubTotal(p) + calcTax(p),
      note: notes[p.productId] || '',
      warranty: warranties[p.productId] || '',
      options: p.options || [],
    }))

    const payload = {
      id: creditNote.id,
      creditNoteId: creditNote.id,
      userId: creditNote.userId,
      customerId: selectedCustomer.id,
      date: creditNote.date || new Date().toISOString(),
      note: data.note,
      type: creditNote.type,
      schoolId:
        creditNote.type === 'kafood' ? creditNote.schoolId || null : null,
      taxAmount: totalTax(),
      amount: totalAmount(),
      discount: totalDiscount(),
      subTotal: totalSub(),
      status: data.status || creditNote.status || 'pending',
      isCredit: 1,
      originalInvoiceId: creditNote.originalInvoiceId,
      items,
    }

    try {
      const updated = await dispatch(updateCreditNote(payload)).unwrap()
      toast.success(
        `Đã cập nhật phiếu điều chỉnh ${updated.code || creditNote.code}`,
      )

      if (hasPrintInvoice) {
        const creditData = await dispatch(getCreditNoteDetail(
          updated.id || creditNote.id,
        )).unwrap()
        setInvoice(creditData)
        const generalInfo = await dispatch(
          getSetting('general_information'),
        ).unwrap()
        setGeneralInformation(generalInfo)
        setTimeout(() => {
          setInvoice(null)
          form.reset()
          onOpenChange?.(false)
        }, 1000)
      } else {
        form.reset()
        onOpenChange?.(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Cập nhật phiếu điều chỉnh thất bại')
    }
  }

  // ---------- render ----------
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 size-4" />
              Sửa phiếu điều chỉnh
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Cập nhật phiếu điều chỉnh</DialogTitle>
            <DialogDescription>
              Đang sửa phiếu: <b>{creditNote?.code}</b>
              {baseOriginal?.code && (
                <>
                  {' '}
                  — từ hóa đơn gốc <b>#{baseOriginal.code}</b>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-auto">
            <Form {...form}>
              <form
                id="update-credit-note"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* LEFT */}
                  <div className="flex-1 space-y-6 rounded-lg border p-4 lg:max-w-[79vw]">
                    <h2 className="text-lg font-semibold">Sản phẩm</h2>

                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full text-sm">
                        <TableHeader>
                          <TableRow className="bg-secondary">
                            <TableHead>TT</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead>SL</TableHead>
                            <TableHead>Tặng</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Thuế</TableHead>
                            <TableHead>Giảm giá</TableHead>
                            <TableHead>Tổng</TableHead>
                            <TableHead>Bảo hành</TableHead>
                            <TableHead>Ghi chú</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {selectedProducts.map((p, i) => (
                            <TableRow key={p.id ?? `${p.productId}-${i}`}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {p.productName}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {p.unitName}
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell>
                                <Input
                                  value={quantities[p.productId] ?? 1}
                                  type="number"
                                  className="h-7 w-16"
                                  onChange={(e) =>
                                    handleChange(setQuantities)(
                                      p.productId,
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  value={giveaway[p.productId] ?? 0}
                                  type="number"
                                  className="h-7 w-16"
                                  onChange={(e) =>
                                    handleChange(setGiveaway)(
                                      p.productId,
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <MoneyInputQuick
                                  value={prices[p.productId] ?? ''}
                                  onChange={(num) =>
                                    handleChange(setPrices)(p.productId, num)
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                {(p.product?.prices?.[0]?.taxes || []).map(
                                  (tax) => (
                                    <FormItem
                                      key={tax.id}
                                      className="flex items-center space-x-2"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={
                                            selectedTaxes[
                                              p.productId
                                            ]?.includes(tax.id) || false
                                          }
                                          onCheckedChange={(checked) =>
                                            handleTaxChange(
                                              p.productId,
                                              tax.id,
                                              checked,
                                            )
                                          }
                                        />
                                      </FormControl>
                                      <FormLabel className="text-xs">
                                        {tax.title} ({tax.percentage}%)
                                      </FormLabel>
                                    </FormItem>
                                  ),
                                )}
                              </TableCell>

                              <TableCell>
                                <MoneyInputQuick
                                  value={discounts[p.productId] ?? ''}
                                  onChange={(num) =>
                                    handleChange(setDiscounts)(p.productId, num)
                                  }
                                />
                              </TableCell>

                              <TableCell className="text-end font-medium">
                                {moneyFormat(calcSubTotal(p) + calcTax(p))}
                              </TableCell>

                              <TableCell>
                                <Input
                                  value={warranties[p.productId] || ''}
                                  placeholder="Bảo hành"
                                  className="h-7 w-full"
                                  onChange={(e) =>
                                    handleChange(setWarranties)(
                                      p.productId,
                                      e.target.value,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Textarea
                                  value={notes[p.productId] || ''}
                                  placeholder="Ghi chú"
                                  rows={1}
                                  className="h-7 w-full"
                                  onChange={(e) =>
                                    handleChange(setNotes)(
                                      p.productId,
                                      e.target.value,
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span>{moneyFormat(totalSub())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Thuế:</span>
                        <span>{moneyFormat(totalTax())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Giảm giá:</span>
                        <span>{moneyFormat(totalDiscount())}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm font-bold text-primary">
                        <span>Tổng cộng:</span>
                        <span>{moneyFormat(totalAmount())}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Viết bằng chữ: {toVietnamese(totalAmount())}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
                    {selectedCustomer ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?name=${selectedCustomer.name}`}
                            />
                            <AvatarFallback>KH</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedCustomer.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Mã KH: {selectedCustomer.code}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-primary">
                            <MobileIcon className="mr-2 h-4 w-4" />
                            {selectedCustomer.phone || 'Chưa có số điện thoại'}
                          </div>
                          <div className="flex items-center text-primary">
                            <Mail className="mr-2 h-4 w-4" />
                            {selectedCustomer.email || 'Chưa có email'}
                          </div>
                          <div className="flex items-center text-primary">
                            <MapPin className="mr-2 h-4 w-4" />
                            {selectedCustomer.address || 'Chưa có địa chỉ'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Không có thông tin khách hàng
                      </div>
                    )}

                    <Separator className="my-3" />
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú chung</FormLabel>
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
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>

            <Button
              disabled={loading}
              onClick={(e) => {
                setHasPrintInvoice(true)
                form.handleSubmit(onSubmit)(e)
              }}
            >
              <IconFileTypePdf className="mr-2 h-4 w-4" /> Cập nhật & in
            </Button>

            <Button
              disabled={loading}
              onClick={(e) => {
                setHasPrintInvoice(false)
                form.handleSubmit(onSubmit)(e)
              }}
            >
              <IconDatabasePlus className="mr-2 h-4 w-4" /> Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoice && generalInformation && (
        <PrintInvoiceView invoice={invoice} setting={generalInformation} />
      )}
    </>
  )
}

export default UpdateCreditNoteDialog
