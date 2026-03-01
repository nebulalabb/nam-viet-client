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

const DebtPagination = ({ pagination, onPaginationChange, pageCount, rowCount }) => {
    return (
        <div className="flex items-center justify-between overflow-auto px-2 mt-4">
            <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
                {rowCount || 0} hàng
            </div>
            <div className="flex items-center sm:space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="hidden text-sm font-medium sm:block">
                        Hàng trên mỗi trang
                    </p>
                    <Select
                        value={`${pagination.limit || 20}`}
                        onValueChange={(value) => {
                            onPaginationChange({ ...pagination, page: 1, limit: Number(value) })
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={`${pagination.limit || 20}`} />
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
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Trang {pagination.page || 1} trong {pageCount || 1}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => onPaginationChange({ ...pagination, page: 1 })}
                        disabled={pagination.page <= 1}
                    >
                        <span className="sr-only">Về trang đầu</span>
                        <DoubleArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => onPaginationChange({ ...pagination, page: pagination.page - 1 })}
                        disabled={pagination.page <= 1}
                    >
                        <span className="sr-only">Trang trước</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => onPaginationChange({ ...pagination, page: pagination.page + 1 })}
                        disabled={pagination.page >= pageCount}
                    >
                        <span className="sr-only">Trang sau</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => onPaginationChange({ ...pagination, page: pageCount })}
                        disabled={pagination.page >= pageCount}
                    >
                        <span className="sr-only">Đến trang cuối</span>
                        <DoubleArrowRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DebtPagination
