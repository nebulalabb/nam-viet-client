import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import CreateCategoryDialog from './CreateCategoryDialog'
import { useState } from 'react'
import { DeleteMultipleCategoriesDialog } from './DeleteMultipleCategoriesDialog'
import { deleteMultipleCategories, getCategories } from '@/stores/CategorySlice'
import { useDispatch } from 'react-redux'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import ExportCategoryDialog from './ExportCategoryDialog'
import ImportCategoryDialog from './ImportCategoryDialog'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const dispatch = useDispatch()
  const selectedRows = table.getSelectedRowModel().rows

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleCategories(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('categoryName')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('categoryName')?.setFilterValue(event.target.value)
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

      <Can permission={'CREATE_CATEGORY'}>
        <Button
          onClick={() => setShowCreateCategoryDialog(true)}
          className="mx-2 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateCategoryDialog && (
          <CreateCategoryDialog
            open={showCreateCategoryDialog}
            onOpenChange={setShowCreateCategoryDialog}
            showTrigger={false}
          />
        )}

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
          <ImportCategoryDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <Can permission={'GET_CATEGORY'}>
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
          <ExportCategoryDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DeleteMultipleCategoriesDialog
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
