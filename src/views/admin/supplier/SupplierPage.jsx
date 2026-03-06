import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getSuppliers } from '@/stores/SupplierSlice'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import { SupplierDataTable } from './components/SupplierDataTable'

const SupplierPage = () => {
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const loading = useSelector((state) => state.supplier.loading)

  const dispatch = useDispatch()
  useEffect(() => {
    document.title = 'Quản lý nhà cung cấp'

    dispatch(getSuppliers())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách nhà cung cấp
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {suppliers && (
            <SupplierDataTable
              data={suppliers}
              columns={columns}
              loading={loading}
            />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default SupplierPage
