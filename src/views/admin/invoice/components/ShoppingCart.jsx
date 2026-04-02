import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import { X, ShoppingCart as CartIcon, Minus, Plus, Package, Check as CheckIcon, ChevronsUpDown, Tag, Loader2, Gift } from 'lucide-react'
import { moneyFormat } from '@/utils/money-format'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/utils/file'

const ShoppingCart = ({
  selectedProducts,
  quantities,
  selectedUnitIds,
  priceOverrides,
  priceErrors = {},
  discounts,
  selectedTaxes,
  notes,
  giveaway,
  onQuantityChange,
  onUnitChange,
  onPriceChange,
  onDiscountChange,
  onTaxChange,
  onNoteChange,
  onGiveawayChange,
  onRemoveProduct,
  getUnitOptions,
  getDisplayPrice,
  calculateSubTotal,
  calculateTaxForProduct,
  calculatePreDiscountTotal,
  calculateTotalDiscount,
  applyWarrantyItems,
  onApplyWarrantyChange,
  // Gift product props (Quà tặng)
  giftProducts = [],
  giftQuantities = {},
  onAddGiftProduct,
  onRemoveGiftProduct,
  onGiftQuantityChange,
  // Promotion props (disabled)
  promoCode = '',
  promoLoading = false,
  appliedPromotion = null,
  promoError = '',
  onPromoCodeChange,
  onApplyPromotion,
  onRemovePromotion,
  cartPromotions = [],
  cartPromosLoading = false,
  onSelectPromotion,
  activeTab = 'cart',
  onActiveTabChange,
}) => {
  if (selectedProducts.length === 0 && giftProducts.length === 0) {
    return (
      <div className="relative flex flex-1 flex-col border-l bg-gradient-to-b from-background to-muted/20">
        {/* Left divider */}
        <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />
        {/* Right divider */}
        <div className="absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-transparent via-border/40 to-transparent" />

        <div className="border-b bg-background/80 p-4 backdrop-blur-sm">
          <h3 className="flex items-center gap-2 font-semibold">
            <CartIcon className="h-4 w-4" />
            Giỏ hàng
            <span className="text-xs text-muted-foreground">(0)</span>
          </h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <CartIcon className="h-16 w-16 text-muted-foreground/30" />
          <p className="mt-4 text-sm text-muted-foreground">
            Chưa có sản phẩm nào
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click vào sản phẩm để thêm vào giỏ hàng
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

      {/* Header with tabs */}
      <div className="space-y-2 border-b bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onActiveTabChange?.('cart')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === 'cart' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <CartIcon className="h-4 w-4" />
            Giỏ hàng
            <span className="text-xs opacity-70">({selectedProducts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => onActiveTabChange?.('gift')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === 'gift' ? 'bg-amber-500 text-white' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )}
          >
            <Gift className="h-4 w-4" />
            Quà tặng
            {giftProducts.length > 0 && <span className="text-xs opacity-70">({giftProducts.length})</span>}
          </button>
        </div>
      </div>

      {/* Cart Tab Content */}
      {activeTab === 'cart' && (
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-3">
            {selectedProducts.map((product, index) => {
              const unitOptions = getUnitOptions(product)
              const currentUnitId =
                selectedUnitIds[product.id] || unitOptions[0]?.unitId
              const currentPrice = getDisplayPrice(product)
              const currentQuantity = quantities[product.id] || 1
              const currentDiscount = discounts[product.id] || 0
              const currentGiveaway = giveaway[product.id] || 0
              const subtotal = calculateSubTotal(product.id)
              const taxAmount = calculateTaxForProduct(product.id)
              const total = subtotal + taxAmount
              const productTaxes = product?.taxes || []
              const selectedProductTaxes = selectedTaxes[product.id] || []
              const imagePath = getPublicUrl(product.image)

              return (
                <div
                  key={product.id}
                  className="rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                >
                  {/* Main Product Row Header */}
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
                          <h4 className="line-clamp-1 text-sm font-medium">
                            {product.productName || product.name}
                          </h4>
                          {product.code && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {product.code}
                            </p>
                          )}
                          {/* Price Sync Timestamp */}
                          {product.syncMapping?.lastSyncAt && (
                            <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                              Cập nhật lần cuối: {new Date(product.syncMapping.lastSyncAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Tồn kho: {Number(product.totalStock) || 0}
                          </p>
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
                          className={cn("h-8 text-sm", priceErrors[product.id] && "border-destructive focus-visible:ring-destructive")}
                        />
                        {priceErrors[product.id] && (
                          <div className="text-[10px] text-destructive mt-1 font-medium">{priceErrors[product.id]}</div>
                        )}
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
                                        {tax.title} ({tax.percentage}%)
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
                            value={currentDiscount === '' ? 0 : currentDiscount}
                            onChange={(e) => {
                              const pct = e.target.value
                              onDiscountChange(product.id, pct)
                              const numPct = parseFloat(pct) || 0
                              onDiscountAmountChange?.(product.id, Math.round(currentPrice * currentQuantity * numPct / 100))
                            }}
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
                          value={Math.round(currentPrice * currentQuantity * (Number(currentDiscount) || 0) / 100)}
                          onChange={(val) => {
                            const base = currentPrice * currentQuantity
                            const newPct = base > 0 ? (val / base) * 100 : 0
                            onDiscountChange(product.id, String(parseFloat(newPct.toFixed(10))))
                            onDiscountAmountChange?.(product.id, val)
                          }}
                          onFocus={(e) => e.target.select()}
                          className="h-8 text-sm w-full"
                          placeholder="0"
                        />
                      </div>
                    </div>


                    {/* Warranty Checkbox */}
                    {product.warrantyPolicy && (
                      <div className="flex items-center gap-2 py-1">
                        <Checkbox
                          id={`warranty-${product.id}`}
                          checked={!!applyWarrantyItems?.[product.id]}
                          onCheckedChange={(checked) =>
                            onApplyWarrantyChange?.(product.id, checked)
                          }
                          className="h-4 w-4 border-primary"
                        />
                        <label
                          htmlFor={`warranty-${product.id}`}
                          className="cursor-pointer text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Kích hoạt bảo hành ({product.warrantyPolicy.periodMonths}{' '}
                          tháng)
                        </label>
                      </div>
                    )}

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
                    {taxAmount > 0 && (
                      <div className="flex items-center justify-between border-t border-dashed pt-2">
                        <span className="text-xs text-muted-foreground">
                          Tiền thuế:
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {moneyFormat(taxAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Gift Tab Content */}
      {activeTab === 'gift' && (
        <ScrollArea className="flex-1">
          <div className="space-y-3 p-3">
            {giftProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Gift className="h-12 w-12 text-amber-300/50 mb-3" />
                <p className="text-sm text-muted-foreground">Chưa có sản phẩm quà tặng</p>
                <p className="text-xs text-muted-foreground mt-1">Chọn sản phẩm từ danh sách để thêm vào quà tặng</p>
              </div>
            ) : (
              giftProducts.map((product) => (
                <div key={product.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">{product.productName || product.name}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveGiftProduct?.(product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Số lượng:</span>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="outline" size="icon" className="h-6 w-6"
                        onClick={() => onGiftQuantityChange?.(product.id, Math.max(1, (giftQuantities[product.id] || 1) - 1))}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input type="number" min="1" value={giftQuantities[product.id] || 1}
                        onChange={(e) => onGiftQuantityChange?.(product.id, Number(e.target.value))}
                        className="h-6 w-14 text-center text-xs p-0" />
                      <Button type="button" variant="outline" size="icon" className="h-6 w-6"
                        onClick={() => onGiftQuantityChange?.(product.id, (giftQuantities[product.id] || 1) + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">Miễn phí</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {/* Cart Summary — only show on cart tab */}
      {activeTab === 'cart' && (
        <div className="border-t bg-muted/30 p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tạm tính:</span>
            <span className="text-sm font-medium">
              {moneyFormat(calculatePreDiscountTotal ? calculatePreDiscountTotal() : 0)}
            </span>
          </div>
          {calculateTotalDiscount && calculateTotalDiscount() > 0 && (
            <div className="flex items-center justify-between text-destructive">
              <span className="text-sm">Giảm giá:</span>
              <span className="text-sm font-medium">-{moneyFormat(calculateTotalDiscount())}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t pt-1.5">
            <span className="text-sm font-semibold">Tổng:</span>
            <span className="text-lg font-bold text-primary">
              {moneyFormat(
                selectedProducts.reduce((total, product) => {
                  return total + calculateSubTotal(product.id)
                }, 0),
              )}
            </span>
          </div>
          {giftProducts.length > 0 && (
            <div className="flex items-center gap-1.5 border-t pt-1.5 mt-1">
              <Gift className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-amber-600 font-medium">
                {giftProducts.length} sản phẩm quà tặng kèm (miễn phí)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShoppingCart

// {
//   (cartPromotions.length > 0 || cartPromosLoading) && (
//     <div className="mb-3 space-y-1.5">
//       <div className="flex items-center gap-1.5">
//         <Tag className="h-3.5 w-3.5 text-primary" />
//         <p className="text-xs font-semibold text-foreground">Khuyến mãi áp dụng</p>
//         {cartPromosLoading && (
//           <Loader2 className="h-3 w-3 animate-spin text-muted-foreground ml-auto" />
//         )}
//       </div>

//       <div className="space-y-1">
//         {cartPromotions.map((promo, idx) => {
//           const isApplied = appliedPromotion?.id === promo.id
//           const isLoading = promoLoading && !isApplied
//           // Recommend the one with highest discountValue (or first if tie)
//           const maxVal = Math.max(...cartPromotions.map(p => Number(p.discountValue || 0)))
//           const isRecommended = idx === 0 || (Number(promo.discountValue || 0) === maxVal && idx === cartPromotions.findIndex(p => Number(p.discountValue || 0) === maxVal))
//           const promoTypeLabel = promo.promotionType === 'buy_x_get_y' ? 'Mua X Tặng Y' : 'Tặng quà'

//           return (
//             <button
//               key={promo.id}
//               type="button"
//               disabled={promoLoading}
//               onClick={() => onSelectPromotion?.(promo)}
//               className={cn(
//                 "w-full flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-all",
//                 isApplied
//                   ? "border-green-400 bg-green-50/80 dark:border-green-700 dark:bg-green-950/40"
//                   : "border-border/60 bg-background hover:border-primary/40 hover:bg-muted/50"
//               )}
//             >
//               {/* Checkbox indicator */}
//               <div className={cn(
//                 "mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
//                 isApplied
//                   ? "border-green-500 bg-green-500"
//                   : "border-muted-foreground/40"
//               )}>
//                 {isApplied && <CheckIcon className="h-2 w-2 text-white" strokeWidth={3} />}
//               </div>

//               <div className="flex-1 min-w-0">
//                 <div className="flex items-center gap-1.5 flex-wrap">
//                   <span className={cn(
//                     "text-xs font-semibold truncate",
//                     isApplied ? "text-green-700 dark:text-green-400" : "text-foreground"
//                   )}>
//                     {promo.promotionName}
//                   </span>
//                   {isRecommended && !isApplied && (
//                     <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 uppercase tracking-wide leading-none shrink-0">
//                       ⭐ Gợi ý
//                     </span>
//                   )}
//                   <span className="inline-flex rounded px-1 py-0.5 text-[9px] font-medium bg-muted text-muted-foreground uppercase tracking-wide leading-none shrink-0">
//                     {promoTypeLabel}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2 mt-0.5 flex-wrap">
//                   <span className="text-[10px] font-mono text-primary">{promo.promotionCode}</span>
//                   {promo.minOrderValue > 0 && (
//                     <span className="text-[10px] text-muted-foreground">
//                       Đơn tối thiểu {moneyFormat(Number(promo.minOrderValue))}
//                     </span>
//                   )}
//                   {promo.discountValue > 0 && (
//                     <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
//                       -{moneyFormat(Number(promo.discountValue))}
//                     </span>
//                   )}
//                 </div>
//                 {/* Gift products */}
//                 {promo.products?.some(pp => pp.giftProduct) && (
//                   <div className="flex items-start gap-1 mt-0.5">
//                     <Gift className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
//                     <span className="text-[10px] text-amber-600 dark:text-amber-400 whitespace-normal break-words leading-tight">
//                       {promo.products.filter(pp => pp.giftProduct).map(pp =>
//                         `${pp.giftProduct.productName} x${pp.giftQuantity}`
//                       ).join(', ')}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {isApplied && (
//                 <div
//                   role="button"
//                   onClick={(e) => { e.stopPropagation(); onRemovePromotion?.() }}
//                   className="shrink-0 rounded-full p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
//                 >
//                   <X className="h-3.5 w-3.5" />
//                 </div>
//               )}
//             </button>
//           )
//         })}
//       </div>

//       {/* Gift products banner (when applied) */}
//       {appliedPromotion?.giftProducts?.length > 0 && (
//         <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2 space-y-1">
//           <p className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
//             <Gift className="h-3 w-3" />
//             Quà tặng kèm
//           </p>
//           {appliedPromotion.giftProducts.map((g, i) => (
//             <p key={i} className="text-[10px] text-amber-600 dark:text-amber-500">
//               • {g.productName || g.name} × {g.quantity}
//             </p>
//           ))}
//         </div>
//       )}

//       {promoError && (
//         <p className="text-[10px] font-medium text-destructive">{promoError}</p>
//       )}
//     </div>
//   )
// }

// {/* ── MANUAL CODE ENTRY (fallback / no auto-detect) ──────── */ }
// {
//   cartPromotions.length === 0 && !cartPromosLoading && !appliedPromotion && (
//     <div className="mb-3 space-y-1">
//       <div className="flex gap-1.5">
//         <div className="relative flex-1">
//           <Tag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
//           <Input
//             type="text"
//             placeholder="Nhập mã khuyến mãi..."
//             value={promoCode}
//             onChange={(e) => onPromoCodeChange?.(e.target.value.toUpperCase())}
//             onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onApplyPromotion?.() } }}
//             className="h-8 pl-8 text-xs uppercase tracking-wider"
//           />
//         </div>
//         <Button
//           type="button"
//           size="sm"
//           variant="outline"
//           className="h-8 shrink-0 text-xs px-3"
//           disabled={!promoCode?.trim() || promoLoading}
//           onClick={onApplyPromotion}
//         >
//           {promoLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Áp dụng'}
//         </Button>
//       </div>
//       {promoError && (
//         <p className="text-[10px] font-medium text-destructive">{promoError}</p>
//       )}
//     </div>
//   )
// }

// {/* Applied promotion (manual code - no auto list) */ }
// {
//   appliedPromotion && cartPromotions.length === 0 && (
//     <div className="flex items-center justify-between mb-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 px-3 py-2">
//       <div className="flex items-center gap-2 min-w-0">
//         <Tag className="h-3.5 w-3.5 shrink-0 text-green-600 dark:text-green-400" />
//         <div className="min-w-0">
//           <p className="text-xs font-semibold text-green-700 dark:text-green-400 truncate">{appliedPromotion.code}</p>
//           <p className="text-[10px] text-green-600 dark:text-green-500 truncate">{appliedPromotion.name}</p>
//         </div>
//       </div>
//       <button type="button" onClick={onRemovePromotion} className="ml-2 shrink-0 rounded-full p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900">
//         <X className="h-3.5 w-3.5" />
//       </button>
//     </div>
//   )
// }
// {/* ─────────────────────────────────────────────────────────── */ }

// <div className="flex items-center justify-between">
//   <span className="text-sm text-muted-foreground">Tạm tính:</span>
//   <span className="text-sm font-medium">
//     {moneyFormat(calculatePreDiscountTotal ? calculatePreDiscountTotal() : 0)}
//   </span>
// </div>
// {
//   calculateTotalDiscount && calculateTotalDiscount() > 0 && (
//     <div className="flex items-center justify-between text-destructive">
//       <span className="text-sm">Giảm giá:</span>
//       <span className="text-sm font-medium">-{moneyFormat(calculateTotalDiscount())}</span>
//     </div>
//   )
// }
// {
//   appliedPromotion?.discountAmount > 0 && (
//     <div className="flex items-center justify-between text-green-600 dark:text-green-400">
//       <span className="text-sm flex items-center gap-1">
//         <Tag className="h-3 w-3" />
//         KM ({appliedPromotion.code}):
//       </span>
//       <span className="text-sm font-medium">-{moneyFormat(appliedPromotion.discountAmount)}</span>
//     </div>
//   )
// }
// <div className="flex items-center justify-between border-t pt-1.5">
//   <span className="text-sm font-semibold">Tổng:</span>
//   <span className="text-lg font-bold text-primary">
//     {moneyFormat(
//       selectedProducts.reduce((total, product) => {
//         return total + calculateSubTotal(product.id)
//       }, 0) - (appliedPromotion?.discountAmount || 0),
//     )}
//   </span>
// </div>
//       </div >
//     </div >
//   )
// }

// export default ShoppingCart
