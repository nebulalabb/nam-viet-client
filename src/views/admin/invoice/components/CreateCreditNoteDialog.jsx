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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
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
import { toast } from 'sonner'
import { getCustomers } from '@/stores/CustomerSlice'
import PrintInvoiceView from './PrintInvoiceView'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { IconDatabasePlus, IconFileTypePdf } from '@tabler/icons-react'
import { Mail, MapPin } from 'lucide-react'
import { MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { createCreditNote, getCreditNoteDetail } from '@/stores/CreditNoteSlice'
import { getSetting } from '@/stores/SettingSlice'
import { createCreditNoteSchema } from '../schema'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'

const CreateCreditNoteDialog = ({
  open,
  onOpenChange,
  originalInvoice,
  showTrigger = true,
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.invoice.loading)
  const authUser =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const [selectedCustomer, setSelectedCustomer] = useState(
    originalInvoice?.customer || null,
  )
  const [selectedProducts, setSelectedProducts] = useState(
    originalInvoice?.invoiceItems || [],
  )
  const numOr = (v, fallback) =>
    v === undefined || v === null || v === '' ? fallback : Number(v)

  // State field
  const [quantities, setQuantities] = useState({})
  const [prices, setPrices] = useState({})
  const [discounts, setDiscounts] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [warranties, setWarranties] = useState({})
  const [notes, setNotes] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})

  const [invoice, setInvoice] = useState(null)
  const [generalInformation, setGeneralInformation] = useState(null)
  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)

  // ================= INIT ===================
  useEffect(() => {
    dispatch(getCustomers())
    dispatch(getSetting('sharing_ratio'))
    if (originalInvoice?.invoiceItems?.length) {
      const q = {},
        p = {},
        d = {},
        g = {},
        w = {},
        n = {},
        t = {}
      originalInvoice.invoiceItems.forEach((item) => {
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
    }
  }, [dispatch, originalInvoice])

  const form = useForm({
    resolver: zodResolver(createCreditNoteSchema),
    defaultValues: { note: '', status: 'pending' },
  })

  // ================= HANDLERS ===================
  const handleChange = (setter) => (productId, value) =>
    setter((prev) => ({ ...prev, [productId]: value }))

  const handleTaxChange = (productId, taxId, isChecked) =>
    setSelectedTaxes((prev) => {
      const productTaxes = prev[productId] || []
      return {
        ...prev,
        [productId]: isChecked
          ? [...productTaxes, taxId]
          : productTaxes.filter((id) => id !== taxId),
      }
    })

  // ================= CALCULATE ===================
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
    selectedProducts.reduce(
      (s, p) => s + (Number(discounts[p.productId]) || 0),
      0,
    )
  const totalTax = () => selectedProducts.reduce((s, p) => s + calcTax(p), 0)
  const totalAmount = () => totalSub() + totalTax()

  // ================= SUBMIT ===================
  const onSubmit = async (data) => {
    if (!selectedCustomer) return toast.error('Vui lòng chọn khách hàng')

    const items = selectedProducts.map((p) => ({
      productId: p.productId,
      image: p.image || null,
      productName: p.productName,
      productType: p.productType,
      unitId: p.unitId || p.product?.prices?.[0]?.unitId,
      unitName: p.unitName,
      quantity: numOr(quantities[p.productId], 1),
      price: numOr(prices[p.productId], p.price), // <= cho phép 0
      taxAmount: calcTax(p),
      subTotal: calcSubTotal(p),
      discount: numOr(discounts[p.productId], 0),
      total: calcSubTotal(p) + calcTax(p),
      note: notes[p.productId] || '',
      warranty: warranties[p.productId] || '',
      options: [],
    }))

    const payload = {
      invoiceId: originalInvoice.id,
      userId: authUser.id,
      customerId: selectedCustomer.id,
      date: new Date().toISOString(),
      note: data.note,
      type: originalInvoice.type,
      schoolId:
        originalInvoice.type === 'kafood'
          ? originalInvoice.schoolId || null
          : null,
      taxAmount: totalTax(),
      amount: totalAmount(),
      discount: totalDiscount(),
      subTotal: totalSub(),
      status: 'pending',
      isCredit: 1,
      originalInvoiceId: originalInvoice.id,
      items,
    }

    try {
      const newInvoice = await dispatch(createCreditNote(payload)).unwrap()
      if (hasPrintInvoice) {
        const creditData = await dispatch(getCreditNoteDetail(newInvoice.id)).unwrap()
        setInvoice(creditData)

        const generalInformationData = await dispatch(
          getSetting('general_information'),
        ).unwrap()
        setGeneralInformation(generalInformationData)

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
      toast.error('Tạo phiếu điều chỉnh thất bại')
    }
  }

  // ================= RENDER ===================
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" />
              Tạo phiếu điều chỉnh
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Phiếu điều chỉnh (Credit Note)</DialogTitle>
            <DialogDescription>
              Dựa trên hóa đơn #{originalInvoice?.code}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[70vh] overflow-auto">
            <Form {...form}>
              <form
                id="create-credit-note"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* LEFT */}
                  <div className="flex-1 space-y-6 rounded-lg border p-4 lg:max-w-[79vw]">
                    <h2 className="text-lg font-semibold">
                      Danh sách sản phẩm
                    </h2>
                    <div className="overflow-x-auto rounded-lg border">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow className="bg-secondary text-xs">
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
                            <TableRow key={p.id}>
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
                                  value={quantities[p.productId] || 1}
                                  type="number"
                                  className="h-7 w-16"
                                  onChange={(e) =>
                                    handleChange(setQuantities)(
                                      p.productId,
                                      e.target.value,
                                    )
                                  }
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  value={giveaway[p.productId] || 0}
                                  type="number"
                                  className="h-7 w-16"
                                  onChange={(e) =>
                                    handleChange(setGiveaway)(
                                      p.productId,
                                      e.target.value,
                                    )
                                  }
                                />
                              </TableCell>

                              {/* GIÁ - FIX */}
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
                                      className="flex flex-row items-center space-x-2"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          onCheckedChange={(checked) =>
                                            handleTaxChange(
                                              p.productId,
                                              tax.id,
                                              checked,
                                            )
                                          }
                                          checked={
                                            selectedTaxes[
                                              p.productId
                                            ]?.includes(tax.id) || false
                                          }
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm">
                                        {tax.title} ({tax.percentage}%)
                                      </FormLabel>
                                    </FormItem>
                                  ),
                                )}
                              </TableCell>

                              {/* GIẢM GIÁ - FIX */}
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

                  {/* RIGHT - CUSTOMER INFO */}
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
              form="create-credit-note"
              disabled={loading}
              onClick={() => setHasPrintInvoice(true)}
            >
              <IconFileTypePdf className="mr-2 h-4 w-4" /> Lưu và in
            </Button>
            <Button form="create-credit-note" disabled={loading}>
              <IconDatabasePlus className="mr-2 h-4 w-4" /> Lưu
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

export default CreateCreditNoteDialog
