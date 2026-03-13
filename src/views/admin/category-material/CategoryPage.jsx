import { getCategories } from '@/stores/CategorySlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { CategoryDataTable } from '../category/components/CategoryDataTable'
import { getColumns } from '../category/components/Column'

const CategoryMaterialPage = () => {
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.category.categories)
  const loading = useSelector((state) => state.category.loading)
  const columns = getColumns('MATERIAL')

  useEffect(() => {
    document.title = 'Quản lý danh mục nguyên liệu'
    dispatch(getCategories({ type: 'MATERIAL' }))
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách danh mục nguyên liệu
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {categories && (
            <CategoryDataTable
              data={categories}
              columns={columns}
              loading={loading}
              type="MATERIAL"
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default CategoryMaterialPage
