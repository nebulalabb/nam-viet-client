import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from './DataTableToolbar'
import { DataTablePagination } from './DataTablePagination'
import { Skeleton } from '@/components/ui/skeleton'
import MobileProductCard from './MobileProductCard'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { useDispatch } from 'react-redux'
import { copyProduct, getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'

const ProductDataTable = ({ columns, data, loading = false }) => {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [columnFilters, setColumnFilters] = useState([])
  const [sorting, setSorting] = useState([])
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const dispatch = useDispatch()

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 30,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleCopy = async (productId) => {
    try {
      await dispatch(copyProduct(productId)).unwrap()
      await dispatch(getProducts()).unwrap()
      toast.success('Sao chép sản phẩm thành công')
    } catch (error) {
      toast.error('Lỗi sao chép sản phẩm')
      console.log(error)
    }
  }

  // Mobile view - Cards
  if (!isDesktop) {
    return (
      <div className="space-y-4">
        <DataTableToolbar table={table} />

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="rounded-lg border p-4">
                <Skeleton className="h-[120px] w-full rounded-md" />
              </div>
            ))}
          </div>
        ) : table.getRowModel().rows?.length ? (
          <div className="space-y-3">
            {table.getRowModel().rows.map((row) => (
              <MobileProductCard
                key={row.id}
                product={row.original}
                isSelected={row.getIsSelected()}
                onSelectChange={(checked) => row.toggleSelected(!!checked)}
                onCopy={handleCopy}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không có kết quả nào
          </div>
        )}

        <div className="overflow-x-auto">
          <DataTablePagination table={table} />
        </div>
      </div>
    )
  }

  // Desktop view - Table

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="sticky top-0 z-10 bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id} 
                      colSpan={header.colSpan}
                      className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex} className="px-2 py-2 sm:px-4 sm:py-3">
                        <Skeleton className="h-[20px] w-full rounded-md" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-xs sm:text-sm"
                >
                  Không có kết quả nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="overflow-x-auto">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}

export { ProductDataTable }
