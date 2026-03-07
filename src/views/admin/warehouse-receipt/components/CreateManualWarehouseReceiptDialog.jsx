import { Button } from '@/components/custom/Button'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { createWarehouseReceipt, getWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { getCustomers } from '@/stores/CustomerSlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import { PlusIcon, Trash2, Check, ChevronsUpDown, Search, CheckIcon } from 'lucide-react'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { receiptTypes, businessTypes } from '../data'
import { moneyFormat } from '@/utils/money-format'

const formSchema = z.object({
  receiptType: z.coerce.number(),
  businessType: z.string().min(1, 'Vui lòng chọn loại nghiệp vụ'),
  receiptDate: z.date(),
  actualReceiptDate: z.date().optional().nullable(),
  reason: z.string().optional(),
  note: z.string().optional(),
  partnerId: z.string().optional(),
})

import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { getPublicUrl } from '@/utils/file'

const CreateManualWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  onSuccess,
}) => {
  const dispatch = useDispatch()
  const { products, loading: productsLoading } = useSelector((state) => state.product)
  const { customers } = useSelector((state) => state.customer)
  const { suppliers } = useSelector((state) => state.supplier)
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [openProductSearch, setOpenProductSearch] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiptType: 1, // Default: Import
      businessType: '',
      receiptDate: new Date(),
      actualReceiptDate: new Date(),
      reason: '',
      note: '',
      partnerId: '',
    },
  })

  const receiptType = form.watch('receiptType')

  // Filter business types based on receipt type
  const filteredBusinessTypes = useMemo(() => {
    // 1: Import, 2: Export
    if (receiptType === 1) {
      return businessTypes.filter(t => ['purchase_in', 'return_in', 'other', 'transfer_in'].includes(t.value))
    }
    if (receiptType === 2) {
      return businessTypes.filter(t => ['sale_out', 'return_out', 'other', 'transfer_out'].includes(t.value))
    }
    return []
  }, [receiptType])

  useEffect(() => {
    // Reset business type when receipt type changes
    form.setValue('businessType', '')
    form.setValue('partnerId', '')

    // Default business type selection
    form.setValue('businessType', 'other')
  }, [receiptType, form])

  useEffect(() => {
    if (open) {
      if (products.length === 0) dispatch(getProducts())
      if (customers.length === 0) dispatch(getCustomers())
      if (suppliers.length === 0) dispatch(getSuppliers())
    }
  }, [open, dispatch, products.length, customers.length, suppliers.length])

  const handleAddProduct = (product) => {
    if (selectedProducts.some(p => p.productId === product.id)) {
      toast.warning('Sản phẩm này đã được chọn')
      return
    }

    const baseUnitId = product.baseUnitId || product.prices?.[0]?.unitId
    // Default movement based on receipt type
    let defaultMovement = 'in'
    if (receiptType === 2) defaultMovement = 'out' // Export
    // Adjustment defaults to 'in' (surplus) initially, user can change

    // Determine default price
    // Import (1) -> Prefer basePrice (Cost)
    // Export (2) -> Prefer price (Selling)
    let defaultPrice = 0
    if (receiptType === 2) {
      defaultPrice = product.price || 0
    } else {
      defaultPrice = product.basePrice || product.price || 0
    }

    setSelectedProducts(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        code: product.code,
        image: product.image,
        unitId: baseUnitId,
        unitName: product.baseUnit?.name || product.prices?.[0]?.unitName || '—',
        quantity: 1,
        price: defaultPrice,
        movement: defaultMovement,
        note: '',
        product: product // Keep full product ref for unit conversion lookup
      }
    ])
    setOpenProductSearch(false)
  }

  const handleRemoveProduct = (index) => {
    const newProducts = [...selectedProducts]
    newProducts.splice(index, 1)
    setSelectedProducts(newProducts)
  }

  const handleProductChange = (index, field, value) => {
    const newProducts = [...selectedProducts]
    newProducts[index][field] = value

    // Handle Unit Change -> Update Factor/Price logic could go here if needed
    if (field === 'unitId') {
      const product = newProducts[index].product
      // Simple find unit name for display
      const unit = product?.unitConversions?.find(u => u.unitId === value) ||
        (Number(product.baseUnitId) === Number(value) ? { unit: product.baseUnit } : null) ||
        product?.prices?.find(p => p.unitId === value)

      if (unit) {
        newProducts[index].unitName = unit.unitName || unit.unit?.name || '—'
      }
    }

    setSelectedProducts(newProducts)
  }

  const onSubmit = async (data) => {
    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm')
      return
    }

    setLoading(true)
    try {
      const details = selectedProducts.map(item => ({
        productId: item.productId,
        unitId: item.unitId,
        movement: receiptType === 1 ? 'in' : 'out',
        qtyActual: item.quantity,
        unitPrice: item.price,
        note: item.note
      }))

      const payload = {
        receiptType: data.receiptType,
        businessType: data.businessType,

        actualReceiptDate: data.actualReceiptDate ? data.actualReceiptDate.toISOString().split('T')[0] : null,
        reason: data.reason,
        note: data.note,
        details: details,
        ...(data.receiptType === 1 && data.partnerId && { supplierId: Number(data.partnerId) }),
        ...(data.receiptType === 2 && data.partnerId && { customerId: Number(data.partnerId) })
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Tạo phiếu kho thành công')

      // Reset & Refresh
      form.reset()
      setSelectedProducts([])
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      // Toast error is handled in slice usually, but safety net:
      toast.error(error?.message || 'Tạo phiếu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const getUnitOptions = (product) => {
    if (!product) return []
    const opts = []

    // Base unit
    if (product.baseUnitId) {
      opts.push({
        value: product.baseUnitId,
        label: product.baseUnit?.name || 'Đơn vị cơ bản'
      })
    } else if (product.prices?.[0]?.unitId) {
      opts.push({
        value: product.prices[0].unitId,
        label: product.prices[0].unitName
      })
    }

    // Conversions
    if (product.unitConversions) {
      product.unitConversions.forEach(uc => {
        if (uc.unitId && uc.unitId !== product.baseUnitId) {
          opts.push({
            value: uc.unitId,
            label: uc.unit?.name || '—'
          })
        }
      })
    }

    // Dedupe
    return opts.filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <PlusIcon className="mr-2 h-4 w-4" />
            Tạo phiếu
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          "md:max-w-4xl md:max-h-[90vh] overflow-y-auto flex flex-col",
          isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col z-[10002]"
        )}
      >
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle>Tạo phiếu kho thủ công</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "space-y-4 flex-1 flex flex-col",
              isMobile && "h-full px-4 pb-4 overflow-auto"
            )}
          >
            <div className="flex-1 overflow-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="receiptType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại phiếu</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {receiptTypes.filter(t => t.value !== 3).map(t => (
                            <SelectItem key={t.value} value={String(t.value)}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loại nghiệp vụ</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nghiệp vụ" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredBusinessTypes.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />



                <FormField
                  control={form.control}
                  name="actualReceiptDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày nhận hàng thực tế</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={field.value ? (field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partnerId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel className="mb-0.5">{receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between font-normal h-9 bg-background",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <span className="truncate">
                                {field.value
                                  ? receiptType === 1
                                    ? suppliers.find((s) => s.id.toString() === field.value.toString())?.name
                                    : customers.find((c) => c.id.toString() === field.value.toString())?.name
                                  : `Chọn ${receiptType === 1 ? 'nhà cung cấp' : 'khách hàng'}`}
                              </span>
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm..." className="h-9" />
                            <CommandEmpty>Không tìm thấy</CommandEmpty>
                            <CommandGroup>
                              <CommandList>
                                {receiptType === 1 ? (
                                  suppliers.map((s) => (
                                    <CommandItem
                                      key={s.id}
                                      value={`${s.name} ${s.phone} ${s.id}`} /* Thêm id vào value để search & select chính xác nếu trùng tên */
                                      onSelect={() => {
                                        form.setValue("partnerId", s.id.toString())
                                      }}
                                    >
                                      {s.name} - {s.phone}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          s.id.toString() === field.value?.toString()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))
                                ) : (
                                  customers.map((c) => (
                                    <CommandItem
                                      key={c.id}
                                      value={`${c.name} ${c.phone} ${c.id}`}
                                      onSelect={() => {
                                        form.setValue("partnerId", c.id.toString())
                                      }}
                                    >
                                      {c.name} - {c.phone}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          c.id.toString() === field.value?.toString()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))
                                )}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lý do / Diễn giải</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ví dụ: Nhập kho hàng trả lại" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="border rounded-md p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                  <h3 className="font-semibold">Chi tiết hàng hóa</h3>
                  <Popover open={openProductSearch} onOpenChange={setOpenProductSearch}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full md:w-[250px] justify-between">
                        <Search className="mr-2 h-4 w-4 opacity-50" />
                        Thêm sản phẩm...
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="end">
                      <Command shouldFilter={false}> {/* Client side filtering manually if needed, or rely on command default */}
                        <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                          <CommandGroup heading="Sản phẩm">
                            {products.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name + ' ' + product.code} // Searchable string
                                onSelect={() => handleAddProduct(product)}
                              >
                                <div className='flex flex-col'>
                                  <span>{product.name}</span>
                                  <span className='text-xs text-muted-foreground'>{product.code} - Tồn: {product.productStocks?.[0]?.quantity || 0}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    selectedProducts.some(p => p.productId === product.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="rounded-md border">
                  {isMobile ? (
                    <div className="divide-y">
                      {selectedProducts.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          Chưa có sản phẩm nào được chọn
                        </div>
                      ) : (
                        selectedProducts.map((item, index) => (
                          <div key={item.productId} className="p-3 space-y-3 bg-card">
                            {/* Row 1: Info & Remove */}
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                  {item.image ? (
                                    <img
                                      src={getPublicUrl(item.image)}
                                      alt={item.productName}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                      <span className="text-[10px]">No img</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{item.productName}</div>
                                  <div className="text-xs text-muted-foreground">{item.code}</div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive -mt-1 -mr-1"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Row 2: Unit & Movement */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase">ĐVT</label>
                                <Select
                                  value={String(item.unitId)}
                                  onValueChange={(val) => handleProductChange(index, 'unitId', Number(val))}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getUnitOptions(item.product).map(u => (
                                      <SelectItem key={u.value} value={String(u.value)} className="text-xs">{u.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>


                            </div>

                            {/* Row 3: Quantity & Price */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase">Số lượng</label>
                                <Input
                                  type="number"
                                  min="0"
                                  className="h-8 text-sm text-right"
                                  value={item.quantity}
                                  onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                                  onFocus={(e) => e.target.select()}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase">
                                  {receiptType === 2 ? 'Đơn giá bán' : 'Đơn giá vốn'}
                                </label>
                                <MoneyInputQuick
                                  className="h-8 text-sm text-right"
                                  value={item.price}
                                  onChange={(val) => handleProductChange(index, 'price', val)}
                                />
                              </div>
                            </div>

                            {/* Row 4: Note */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-muted-foreground uppercase">Ghi chú</label>
                              <Input
                                className="h-8 text-sm"
                                value={item.note}
                                onChange={(e) => handleProductChange(index, 'note', e.target.value)}
                                placeholder="Ghi chú chi tiết..."
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[800px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="w-[60px]">Ảnh</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="w-[100px]">Đơn vị</TableHead>

                            <TableHead className="w-[100px]">Số lượng</TableHead>
                            <TableHead className="w-[150px]">
                              {receiptType === 2 ? 'Đơn giá bán' : 'Đơn giá vốn'}
                            </TableHead>
                            <TableHead>Ghi chú</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedProducts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                                Chưa có sản phẩm nào được chọn
                              </TableCell>
                            </TableRow>
                          ) : (
                            selectedProducts.map((item, index) => (
                              <TableRow key={item.productId}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>
                                  <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
                                    {item.image ? (
                                      <img
                                        src={getPublicUrl(item.image)}
                                        alt={item.productName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                        <span className="text-[10px]">No img</span>
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{item.productName}</div>
                                  <div className="text-xs text-muted-foreground">{item.code}</div>
                                </TableCell>
                                <TableCell>
                                  <Select
                                    value={String(item.unitId)}
                                    onValueChange={(val) => handleProductChange(index, 'unitId', Number(val))}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getUnitOptions(item.product).map(u => (
                                        <SelectItem key={u.value} value={String(u.value)}>{u.label}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>



                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0"
                                    className="h-8 text-right"
                                    value={item.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', Number(e.target.value))}
                                    onFocus={(e) => e.target.select()}
                                  />
                                </TableCell>
                                <TableCell>
                                  <MoneyInputQuick
                                    className="h-8 text-right"
                                    value={item.price}
                                    onChange={(val) => handleProductChange(index, 'price', val)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-8"
                                    value={item.note}
                                    onChange={(e) => handleProductChange(index, 'note', e.target.value)}
                                    placeholder="Ghi chú..."
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemoveProduct(index)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Ghi chú thêm..." />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4 shrink-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" loading={loading}>Lưu phiếu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateManualWarehouseReceiptDialog
