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
import { ShoppingCart as CartIcon, Minus, Plus, Package, X, Check as CheckIcon, ChevronsUpDown } from 'lucide-react'
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
      <div className="relative flex w-[600px] flex-col border-l bg-gradient-to-b from-background to-muted/20">
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
            Chưa có sản phẩm nào
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click vào sản phẩm để thêm vào đơn hàng
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
      <div className="space-y-2 border-b bg-background/80 p-4 backdrop-blur-sm">
        <h3 className="flex items-center gap-2 font-semibold">
          <CartIcon className="h-4 w-4" />
          <span className="hidden md:inline">Chi tiết đơn hàng</span>
          <span className="md:hidden">Chi tiết</span>
          <span className="text-xs text-muted-foreground">
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
                className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
              >
                {/* Main Product Row */}
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {product.image ? (
                      <img
                        src={imagePath}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Product Info & Controls */}
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Name and Remove Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="line-clamp-1 text-sm font-medium">
                          {product.name}
                        </h4>
                        {product.code && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {product.code}
                          </p>
                        )}
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

                {/* Inputs and Totals */}
                <div className="mt-3 space-y-3">
                  <div className="flex flex-col gap-2">
                    {/* Row 1: Unit & Price */}
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
                          className={cn("h-8 text-sm", currentPrice <= 0 && "border-destructive focus-visible:ring-destructive")}
                          onFocus={(e) => e.target.select()}
                        />
                        {currentPrice <= 0 && (
                          <span className="text-[10px] text-destructive mt-1 block">
                            Đơn giá phải lớn hơn 0
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Số lượng + Thuế + Giảm giá (%) */}
                    {(() => {
                      const productTaxes = product?.prices?.[0]?.taxes || []
                      const selectedProductTaxes = selectedTaxes[product.id] || []
                      const taxAmount = calculateTaxForProduct(product.id)
                      return (
                        <div className="flex gap-2">
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
                                className="h-8 w-full min-w-0 p-0 text-center text-sm"
                                onFocus={(e) => e.target.select()}
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
                              <PopoverContent className="w-[220px] p-0">
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

                          {/* Discount Rate */}
                          <div className="flex-1">
                            <label className="mb-1 block text-[10px] text-muted-foreground">
                              Giảm giá (%)
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="any"
                                value={discountRates[product.id] ?? 0}
                                onChange={(e) =>
                                  onDiscountRateChange(product.id, e.target.value)
                                }
                                placeholder="0"
                                className="h-8 pr-6 text-sm"
                                onFocus={(e) => e.target.select()}
                              />
                              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between border-t pt-2">
                    <span className="text-xs text-muted-foreground">
                      Thành tiền:
                    </span>
                    <span className="text-sm font-semibold text-primary">
                      {moneyFormat(subtotal)}
                    </span>
                  </div>

                  {/* Tax Amount Display */}
                  {calculateTaxForProduct(product.id) > 0 && (
                    <div className="flex items-center justify-between border-t border-dashed pt-2">
                      <span className="text-xs text-muted-foreground">
                        Tiền thuế:
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {moneyFormat(calculateTaxForProduct(product.id))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Cart Summary */}
      <div className="border-t bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Tạm tính:</span>
          <span className="text-lg font-bold text-primary">
            {moneyFormat(
              selectedProducts.reduce((total, product) => {
                return total + calculateSubTotal(product.id)
              }, 0),
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PurchaseOrderCart
