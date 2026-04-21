import { X } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOptions'
import CreateNewsDialog from './CreateNewsDialog'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { useSelector } from 'react-redux'

export default function DataTableToolbar({ table, globalFilter, onGlobalFilterChange }) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter
  const categories = useSelector((state) => state.news.categories)

  const categoryOptions = categories.map((cat) => ({
    label: cat.categoryName,
    value: cat.id,
  }))

  const statusOptions = [
    { label: 'Nháp', value: 'draft' },
    { label: 'Đã xuất bản', value: 'published' },
    { label: 'Lưu trữ', value: 'archived' },
  ]

  const contentTypeOptions = [
    { label: 'Bài viết', value: 'article' },
    { label: 'Video', value: 'video' },
  ]

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
      <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
        <Input
          placeholder="Tìm kiếm bài viết..."
          value={globalFilter ?? ''}
          onChange={(event) => onGlobalFilterChange(event.target.value)}
          className="h-8 w-full sm:w-[150px] lg:w-[250px]"
        />
        {table.getColumn('categoryId') && (
          <DataTableFacetedFilter
            column={table.getColumn('categoryId')}
            title="Danh mục"
            options={categoryOptions}
          />
        )}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={statusOptions}
          />
        )}
        {table.getColumn('contentType') && (
          <DataTableFacetedFilter
            column={table.getColumn('contentType')}
            title="Loại"
            options={contentTypeOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters()
              onGlobalFilterChange('')
            }}
            className="h-8 px-2 lg:px-3"
          >
            Xóa lọc
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <CreateNewsDialog />
      </div>
    </div>
  )
}
