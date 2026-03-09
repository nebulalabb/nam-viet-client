import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

const DataTableViewOptions = ({ table }) => {
  const options = {
    code: 'Mã HĐ',
    amount: 'Tổng tiền',
    taxAmount: 'Thuế',
    discount: 'Giảm giá',
    subTotal: 'Tổng cộng',
    createdAt: 'Ngày tạo',
    status: 'Trạng thái',
    customer: 'Khách hàng',
    user: 'Người tạo',
    debt: 'Công nợ',
    expectedDeliveryDate: 'Ngày giao hàng',
    sharingRatio: 'Chia DS',
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto h-8 lg:flex">
            <MixerHorizontalIcon className="mr-2 h-4 w-4" />
            Xem
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Chuyển đổi cột</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter(
              (column) =>
                typeof column.accessorFn !== 'undefined' && column.getCanHide(),
            )
            .map((column) => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {options[column.id] || column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableViewOptions }
