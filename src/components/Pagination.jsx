import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeft as DoubleArrowLeftIcon, ChevronsRight as DoubleArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/custom/Button'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center space-x-2">
            <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
            >
                <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center text-sm font-medium">
                Trang {currentPage} / {totalPages}
            </div>

            <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
            >
                <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
        </div>
    )
}
