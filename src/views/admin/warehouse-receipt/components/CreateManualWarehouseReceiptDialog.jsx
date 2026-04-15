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
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { createWarehouseReceipt, getWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { getCustomers } from '@/stores/CustomerSlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { PlusIcon, Trash2, Check, CheckIcon, Search } from 'lucide-react'
import api from '@/utils/axios'
import { CaretSortIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { receiptTypes, businessTypes } from '../data'
import { moneyFormat } from '@/utils/money-format'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { getPublicUrl } from '@/utils/file'

const formSchema = z.object({
  receiptType: z.coerce.number(),
  businessType: z.string().min(1, 'Vui lòng chọn loại nghiệp vụ'),
  warehouseId: z.string().min(1, 'Vui lòng chọn kho'),
  receiptDate: z.date(),
  actualReceiptDate: z.date().optional().nullable(),
  reason: z.string().optional(),
  note: z.string().optional(),
  partnerId: z.string().optional(),
})

const CreateManualWarehouseReceiptDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  onSuccess,
  defaultReceiptType = 1,
  triggerLabel,
}) => {
  const dispatch = useDispatch()
  const { products, loading: productsLoading } = useSelector((state) => state.product)
  const { customers } = useSelector((state) => state.customer)
  const { suppliers } = useSelector((state) => state.supplier)
  const { warehouses } = useSelector((state) => state.warehouse)
  const [loading, setLoading] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [openProductSearch, setOpenProductSearch] = useState(false)
  const [openPartnerPopover, setOpenPartnerPopover] = useState(false)
  const [inventoryMap, setInventoryMap] = useState({}) // productId -> quantity
  const [openTargetWarehousePopover, setOpenTargetWarehousePopover] = useState(false)
  const [supplierAutoFilled, setSupplierAutoFilled] = useState(false) // Track if supplier was auto-filled from product
  const isMobile = useMediaQuery('(max-width: 768px)')

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      receiptType: defaultReceiptType, // 1: Import, 2: Export
      businessType: '',
      warehouseId: '',
      receiptDate: new Date(),
      actualReceiptDate: new Date(),
      reason: '',
      note: '',
      partnerId: '',
    },
  })

  const receiptType = form.watch('receiptType')
  const selectedWarehouseId = form.watch('warehouseId')
  const businessType = form.watch('businessType')
  const selectedPartnerId = form.watch('partnerId')
  const isTransferType = businessType === 'transfer_in' || businessType === 'transfer_out'

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

  // Fetch inventory for selected warehouse
  const fetchInventory = useCallback(async (warehouseId) => {
    if (!warehouseId) {
      setInventoryMap({})
      return
    }
    try {
      const res = await api.get('/inventory', { params: { warehouseId, limit: 10000 } })
      const data = res.data?.data || []
      const map = {}
      data.forEach(inv => {
        map[inv.productId] = Number(inv.quantity) - Number(inv.reservedQuantity || 0)
      })
      setInventoryMap(map)
    } catch (err) {
      console.error('Failed to fetch inventory:', err)
      setInventoryMap({})
    }
  }, [])

  useEffect(() => {
    if (selectedWarehouseId) {
      fetchInventory(selectedWarehouseId)
    } else {
      setInventoryMap({})
    }
  }, [selectedWarehouseId, fetchInventory])

  // Check if any product has insufficient stock (for export)
  const hasInsufficientStock = useMemo(() => {
    if (receiptType !== 2) return false // Only check for export
    return selectedProducts.some(item => {
      const stock = inventoryMap[item.productId] ?? 0
      return stock < item.quantity
    })
  }, [receiptType, selectedProducts, inventoryMap])

  useEffect(() => {
    // Reset business type when receipt type changes
    form.setValue('businessType', '')
    form.setValue('partnerId', '')

    // Default business type selection
    form.setValue('businessType', 'other')
  }, [receiptType, form])

  // Filter products for dropdown
  const displayProducts = useMemo(() => {
    let filtered = products
    // For export: only show products with stock
    if (receiptType === 2 && selectedWarehouseId) {
      filtered = filtered.filter(p => (inventoryMap[p.id] ?? 0) > 0)
    }
    // For import: filter by selected supplier if one is chosen
    if (receiptType === 1 && selectedPartnerId) {
      const supplierIdNum = Number(selectedPartnerId)
      filtered = filtered.filter(p => p.supplierId === supplierIdNum || p.supplier?.id === supplierIdNum)
    }
    return filtered
  }, [products, receiptType, selectedWarehouseId, inventoryMap, selectedPartnerId])

  useEffect(() => {
    if (open) {
      // Reset all state when dialog opens to start fresh
      form.reset({
        receiptType: defaultReceiptType,
        businessType: '',
        warehouseId: '',
        receiptDate: new Date(),
        actualReceiptDate: new Date(),
        reason: '',
        note: '',
        partnerId: '',
      })
      setSelectedProducts([])
      setSupplierAutoFilled(false)
      setInventoryMap({})
      setOpenProductSearch(false)
      setOpenPartnerPopover(false)
      setOpenTargetWarehousePopover(false)

      // Fetch data if not loaded
      if (products.length === 0) dispatch(getProducts())
      if (customers.length === 0) dispatch(getCustomers())
      if (suppliers.length === 0) dispatch(getSuppliers())
      if (!warehouses || warehouses.length === 0) dispatch(getWarehouses({ limit: 1000 }))
    }
  }, [open])

  const handleAddProduct = (product) => {
    if (selectedProducts.some(p => p.productId === product.id)) {
      toast.warning('Sản phẩm này đã được chọn')
      return
    }

    // Auto-fill supplier from product if no supplier is selected (import only)
    if (receiptType === 1 && !selectedPartnerId && product.supplierId) {
      form.setValue('partnerId', product.supplierId.toString())
      setSupplierAutoFilled(true)
      toast.info(`Đã tự động chọn nhà cung cấp: ${product.supplier?.supplierName || 'NCC'}. Lần thêm tiếp theo sẽ chỉ hiện sản phẩm của nhà cung cấp này.`)
    }

    // Backend trả về product.unit (relation), không phải baseUnit/baseUnitId
    const unitId = product.unitId || product.unit?.id
    const unitName = product.unit?.unitName || product.unit?.name || '—'

    // Default movement based on receipt type
    let defaultMovement = 'in'
    if (receiptType === 2) defaultMovement = 'out' // Export

    setSelectedProducts(prev => [
      ...prev,
      {
        productId: product.id,
        productName: product.productName || product.name,
        code: product.productCode || product.code,
        image: product.image,
        unitId: unitId,
        unitName: unitName,
        quantity: 1,
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
      // Validate stock for export
      if (receiptType === 2 && hasInsufficientStock) {
        toast.error('Tồn kho không đủ cho một hoặc nhiều sản phẩm')
        setLoading(false)
        return
      }

      const details = selectedProducts.map(item => ({
        productId: item.productId,
        unitId: item.unitId,
        quantity: Number(item.quantity) || 0,
        notes: item.note || undefined,
      }))

      const isTransferTypePayload = data.businessType === 'transfer_in' || data.businessType === 'transfer_out'
      const payload = {
        warehouseId: Number(data.warehouseId),
        reason: data.reason || undefined,
        notes: data.note || undefined,
        referenceType: data.businessType || undefined,
        actualReceiptDate: data.actualReceiptDate,
        customerId: data.receiptType === 2 && !isTransferTypePayload && data.partnerId ? Number(data.partnerId) : undefined,
        supplierId: data.receiptType === 1 && !isTransferTypePayload && data.partnerId ? Number(data.partnerId) : undefined,
        details,
        // partnerId đi kèm referenceType để backend biết partner (nếu có)
        // Với transfer, referenceId là kho nhập (nếu là transfer nhập hoặc xuất thì referenceId lưu id kho đích)
        ...(isTransferTypePayload && data.partnerId && { referenceId: Number(data.partnerId) }),
        ...(!isTransferTypePayload && data.receiptType === 1 && data.partnerId && { referenceId: Number(data.partnerId) }),
        ...(!isTransferTypePayload && data.receiptType === 2 && data.partnerId && { referenceId: Number(data.partnerId) }),
        // Pass receiptType cho slice biết dùng /import hay /export
        receiptType: data.receiptType,
      }

      await dispatch(createWarehouseReceipt(payload)).unwrap()
      toast.success('Tạo phiếu kho thành công')

      // Reset & Refresh
      form.reset()
      setSelectedProducts([])
      setSupplierAutoFilled(false)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
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
            {triggerLabel || 'Tạo phiếu'}
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
          <DialogTitle>{receiptType === 2 ? 'Tạo phiếu xuất kho' : 'Tạo phiếu nhập kho'}</DialogTitle>
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
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isTransferType ? 'Kho xuất' : 'Kho'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn kho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(warehouses || []).map(w => (
                            <SelectItem key={w.id} value={String(w.id)}>{w.warehouseName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />


                {isTransferType ? (
                  <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel className="mb-0.5">Kho nhập</FormLabel>
                        <Popover open={openTargetWarehousePopover} onOpenChange={setOpenTargetWarehousePopover}>
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
                                    ? (warehouses || []).find((w) => w.id.toString() === field.value.toString())?.warehouseName
                                    : 'Chọn kho nhập'}
                                </span>
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Tìm kho..." className="h-9" />
                              <CommandEmpty>Không tìm thấy kho</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {(warehouses || []).filter(w => w.id.toString() !== selectedWarehouseId).map((w) => (
                                    <CommandItem
                                      key={w.id}
                                      value={`${w.warehouseName} ${w.id}`}
                                      onSelect={() => {
                                        form.setValue("partnerId", w.id.toString())
                                        setOpenTargetWarehousePopover(false)
                                      }}
                                    >
                                      {w.warehouseName}
                                      <CheckIcon
                                        className={cn(
                                          "ml-auto h-4 w-4",
                                          w.id.toString() === field.value?.toString()
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="partnerId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2">
                        <FormLabel className="mb-0.5">{receiptType === 1 ? 'Nhà cung cấp' : 'Khách hàng'}</FormLabel>
                        <Popover open={openPartnerPopover} onOpenChange={setOpenPartnerPopover}>
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
                                      ? suppliers.find((s) => s.id.toString() === field.value.toString())?.supplierName
                                      : customers.find((c) => c.id.toString() === field.value.toString())?.customerName
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
                                        value={`${s.supplierName} ${s.id}`}
                                        onSelect={() => {
                                          form.setValue("partnerId", s.id.toString())
                                          setOpenPartnerPopover(false)
                                        }}
                                      >
                                        {s.supplierName}
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
                                        value={`${c.customerName} ${c.id}`}
                                        onSelect={() => {
                                          form.setValue("partnerId", c.id.toString())
                                          setOpenPartnerPopover(false)
                                        }}
                                      >
                                        {c.customerName}
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
                )}
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
                    <PopoverContent className="w-[420px] p-0" align="end">
                      <Command shouldFilter={false}>
                        <CommandInput placeholder="Tìm kiếm sản phẩm..." />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                          <CommandGroup heading="Sản phẩm">
                            {displayProducts.length === 0 ? (
                              <div className="p-2 text-center text-sm text-muted-foreground">Không có sản phẩm trong kho này</div>
                            ) : displayProducts.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={(product.productName || product.name || '') + ' ' + (product.productCode || product.code || '')}
                                onSelect={() => handleAddProduct(product)}
                                className="flex items-center gap-3 py-2"
                              >
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                                  {product.image ? (
                                    <img
                                      src={getPublicUrl(product.image)}
                                      alt={product.productName || product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                      <span className="text-[9px] leading-tight px-0.5 text-center">No img</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span className="font-medium text-sm truncate">{product.productName || product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.productCode || product.code} · Tồn: {(selectedWarehouseId ? inventoryMap[product.id] : product.productStocks?.[0]?.quantity) ?? 0}
                                    {receiptType === 1 && !selectedPartnerId && product.supplier?.supplierName && (
                                      <> · <span className="text-blue-600 font-medium">{product.supplier.supplierName}</span></>
                                    )}
                                  </span>
                                </div>
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
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
                        selectedProducts.map((item, index) => {
                          const stock = inventoryMap[item.productId] ?? 0
                          const isInsufficient = receiptType === 2 && stock < item.quantity
                          return (
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

                            {/* Row 2: Unit, Quantity & Stock */}
                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground uppercase">ĐVT</label>
                                <div className="h-8 flex items-center text-sm">{item.unitName || '—'}</div>
                              </div>
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
                                <label className="text-[10px] text-muted-foreground uppercase">Tồn kho</label>
                                <div className={cn(
                                  "h-8 flex items-center text-sm font-medium",
                                  isInsufficient ? "text-red-500 font-bold" : "text-foreground"
                                )}>
                                  {selectedWarehouseId ? (isInsufficient ? <span className="text-red-500 font-bold">{stock} (Thiếu)</span> : stock) : '—'}
                                </div>
                              </div>
                            </div>

                            {/* Row 3: Note */}
                            <div className="space-y-1 mt-2">
                              <label className="text-[10px] font-bold text-amber-700 uppercase">Ghi chú SP</label>
                              <Input
                                className="h-8 text-sm bg-amber-50 border-amber-300 focus-visible:ring-amber-500 transition-colors"
                                value={item.note}
                                onChange={(e) => handleProductChange(index, 'note', e.target.value)}
                                placeholder="Ghi chú chi tiết..."
                              />
                            </div>
                          </div>
                          )
                        })
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="min-w-[700px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">#</TableHead>
                            <TableHead className="w-[60px]">Ảnh</TableHead>
                            <TableHead>Sản phẩm</TableHead>
                            <TableHead className="w-[100px]">Đơn vị</TableHead>
                            <TableHead className="w-[120px]">Số lượng</TableHead>
                            <TableHead className="w-[100px]">Tồn kho</TableHead>
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
                            selectedProducts.map((item, index) => {
                              const stock = inventoryMap[item.productId] ?? 0
                              const isInsufficient = receiptType === 2 && stock < item.quantity
                              return (
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
                                  <span className="text-sm">{item.unitName || '—'}</span>
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
                                  {selectedWarehouseId ? (
                                    <span className={cn(
                                      "text-sm font-medium",
                                      isInsufficient ? "text-red-500 font-bold" : ""
                                    )}>
                                      {isInsufficient ? <span className="text-red-500 font-bold">{stock}</span> : stock}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className="h-8 bg-amber-50 border-amber-300 focus-visible:ring-amber-500 transition-colors"
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
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>


            </div>

            <DialogFooter className="mt-4 shrink-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">Hủy</Button>
              </DialogClose>
              <Button type="submit" loading={loading} disabled={loading || (receiptType === 2 && hasInsufficientStock)}>
                {receiptType === 2 && hasInsufficientStock ? 'Tồn kho không đủ' : 'Lưu phiếu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateManualWarehouseReceiptDialog
