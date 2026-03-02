import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon, FileSpreadsheet } from 'lucide-react'
import { useState, useEffect } from 'react'
import CreateCustomerDialog from './CreateCustomerDialog'
import ImportCustomerDialog from './ImportCustomerDialog'
import { types, customerStatuses } from '../data'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { DeleteMultipleCustomersDialog } from './DeleteMultipleCustomersDialog'
import { deleteMultipleCustomers } from '@/stores/CustomerSlice'
import { useDispatch } from 'react-redux'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconFileTypeXls } from '@tabler/icons-react'
import ExportCustomerDialog from './ExportCustomerDialog'
import { useDebounce } from '@/hooks/useDebounce'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const dispatch = useDispatch()
  const selectedRows = table.getSelectedRowModel().rows

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleCustomers(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

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
          placeholder="Tìm kiếm tên, SĐT..."
          value={searchValue}
          onChange={(event) => setSearchValue(String(event.target.value))}
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          {table.getColumn('customerType') && (
            <DataTableFacetedFilter
              column={table.getColumn('customerType')}
              title="Loại khách hàng"
              options={types}
            />
          )}
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={customerStatuses}
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

      {
        selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa ({selectedRows.length})
          </Button>
        )
      }

      <Can permission={'CREATE_CUSTOMER'}>
        <Button
          onClick={() => setShowCreateCustomerDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        <Button
          onClick={() => setShowImportDialog(true)}
          className="mx-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          variant="outline"
          size="sm"
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {showImportDialog && (
          <ImportCustomerDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}

        {showCreateCustomerDialog && (
          <CreateCustomerDialog
            open={showCreateCustomerDialog}
            onOpenChange={setShowCreateCustomerDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <Can permission={'GET_CUSTOMER'}>
        <Button
          onClick={() => setShowExportDialog(true)}
          className="mx-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          variant="outline"
          size="sm"
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {showExportDialog && (
          <ExportCustomerDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DeleteMultipleCustomersDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
      />

      <DataTableViewOptions table={table} />
    </div >
  )
}

export { DataTableToolbar }
