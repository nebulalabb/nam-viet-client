import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { UnitDataTable } from './components/UnitDataTable'
import { columns } from './components/Column'
import { getUnits } from '@/stores/UnitSlice'

const UnitPage = () => {
  const dispatch = useDispatch()
  const units = useSelector((state) => state.unit.units)
  const loading = useSelector((state) => state.unit.loading)

  useEffect(() => {
    document.title = 'Quản lý đơn vị tính'
    dispatch(getUnits())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách các đơn vị tính
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {units && (
            <UnitDataTable data={units} columns={columns} loading={loading} />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default UnitPage
