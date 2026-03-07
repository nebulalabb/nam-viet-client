import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Package } from 'lucide-react'
import { moneyFormat } from '@/utils/money-format'
import { cn } from '@/lib/utils'
import { getPublicUrl } from '@/utils/file'

const ProductGrid = ({
  products,
  onAddProduct,
  selectedProductIds = [],
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="mt-2 text-sm text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Product List */}
      <ScrollArea className="flex-1">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Package className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              Không tìm thấy sản phẩm
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-4">
            {products.map((product) => {
              const isSelected = selectedProductIds.includes(product.id)
              const imagePath = getPublicUrl(product.image);
              const stock = Number(product.currentStock) || 0
              const isOutOfStock = stock <= 0

              return (
                <Card
                  key={product.id}
                  className={cn(
                    "group cursor-pointer transition-all hover:shadow-sm",
                    isSelected && "ring-2 ring-primary bg-primary/5",
                    // isOutOfStock && "opacity-60" // Allow selection even if out of stock
                  )}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    // Allow selection even if out of stock
                    onAddProduct(product)
                  }}
                >
                  <CardContent className="p-2.5">
                    <div className="grid grid-cols-[64px_1fr] gap-x-3 gap-y-2 md:flex md:items-start md:gap-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 rounded-md bg-muted overflow-hidden relative shrink-0">
                        {product.image ? (
                          <img
                            src={imagePath}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-7 w-7 text-muted-foreground/30" />
                          </div>
                        )}

                        {/* Stock Badge */}
                        {isOutOfStock && (
                          <Badge variant="destructive" className="absolute top-0.5 right-0.5 text-[9px] px-1 py-0 h-4">
                            Hết
                          </Badge>
                        )}
                      </div>

                      {/* Info Section (Name, Code + Desktop Price/Stock) */}
                      <div className="flex flex-col min-w-0 md:flex-1">
                        <h4 className="font-medium text-sm">
                          {product.name}
                        </h4>

                        {product.code && (
                          <p className="text-[11px] text-muted-foreground">
                            {product.code}
                          </p>
                        )}

                        {/* Desktop Price/Stock Display */}
                        <div className="hidden md:block">
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-semibold text-primary">
                              {moneyFormat(product.price)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Tồn: {stock}
                            </span>
                          </div>
                          {product.syncMapping?.lastSyncAt && (
                            <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                              Cập nhật lần cuối: {new Date(product.syncMapping.lastSyncAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Mobile Bottom Section (Price/Stock + Button) */}
                      <div className="col-span-2 w-full md:w-auto flex items-center justify-between md:justify-start gap-3 pt-1 md:pt-0">
                        {/* Mobile Price/Stock Display */}
                        <div className="md:hidden flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-sm font-semibold text-primary">
                              {moneyFormat(product.price)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Tồn: {stock}
                            </span>
                          </div>
                          {product.syncMapping?.lastSyncAt && (
                            <p className="text-[10px] text-muted-foreground/80 truncate mt-0.5">
                              Cập nhật lần cuối lúc: {new Date(product.syncMapping.lastSyncAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>

                        {/* Add Button */}
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "shrink-0 h-7 text-xs md:w-auto",
                            !isSelected && "border-green-600 text-green-600 hover:text-green-700 hover:border-green-700 hover:bg-green-50 md:border-input md:text-accent-foreground md:hover:bg-accent md:hover:text-accent-foreground md:hover:border-input"
                          )}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {isSelected ? 'Đã chọn' : 'Thêm'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export default ProductGrid
