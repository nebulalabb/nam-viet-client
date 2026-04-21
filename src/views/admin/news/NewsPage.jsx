import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { getNews, getNewsCategories } from '@/stores/NewsSlice'
import { useEffect, useState } from 'react'
import { NewsDataTable } from './components/NewsDataTable'
import { getColumns } from './components/Column'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const NewsPage = () => {
  const dispatch = useDispatch()
  const news = useSelector((state) => state.news.news)
  const loading = useSelector((state) => state.news.loading)
  const serverPagination = useSelector((state) => state.news.pagination)

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  })
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const columns = getColumns()

  useEffect(() => {
    document.title = 'Quản lý bài viết'
    dispatch(getNewsCategories())
  }, [dispatch])

  useEffect(() => {
    const filtersParams = columnFilters.reduce((acc, filter) => {
      acc[filter.id] = filter.value.join ? filter.value.join(',') : filter.value
      return acc
    }, {})

    dispatch(getNews({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: globalFilter || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      ...filtersParams
    }))
  }, [dispatch, pagination.pageIndex, pagination.pageSize, columnFilters, globalFilter, statusFilter])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2 px-2 sm:px-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Quản lý bài viết
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-[400px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="draft">Nháp</TabsTrigger>
                <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
                <TabsTrigger value="archived">Lưu trữ</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-2 sm:px-0">
          {news && (
            <NewsDataTable
              data={news}
              columns={columns}
              loading={loading}
              pagination={pagination}
              pageCount={serverPagination?.totalPages || 1}
              rowCount={serverPagination?.total || 0}
              onPaginationChange={setPagination}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default NewsPage
