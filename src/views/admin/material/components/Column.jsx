import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { DataTableRowActions } from './DataTableRowAction'
import { priorityLabels } from './data'
import { getMaterialById } from '@/stores/MaterialSlice'
import MaterialDetailDialog from './MaterialDetailDialog'

const MaterialCodeCell = ({ row }) => {
    const [showDetail, setShowDetail] = useState(false)
    const dispatch = useDispatch()

    const handleClick = () => {
        dispatch(getMaterialById(row.original.id))
        setShowDetail(true)
    }

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="font-mono text-sm font-semibold text-green-700 hover:text-green-900 hover:underline cursor-pointer transition-colors"
            >
                {row.getValue('materialCode')}
            </button>
            {showDetail && (
                <MaterialDetailDialog
                    open={showDetail}
                    onOpenChange={setShowDetail}
                />
            )}
        </>
    )
}

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
                aria-label="Chọn tất cả"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Chọn dòng"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'materialCode',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mã NL" />
        ),
        cell: ({ row }) => <MaterialCodeCell row={row} />,
        enableSorting: true,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Tên nguyên liệu" />
        ),
        cell: ({ row }) => (
            <div className="font-medium whitespace-normal break-words max-w-[200px]">
                {row.getValue('name')}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'imageUrl',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Hình ảnh" />
        ),
        cell: ({ row }) => {
            const imageUrl = row.original?.imageUrl
            return imageUrl ? (
                <img
                    src={imageUrl}
                    alt={row.original?.name}
                    className="h-10 w-10 rounded-md object-cover border"
                />
            ) : (
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                    N/A
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'cost',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Giá thành" />
        ),
        cell: ({ row }) => {
            const cost = Number(row.getValue('cost')) || 0
            const formatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(cost)
            return (
                <div className="font-medium text-green-700">
                    {formatted}
                </div>
            )
        },
        enableSorting: true,
    },
    {
        id: 'category',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Danh mục" />
        ),
        cell: ({ row }) => {
            const category = row.original?.category
            return (
                <div className="font-medium">
                    {category ? category.categoryName : (
                        <span className="text-gray-400 italic">—</span>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'unit',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Đơn vị" />
        ),
        cell: ({ row }) => (
            <div>{row.getValue('unit') || <span className="text-gray-400 italic">—</span>}</div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: 'materialType',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Loại NL" />
        ),
        cell: ({ row }) => (
            <div>{row.getValue('materialType') || <span className="text-gray-400 italic">—</span>}</div>
        ),
        enableSorting: false,
    },
    {
        id: 'supplier',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nhà cung cấp" />
        ),
        cell: ({ row }) => {
            const supplier = row.original?.supplier
            return (
                <div className="font-medium">
                    {supplier ? supplier.supplierName : (
                        <span className="text-gray-400 italic">—</span>
                    )}
                </div>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'priority',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ưu tiên" />
        ),
        cell: ({ row }) => {
            const priorityValue = row.getValue('priority')
            const priority = priorityLabels.find((p) => p.value === priorityValue) || {
                label: `${priorityValue}`,
                color: 'bg-gray-100 text-gray-800',
            }
            return (
                <Badge className={`${priority.color} border-0`}>
                    {priority.label}
                </Badge>
            )
        },
        enableSorting: true,
    },
    {
        accessorKey: 'purchaseDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày mua" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('purchaseDate')
            return date ? (
                <div className="text-sm">{new Date(date).toLocaleDateString('vi-VN')}</div>
            ) : (
                <span className="text-gray-400 italic">—</span>
            )
        },
        enableSorting: false,
    },
    {
        accessorKey: 'effectiveDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ngày áp dụng" />
        ),
        cell: ({ row }) => {
            const date = row.getValue('effectiveDate')
            return date ? (
                <div className="text-sm">{new Date(date).toLocaleDateString('vi-VN')}</div>
            ) : (
                <span className="text-gray-400 italic">—</span>
            )
        },
        enableSorting: false,
    },
    {
        id: 'actions',
        header: () => <div className="text-center">Thao tác</div>,
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
