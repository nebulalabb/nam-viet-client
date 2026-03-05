import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'

const Pagination = ({
  page = 1,
  limit = 10,
  totalItems = 0,
  totalPages = 1,
  onPageChange,
}) => {
  const safeChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return
    onPageChange(nextPage)
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-2 py-2">
      <div className="flex items-center space-x-6">
        <div className="text-xs font-medium">
          Trang {page} / {totalPages}
          {typeof totalItems === 'number' && (
            <span className="ml-1 text-muted-foreground">
              • {totalItems} bản ghi
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-6 w-6 p-0 lg:flex"
            onClick={() => safeChangePage(1)}
            disabled={page === 1}
          >
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => safeChangePage(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => safeChangePage(page + 1)}
            disabled={page >= totalPages}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            className="hidden h-6 w-6 p-0 lg:flex"
            onClick={() => safeChangePage(totalPages)}
            disabled={page >= totalPages}
          >
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Pagination
