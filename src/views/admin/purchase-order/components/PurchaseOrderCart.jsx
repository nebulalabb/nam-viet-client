import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
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
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart as CartIcon, Minus, Plus, Package, X, Check as CheckIcon, ChevronsUpDown, Tag } from 'lucide-react'
import { moneyFormat } from '@/utils/money-format'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import { getPublicUrl } from '@/utils/file'
import { cn } from '@/lib/utils'

const PurchaseOrderCart = ({
  selectedProducts,
  quantities,
  selectedUnitIds,
  priceOverrides,
  discountRates,
  selectedTaxes,
  notes,
  onQuantityChange,
  onUnitChange,
  onPriceChange,
  onDiscountRateChange,
  onTaxChange,
  onNoteChange,
  onRemoveProduct,
  getUnitOptions,
  getDisplayPrice,
  calculateSubTotal,
  calculateTaxForProduct,
}) => {
  if (selectedProducts.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col border-l bg-gradient-to-b from-background to-muted/20">
        {/* Left divider */}
        <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        {/* Right divider */}
        <div className="absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

        <div className="border-b bg-background/80 p-4 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 font-semibold">
            <CartIcon className="h-4 w-4" />
            Chi tiết đơn hàng
            <span className="text-xs text-muted-foreground">(0)</span>
          </h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <CartIcon className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Chưa có nguyên liệu nào
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click vào nguyên liệu để thêm vào đơn hàng
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col border-l bg-gradient-to-b from-background to-muted/20">
      {/* Left divider */}
      <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Right divider */}
      <div className="absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

      {/* Header */}
      <div className="space-y-2 border-b bg-emerald-50/20 p-4 backdrop-blur-sm">
        <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-900 uppercase tracking-wider">
          <CartIcon className="h-4 w-4 text-emerald-600" />
          <span className="hidden md:inline">Chi tiết đơn hàng</span>
          <span className="md:hidden">Chi tiết</span>
          <span className="text-xs text-muted-foreground lowercase font-normal">
            ({selectedProducts.length})
          </span>
        </h3>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1">
        <div className="space-y-3 p-3">
          {selectedProducts.map((product) => {
            const unitOptions = getUnitOptions(product)
            const currentUnitId =
              selectedUnitIds[product.id] || unitOptions[0]?.unitId
            const currentPrice = getDisplayPrice(product)
            const currentQuantity = quantities[product.id] || 1
            const subtotal = calculateSubTotal(product.id)
            const imagePath = getPublicUrl(product.image)

            return (
              <div
                key={product.id}
                className="rounded-xl border border-emerald-100/50 bg-white p-4 transition-all hover:shadow-md hover:border-emerald-200 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-12 -mt-12 group-hover:bg-emerald-100/50 transition-colors" />
                {/* Header: Image + Name + Remove */}
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {product.image ? (
                      <img
                        src={imagePath}
                        alt={product.productName || product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Name and Remove Button */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-2 text-sm font-bold text-emerald-900 leading-snug">
                          {product.productName || product.name}
                        </h4>
                        {product.code && (
                          <p className="mt-1 text-[10px] font-mono font-medium text-emerald-600/70 bg-emerald-50 w-fit px-1.5 py-0.5 rounded">
                            {product.code}
                          </p>
                        )}
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Tồn kho: {Number(product.totalStock) || 0}
                        </p>
                        {/* Price Sync Timestamp */}
                        {product.syncMapping?.lastSyncAt && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                            {product.syncMapping.supplier?.name} - Cập nhật: {new Date(product.syncMapping.lastSyncAt).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemoveProduct(product.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Inputs and Totals (Full Width) */}
                <div className="mt-3 space-y-3">
                  {/* Row 1: Đơn vị, Đơn giá, Số lượng */}
                  <div className="flex gap-2">
                    {/* Unit Selection */}
                    <div className="flex-1">
                      <label className="mb-1 block text-[10px] text-muted-foreground">
                        Đơn vị
                      </label>
                      <Select
                        value={String(currentUnitId)}
                        onValueChange={(val) => onUnitChange(product.id, val)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((opt) => (
                            <SelectItem
                              key={opt.unitId}
                              value={String(opt.unitId)}
                            >
                              {opt.unitName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Editable Price */}
                    <div className="flex-1">
                      <label className="mb-1 block text-[10px] text-muted-foreground">
                        Đơn giá
                      </label>
                      <MoneyInputQuick
                        value={currentPrice}
                        onChange={(num) =>
                          onPriceChange(product.id, String(num))
                        }
                        onFocus={(e) => e.target.select()}
                        className={cn("h-8 text-sm", currentPrice <= 0 && "border-destructive focus-visible:ring-destructive")}
                      />
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex-1">
                      <label className="mb-1 block text-[10px] text-muted-foreground">
                        Số lượng
                      </label>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            onQuantityChange(
                              product.id,
                              Math.max(1, currentQuantity - 1),
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={currentQuantity}
                          onChange={(e) =>
                            onQuantityChange(
                              product.id,
                              Number(e.target.value),
                            )
                          }
                          onFocus={(e) => e.target.select()}
                          className="h-8 w-full min-w-0 p-0 text-center text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() =>
                            onQuantityChange(product.id, currentQuantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Thuế + Giảm giá */}
                  {(() => {
                     const productTaxes = product?.taxes || product?.prices?.[0]?.taxes || []
                    const selectedProductTaxes = selectedTaxes[product.id] || []
                    const currentDiscountRate = discountRates[product.id] || 0
                    
                    return (
                      <div className="flex gap-2">
                        {/* Tax Selection */}
                        <div className="flex-1">
                          <label className="mb-1 block text-[10px] text-muted-foreground">
                            Thuế
                          </label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="h-8 w-full justify-between text-xs px-2"
                              >
                                <span className="truncate">
                                  {selectedProductTaxes.length > 0
                                    ? `${selectedProductTaxes.length} loại`
                                    : 'Chọn'}
                                </span>
                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                              <Command>
                                <CommandList>
                                  <CommandGroup>
                                    {productTaxes.length > 0 ? (
                                      productTaxes.map((tax) => (
                                        <CommandItem
                                          key={tax.id}
                                          value={tax.id.toString()}
                                          onSelect={() => {
                                            const isChecked = !selectedProductTaxes.includes(tax.id)
                                            onTaxChange(product.id, tax.id, isChecked)
                                          }}
                                        >
                                          <div
                                            className={cn(
                                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                              selectedProductTaxes.includes(tax.id)
                                                ? 'bg-primary text-primary-foreground'
                                                : 'opacity-50 [&_svg]:invisible',
                                            )}
                                          >
                                            <CheckIcon className={cn('h-4 w-4')} />
                                          </div>
                                          {tax.title || tax.name} ({tax.percentage}%)
                                        </CommandItem>
                                      ))
                                    ) : (
                                      <div className="py-6 text-center text-sm text-muted-foreground">
                                        Không có thông tin thuế
                                      </div>
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        {/* Giảm giá (%) */}
                        <div className="flex-1">
                          <label className="mb-1 block text-[10px] text-muted-foreground">
                            Giảm giá (%)
                          </label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={currentDiscountRate === '' ? 0 : currentDiscountRate}
                              onChange={(e) =>
                                onDiscountRateChange(product.id, e.target.value)
                              }
                              onFocus={(e) => e.target.select()}
                              className="h-8 pr-6 text-sm"
                            />
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                          </div>
                        </div>

                        {/* Tiền giảm giá */}
                        <div className="flex-1">
                          <label className="mb-1 block text-[10px] text-muted-foreground">
                            Tiền giảm giá
                          </label>
                          <MoneyInputQuick
                            value={Math.round(currentPrice * currentQuantity * (Number(currentDiscountRate) || 0) / 100)}
                            onChange={(val) => {
                              const base = currentPrice * currentQuantity
                              const newPct = base > 0 ? (val / base) * 100 : 0
                              onDiscountRateChange(product.id, String(parseFloat(newPct.toFixed(10))))
                            }}
                            onFocus={(e) => e.target.select()}
                            className="h-8 text-sm w-full"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Subtotal */}
                  {(() => {
                    const rate = discountRates[product.id] || 0
                    const originTotal = currentPrice * currentQuantity
                    const discountAmt = Math.round(originTotal * (Number(rate) || 0) / 100)
                    const taxAmount = calculateTaxForProduct(product.id)

                    return (
                      <>
                        {/* Giá gốc + dòng giảm giá (chỉ hiện khi có giảm giá) */}
                        {discountAmt > 0 && (
                          <>
                            <div className="flex items-center justify-between border-t pt-2">
                              <span className="text-xs text-muted-foreground">Giá gốc:</span>
                              <span className="text-xs line-through text-muted-foreground">
                                {moneyFormat(originTotal)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-destructive">Giảm giá:</span>
                              <span className="text-xs font-medium text-destructive">
                                -{moneyFormat(discountAmt)}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Thành tiền */}
                        <div className="flex items-center justify-between border-t pt-2">
                          <span className="text-xs text-muted-foreground">Thành tiền:</span>
                          <span className="text-xs font-bold text-emerald-800">
                            {moneyFormat(subtotal)}
                          </span>
                        </div>

                        {/* Tiền thuế */}
                        {taxAmount > 0 && (
                          <div className="flex items-center justify-between border-t border-dashed pt-2">
                            <span className="text-xs text-muted-foreground">Tiền thuế:</span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {moneyFormat(taxAmount)}
                            </span>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Cart Summary */}
      <div className="border-t bg-emerald-50/30 p-5 space-y-3">
        <div className="flex items-center justify-between group">
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Tạm tính:</span>
          <span className="text-sm font-bold text-emerald-900">
            {moneyFormat(
              selectedProducts.reduce((total, product) => {
                const currentPrice = getDisplayPrice(product)
                const currentQuantity = quantities[product.id] || 1
                return total + (currentPrice * currentQuantity)
              }, 0)
            )}
          </span>
        </div>

        {(() => {
           const totalDiscount = selectedProducts.reduce((sum, p) => {
             const price = getDisplayPrice(p)
             const quantity = quantities[p.id] || 1
             const rate = discountRates[p.id] || 0
             return sum + (price * quantity * rate / 100)
           }, 0)
           return totalDiscount > 0 && (
             <div className="flex items-center justify-between text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
               <span className="text-xs font-bold flex items-center gap-1.5">
                 <Tag className="h-3.5 w-3.5" />
                 Tổng giảm giá trên SP:
               </span>
               <span className="text-sm font-black">-{moneyFormat(totalDiscount)}</span>
             </div>
           )
        })()}

        <div className="flex items-center justify-between border-t border-emerald-100 pt-3">
          <span className="text-sm font-black text-emerald-950">Tổng:</span>
          <div className="flex flex-col items-end">
             <span className="text-xl font-black text-emerald-600 tracking-tight">
               {moneyFormat(
                 selectedProducts.reduce((total, product) => {
                   return total + calculateSubTotal(product.id)
                 }, 0)
               )}
             </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseOrderCart
