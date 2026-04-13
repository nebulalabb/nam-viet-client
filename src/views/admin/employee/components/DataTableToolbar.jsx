import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateUserDialog from './CreateEmployeeDialog'
import { employeeStatuses } from '../data/index'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
// import { DeleteMultipleUsersDialog } from './DeleteMultipleUsersDialog'
// import { deleteMultipleUsers } from '@/stores/UserSlice'
import { useDispatch } from 'react-redux'
import { TrashIcon } from '@radix-ui/react-icons'

const DataTableToolbar = ({ table }) => {
    const isFiltered = table.getState().columnFilters.length > 0
    const [showCreateUserDialog, setShowCreateUserDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const dispatch = useDispatch()
    const selectedRows = table.getSelectedRowModel().rows


    return (
        <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm kiếm: Tên, SĐT, Email..."
                    value={table.getState().globalFilter || ''}
                    onChange={(event) =>
                        table.setGlobalFilter(String(event.target.value))
                    }
                    className="h-10 w-[200px] lg:w-[320px] rounded-xl shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] border-gray-200/80 bg-white"
                />

                <div className="flex gap-x-2">
                    {table.getColumn('status') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('status')}
                            title="Trạng thái"
                            options={employeeStatuses}
                        />
                    )}
                </div>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-10 px-2 lg:px-3 text-red-500 hover:text-red-600 hover:bg-red-50"
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
                        disabled
                    >
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                        Xóa ({selectedRows.length})
                    </Button>
                )
            }

            <Can permission={'CREATE_USER'}>
                <Button
                    onClick={() => setShowCreateUserDialog(true)}
                    className="mx-2 bg-emerald-600 hover:bg-emerald-700 text-white h-10 rounded-xl shadow-sm"
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

            {/* <DeleteMultipleUsersDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
      /> */}

            <DataTableViewOptions table={table} />
        </div >
    )
}

export { DataTableToolbar }
