import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { PlusIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import CreateMaterialDialog from './CreateMaterialDialog'

const DataTableToolbar = ({ table }) => {
    const isFiltered = table.getState().columnFilters.length > 0
    const [showCreateDialog, setShowCreateDialog] = useState(false)

    const initialFilter = table.getState().globalFilter || ''
    const [inputValue, setInputValue] = useState(initialFilter)

    useEffect(() => {
        setInputValue(table.getState().globalFilter || '')
    }, [table.getState().globalFilter])

    useEffect(() => {
        const timeout = setTimeout(() => {
            table.setGlobalFilter(inputValue)
        }, 300)
        return () => clearTimeout(timeout)
    }, [inputValue, table])

    return (
        <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm kiếm nguyên liệu..."
                    value={inputValue}
                    onChange={(event) => setInputValue(String(event.target.value))}
                    className="h-8 w-[150px] lg:w-[250px] border-green-200 focus-visible:ring-green-500"
                />

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                        Đặt lại
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <Button
                onClick={() => setShowCreateDialog(true)}
                className="mx-2 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
            >
                <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                Thêm mới
            </Button>

            {showCreateDialog && (
                <CreateMaterialDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                />
            )}
        </div>
    )
}

export { DataTableToolbar }
