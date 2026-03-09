import { Button } from '@/components/custom/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import ViewProductDialog from './ViewProductDialog'
import Can from '@/utils/can'
import { Copy, Package } from 'lucide-react'
import { DataTableRowActions } from './DataTableRowAction'
import { getPublicUrl } from '@/utils/file'

const MobileProductCard = ({ product, isSelected, onSelectChange, onCopy }) => {
  const [showViewDialog, setShowViewDialog] = useState(false)

  const imageUrl = product.image || product.document
  const publicImageUrl = getPublicUrl(imageUrl)

  // Get unit name from price or unit object
  const unitName =
    product?.prices?.[0]?.unitName ||
    product?.prices?.[0]?.unit?.name ||
    product?.unit?.name ||
    'Chưa có đơn vị'

  return (
    <>
      {showViewDialog && (
        <ViewProductDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          productId={product.id}
          showTrigger={false}
        />
      )}

      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-start gap-2">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onSelectChange}
                className="mt-1"
              />
              {/* Hình ảnh sản phẩm */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded border bg-muted">
                {publicImageUrl ? (
                  <img
                    src={publicImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle
                  className="line-clamp-2 cursor-pointer text-sm font-semibold hover:text-primary"
                  onClick={() => setShowViewDialog(true)}
                >
                  {product.name}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {product.code}
                </p>
              </div>
            </div>
            <DataTableRowActions row={{ original: product }} />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Danh mục và Đơn vị */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-[10px] text-muted-foreground">Danh mục</p>
              <p className="line-clamp-1 font-medium">
                {product.category?.name}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Đơn vị</p>
              <p className="font-medium">{unitName}</p>
            </div>
          </div>

          {/* Giá */}
          <div className="text-xs">
            <p className="text-[10px] text-muted-foreground">Giá</p>
            <p className="font-semibold text-primary">
              {moneyFormat(product.price)}
            </p>
          </div>

          {/* Lịch sử giá */}
          {product.prices?.length > 1 && (
            <div className="text-xs">
              <span className="font-medium text-orange-500">
                {product.prices.length} lịch sử giá
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 border-t pt-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 flex-1 text-xs"
              onClick={() => setShowViewDialog(true)}
            >
              Xem
            </Button>
            <Can permission="COPY_PRODUCT">
              <Button
                size="sm"
                variant="outline"
                className="h-8 flex-1 text-xs"
                onClick={() => onCopy(product.id)}
              >
                <Copy className="mr-1 h-3 w-3" />
                Sao
              </Button>
            </Can>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default MobileProductCard
