import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'

export const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto py-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm mã phiếu giao..."
          value={table.getColumn('deliveryCode')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('deliveryCode')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Đặt lại
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      <DataTableViewOptions table={table} />
    </div>
  )
}
