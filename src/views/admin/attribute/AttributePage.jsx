import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AttributeDataTable } from './components/AttributeDataTable'
import { columns } from './components/Column'
import { getAttributes } from '@/stores/AttributeSlice'

const AttributePage = () => {
  const dispatch = useDispatch()
  const attributes = useSelector((state) => state.attribute.attributes)
  const loading = useSelector((state) => state.attribute.loading)

  useEffect(() => {
    document.title = 'Quản lý thuộc tính'
    dispatch(getAttributes())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách các thuộc tính
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {attributes && (
            <AttributeDataTable
              data={attributes}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default AttributePage
