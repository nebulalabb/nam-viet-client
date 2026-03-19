import React from 'react'
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

const CustomPagination = ({ 
    totalItems, 
    currentPage, 
    pageSize, 
    onPageChange, 
    onPageSizeChange 
}) => {
    const totalPages = Math.ceil(totalItems / pageSize) || 1
    const canPreviousPage = currentPage > 1
    const canNextPage = currentPage < totalPages

    return (
        <div className="flex items-center justify-between overflow-auto px-2 mt-4 pt-4 border-t">
            <div className="hidden flex-1 text-sm text-muted-foreground sm:block">
                {totalItems} hàng
            </div>
            <div className="flex items-center sm:space-x-6 lg:space-x-8">
                {onPageSizeChange && (
                    <div className="flex items-center space-x-2">
                        <p className="hidden text-sm font-medium sm:block">
                            Hàng trên mỗi trang
                        </p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                onPageSizeChange(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 50, 100].map((size) => (
                                    <SelectItem key={size} value={`${size}`}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Trang {currentPage} trong {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => onPageChange(1)}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Về trang đầu</span>
                        <DoubleArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={!canPreviousPage}
                    >
                        <span className="sr-only">Trang trước</span>
                        <ChevronLeftIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Trang sau</span>
                        <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => onPageChange(totalPages)}
                        disabled={!canNextPage}
                    >
                        <span className="sr-only">Đến trang cuối</span>
                        <DoubleArrowRightIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CustomPagination
