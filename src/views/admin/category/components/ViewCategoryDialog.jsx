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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Layers, FileText, Calendar, Users, Eye, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import api from '@/utils/axios'
import { PRODUCT_SOURCE, PRODUCT_TYPE, statuses, types } from '../data'
import Can from '@/utils/can'
import UpdateCategoryDialog from './UpdateCategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'

const ViewCategoryDialog = ({
  categoryId,
  showTrigger = true,
  open,
  onOpenChange,
  ...props
}) => {
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState({})
  const [error, setError] = useState(null)

  const [showUpdateCategoryDialog, setShowUpdateCategoryDialog] = useState(false)
  const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)

  // Bộ lọc thời gian
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const TYPE_LABEL_MAP = Object.fromEntries(
    types.map((t) => [t.value, t.label]),
  )
  const STATUS_MAP = Object.fromEntries(statuses.map((s) => [s.value, s]))

  const st = STATUS_MAP[category?.status]
  const statusClass =
    st?.value === 'published' ? 'text-blue-600' : 'text-amber-600'

  const PRODUCT_SOURCE_LABEL = Object.fromEntries(
    PRODUCT_SOURCE.map((x) => [x.value, x.name]),
  )
  const PRODUCT_TYPE_LABEL = Object.fromEntries(
    PRODUCT_TYPE.map((x) => [x.value, x.name]),
  )

  useEffect(() => {
    if (!open || !categoryId) return
    setLoading(true)
    setError(null)
    api
      .get(`/categories/${categoryId}`)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data
        setCategory(payload || {})
      })
      .catch((err) => {
        console.error('Fetch category detail error:', err)
        setError('Không tải được dữ liệu danh mục')
        setCategory({})
      })
      .finally(() => setLoading(false))
  }, [open, categoryId])

  const products = useMemo(
    () => (Array.isArray(category?.products) ? category.products : []),
    [category?.products],
  )
  const invoiceItems = useMemo(
    () => (Array.isArray(category?.invoiceItems) ? category.invoiceItems : []),
    [category?.invoiceItems],
  )

  // Lọc theo thời gian + gom báo cáo KH & SP
  const { customerRows, productRows, summary } = useMemo(() => {
    if (!invoiceItems.length) {
      return {
        customerRows: [],
        productRows: [],
        summary: { so_khach_mua: 0, doanh_thu: 0, so_lan_mua: 0 },
      }
    }

    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null

    const filtered = invoiceItems.filter((it) => {
      const d = new Date(it?.invoice?.date)
      if (Number.isNaN(+d)) return false
      if (from && d < from) return false
      if (to && d > to) return false
      return true
    })

    // --- Gom theo khách hàng
    const byCustomer = new Map()
    for (const it of filtered) {
      const cust = it?.invoice?.customer
      if (!cust?.id) continue
      const invId = it?.invoice?.id
      const qty = Number(it?.quantity || 0)
      const unitPrice =
        it?.unitPrice != null
          ? Number(it.unitPrice)
          : it?.price != null
            ? Number(it.price)
            : it?.product?.price != null
              ? Number(it.product.price)
              : 0
      const revenue = qty * unitPrice

      if (!byCustomer.has(cust.id)) {
        byCustomer.set(cust.id, {
          customerId: cust.id,
          customerName: cust.name || '',
          invoiceSet: new Set(),
          doanh_thu: 0,
        })
      }
      const row = byCustomer.get(cust.id)
      if (invId) row.invoiceSet.add(invId)
      row.doanh_thu += revenue
    }

    const customerRows = Array.from(byCustomer.values()).map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      so_lan_mua: r.invoiceSet.size,
      // KHÔNG cộng tổng SL vì nhiều đơn vị
      tong_so_luong: undefined,
      doanh_thu: r.doanh_thu,
      don_gia_tb: undefined, // không có mẫu số chuẩn do đơn vị khác nhau
    }))

    customerRows.sort(
      (a, b) => b.doanh_thu - a.doanh_thu || b.so_lan_mua - a.so_lan_mua,
    )

    // --- Gom theo sản phẩm (theo từng đơn vị)
    const byProduct = new Map()
    for (const it of filtered) {
      const p = it?.product
      if (!p?.id) continue
      const invId = it?.invoice?.id
      const custId = it?.invoice?.customer?.id
      const qty = Number(it?.quantity || 0)
      const unitName = it?.unitName || '—'
      const unitPrice =
        it?.unitPrice != null
          ? Number(it.unitPrice)
          : it?.price != null
            ? Number(it.price)
            : p?.price != null
              ? Number(p.price)
              : 0
      const revenue = qty * unitPrice

      if (!byProduct.has(p.id)) {
        byProduct.set(p.id, {
          productId: p.id,
          name: p.name || '',
          code: p.code || null,
          listedPrice: p.price ?? null,
          unitStats: new Map(), // unitName -> qty
          invoiceSet: new Set(),
          customerSet: new Set(),
          doanh_thu: 0,
        })
      }
      const r = byProduct.get(p.id)
      r.invoiceSet.add(invId)
      if (custId) r.customerSet.add(custId)
      r.doanh_thu += revenue

      const prevQty = r.unitStats.get(unitName) || 0
      r.unitStats.set(unitName, prevQty + qty)
    }

    const productRows = Array.from(byProduct.values())
      .map((r) => ({
        productId: r.productId,
        name: r.name,
        code: r.code,
        listedPrice: r.listedPrice,
        so_khach: r.customerSet.size,
        so_lan_mua: r.invoiceSet.size,
        doanh_thu: r.doanh_thu,
        unitList: Array.from(r.unitStats.entries()), // [unitName, qty]
      }))
      .sort((a, b) => b.doanh_thu - a.doanh_thu || b.so_lan_mua - a.so_lan_mua)

    const summary = {
      so_khach_mua: byCustomer.size,
      so_lan_mua: filtered.reduce(
        (acc, it) => acc + (it?.invoice?.id ? 1 : 0),
        0,
      ),
      doanh_thu: filtered.reduce((acc, it) => {
        const qty = Number(it?.quantity || 0)
        const unitPrice =
          it?.unitPrice != null
            ? Number(it.unitPrice)
            : it?.price != null
              ? Number(it.price)
              : it?.product?.price != null
                ? Number(it.product.price)
                : 0
        return acc + qty * unitPrice
      }, 0),
    }

    return { customerRows, productRows, summary }
  }, [invoiceItems, dateFrom, dateTo])

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 size-4" aria-hidden="true" />
            Xem danh mục
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="md:h-auto md:max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            Chi tiết danh mục: {loading ? 'Đang tải...' : category?.categoryName || '—'}
          </DialogTitle>
          <DialogDescription>
            Mã danh mục: <strong>{category?.categoryCode || '—'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-[20px] w-full rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : !category?.id ? (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy danh mục
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Cột trái: Thông tin danh mục + sản phẩm */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Layers className="h-5 w-5" />
                  Thông tin danh mục
                </h2>

                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span className="font-medium">{category.categoryName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã:</span>
                      <span>{category.categoryCode || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span
                        className={`inline-flex items-center gap-1 ${statusClass}`}
                      >
                        {st?.icon ? <st.icon className="h-4 w-4" /> : null}
                        <span>{st?.label || '—'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại:</span>
                      <span>{TYPE_LABEL_MAP[category.type] || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span>{dateFormat(category.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cập nhật:</span>
                      <span>{dateFormat(category.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Sản phẩm thuộc danh mục */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5" />
                    Sản phẩm thuộc danh mục
                  </h3>

                  {products.length ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary text-xs">
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Mã</TableHead>
                          <TableHead>Loại</TableHead>
                          {/* <TableHead>Nguồn</TableHead> */}
                          <TableHead className="text-right">
                            Giá niêm yết
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-medium">
                              {p.productName}
                            </TableCell>
                            <TableCell>{p.sku || '—'}</TableCell>
                            <TableCell>
                              {PRODUCT_TYPE_LABEL[p.type] ?? '—'}
                            </TableCell>
                            {/* <TableCell>
                              {PRODUCT_SOURCE_LABEL[p.source] ?? '—'}
                            </TableCell> */}
                            <TableCell className="text-right">
                              {p.price != null ? moneyFormat(p.price) : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Danh mục chưa có sản phẩm
                    </p>
                  )}
                </div>
              </div>

              {/* Cột phải: Bộ lọc & báo cáo */}
              <div className="w-full space-y-6 rounded-lg border p-4 lg:w-[36rem]">
                <div className="flex items-center justify-between">
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Users className="h-5 w-5" />
                    Báo cáo bán hàng (lọc theo thời gian)
                  </h3>
                </div>

                {/* Bộ lọc thời gian */}
                <div className="flex flex-col gap-3 rounded-md bg-muted/40 p-3 md:flex-row md:items-end">
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border bg-background p-2 text-sm"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs text-muted-foreground">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border bg-background p-2 text-sm"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="pt-5 md:pt-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDateFrom('')
                        setDateTo('')
                      }}
                    >
                      Xóa lọc
                    </Button>
                  </div>
                </div>

                {/* Summary: bỏ "Tổng SL" */}
                <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground">Số khách mua</div>
                    <div className="text-lg font-semibold">
                      {summary.so_khach_mua}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground">Số lần mua</div>
                    <div className="text-lg font-semibold">
                      {summary.so_lan_mua}
                    </div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-muted-foreground">Doanh thu</div>
                    <div className="text-lg font-semibold">
                      {moneyFormat(summary.doanh_thu)}
                    </div>
                  </div>
                </div>

                {/* Tổng hợp theo sản phẩm */}
                <div className="space-y-2">
                  <h4 className="font-semibold">
                    Tổng hợp theo sản phẩm (trong khoảng lọc)
                  </h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead>Đơn vị / SL</TableHead>
                        <TableHead className="text-center">Số KH</TableHead>
                        <TableHead className="text-center">Số lần</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                        <TableHead className="text-right">
                          Giá niêm yết
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productRows.length ? (
                        productRows.map((r) => (
                          <TableRow key={r.productId}>
                            <TableCell className="max-w-[12rem]">
                              <div className="truncate font-medium">
                                {r.name || '—'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.code || '—'}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[14rem]">
                              <div className="flex flex-wrap gap-1">
                                {r.unitList.map(([unit, qty]) => (
                                  <span
                                    key={unit}
                                    className="mr-1 rounded bg-muted px-2 py-0.5 text-xs"
                                  >
                                    {unit}:{' '}
                                    <strong className="ml-1">{qty}</strong>
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {r.so_khach}
                            </TableCell>
                            <TableCell className="text-center">
                              {r.so_lan_mua}
                            </TableCell>
                            <TableCell className="text-right">
                              {moneyFormat(r.doanh_thu)}
                            </TableCell>
                            <TableCell className="text-right">
                              {r.listedPrice != null
                                ? moneyFormat(r.listedPrice)
                                : '—'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="py-8 text-center text-muted-foreground"
                          >
                            Không có dữ liệu theo khoảng thời gian đã chọn
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Bảng khách hàng */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Khách hàng đã mua</h4>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className="text-center">Số lần</TableHead>
                        <TableHead className="text-right">Doanh thu</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerRows.length ? (
                        customerRows.map((r) => (
                          <TableRow key={r.customerId}>
                            <TableCell className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={`https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(
                                    r.customerName || 'KH',
                                  )}`}
                                />
                                <AvatarFallback>KH</AvatarFallback>
                              </Avatar>
                              <div className="truncate">
                                {r.customerName || '—'}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {r.so_lan_mua}
                            </TableCell>
                            <TableCell className="text-right">
                              {moneyFormat(r.doanh_thu)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="py-8 text-center text-muted-foreground"
                          >
                            Không có dữ liệu theo khoảng thời gian đã chọn
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-2" />

                <div className="text-xs text-muted-foreground">
                  <Calendar className="mr-1 inline-block h-4 w-4" />
                  Dữ liệu tính dựa trên các đơn bán <strong>
                    Đã duyệt
                  </strong>{' '}
                  thuộc danh mục này.
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="hidden md:flex sm:space-x-0 mt-4">
          <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            <Can permission="UPDATE_CATEGORY">
              <Button
                size="sm"
                onClick={() => setShowUpdateCategoryDialog(true)}
                className="gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
            </Can>

            <Can permission="DELETE_CATEGORY">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteCategoryDialog(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </Can>

            <DialogClose asChild>
              <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>

      {showUpdateCategoryDialog && (
        <UpdateCategoryDialog
          open={showUpdateCategoryDialog}
          onOpenChange={setShowUpdateCategoryDialog}
          category={category}
          showTrigger={false}
          contentClassName="z-[100072]"
          overlayClassName="z-[100071]"
        />
      )}

      {showDeleteCategoryDialog && (
        <DeleteCategoryDialog
          open={showDeleteCategoryDialog}
          onOpenChange={(open) => {
            setShowDeleteCategoryDialog(open)
            if (!open && !category.id) { // close view when deleted
              onOpenChange?.(false)
            }
          }}
          category={category}
          showTrigger={false}
          contentClassName="z-[100072]"
          overlayClassName="z-[100071]"
        />
      )}
    </Dialog>
  )
}

export default ViewCategoryDialog
