import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const columnLabels = {
  images: 'Hình ảnh',
  sku: 'Mã SP',
  productName: 'Tên sản phẩm',
  categoryId: 'Danh mục',
  unitName: 'Đơn vị tính',
  sellingPriceRetail: 'Giá bán lẻ',
  stock: 'Tồn kho',
  status: 'Trạng thái',
}

const DataTableViewOptions = ({ table }) => {
  const columns = table
    .getAllColumns()
    .filter((column) => column.getCanHide())

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
            >
              {columnLabels[column.id] || column.id}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableViewOptions }
