import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { productStatuses, productTypes } from '../data'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/number-format'

export const columns = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'images',
        header: () => <div className="text-center">Hình ảnh</div>,
        cell: ({ row }) => {
            const images = row.getValue('images')
            const primaryImage = images?.find((img) => img.isPrimary) || images?.[0]
            return (
                <div className="flex justify-center">
                    {primaryImage ? (
                        <img
                            src={`http://localhost:8000${primaryImage.imageUrl}`}
                            alt={row.getValue('productName')}
                            className="h-10 w-10 rounded-md object-cover border"
                            onError={(e) => {
                                e.target.src = '/placeholder.png'
                                e.target.onerror = null
                            }}
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <span className="text-[10px] text-muted-foreground">No img</span>
                        </div>
                    )}
                </div>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'sku',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã SP" />
        ),
        cell: ({ row }) => (
            <div className="font-medium whitespace-nowrap">
                {row.getValue('sku')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'productName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên Sản Phẩm" />
        ),
        cell: ({ row }) => (
            <div
                className="font-medium whitespace-nowrap min-w-[150px] max-w-[220px] truncate"
                title={row.getValue('productName')}
            >
                {row.getValue('productName')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'categoryId',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Danh mục" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-nowrap">
                {row.original.category?.categoryName || '—'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    // ✅ Đơn Vị Tính thay thế Loại SP
    {
        id: 'unitName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đơn vị tính" />
        ),
        cell: ({ row }) => {
            const unit = row.original.unit
            return unit ? (
                <Badge variant="outline" className="whitespace-nowrap font-normal">
                    {unit.unitName}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-sm">—</span>
            )
        },
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'sellingPriceRetail',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Giá bán lẻ" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-nowrap text-right font-medium">
                {formatCurrency(row.getValue('sellingPriceRetail'))}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'stock',
        header: 'Tồn kho',
        cell: ({ row }) => {
            const inventory = row.original.inventory || []
            const totalStock = inventory.reduce(
                (sum, inv) => sum + Number(inv.quantity),
                0,
            )
            return (
                <div className="text-right">
                    <Badge variant={totalStock > 0 ? 'secondary' : 'destructive'}>
                        {totalStock}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Trạng thái" />
        ),
        cell: ({ row }) => {
            const statusValue = row.getValue('status')
            const status = productStatuses.find((s) => s.value === statusValue) || {
                label: statusValue,
                variant: 'outline',
            }
            const StatusIcon = status.icon
            return (
                <div className="flex w-[120px] items-center">
                    <Badge
                        variant="outline"
                        className={`flex items-center gap-1 ${status.badgeClass || ''}`}
                    >
                        {StatusIcon && <StatusIcon className="h-3 w-3" />}
                        {status.label}
                    </Badge>
                </div>
            )
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thao tác" />
        ),
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
