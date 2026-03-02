import { Cross2Icon, PlusIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { statuses } from '../data'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import CreateUserDialog from './CreateUserDialog'
import Can from '@/utils/can'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)

  const [searchValue, setSearchValue] = useState(table.getState().globalFilter || '')
  const debouncedSearchValue = useDebounce(searchValue, 500)

  useEffect(() => {
    if (table.getState().globalFilter !== debouncedSearchValue) {
      table.setGlobalFilter(debouncedSearchValue)
    }
  }, [debouncedSearchValue, table])

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={searchValue}
          onChange={(event) => setSearchValue(String(event.target.value))}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={statuses}
            />
          )}
        </div>
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

      <Can permission={['CREATE_USER', 'GET_ROLE']}>
        <Button
          onClick={() => setShowCreateUserDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateUserDialog && (
          <CreateUserDialog
            open={showCreateUserDialog}
            onOpenChange={setShowCreateUserDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />
    </div>
  )
}

export { DataTableToolbar }
