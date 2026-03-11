import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { moneyFormat } from '@/utils/money-format'
import { useState } from 'react'
import PriceLogDialog from './PriceLogDialog'
import { PRODUCT_TYPE } from '../data'
import { normalizeText } from '@/utils/normalize-text'
import ViewProductDialog from './ViewProductDialog'
import Can from '@/utils/can'
import { IconInfoCircle } from '@tabler/icons-react'
import { Checkbox } from '@/components/ui/checkbox'
import { getPublicUrl } from '@/utils/file'
import { Package } from 'lucide-react'

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
        className="mx-2 translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mx-2 translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã" />
    ),
    cell: function Cell({ row }) {
      const [showViewProductDialog, setShowViewProductDialog] = useState(false)

      return (
        <>
          <Can permission={'GET_PRODUCT'}>
            {showViewProductDialog && (
              <ViewProductDialog
                open={showViewProductDialog}
                onOpenChange={setShowViewProductDialog}
                productId={row.original.id}
                showTrigger={false}
              />
            )}
          </Can>

          <div
            className="w-32 cursor-pointer"
            onClick={() => setShowViewProductDialog(true)}
          >
            <div className="font-medium text-blue-600 hover:underline">
              {row.getValue('code')}
            </div>
            {row.original.priceHistories?.length > 0 ? (
              <div className="text-xs text-orange-500 mt-1 font-normal">
                {row.original.priceHistories.length} lần đổi giá
              </div>
            ) : null}
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên sản phẩm" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.original.image || row.original.document
      const publicImageUrl = getPublicUrl(imageUrl)

      return (
        <div className="flex flex-col gap-2">
          <div className="w-28 font-medium">{row.getValue('productName')}</div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded border bg-muted">
            {publicImageUrl ? (
              <img
                src={publicImageUrl}
                alt={row.original.productName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      const name = normalizeText(row.original.productName)
      const searchValue = normalizeText(value)

      return name.includes(searchValue)
    },
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => {
      return <div className="w-28">{row.original?.category?.categoryName}</div>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original?.categoryId)
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'totalStock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tồn kho" />
    ),
    cell: ({ row }) => {
      const stock = Number(row.original?.totalStock)
      return (
        <div className="w-16 text-center">
          {isNaN(stock) ? 0 : stock}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const typeKey = row.getValue('type')
      const type = PRODUCT_TYPE.find((item) => item.value === typeKey)
      return (
        <div className="w-20 hidden sm:block">{type ? type.name : 'Không xác định'}</div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá" />
    ),
    cell: function Cell({ row }) {
      const [showPriceLogDialog, setShowPriceLogDialog] = useState(false)

      return (
        <div>
          <div
            className="flex cursor-pointer space-x-2"
            onClick={() => setShowPriceLogDialog(true)}
          >
            <span className="max-w-32 truncate hover:text-primary hover:underline sm:max-w-72 md:max-w-[31rem]">
              {moneyFormat(row.getValue('price'))}
              <IconInfoCircle className="ml-1 inline-block size-4" />
            </span>
          </div>

          {showPriceLogDialog && (
            <PriceLogDialog
              open={showPriceLogDialog}
              onOpenChange={setShowPriceLogDialog}
              product={row.original}
              showTrigger={false}
            />
          )}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Cập nhật" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-32 truncate sm:max-w-72 md:max-w-[31rem]">
            {dateFormat(row.getValue('updatedAt'))}
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thao tác" />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
