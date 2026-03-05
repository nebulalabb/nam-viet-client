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
import { FileText, Pencil, Trash2, Building2, PlusIcon, X, User, Calendar } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import api from '@/utils/axios'
import Can from '@/utils/can'
import UpdateSupplierDialog from './UpdateSupplierDialog'
import { DeleteSupplierDialog } from './DeleteSupplierDialog'

const ViewSupplierDialog = ({
  supplierId,
  showTrigger = true,
  open,
  onOpenChange,
  contentClassName = '',
  overlayClassName = '',
  ...props
}) => {
  const [loading, setLoading] = useState(false)
  const [supplier, setSupplier] = useState({})
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)

  const [showUpdateSupplierDialog, setShowUpdateSupplierDialog] = useState(false)
  const [showDeleteSupplierDialog, setShowDeleteSupplierDialog] = useState(false)

  useEffect(() => {
    if (!open || !supplierId) return
    setLoading(true)
    setError(null)
    api
      .get(`/supplier/${supplierId}/products`)
      .then((res) => {
        const payload = res?.data?.data ?? res?.data
        setSupplier(payload?.supplier || {})
        setProducts(Array.isArray(payload?.products) ? payload.products : [])
      })
      .catch((err) => {
        console.error('Fetch supplier detail error:', err)
        setError('Không tải được dữ liệu nhà cung cấp')
        setSupplier({})
        setProducts([])
      })
      .finally(() => setLoading(false))
  }, [open, supplierId])

  const groupedProducts = useMemo(() => {
    if (!products.length) return []
    const map = new Map()
    for (const p of products) {
      const key = p.productId
      if (!map.has(key)) {
        map.set(key, {
          productId: p.productId,
          productName: p.productName,
          unitName: p.unitName,
          history: [],
        })
      }
      map.get(key).history.push({
        id: p.id,
        price: p.price,
        createdAt: p.createdAt,
        taxes: p.taxes || [],
      })
    }
    return Array.from(map.values()).map((item) => ({
      ...item,
      history: item.history.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    }))
  }, [products])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent
        className={`md:h-auto md:max-w-6xl ${contentClassName}`}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>
            Chi tiết nhà cung cấp:{' '}
            {loading ? 'Đang tải...' : supplier?.supplierName || '—'}
          </DialogTitle>
          <DialogDescription>
            Mã số thuế: <strong>{supplier?.taxCode || '—'}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-auto">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[20px] w-full rounded-md" />
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : !supplier?.id ? (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy nhà cung cấp
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              {/* Cột trái: Thông tin nhà cung cấp */}
              <div className="flex-1 space-y-6 rounded-lg border p-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Building2 className="h-5 w-5" />
                  Thông tin nhà cung cấp
                </h2>

                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tên:</span>
                      <span className="font-medium">{supplier.supplierName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mã số thuế:</span>
                      <span>{supplier.taxCode || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Điện thoại:</span>
                      <span>{supplier.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{supplier.email || '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Địa chỉ:</span>
                      <span>{supplier.address || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <span className="capitalize">
                        {supplier.status === 'active'
                          ? 'Hoạt động'
                          : 'Ngừng'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày tạo:</span>
                      <span>{dateFormat(supplier.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cập nhật:</span>
                      <span>{dateFormat(supplier.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {supplier.notes && (
                  <div>
                    <strong className="text-muted-foreground">Ghi chú:</strong>
                    <p className="mt-1 text-sm">{supplier.notes}</p>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Lịch sử giá theo sản phẩm */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <FileText className="h-5 w-5" />
                    Sản phẩm cung cấp và lịch sử giá
                  </h3>

                  {groupedProducts.length > 0 ? (
                    <div className="space-y-6">
                      {groupedProducts.map((p) => (
                        <div
                          key={p.productId}
                          className="rounded-lg border p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-medium">{p.productName}</h4>
                            <span className="text-xs text-muted-foreground">
                              {p.history.length} lần báo giá
                            </span>
                          </div>

                          <Table>
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead>Giá nhập</TableHead>
                                <TableHead>Thuế</TableHead>
                                <TableHead>Đơn vị</TableHead>
                                <TableHead>Ngày áp dụng</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {p.history.map((h) => (
                                <TableRow key={h.id}>
                                  <TableCell className="font-medium">
                                    {moneyFormat(h.price)}
                                  </TableCell>
                                  <TableCell>
                                    {h.taxes?.length
                                      ? h.taxes
                                        .map(
                                          (t) =>
                                            `${t.title} (${t.percentage}%)`,
                                        )
                                        .join(', ')
                                      : '—'}
                                  </TableCell>
                                  <TableCell>{p.unitName}</TableCell>
                                  <TableCell>
                                    {dateFormat(h.createdAt, true)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Chưa có lịch sử báo giá
                    </p>
                  )}
                </div>
              </div>

              {/* Cột phải */}
              <div className="w-full space-y-6 rounded-lg border p-4 lg:w-80">
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <User className="h-5 w-5" />
                    Người tạo
                  </h3>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?background=random&name=${supplier?.creator?.fullName}`}
                      />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">
                        {supplier?.creator?.fullName}
                      </div>
                      <div className="text-muted-foreground">
                        {supplier?.creator?.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-semibold">
                    <Calendar className="h-5 w-5" />
                    Thời gian khởi tạo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dateFormat(supplier.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="hidden md:flex sm:space-x-0 mt-4">
          <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            <Can permission="UPDATE_SUPPLIER">
              <Button
                size="sm"
                onClick={() => setShowUpdateSupplierDialog(true)}
                className="gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
            </Can>

            <Can permission="DELETE_SUPPLIER">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteSupplierDialog(true)}
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

      {showUpdateSupplierDialog && (
        <UpdateSupplierDialog
          open={showUpdateSupplierDialog}
          onOpenChange={setShowUpdateSupplierDialog}
          supplier={supplier}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {showDeleteSupplierDialog && (
        <DeleteSupplierDialog
          open={showDeleteSupplierDialog}
          onOpenChange={(open) => {
            setShowDeleteSupplierDialog(open)
            if (!open && !supplier.id) { // If successfully deleted, close the view dialog as well
              onOpenChange?.(false)
            }
          }}
          supplier={supplier}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}
    </Dialog>
  )
}

export default ViewSupplierDialog
