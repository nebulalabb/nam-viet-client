import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/custom/Button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { CheckIcon, Mail, MapPin, User, Calendar, Truck, RefreshCcw } from 'lucide-react'
import { CaretSortIcon, MobileIcon } from '@radix-ui/react-icons'
import { IconDatabasePlus } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { DatePicker } from '@/components/custom/DatePicker'
import { createSupplier } from '@/stores/SupplierSlice'

const PurchaseOrderSidebar = ({
  form,
  suppliers,
  selectedSupplier,
  supplierEditData,
  onSupplierEditDataChange,
  onSelectSupplier,
  customers = [],
  selectedCustomer,
  customerEditData,
  onCustomerEditDataChange,
  onSelectCustomer,
  sourceType = 'supplier',
  onSourceTypeChange,
  paymentMethods,
  calculateSubTotal,
  calculateTotalTax,
  calculateTotalDiscount,
  calculateTotalAmount,
  calculateExpenses,
  onEditExpenses,
  onSubmit,
  loading,
  expectedDeliveryDate,
  onExpectedDeliveryDateChange,
  isUpdate = false,
  isPrintContract,
  setIsPrintContract,
  contractNumber,
  setContractNumber,
}) => {
  const dispatch = useDispatch()
  const [openOrderDatePicker, setOpenOrderDatePicker] = useState(false)
  const [openDeliveryDatePicker, setOpenDeliveryDatePicker] = useState(false)
  const [openIdentityDatePicker, setOpenIdentityDatePicker] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [identityCardError, setIdentityCardError] = useState('')

  const validatePhoneNumber = (phone) => {
    if (!phone) {
      setPhoneError('Số điện thoại là bắt buộc')
      return
    }
    const regex = /^(0)(2|3|5|7|8|9)([0-9]{8,9})$/
    if (!regex.test(phone)) {
      setPhoneError('SĐT không hợp lệ (Bắt đầu bằng 02, 03, 05, 07, 08, 09 và có 10-11 số)')
    } else {
      setPhoneError('')
    }
  }

  const validateEmail = (email) => {
    if (!email) {
      setEmailError('')
      return
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(email)) {
      setEmailError('Email không hợp lệ')
    } else {
      setEmailError('')
    }
  }

  const validateIdentityCard = (id) => {
    if (!id) {
      setIdentityCardError('')
      return
    }
    const cleaned = id.replace(/\D/g, '')
    if (cleaned.length < 9 || cleaned.length > 12) {
      setIdentityCardError('CCCD/CMND phải có 9-12 chữ số')
    } else {
      setIdentityCardError('')
    }
  }

  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false)

  const handleCreateSupplierInline = async () => {
    if (!supplierEditData.name?.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp')
      return
    }
    if (!supplierEditData.phone?.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    try {
      setIsCreatingSupplier(true)
      const newSupplier = await dispatch(
        createSupplier({
          name: supplierEditData.name,
          phone: supplierEditData.phone,
          email: supplierEditData.email || '',
          address: supplierEditData.address || '',
          taxCode: supplierEditData.taxCode || '',
          note: '',
          status: 'active'
        })
      ).unwrap()

      if (newSupplier) {
        toast.success('Tạo nhà cung cấp thành công')
        onSelectSupplier(newSupplier)
        // Reset edit data is handled by parent or we can clear it here if needed, 
        // but typically selecting replaces the edit data view
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
      toast.error('Lỗi tạo nhà cung cấp')
    } finally {
      setIsCreatingSupplier(false)
    }
  }

  const subtotal = calculateSubTotal()
  const tax = calculateTotalTax()
  const discount = calculateTotalDiscount()
  const expenses = calculateExpenses ? calculateExpenses() : 0
  const total = calculateTotalAmount()

  return (
    <div className="w-96 shrink-0 overflow-hidden bg-gradient-to-b border-l from-muted/50 to-background flex flex-col relative">
      {/* Left divider */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Header */}
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <h3 className="font-semibold mb-3">Thông tin đơn đặt hàng</h3>
        {/* Source Type Toggle */}
        <div className="flex rounded-md border overflow-hidden text-xs">
          <button
            type="button"
            className={cn(
              'flex-1 py-1.5 font-medium transition-colors',
              sourceType === 'supplier'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted/50'
            )}
            onClick={() => onSourceTypeChange?.('supplier')}
          >
            Nhà cung cấp
          </button>
          <button
            type="button"
            className={cn(
              'flex-1 py-1.5 font-medium transition-colors',
              sourceType === 'customer'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted/50'
            )}
            onClick={() => onSourceTypeChange?.('customer')}
          >
            Khách hàng
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Supplier or Customer Selection */}
          {sourceType === 'supplier' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Nhà cung cấp</label>

              {selectedSupplier ? (
                <>
                  <div className="border rounded-lg p-3 space-y-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedSupplier?.name}`}
                          alt={selectedSupplier?.name}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-snug break-words">
                          {selectedSupplier?.name}
                        </div>
                        {selectedSupplier?.code && (
                          <div className="text-xs text-muted-foreground">
                            {selectedSupplier?.code}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onSelectSupplier(null)}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-1.5 text-xs">
                      {selectedSupplier?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MobileIcon className="h-3 w-3" />
                          <a
                            href={`tel:${selectedSupplier?.phone}`}
                            className="hover:text-primary"
                          >
                            {selectedSupplier?.phone}
                          </a>
                        </div>
                      )}
                      {selectedSupplier?.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a
                            href={`mailto:${selectedSupplier?.email}`}
                            className="hover:text-primary truncate"
                          >
                            {selectedSupplier?.email}
                          </a>
                        </div>
                      )}
                      {selectedSupplier?.address && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{selectedSupplier?.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supplier Edit Fields - Always visible when supplier selected */}
                  <Separator />
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                    <div className="text-xs font-medium text-muted-foreground">Thông tin nhà cung cấp (có thể sửa)</div>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Tên nhà cung cấp <span className="text-destructive"> *</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          value={supplierEditData?.name || ''}
                          onChange={(e) => onSupplierEditDataChange({ ...supplierEditData, name: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Số điện thoại <span className="text-destructive"> *</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập SĐT"
                          value={supplierEditData?.phone || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onSupplierEditDataChange({ ...supplierEditData, phone: val })
                            validatePhoneNumber(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn("h-8 text-xs", phoneError && "border-destructive")}
                        />
                      </FormControl>
                      {phoneError && <span className="text-[10px] text-destructive">{phoneError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập email"
                          value={supplierEditData?.email || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onSupplierEditDataChange({ ...supplierEditData, email: val })
                            validateEmail(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn("h-8 text-xs", emailError && "border-destructive")}
                        />
                      </FormControl>
                      {emailError && <span className="text-[10px] text-destructive">{emailError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập địa chỉ"
                          value={supplierEditData?.address || ''}
                          onChange={(e) => onSupplierEditDataChange({ ...supplierEditData, address: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Mã số thuế</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MST"
                          value={supplierEditData?.taxCode || ''}
                          onChange={(e) => onSupplierEditDataChange({ ...supplierEditData, taxCode: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full justify-between font-normal"
                              >
                                {field.value
                                  ? suppliers.find((s) => s.id.toString() === field.value.toString())?.name
                                  : 'Chọn nhà cung cấp'}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Tìm kiếm..." className="h-9" />
                              <CommandEmpty>Không tìm thấy</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {suppliers.map((supplier) => (
                                    <CommandItem
                                      value={supplier.id.toString()}
                                      key={supplier.id}
                                      onSelect={() => onSelectSupplier(supplier)}
                                    >
                                      {supplier.name} - {supplier.phone}
                                      <CheckIcon
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          supplier.id.toString() === field.value?.toString()
                                            ? 'opacity-100'
                                            : 'opacity-0'
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

                  {/* Supplier Input Fields - For creating new */}
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                    <div className="text-xs font-medium text-muted-foreground">Hoặc nhập thông tin nhà cung cấp mới</div>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Tên nhà cung cấp <span className="text-destructive"> *</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          value={supplierEditData?.name || ''}
                          onChange={(e) => onSupplierEditDataChange({
                            ...supplierEditData,
                            name: e.target.value
                          })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Số điện thoại <span className="text-destructive"> *</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập SĐT"
                          value={supplierEditData?.phone || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onSupplierEditDataChange({
                              ...supplierEditData,
                              phone: val
                            })
                            validatePhoneNumber(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn("h-8 text-xs", phoneError && "border-destructive")}
                        />
                      </FormControl>
                      {phoneError && <span className="text-[10px] text-destructive">{phoneError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập email"
                          value={supplierEditData?.email || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onSupplierEditDataChange({
                              ...supplierEditData,
                              email: val
                            })
                            validateEmail(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn("h-8 text-xs", emailError && "border-destructive")}
                        />
                      </FormControl>
                      {emailError && <span className="text-[10px] text-destructive">{emailError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập địa chỉ"
                          value={supplierEditData?.address || ''}
                          onChange={(e) => onSupplierEditDataChange({
                            ...supplierEditData,
                            address: e.target.value
                          })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Mã số thuế</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="MST"
                          value={supplierEditData?.taxCode || ''}
                          onChange={(e) => onSupplierEditDataChange({
                            ...supplierEditData,
                            taxCode: e.target.value
                          })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <p className="text-[10px] text-muted-foreground italic">
                      * Nhà cung cấp sẽ được tạo tự động khi lưu đơn hàng nếu chưa có
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ===== CUSTOMER SECTION ===== */
            <div className="space-y-2">
              <label className="text-sm font-medium">Khách hàng</label>

              {selectedCustomer ? (
                <>
                  <div className="border rounded-lg p-3 space-y-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer?.name}`}
                          alt={selectedCustomer?.name}
                        />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-snug break-words">{selectedCustomer?.name}</div>
                        {selectedCustomer?.code && <div className="text-xs text-muted-foreground">{selectedCustomer.code}</div>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onSelectCustomer(null)}>
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-1.5 text-xs">
                      {selectedCustomer?.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MobileIcon className="h-3 w-3" />
                          <a href={`tel:${selectedCustomer.phone}`} className="hover:text-primary">{selectedCustomer.phone}</a>
                        </div>
                      )}
                      {selectedCustomer?.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${selectedCustomer.email}`} className="hover:text-primary truncate">{selectedCustomer.email}</a>
                        </div>
                      )}
                      {selectedCustomer?.address && (
                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{selectedCustomer.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                    <div className="text-xs font-medium text-muted-foreground">Thông tin khách hàng (có thể sửa)</div>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Tên khách hàng <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          value={customerEditData?.name || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, name: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          autoCapitalize="words"
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Số điện thoại <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập SĐT"
                          value={customerEditData?.phone || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onCustomerEditDataChange({ ...customerEditData, phone: val })
                            validatePhoneNumber(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          inputMode="numeric"
                          className={cn('h-8 text-xs', phoneError && 'border-destructive')}
                        />
                      </FormControl>
                      {phoneError && <span className="text-[10px] text-destructive">{phoneError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Nhập email"
                          value={customerEditData?.email || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onCustomerEditDataChange({ ...customerEditData, email: val })
                            validateEmail(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn('h-8 text-xs', emailError && 'border-destructive')}
                        />
                      </FormControl>
                      {emailError && <span className="text-[10px] text-destructive">{emailError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập địa chỉ"
                          value={customerEditData?.address || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, address: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">CCCD <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập số CCCD"
                          value={customerEditData?.identityCard || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12)
                            onCustomerEditDataChange({ ...customerEditData, identityCard: val })
                            validateIdentityCard(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          inputMode="numeric"
                          className={cn('h-8 text-xs', identityCardError && 'border-destructive')}
                        />
                      </FormControl>
                      {identityCardError && <span className="text-[10px] text-destructive">{identityCardError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Ngày cấp</FormLabel>
                      <Popover open={openIdentityDatePicker} onOpenChange={setOpenIdentityDatePicker}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn('h-8 w-full justify-start text-left font-normal text-xs', !customerEditData?.identityDate && 'text-muted-foreground')}
                            >
                              <Calendar className="mr-2 h-3 w-3" />
                              {customerEditData?.identityDate
                                ? new Date(customerEditData.identityDate).toLocaleDateString('vi-VN')
                                : 'Chọn ngày cấp'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={customerEditData?.identityDate ? new Date(customerEditData.identityDate) : undefined}
                            onSelect={(date) => {
                              onCustomerEditDataChange({ ...customerEditData, identityDate: date ? date.toISOString() : null })
                              setOpenIdentityDatePicker(false)
                            }}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Nơi cấp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập nơi cấp"
                          value={customerEditData?.identityPlace || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, identityPlace: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className="w-full justify-between font-normal">
                                {field.value
                                  ? customers.find((c) => c.id.toString() === field.value?.toString())?.name
                                  : 'Chọn khách hàng'}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                              <CommandInput placeholder="Tìm kiếm..." className="h-9" />
                              <CommandEmpty>Không tìm thấy</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {customers.map((customer) => (
                                    <CommandItem
                                      value={`${customer.name || ''} ${customer.phone || ''}`.trim()}
                                      key={customer.id}
                                      onSelect={() => onSelectCustomer(customer)}
                                    >
                                      {customer.name} - {customer.phone}
                                      <CheckIcon className={cn('ml-auto h-4 w-4', customer.id.toString() === field.value?.toString() ? 'opacity-100' : 'opacity-0')} />
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
                  <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                    <div className="text-xs font-medium text-muted-foreground">Hoặc nhập thông tin khách hàng mới</div>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Tên khách hàng <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên"
                          value={customerEditData?.name || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, name: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          autoCapitalize="words"
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Số điện thoại <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập SĐT"
                          value={customerEditData?.phone || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onCustomerEditDataChange({ ...customerEditData, phone: val })
                            validatePhoneNumber(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          inputMode="numeric"
                          className={cn('h-8 text-xs', phoneError && 'border-destructive')}
                        />
                      </FormControl>
                      {phoneError && <span className="text-[10px] text-destructive">{phoneError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoCapitalize="none"
                          autoCorrect="off"
                          placeholder="Nhập email"
                          value={customerEditData?.email || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            onCustomerEditDataChange({ ...customerEditData, email: val })
                            validateEmail(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className={cn('h-8 text-xs', emailError && 'border-destructive')}
                        />
                      </FormControl>
                      {emailError && <span className="text-[10px] text-destructive">{emailError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập địa chỉ"
                          value={customerEditData?.address || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, address: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">CCCD <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập số CCCD"
                          value={customerEditData?.identityCard || ''}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 12)
                            onCustomerEditDataChange({ ...customerEditData, identityCard: val })
                            validateIdentityCard(val)
                          }}
                          onFocus={(e) => e.target.select()}
                          inputMode="numeric"
                          className={cn('h-8 text-xs', identityCardError && 'border-destructive')}
                        />
                      </FormControl>
                      {identityCardError && <span className="text-[10px] text-destructive">{identityCardError}</span>}
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Ngày cấp</FormLabel>
                      <Popover open={openIdentityDatePicker} onOpenChange={setOpenIdentityDatePicker}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn('h-8 w-full justify-start text-left font-normal text-xs', !customerEditData?.identityDate && 'text-muted-foreground')}
                            >
                              <Calendar className="mr-2 h-3 w-3" />
                              {customerEditData?.identityDate
                                ? new Date(customerEditData.identityDate).toLocaleDateString('vi-VN')
                                : 'Chọn ngày cấp'}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={customerEditData?.identityDate ? new Date(customerEditData.identityDate) : undefined}
                            onSelect={(date) => {
                              onCustomerEditDataChange({ ...customerEditData, identityDate: date ? date.toISOString() : null })
                              setOpenIdentityDatePicker(false)
                            }}
                            disabled={(date) => date > new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>

                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs">Nơi cấp</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập nơi cấp"
                          value={customerEditData?.identityPlace || ''}
                          onChange={(e) => onCustomerEditDataChange({ ...customerEditData, identityPlace: e.target.value })}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-xs"
                        />
                      </FormControl>
                    </FormItem>

                    <p className="text-[10px] text-muted-foreground italic">* Khách hàng sẽ được tạo tự động khi lưu đơn</p>
                  </div>
                </>
              )}
            </div>
          )}

          <Separator />

          {/* Contract Number Input - Required only for supplier */}
          <FormField
            control={form.control}
            name="contractNumber"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>
                  Số hợp đồng
                  {sourceType === 'supplier' && <span className="text-destructive"> *</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nhập số hợp đồng..."
                    className="h-9"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      // Keep state sync for side-effects if needed, or remove if fully relying on form
                      if (setContractNumber) setContractNumber(e.target.value)
                      if (setIsPrintContract) setIsPrintContract(!!e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isAutoApprove"
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Cấu hình duyệt</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === 'true')}
                  defaultValue={field.value === false ? 'false' : 'true'}
                  value={field.value === false ? 'false' : 'true'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấu hình" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Không cần duyệt</SelectItem>
                    <SelectItem value="false">Cần duyệt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Order Date */}
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày đặt hàng</FormLabel>
                <Popover open={openOrderDatePicker} onOpenChange={setOpenOrderDatePicker}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {field.value
                          ? new Date(field.value).toLocaleDateString('vi-VN')
                          : 'Chọn ngày'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePicker
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? date.toISOString() : null)
                        setOpenOrderDatePicker(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Expected Delivery Date - Always visible for PO */}
          <FormField
            control={form.control}
            name="expectedDeliveryDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày dự kiến giao hàng <span className="text-destructive"> *</span></FormLabel>
                <Popover open={openDeliveryDatePicker} onOpenChange={setOpenDeliveryDatePicker}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        {field.value
                          ? new Date(field.value).toLocaleDateString('vi-VN')
                          : 'Chọn ngày'}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DatePicker
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date)
                        onExpectedDeliveryDateChange(date)
                        setOpenDeliveryDatePicker(false)
                      }}
                      disabled={(date) => {
                        const orderDate = form.getValues('orderDate')
                        const minDate = orderDate ? new Date(orderDate) : new Date()
                        const minDay = new Date(minDate)
                        minDay.setHours(0, 0, 0, 0)
                        const checkDay = new Date(date)
                        checkDay.setHours(0, 0, 0, 0)
                        return checkDay <= minDay
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />



          {/* Payment Terms */}
          <FormField
            control={form.control}
            name="paymentTerms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điều khoản thanh toán</FormLabel>
                <FormControl>
                  <Input placeholder="Ví dụ: Net 30" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ghi chú</FormLabel>
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

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Tổng kết</h4>

            <div className="space-y-1.5 text-sm">
              {/* Tạm tính */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{moneyFormat(subtotal)}</span>
              </div>

              {/* Giảm giá */}
              {/* {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Giảm giá:</span>
                  <span>-{moneyFormat(discount)}</span>
                </div>
              )} */}

              {/* Tiền thuế */}
              {tax > 0 && (
                <div className="flex justify-between text-blue-600">
                  <span>Tiền thuế:</span>
                  <span>+{moneyFormat(tax)}</span>
                </div>
              )}

              {/* Phí khác */}
              <div className="flex justify-between items-center group">
                <span className="text-muted-foreground">Phí khác:</span>
                <div className="flex items-center gap-2">
                  <span>{moneyFormat(expenses)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      onEditExpenses && onEditExpenses()
                    }}
                  >
                    <IconDatabasePlus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {expenses === 0 && (
                <div className="text-right">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs text-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      onEditExpenses && onEditExpenses()
                    }}
                  >
                    + Thêm chi phí
                  </Button>
                </div>
              )}

              <Separator />

              {/* Tổng cộng */}
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>Tổng cộng:</span>
                <span className="text-primary">{moneyFormat(total)}</span>
              </div>

              <div className="text-xs text-muted-foreground pt-1">
                Bằng chữ: <span className="font-medium">{toVietnamese(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t space-y-2">
        <Button
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
          disabled={loading}
          loading={loading}
        >
          <IconDatabasePlus className="h-4 w-4 mr-2" />
          {isUpdate ? 'Cập nhật đơn hàng' : 'Tạo đơn đặt hàng'}
        </Button>
      </div>
    </div>
  )
}

export default PurchaseOrderSidebar
