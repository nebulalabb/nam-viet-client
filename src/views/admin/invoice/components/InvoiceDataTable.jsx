import { useState } from 'react'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
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
import MobileInvoiceCard from './MobileInvoiceCard'
import { normalizeText } from '@/utils/normalize-text'

const InvoiceDataTable = ({
  columns,
  data,
  loading = false,
  isMyInvoice = false,
  onCreated,
  onView,
  // Server-side pagination props
  pageCount,
  pagination,
  onPaginationChange,
  // Server-side search
  onSearchChange,
  onDeleted,
  columnFilters = [], // Add columnFilters prop
  onColumnFiltersChange, // Add onColumnFiltersChange prop
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})

  // Use internal state if props not provided (fallback)
  const [internalColumnFilters, setInternalColumnFilters] = useState([])

  const finalColumnFilters = onColumnFiltersChange ? columnFilters : internalColumnFilters
  const finalSetColumnFilters = onColumnFiltersChange ? onColumnFiltersChange : setInternalColumnFilters

  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  // Default internal pagination state if not provided (fallback)
  const [internalPagination, setInternalPagination] = useState({
    pageIndex: 0,
    pageSize: isMobile ? 15 : 30,
  })

  // Use props if provided, else internal state
  const paginationState = pagination || internalPagination

  const table = useReactTable({
    data,
    columns,
    // Enable server-side pagination
    manualPagination: !!pagination,
    manualFiltering: !!onSearchChange, // Revert to standard manualFiltering for full server-side control
    pageCount: pageCount ?? -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: finalColumnFilters,
      globalFilter,
      pagination: paginationState,
    },
    // Handle pagination changes
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater(paginationState)
        if (onPaginationChange) {
          onPaginationChange(newState)
        } else {
          setInternalPagination(newState)
        }
      } else {
        if (onPaginationChange) {
          onPaginationChange(updater)
        } else {
          setInternalPagination(updater)
        }
      }
    },
    meta: {
      onView,
      onDeleted,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: finalSetColumnFilters,
    onGlobalFilterChange: (updater) => {
      const value = typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(value)
      if (onSearchChange) {
        onSearchChange(value)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Standard pagination model is still needed for rows per page calculation etc
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true

      const filterNorm = normalizeText(filterValue)

      const original = row.original

      // 1. Check Invoice Code
      if (normalizeText(original.code || '').includes(filterNorm)) return true

      // 2. Check Customer attributes (Name, Phone, TaxCode, IdentityCard)
      const customer = original.customer
      if (customer) {
        const customerText = normalizeText(
          `${customer.name || ''} ${customer.taxCode || ''} ${customer.phone || ''} ${customer.identityCard || ''}`
        )
        if (customerText.includes(filterNorm)) return true
      }

      // 3. Check Sales Contract Code
      if (original.salesContract?.code) {
        if (normalizeText(original.salesContract.code).includes(filterNorm)) return true
      }

      // 4. Check the specific column value (fallback)
      const value = row.getValue(columnId)
      if (value != null && typeof value !== 'object') {
        return normalizeText(String(value)).includes(filterNorm)
      }

      return false
    },
  })

  // Mobile View - Card List
  if (isMobile) {
    return (
      <div className="space-y-4">
        <DataTableToolbar table={table} isMyInvoice={isMyInvoice} onCreated={onCreated} />

        <div className="space-y-2">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <Skeleton className="h-[20px] w-1/3 rounded-md" />
                  <Skeleton className="h-[16px] w-2/3 rounded-md" />
                  <Skeleton className="h-[16px] w-1/2 rounded-md" />
                </div>
              ))}
            </>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <MobileInvoiceCard
                key={row.id}
                invoice={row.original}
                isSelected={row.getIsSelected()}
                onSelectChange={(checked) => row.toggleSelected(checked)}
                onRowAction={() => { }}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có kết quả nào
            </div>
          )}
        </div>

        <DataTablePagination table={table} />
      </div>
    )
  }

  // Desktop View - Table
  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} isMyInvoice={isMyInvoice} onCreated={onCreated} />

      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-secondary">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                      <TableCell key={colIndex}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  Không có kết quả nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export default InvoiceDataTable
