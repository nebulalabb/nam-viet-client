import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RoleDataTable } from './components/RoleDataTable'
import { columns } from './components/Column'
import { getRoles } from '@/stores/RoleSlice'

const RolePage = () => {
  const dispatch = useDispatch()
  const roles = useSelector((state) => state.role.roles)
  const loading = useSelector((state) => state.role.loading)

  useEffect(() => {
    document.title = 'Quản lý vai trò'
    dispatch(getRoles())
  }, [dispatch])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Danh sách các vai trò trong hệ thống
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {roles && (
            <RoleDataTable data={roles} columns={columns} loading={loading} />
          )}
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default RolePage
