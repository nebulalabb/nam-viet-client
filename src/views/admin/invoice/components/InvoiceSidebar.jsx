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
import { CheckIcon, Mail, MapPin, User, Calendar, RefreshCcw } from 'lucide-react'
import { MobileIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { IconDatabasePlus, IconFileTypePdf } from '@tabler/icons-react'
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
import { createCustomer } from '@/stores/CustomerSlice'
import { toast } from 'sonner'
import { DatePicker } from '@/components/custom/DatePicker'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'

const InvoiceSidebar = ({
  form,
  customers,
  warehouses = [],
  selectedCustomer,
  customerEditData,
  onCustomerEditDataChange,
  onSelectCustomer,
  paymentMethods,
  calculateSubTotal,
  calculateTotalTax,
  calculateTotalDiscount,
  calculateTotalAmount,
  calculateExpenses,
  onSubmit,
  loading,
  onShowCreateCustomer,
  onShowUpdateCustomer,
  onPrintInvoice,
  onPrintQuotation,
  isUpdate = false,
  customerErrors = {}, // Receive validation errors
  deliveryDateError = '', // Receive delivery date error
  onInvalidSubmit,
  onScrollToCart,
}) => {
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
      setIdentityCardError('CCCD/CMND là bắt buộc')
      return
    }
    if (id.length !== 9 && id.length !== 12) {
      setIdentityCardError('CCCD/CMND phải có 9 hoặc 12 số')
    } else {
      setIdentityCardError('')
    }
  }

  const handleLoadCustomerToEdit = (customer) => {
    onCustomerEditDataChange({
      customerName: customer?.customerName || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      cccd: customer?.cccd || '',
      issuedAt: customer?.issuedAt || null,
      issuedBy: customer?.issuedBy || '',
    })
  }

  // Auto-load customer data when selected
  const handleAutoLoadCustomer = (customer) => {
    handleLoadCustomerToEdit(customer)
  }

  const handleCancelEdit = () => {
    onCustomerEditDataChange(null)
  }

  // Removed handlePrintContractChange function

  const subtotal = calculateSubTotal()
  const tax = calculateTotalTax()
  const discount = calculateTotalDiscount()
  const expenses = calculateExpenses()
  const total = calculateTotalAmount()

  return (
    <div className="w-80 bg-gradient-to-b border-l from-muted/50 to-background flex flex-col relative">
      {/* Left divider */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Header */}
      <div className="p-4 border-b bg-background">
        <h3 className="font-semibold">Thông tin đơn hàng</h3>
      </div>

      <ScrollArea className="flex-1">
        <div id="invoice-sidebar-top" />
        <div className="p-4 space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Khách hàng</label>

            {selectedCustomer ? (
              <>
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
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onSelectCustomer(null)}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-1.5 text-xs">
                    {selectedCustomer?.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MobileIcon className="h-3 w-3" />
                        <a
                          href={`tel:${selectedCustomer?.phone}`}
                          className="hover:text-primary"
                        >
                          {selectedCustomer?.phone}
                        </a>
                      </div>
                    )}
                    {selectedCustomer?.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <a
                          href={`mailto:${selectedCustomer?.email}`}
                          className="hover:text-primary truncate"
                        >
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
                        <User className="h-3 w-3" />
                        <span>CCCD: {selectedCustomer?.cccd || selectedCustomer?.identityCard}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Customer Edit Fields - Always visible when customer selected */}
                <Separator />
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="text-xs font-medium text-muted-foreground">Thông tin khách hàng (có thể sửa)</div>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Tên khách hàng <span className="text-destructive"> *</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên"
                        value={customerEditData?.customerName || ''}
                        onChange={(e) => onCustomerEditDataChange({ ...customerEditData, customerName: e.target.value })}
                        onFocus={(e) => e.target.select()}
                        autoCapitalize="words"
                        className={cn("h-8 text-xs", customerErrors?.customerName && "border-destructive")}
                      />
                    </FormControl>
                    {customerErrors?.customerName && <span className="text-[10px] text-destructive">{customerErrors.customerName}</span>}
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Số điện thoại <span className="text-destructive"> *</span></FormLabel>
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
                        className={cn("h-8 text-xs", (phoneError || customerErrors?.phone) && "border-destructive")}
                      />
                    </FormControl>
                    {(phoneError || customerErrors?.phone) && <span className="text-[10px] text-destructive">{phoneError || customerErrors?.phone}</span>}
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
                        className={cn("h-8 text-xs", (emailError || customerErrors?.email) && "border-destructive")}
                      />
                    </FormControl>
                    {(emailError || customerErrors?.email) && <span className="text-[10px] text-destructive">{emailError || customerErrors?.email}</span>}
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
                    <FormLabel className="text-xs">CCCD <span className="text-destructive"> *</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số CCCD"
                        value={customerEditData?.cccd || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 12)
                          onCustomerEditDataChange({ ...customerEditData, cccd: val })
                          validateIdentityCard(val)
                        }}
                        onFocus={(e) => e.target.select()}
                        inputMode="numeric"
                        className={cn("h-8 text-xs", (identityCardError || customerErrors?.cccd) && "border-destructive")}
                      />
                    </FormControl>
                    {(identityCardError || customerErrors?.cccd) && <span className="text-[10px] text-destructive">{identityCardError || customerErrors?.cccd}</span>}
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Ngày cấp</FormLabel>
                    <Popover open={openIdentityDatePicker} onOpenChange={setOpenIdentityDatePicker}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-start text-left font-normal text-xs',
                              !customerEditData?.issuedAt && 'text-muted-foreground'
                            )}
                          >
                            <Calendar className="mr-2 h-3 w-3" />
                            {customerEditData?.issuedAt
                              ? new Date(customerEditData.issuedAt).toLocaleDateString('vi-VN')
                              : 'Chọn ngày cấp'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePicker
                          mode="single"
                          selected={customerEditData?.issuedAt ? new Date(customerEditData.issuedAt) : undefined}
                          onSelect={(date) => {
                            onCustomerEditDataChange({ ...customerEditData, issuedAt: date ? date.toISOString() : null })
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
                        value={customerEditData?.issuedBy || ''}
                        onChange={(e) => onCustomerEditDataChange({ ...customerEditData, issuedBy: e.target.value })}
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
                            <Button
                              variant="outline"
                              className="w-full justify-between font-normal"
                            >
                              {field.value
                                ? customers.find((c) => c.id === field.value)?.name
                                : 'Chọn khách hàng cũ'}
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
                                    value={`${customer.customerName || customer.name || ''} ${customer.phone || ''} ${customer.cccd || customer.identityCard || ''}`.trim()}
                                    key={customer.id}
                                    onSelect={() => onSelectCustomer(customer)}
                                  >
                                    {customer.customerName || customer.name} - {customer.phone}
                                    <CheckIcon
                                      className={cn(
                                        'ml-auto h-4 w-4',
                                        customer.id === field.value
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

                {/* Customer Input Fields - Auto-create on submit */}
                <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
                  <div className="text-xs font-medium text-muted-foreground">Hoặc nhập thông tin khách hàng mới</div>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Tên khách hàng <span className="text-destructive"> *</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên"
                        value={customerEditData?.customerName || ''}
                        onChange={(e) => onCustomerEditDataChange({
                          ...customerEditData,
                          customerName: e.target.value
                        })}
                        onFocus={(e) => e.target.select()}
                        autoCapitalize="words"
                        className={cn("h-8 text-xs", customerErrors?.customerName && "border-destructive")}
                      />
                    </FormControl>
                    {customerErrors?.customerName && <span className="text-[10px] text-destructive">{customerErrors.customerName}</span>}
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Số điện thoại <span className="text-destructive"> *</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập SĐT"
                        value={customerEditData?.phone || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          onCustomerEditDataChange({
                            ...customerEditData,
                            phone: val
                          })
                          validatePhoneNumber(val)
                        }}
                        onFocus={(e) => e.target.select()}
                        inputMode="numeric"
                        className={cn("h-8 text-xs", (phoneError || customerErrors?.phone) && "border-destructive")}
                      />
                    </FormControl>
                    {(phoneError || customerErrors?.phone) && <span className="text-[10px] text-destructive">{phoneError || customerErrors?.phone}</span>}
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
                          onCustomerEditDataChange({
                            ...customerEditData,
                            email: val
                          })
                          validateEmail(val)
                        }}
                        onFocus={(e) => e.target.select()}
                        className={cn("h-8 text-xs", (emailError || customerErrors?.email) && "border-destructive")}
                      />
                    </FormControl>
                    {(emailError || customerErrors?.email) && <span className="text-[10px] text-destructive">{emailError || customerErrors?.email}</span>}
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Địa chỉ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập địa chỉ"
                        value={customerEditData?.address || ''}
                        onChange={(e) => onCustomerEditDataChange({
                          ...customerEditData,
                          address: e.target.value
                        })}
                        onFocus={(e) => e.target.select()}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">CCCD <span className="text-destructive"> *</span></FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số CCCD"
                        value={customerEditData?.cccd || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 12)
                          onCustomerEditDataChange({
                            ...customerEditData,
                            cccd: val
                          })
                          validateIdentityCard(val)
                        }}
                        onFocus={(e) => e.target.select()}
                        inputMode="numeric"
                        className={cn("h-8 text-xs", (identityCardError || customerErrors?.cccd) && "border-destructive")}
                      />
                    </FormControl>
                    {(identityCardError || customerErrors?.cccd) && <span className="text-[10px] text-destructive">{identityCardError || customerErrors?.cccd}</span>}
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Ngày cấp</FormLabel>
                    <Popover open={openIdentityDatePicker} onOpenChange={setOpenIdentityDatePicker}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-start text-left font-normal text-xs',
                              !customerEditData?.issuedAt && 'text-muted-foreground'
                            )}
                          >
                            <Calendar className="mr-2 h-3 w-3" />
                            {customerEditData?.issuedAt
                              ? new Date(customerEditData.issuedAt).toLocaleDateString('vi-VN')
                              : 'Chọn ngày cấp'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePicker
                          mode="single"
                          selected={customerEditData?.issuedAt ? new Date(customerEditData.issuedAt) : undefined}
                          onSelect={(date) => {
                            onCustomerEditDataChange({
                              ...customerEditData,
                              issuedAt: date ? date.toISOString() : null
                            })
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
                        value={customerEditData?.issuedBy || ''}
                        onChange={(e) => onCustomerEditDataChange({
                          ...customerEditData,
                          issuedBy: e.target.value
                        })}
                        onFocus={(e) => e.target.select()}
                        className="h-8 text-xs"
                      />
                    </FormControl>
                  </FormItem>

                  <p className="text-[10px] text-muted-foreground italic">
                    * Khách hàng sẽ được tạo tự động khi lưu hóa đơn
                  </p>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Order Date */}
          <FormField
            control={form.control}
            name="orderDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày đặt hàng <span className="text-destructive"> *</span></FormLabel>
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

          {/* Require Approval */}
          <FormField
            control={form.control}
            name="requireApproval"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại phê duyệt <span className="text-destructive"> *</span></FormLabel>
                <Select onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại phê duyệt" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="false">Đơn hàng không cần duyệt</SelectItem>
                    <SelectItem value="true">Đơn hàng cần duyệt</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPickupOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại đơn hàng <span className="text-destructive"> *</span></FormLabel>
                <Select onValueChange={(val) => field.onChange(val === 'true')} value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại đơn hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Đơn bán tại chỗ</SelectItem>
                    <SelectItem value="false">Đơn bán cần vận chuyển</SelectItem>
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
                <FormLabel>Kho xuất kho mặc định</FormLabel>
                <Select onValueChange={(val) => field.onChange(val === 'unselected' ? undefined : parseInt(val))} value={field.value ? field.value.toString() : 'unselected'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho xuất hàng mặc định (Tùy chọn)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unselected">Không chọn</SelectItem>
                    {warehouses?.map((w) => (
                      <SelectItem key={w.id} value={w.id.toString()}>
                        {w.warehouseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!form.watch('isPickupOrder') && (
            <div className="space-y-3 p-3 border rounded-lg bg-orange-50/50">
              <div className="text-xs font-medium text-orange-800">Thông tin giao hàng</div>

              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Tên người nhận</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên người nhận" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">SĐT người nhận</FormLabel>
                    <FormControl>
                      <Input placeholder="Số điện thoại" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryAddress"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Địa chỉ giao hàng</FormLabel>
                    <FormControl>
                      <Input placeholder="Địa chỉ chi tiết" className="h-8 text-xs" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingFee"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Phí giao hàng</FormLabel>
                    <FormControl>
                      <MoneyInputQuick
                        placeholder="Nhập phí tối thiểu 0"
                        value={field.value}
                        onChange={(val) => field.onChange(val)}
                        min={0}
                        className="h-8 w-full text-xs text-left px-3"
                        align="left"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs">Ngày dự kiến giao</FormLabel>
                    <Popover open={openDeliveryDatePicker} onOpenChange={setOpenDeliveryDatePicker}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'h-8 w-full justify-start text-left font-normal text-xs',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            <Calendar className="mr-2 h-3 w-3" />
                            {field.value
                              ? new Date(field.value).toLocaleDateString('vi-VN')
                              : 'Chọn ngày giao dự kiến'}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <DatePicker
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            field.onChange(date ? date.toISOString() : null)
                            setOpenDeliveryDatePicker(false)
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          )}


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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tạm tính:</span>
                <span>{moneyFormat(subtotal)}</span>
              </div>

              {tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thuế:</span>
                  <span>{moneyFormat(tax)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Giảm giá:</span>
                  <span>-{moneyFormat(discount)}</span>
                </div>
              )}

              {expenses > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí khác:</span>
                  <span>{moneyFormat(expenses)}</span>
                </div>
              )}

              {Number(form.watch('shippingFee')) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí giao hàng:</span>
                  <span>{moneyFormat(Number(form.watch('shippingFee')))}</span>
                </div>
              )}

              <Separator />

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
        {/* Main Button */}
        <Button
          className="w-full"
          onClick={form.handleSubmit(onSubmit, onInvalidSubmit)}
          disabled={loading}
          loading={loading}
        >
          <IconDatabasePlus className="h-4 w-4 mr-2" />
          {isUpdate ? 'Cập nhật đơn bán' : 'Tạo đơn bán'}
        </Button>

        {/* Print Buttons Disabled by Business Logic (Chỉ in khi có phiếu xuất kho)
        <div className="space-y-2 flex flex-col">
          <Button
            type="button"
            className="w-full"
            onClick={form.handleSubmit((data) => onSubmit(data, { printInvoice: true }), onInvalidSubmit)}
            disabled={loading}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            {isUpdate ? 'Cập nhật Và In Hóa Đơn' : 'Tạo Và In Hóa Đơn'}
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={form.handleSubmit((data) => onSubmit(data, { printAgreement: true }))}
            disabled={loading}
          >
            <IconFileTypePdf className="h-4 w-4 mr-2" />
            {isUpdate ? 'Cập nhật Và In Thỏa Thuận' : 'Tạo Và In Thỏa Thuận'}
          </Button>
        </div>
        */}
      </div>
    </div>
  )
}

export default InvoiceSidebar
