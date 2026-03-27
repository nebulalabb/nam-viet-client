import { useEffect, useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import Can from '@/utils/can'
import UpdateWarehouseDialog from './UpdateWarehouseDialog'
import DeleteWarehouseDialog from './DeleteWarehouseDialog'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { useDispatch, useSelector } from 'react-redux'
import { getWarehouseStatistics } from '@/stores/WarehouseSlice'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import api from '@/utils/axios'
import { getPublicUrl } from '@/utils/file'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const WarehouseDetailDialog = ({ warehouse, open, onOpenChange }) => {
    const dispatch = useDispatch()
    const [showDeleteWarehouseDialog, setShowDeleteWarehouseDialog] = useState(false)
    const [showUpdateWarehouseDialog, setShowUpdateWarehouseDialog] = useState(false)
    const statistics = useSelector((state) => state.warehouse.currentWarehouseStatistics)
    const [inventory, setInventory] = useState([])
    const [loadingInventory, setLoadingInventory] = useState(false)

    useEffect(() => {
        if (open && warehouse?.id) {
            dispatch(getWarehouseStatistics(warehouse.id))
            setLoadingInventory(true)
            api.get('/inventory/warehouse/' + warehouse.id)
                .then(res => setInventory(res.data?.data || []))
                .catch(err => console.error(err))
                .finally(() => setLoadingInventory(false))
        } else {
            setInventory([])
        }
    }, [dispatch, open, warehouse?.id])

    if (!warehouse) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="md:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl border-b pb-2">
                        Chi tiết kho: {warehouse.warehouseName}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Mã kho</p>
                            <p className="font-semibold">{warehouse.warehouseCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Loại kho</p>
                            <p>{warehouse.warehouseType === 'main' ? 'Kho chính' : 'Kho phụ'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Trạng thái</p>
                            {warehouse.status === 'active' ? (
                                <Badge className="bg-green-500 mt-1">Hoạt động</Badge>
                            ) : (
                                <Badge variant="secondary" className="mt-1">Khóa</Badge>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Khu vực / Tỉnh thành</p>
                            <p>{warehouse.region || '—'} / {warehouse.city || '—'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Địa chỉ chi tiết</p>
                            <p>{warehouse.address || 'Chưa cập nhật'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Sức chứa tối đa</p>
                            <p>{warehouse.capacity ? warehouse.capacity.toLocaleString() : 'Không giới hạn'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Quản lý kho</p>
                            <p>{warehouse.manager?.fullName || 'Chưa chỉ định'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Mô tả</p>
                            <p className="text-sm">{warehouse.description || 'Không có mô tả'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Ngày tạo</p>
                            <p>{format(new Date(warehouse.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                        </div>
                    </div>
                </div>

                {statistics && (
                    <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-3">Thống kê</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xl font-bold text-blue-600">{statistics.inventory?.totalQuantity || 0}</p>
                                <p className="text-xs text-blue-800">Sản phẩm tồn kho</p>
                            </div>
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                <p className="text-xl font-bold text-green-600">
                                    {statistics.capacity?.currentUtilizationPercent || 0}%
                                </p>
                                <p className="text-xs text-green-800">Hiệu suất sức chứa</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <p className="text-xl font-bold text-purple-600">{statistics.transactions?.thisMonth || 0}</p>
                                <p className="text-xs text-purple-800">Giao dịch tháng này</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 border-t pt-4">
                    <h4 className="font-semibold mb-3">Danh sách sản phẩm trong kho</h4>
                    <div className="border rounded-md">
                        <ScrollArea className="h-[250px] w-full">
                            <Table>
                                <TableHeader className="sticky top-0 bg-secondary z-10">
                                    <TableRow>
                                        <TableHead className="w-[60px] text-center">Ảnh</TableHead>
                                        <TableHead>Mã SP</TableHead>
                                        <TableHead>Tên sản phẩm</TableHead>
                                        <TableHead className="text-right">Tồn tối thiểu</TableHead>
                                        <TableHead className="text-right">Khả dụng</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingInventory ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Đang tải danh sách...</TableCell>
                                        </TableRow>
                                    ) : inventory.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">Không có sản phẩm nào trong kho</TableCell>
                                        </TableRow>
                                    ) : (
                                        inventory.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="p-2">
                                                    <div className="flex justify-center">
                                                    {item.product?.image ? (
                                                        <img src={getPublicUrl(item.product.image)} alt={item.product?.code} className="w-8 h-8 rounded border object-cover" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded border bg-muted flex flex-col items-center justify-center text-[10px] text-muted-foreground">No img</div>
                                                    )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium whitespace-nowrap">{item.product?.code}</TableCell>
                                                <TableCell className="max-w-[150px] lg:max-w-[200px] truncate" title={item.product?.productName}>{item.product?.productName}</TableCell>
                                                <TableCell className="text-right text-muted-foreground">{item.product?.minStockLevel || 0}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">{(item.availableQuantity || 0).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row sm:space-x-0 mt-4 gap-2">
                    <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
                        <Can permission="WAREHOUSE_MANAGEMENT">
                            <Button
                                size="sm"
                                onClick={() => setShowUpdateWarehouseDialog(true)}
                                className="gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <Pencil className="h-4 w-4" />
                                Sửa
                            </Button>
                        </Can>

                        <Can permission="WAREHOUSE_MANAGEMENT">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setShowDeleteWarehouseDialog(true)}
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

            {showDeleteWarehouseDialog && (
                <DeleteWarehouseDialog
                    open={showDeleteWarehouseDialog}
                    onOpenChange={setShowDeleteWarehouseDialog}
                    warehouse={warehouse}
                    showTrigger={false}
                    onSuccess={() => onOpenChange?.(false)}
                />
            )}

            {showUpdateWarehouseDialog && (
                <UpdateWarehouseDialog
                    open={showUpdateWarehouseDialog}
                    onOpenChange={setShowUpdateWarehouseDialog}
                    warehouse={warehouse}
                    showTrigger={false}
                    onSuccess={() => onOpenChange?.(false)}
                />
            )}
        </Dialog>
    )
}

export default WarehouseDetailDialog
