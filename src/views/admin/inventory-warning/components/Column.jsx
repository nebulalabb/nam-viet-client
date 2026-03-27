import { DataTableColumnHeader } from '../../product/components/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { getPublicUrl } from '@/utils/file'

export const columns = [
    {
        accessorKey: 'images',
        header: () => <div className="text-center">Hình ảnh</div>,
        cell: ({ row }) => {
            const images = row.getValue('images')
            const primaryImage = images?.find((img) => img.isPrimary) || images?.[0]
            const publicImageUrl = primaryImage ? getPublicUrl(primaryImage.imageUrl) : null
            return (
                <div className="flex justify-center">
                    {publicImageUrl ? (
                        <img
                            src={publicImageUrl}
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
        enableHiding: false,
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
                className="font-medium min-w-[150px] max-w-[250px] truncate"
                title={row.getValue('productName')}
            >
                {row.getValue('productName')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        id: 'category',
        accessorFn: (row) => row.category?.categoryName || '—',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Danh mục" />
        ),
        cell: ({ row }) => (
            <div className="whitespace-nowrap">
                {row.getValue('category')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'minStockLevel',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tồn Tối Thiểu" />
        ),
        cell: ({ row }) => (
            <div className="text-right font-medium text-muted-foreground">
                {row.getValue('minStockLevel')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'availableStock',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đang Có" />
        ),
        cell: ({ row }) => (
            <div className="text-right font-bold text-orange-600 dark:text-orange-400">
                {row.getValue('availableStock')}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'shortfall',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Thiếu Hụt" />
        ),
        cell: ({ row }) => (
            <div className="text-right">
                <Badge variant="destructive" className="font-bold text-sm">
                    {row.getValue('shortfall')}
                </Badge>
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
]
