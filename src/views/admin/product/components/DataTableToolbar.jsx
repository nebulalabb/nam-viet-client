import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import { productStatuses, productTypes } from '../data'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CreateProductDialog from './CreateProductDialog'
import DeleteMultipleProductsDialog from './DeleteMultipleProductsDialog'

export function DataTableToolbar({
    table,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
}) {
    const categories = useSelector((state) => state.category?.categories || [])

    const isFiltered = columnFilters.length > 0 || !!globalFilter
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const hasSelectedRows = selectedRows.length > 0

    const [searchInput, setSearchInput] = useState(globalFilter || '')

    useEffect(() => {
        const timer = setTimeout(() => {
            setGlobalFilter(searchInput)
        }, 500)
        return () => clearTimeout(timer)
    }, [searchInput, setGlobalFilter])

    const handleFilterChange = (id, value) => {
        const newFilters = columnFilters.filter(f => f.id !== id)
        if (value) {
            newFilters.push({ id, value })
        }
        setColumnFilters(newFilters)
    }

    const selectedStatus = columnFilters.find((f) => f.id === 'status')?.value || ''
    const selectedType = columnFilters.find((f) => f.id === 'productType')?.value || ''
    const selectedCategory = columnFilters.find((f) => f.id === 'categoryId')?.value || ''

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm theo mã, tên SP..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <select
                    value={selectedType}
                    onChange={(e) => handleFilterChange('productType', e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Loại sản phẩm</option>
                    {productTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring max-w-[150px]"
                >
                    <option value="">Danh mục</option>
                    {categories.slice(0, 50).map((c) => ( // Render first 50 to avoid long dropdowns, or ideally use a searchable select
                        <option key={c.id} value={c.id}>{c.categoryName}</option>
                    ))}
                </select>

                <select
                    value={selectedStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Trạng thái</option>
                    {productStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setColumnFilters([])
                            setGlobalFilter('')
                            setSearchInput('')
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Xóa lọc
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    {hasSelectedRows && (
                        <DeleteMultipleProductsDialog
                            products={selectedRows.map((row) => row.original)}
                            onSuccess={() => table.toggleAllRowsSelected(false)}
                        />
                    )}
                </div>
                <CreateProductDialog />
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}
