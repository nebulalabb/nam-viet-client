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
const DataTablePagination = ({ table }) => {
    const pageCount = table.getPageCount()
    const pageIndex = table.getState().pagination.pageIndex

    let pages = []
    if (pageCount <= 5) {
        pages = Array.from({ length: pageCount }, (_, i) => i)
    } else {
        if (pageIndex <= 2) {
            pages = [0, 1, 2, '...', pageCount - 1]
        } else if (pageIndex >= pageCount - 3) {
            pages = [0, '...', pageCount - 3, pageCount - 2, pageCount - 1]
        } else {
            pages = [0, '...', pageIndex - 1, pageIndex, pageIndex + 1, '...', pageCount - 1]
        }
    }

    return (
        <div className="flex items-center justify-between overflow-auto px-2 mt-4 bg-white dark:bg-zinc-950 p-2 rounded-lg border">
            {/* 1. Số lượng */}
            <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
                Tổng cộng: <span className="font-semibold text-emerald-700 dark:text-emerald-400">{table.getRowCount()}</span> dòng
            </div>

            <div className="flex items-center sm:space-x-6 lg:space-x-8">
                {/* 2. Hàng trên mỗi trang */}
                <div className="flex items-center space-x-2">
                    <p className="hidden text-sm font-medium sm:block">
                        Hàng trên mỗi trang
                    </p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[20, 30, 50, 100, 250, 500].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* 3. Chuyển trang (như ảnh) */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 border-gray-200 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 bg-white rounded-xl shadow-sm transition-all"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>

                    {pages.map((p, i) => {
                        if (p === '...') {
                            return <span key={i} className="px-1 text-gray-400 font-medium">...</span>
                        }
                        const isCurrent = p === pageIndex
                        return (
                            <Button
                                key={i}
                                variant={isCurrent ? "default" : "outline"}
                                className={`h-9 w-9 p-0 rounded-xl font-bold text-sm shadow-sm transition-all ${
                                    isCurrent 
                                        ? 'bg-emerald-700 text-white hover:bg-emerald-800 border-none ring-2 ring-emerald-700/20' 
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                                }`}
                                onClick={() => table.setPageIndex(p)}
                            >
                                {p + 1}
                            </Button>
                        )
                    })}

                    <Button
                        variant="outline"
                        className="h-9 w-9 p-0 border-gray-200 text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 bg-white rounded-xl shadow-sm transition-all"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export { DataTablePagination }
