import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { DateRange } from '@/components/custom/DateRange'

export const typeOptions = [
    {
        value: 'buy_x_get_y',
        label: 'Mua X tặng Y',
    },
    {
        value: 'percentage',
        label: 'Giảm theo phần trăm',
    },
    {
        value: 'fixed_amount',
        label: 'Giảm cố định',
    },
    {
        value: 'gift',
        label: 'Tặng quà',
    },
]

const DataTableToolbar = ({ table }) => {
    const isFiltered = table.getState().columnFilters.length > 0
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
                    placeholder="Tìm kiếm mã, tên khuyến mãi..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(String(event.target.value))}
                    className="h-8 w-[200px] lg:w-[350px]"
                />

                <div className="flex gap-x-2">
                    <DateRange
                        onChange={(range) => {
                            table.getColumn('startDate')?.setFilterValue(range)
                        }}
                    />

                    {table.getColumn('promotionType') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('promotionType')}
                            title="Loại Khuyến Mãi"
                            options={typeOptions}
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

            <DataTableViewOptions table={table} />
        </div >
    )
}

export { DataTableToolbar }
