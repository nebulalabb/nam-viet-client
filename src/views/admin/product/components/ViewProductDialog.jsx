import { useCallback, useEffect, useMemo, useState } from 'react'
import api from '@/utils/axios'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import {
  Package,
  Tag,
  FileText,
  User,
  Building2,
  PlusIcon,
  Ruler,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  X,
} from 'lucide-react'

import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { getPublicUrl } from '@/utils/file'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

import ProductSaleHistoryTab from './ProductSaleHistoryTab'
import UpdateProductDialog from './UpdateProductDialog'
import { DeleteProductDialog } from './DeleteProductDialog'
import { Pencil, Trash2 } from 'lucide-react'
import Can from '@/utils/can'

const ViewProductDialog = ({ productId, showTrigger = true, contentClassName, overlayClassName, ...props }) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [product, setProduct] = useState(null)
  const [showUpdateProductDialog, setShowUpdateProductDialog] = useState(false)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    setLoading(true)
    try {
      const res = await api.get(`/product/${productId}`)
      setProduct(res.data.data)
    } catch (e) {
      console.error('Fetch product error:', e)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const supplierPriceHistory = useMemo(() => {
    if (!product?.prices?.length) return []

    const map = new Map()
    product.prices.forEach((p) => {
      if (!map.has(p.supplierId)) {
        map.set(p.supplierId, {
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          supplier: p.supplier,
          prices: [],
        })
      }
      map.get(p.supplierId).prices.push(p)
    })

    return Array.from(map.values()).map((s) => ({
      ...s,
      prices: s.prices.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    }))
  }, [product])

  const stockHistory = useMemo(() => {
    if (!product?.productStocks?.length) return []
    return [...product.productStocks].sort(
      (a, b) => new Date(b.snapshotDate) - new Date(a.snapshotDate),
    )
  }, [product])

  const latestStock = stockHistory[0] || null

  // =========================
  // NEW: base unit + conversions view model
  // =========================
  const baseUnitName = useMemo(() => {
    // ưu tiên baseUnit (nếu backend trả), fallback prices[0].unitName
    return (
      product?.baseUnit?.name ||
      product?.prices?.[0]?.unitName ||
      product?.prices?.[0]?.unit?.name ||
      '—'
    )
  }, [product])

  const conversionRows = useMemo(() => {
    const list = product?.unitConversions || []
    if (!list.length) return []

    // show newest first (optional)
    return [...list].sort((a, b) => {
      const ta = new Date(a?.createdAt || 0).getTime()
      const tb = new Date(b?.createdAt || 0).getTime()
      return tb - ta
    })
  }, [product])

  const convertedPrices = useMemo(() => {
    // Use unitPricing from backend if available (more accurate)
    if (product?.unitPricing?.length) {
      return product.unitPricing
      return product.unitPricing
        // .filter(up => up.source === 'CONVERTED') // Show ALL units including EXPLICIT
        .map(up => ({
          unitId: up.unitId,
          unitName: up.unitName,
          unitPrice: up.price,
          basePrice: up.basePrice,
          source: up.source,
          convertedFrom: up.convertedFrom,
        }))
        .sort((a, b) => {
          // Move EXPLICIT to top
          if (a.source === 'EXPLICIT' && b.source !== 'EXPLICIT') return -1;
          if (a.source !== 'EXPLICIT' && b.source === 'EXPLICIT') return 1;
          return 0;
        })
    }

    // Fallback: calculate from unitConversions if unitPricing not available
    const basePrice = Number(product?.price || 0)
    if (!Number.isFinite(basePrice) || basePrice <= 0) return []

    // Keep fallback using conversionRows if unitPricing is missing
    return conversionRows
      .map((c) => {
        const factor = Number(c?.conversionFactor || 0)
        if (!Number.isFinite(factor) || factor <= 0) return null

        const unitPrice = basePrice / factor

        return {
          id: c.id,
          unitName: c?.unit?.name || c?.unitName || '—',
          factor,
          unitPrice,
          source: 'CONVERTED',
        }
      })
      .filter(Boolean)
  }, [product, conversionRows])

  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" />
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn(
          "max-w-7xl",
          isMobile && "fixed inset-0 w-screen h-[100dvh] top-0 left-0 right-0 max-w-none m-0 p-0 rounded-none translate-x-0 translate-y-0 flex flex-col",
          contentClassName
        )}
        overlayClassName={overlayClassName}
      >
        <DialogHeader className={cn(isMobile && "px-4 pt-4")}>
          <DialogTitle>
            Chi tiết sản phẩm: {loading ? 'Đang tải...' : product?.name || '—'}
          </DialogTitle>
          <DialogDescription>
            Mã sản phẩm: <strong>{product?.code || '—'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "overflow-auto",
          isMobile ? "h-full px-4 pb-4 flex-1" : "max-h-[75vh]"
        )}>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : !product ? (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy sản phẩm
            </div>
          ) : (
            <Tabs defaultValue="info">
              <TabsList className="mb-4">
                <TabsTrigger value="info">Thông tin</TabsTrigger>
                <TabsTrigger value="sale-history">Lịch sử bán</TabsTrigger>
              </TabsList>

              {/* ================= TAB INFO ================= */}
              <TabsContent value="info">
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                      <Package className="h-5 w-5" />
                      Thông tin sản phẩm
                    </h2>

                    <div className="grid gap-4 text-sm md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tên</span>
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã</span>
                          <span className="font-mono">{product.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Loại</span>
                          <span>
                            {product.type === 'digital' ? 'Phần mềm' : 'Vật lý'}
                          </span>
                        </div>

                        {/* NEW: base unit */}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Đơn vị gốc
                          </span>
                          <span className="font-medium">{baseUnitName}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá gốc</span>
                          <span className="font-medium">
                            {moneyFormat(product.basePrice || 0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giá bán</span>
                          <span className="font-semibold text-primary">
                            {moneyFormat(product.price)} / {baseUnitName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Ngày tạo
                          </span>
                          <span>{dateFormat(product.createdAt)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Cập nhật
                          </span>
                          <span>{dateFormat(product.updatedAt)}</span>
                        </div>
                        {product.countSale !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Số lần bán</span>
                            <span className="font-medium">{product.countSale}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description & Note */}
                    {(product.description || product.note) && (
                      <div className="space-y-2">
                        {product.description && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Mô tả</h4>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                        )}
                        {product.note && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Ghi chú</h4>
                            <p className="text-sm text-muted-foreground">{product.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attributes */}
                    {product.attributes?.length > 0 && (
                      <div className="rounded-lg border p-3">
                        <h3 className="mb-2 font-semibold text-sm">Thuộc tính</h3>
                        <div className="grid gap-2">
                          {product.attributes.map((attr) => (
                            <div key={attr.id} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{attr.name}:</span>
                              <span className="font-medium">{attr.pivot?.value || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Product Flags */}
                    <div className="rounded-lg bg-muted/50 p-3">
                      <h3 className="mb-2 font-semibold text-sm">Cấu hình</h3>
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quản lý serial</span>
                          <span>{product.manageSerial ? '✓ Có' : '✗ Không'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Có hạn sử dụng</span>
                          <span>{product.hasExpiry ? '✓ Có' : '✗ Không'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Unit conversions display */}
                    <div className="rounded-lg border p-3">
                      <h3 className="mb-2 flex items-center gap-2 font-semibold">
                        <Ruler className="h-4 w-4" />
                        Đơn vị quy đổi
                      </h3>

                      {convertedPrices.length === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          Sản phẩm chưa có đơn vị quy đổi.
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-secondary text-xs">
                              <TableHead>Quy ước</TableHead>
                              <TableHead className="text-right">
                                Giá theo đơn vị
                              </TableHead>
                              <TableHead className="text-center">Nguồn</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {convertedPrices.map((c) => {
                              const unitName = c.unitName || '—'
                              // const factor = Number(c?.conversionFactor || 0)
                              // const unitPrice =
                              //   Number(product?.price || 0) /
                              //   (factor > 0 ? factor : 1)
                              const isBase = c.source === 'EXPLICIT'
                              const factor = c.convertedFrom ? Number(c.convertedFrom.conversionFactor) : 1

                              return (
                                <TableRow key={c.unitId + c.source}>
                                  <TableCell>
                                    {isBase ? (
                                      <span className="font-semibold text-primary">Đơn vị gốc</span>
                                    ) : (
                                      <>
                                        <span className="font-medium">
                                          1 {c.convertedFrom?.unitName || baseUnitName}
                                        </span>{' '}
                                        ={' '}
                                        <span className="font-medium">
                                          {factor || '—'}
                                        </span>{' '}
                                        <span className="font-medium">
                                          {unitName}
                                        </span>
                                      </>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <span className="font-semibold">
                                      {moneyFormat(c.unitPrice)} / {unitName}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[11px] border-transparent bg-transparent px-0 font-medium",
                                        isBase ? "text-primary" : "text-muted-foreground"
                                      )}
                                    >
                                      {isBase ? (
                                        <><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Thiết lập</>
                                      ) : (
                                        <><RefreshCw className="mr-1 h-3.5 w-3.5" /> Quy đổi</>
                                      )}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </div>

                    {/* Warranty Policy */}
                    {product.warrantyPolicy && (
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold">
                          <Tag className="h-4 w-4" />
                          Chính sách bảo hành
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Thời hạn</span>
                          <strong>{product.warrantyPolicy.periodMonths} tháng</strong>
                          <span>Chi phí</span>
                          <span>{moneyFormat(product.warrantyPolicy.warrantyCost || 0)}</span>
                          {product.warrantyPolicy.conditions && (
                            <>
                              <span className="col-span-2 mt-1 text-muted-foreground">
                                Điều kiện: {product.warrantyPolicy.conditions}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {product.coefficient && (
                      <div className="rounded-lg bg-secondary/50 p-3">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold">
                          <Tag className="h-4 w-4" />
                          Hệ số lương
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span>Hệ số</span>
                          <strong>{product.coefficient.coefficient}x</strong>
                          <span>Hiệu lực</span>
                          <span>
                            {dateFormat(product.coefficient.effectiveDate)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Price Sync Information */}
                    {product.syncMapping && (
                      <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                        <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                          <RefreshCw className="h-4 w-4" />
                          Đồng bộ giá tự động
                        </h3>

                        <div className="grid gap-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Trạng thái:</span>
                            {product.syncMapping.syncStatus === 'SUCCESS' ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Thành công
                              </Badge>
                            ) : product.syncMapping.syncStatus === 'PENDING' ? (
                              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                <RefreshCw className="h-3 w-3 mr-1 text-slate-400" />
                                Chưa đồng bộ
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <XCircle className="h-3 w-3 mr-1" />
                                Lỗi
                              </Badge>
                            )}
                          </div>

                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Mã tham chiếu:</span>
                            <span className="font-mono font-medium">{product.syncMapping.externalCode}</span>
                          </div>

                          {product.syncMapping.syncStatus !== 'PENDING' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Giá bán:</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {moneyFormat(product.syncMapping.lastSyncPrice)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Giá mua:</span>
                                <span className="font-semibold">
                                  {moneyFormat(product.syncMapping.lastBuyPrice)}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Đồng bộ lần cuối:</span>
                                <span>{dateFormat(product.syncMapping.lastSyncAt, true)}</span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-muted-foreground">NCC cập nhật:</span>
                                <span>{dateFormat(product.syncMapping.providerUpdatedAt, true)}</span>
                              </div>
                            </>
                          )}

                          {product.syncMapping.errorMessage && product.syncMapping.syncStatus !== 'PENDING' && (
                            <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs">
                              <strong>Lỗi:</strong> {product.syncMapping.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-semibold">
                        <FileText className="h-5 w-5" />
                        Lịch sử giá thủ công
                      </h3>

                      {supplierPriceHistory.map((s) => (
                        <div
                          key={s.supplierId}
                          className="mb-4 rounded border p-3"
                        >
                          <div className="mb-2 flex items-center gap-2 font-medium">
                            <Building2 className="h-4 w-4" />
                            {s.supplierName}
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead>Giá nhập</TableHead>
                                <TableHead>Giá bán</TableHead>
                                <TableHead>Đơn vị</TableHead>
                                <TableHead>Thuế</TableHead>
                                <TableHead>Ngày</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {s.prices.map((p) => (
                                <TableRow key={p.id}>
                                  <TableCell>
                                    {moneyFormat(p.basePrice || 0)}
                                  </TableCell>
                                  <TableCell>
                                    {moneyFormat(p.price || 0)}
                                  </TableCell>
                                  <TableCell>{p.unitName}</TableCell>
                                  <TableCell>
                                    {p.taxes && p.taxes.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {p.taxes.map(t => (
                                          <Badge key={t.title} variant="outline" className="text-[10px] whitespace-nowrap">
                                            {t.title}: {t.percentage}%
                                          </Badge>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">—</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {dateFormat(p.createdAt, true)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full space-y-6 rounded-lg border p-4 lg:w-80">
                    {/* Product Image */}
                    {product.image && (
                      <div className="rounded-lg border p-3">
                        <h3 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                          <ImageIcon className="h-4 w-4" />
                          Hình ảnh
                        </h3>
                        <img
                          src={getPublicUrl(product.image)}
                          alt={product.name}
                          className="w-full rounded-md object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    {latestStock && (
                      <div className="rounded bg-secondary/50 p-3 text-sm">
                        <div className="mb-2 font-semibold">Tồn kho</div>
                        <div className="flex justify-between">
                          <span>Số lượng</span>
                          <span>{latestStock.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá tồn</span>
                          <span className="font-semibold text-primary">
                            {moneyFormat(latestStock.price)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Creator & Updater Info */}
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex items-center gap-2 font-semibold">
                          <User className="h-4 w-4" />
                          Người tạo
                        </div>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={
                                product.createdByUser?.fullName
                                  ? `https://ui-avatars.com/api/?name=${product.createdByUser.fullName}`
                                  : undefined
                              }
                            />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-sm space-y-1">
                            <div className="font-medium">
                              {product.createdByUser?.fullName || '—'}
                            </div>
                            {product.createdByUser?.code && (
                              <div className="text-muted-foreground">
                                Mã: {product.createdByUser.code}
                              </div>
                            )}
                            {product.createdByUser?.email && (
                              <div className="text-muted-foreground">
                                📧 {product.createdByUser.email}
                              </div>
                            )}
                            {product.createdByUser?.phone && (
                              <div className="text-muted-foreground">
                                📞 {product.createdByUser.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {product.updatedByUser && (
                        <div>
                          <div className="mb-2 flex items-center gap-2 font-semibold">
                            <User className="h-4 w-4" />
                            Người cập nhật
                          </div>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={
                                  product.updatedByUser?.fullName
                                    ? `https://ui-avatars.com/api/?name=${product.updatedByUser.fullName}`
                                    : undefined
                                }
                              />
                              <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-sm space-y-1">
                              <div className="font-medium">
                                {product.updatedByUser?.fullName || '—'}
                              </div>
                              {product.updatedByUser?.code && (
                                <div className="text-muted-foreground">
                                  Mã: {product.updatedByUser.code}
                                </div>
                              )}
                              {product.updatedByUser?.email && (
                                <div className="text-muted-foreground">
                                  📧 {product.updatedByUser.email}
                                </div>
                              )}
                              {product.updatedByUser?.phone && (
                                <div className="text-muted-foreground">
                                  📞 {product.updatedByUser.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ================= TAB SALE HISTORY ================= */}
              <TabsContent value="sale-history">
                <ProductSaleHistoryTab productId={productId} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <DialogFooter className={cn(isMobile && "pb-4 px-4", "sm:space-x-0 mt-4")}>
          <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            {product && (
              <Can permission="UPDATE_PRODUCT">
                <Button
                  size="sm"
                  className="gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => setShowUpdateProductDialog(true)}
                >
                  <Pencil className="h-4 w-4" />
                  Sửa
                </Button>
              </Can>
            )}

            {product && (
              <Can permission="DELETE_PRODUCT">
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2 w-full sm:w-auto"
                  onClick={() => setShowDeleteProductDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </Button>
              </Can>
            )}

            <DialogClose asChild>
              <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>

        {product && (
          <UpdateProductDialog
            open={showUpdateProductDialog}
            onOpenChange={(open) => {
              setShowUpdateProductDialog(open)
              if (!open) {
                fetchProduct()
              }
            }}
            product={product}
            showTrigger={false}
            contentClassName="z-[100030]"
            overlayClassName="z-[100029]"
          />
        )}

        {product && (
          <DeleteProductDialog
            open={showDeleteProductDialog}
            onOpenChange={setShowDeleteProductDialog}
            product={product}
            showTrigger={false}
            contentClassName="z-[100060]"
            overlayClassName="z-[100059]"
            onSuccess={() => {
              // Close view dialog after successful delete if needed, 
              // or rely on parent to refresh list. 
              // Usually we might want to close the view dialog here.
              setShowDeleteProductDialog(false)
              // props.onOpenChange?.(false) // Optional: close view dialog
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ViewProductDialog
