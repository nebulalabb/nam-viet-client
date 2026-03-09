import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

const DataTablePagination = ({ table }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 px-2 py-4 overflow-auto">
      {/* Total rows - Hidden on mobile */}
      <div className="hidden flex-1 text-xs sm:text-sm text-muted-foreground sm:block">
        {table.getFilteredRowModel().rows.length} hàng
      </div>

      {/* Page size and navigation - Stack on mobile */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 lg:gap-8 w-full sm:w-auto">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <p className="hidden text-xs sm:text-sm font-medium sm:block">
            / trang
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[60px] sm:w-[70px] text-xs sm:text-sm">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page info */}
        <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
          Trang {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* First page - Hidden on mobile */}
          {isDesktop && (
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              title="Trang đầu"
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
          )}

          {/* Previous */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Trang trước"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          {/* Next */}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Trang sau"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          {/* Last page - Hidden on mobile */}
          {isDesktop && (
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              title="Trang cuối"
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export { DataTablePagination }
