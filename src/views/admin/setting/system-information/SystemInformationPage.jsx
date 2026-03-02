import { Button } from '@/components/custom/Button'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Skeleton } from '@/components/ui/skeleton'
import { getSetting, syncSystemSetting } from '@/stores/SettingSlice'
import { IconArrowLeft, IconRefresh } from '@tabler/icons-react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const SystemInformationPage = () => {
  const settings = useSelector((state) => state.setting.setting)
  const loading = useSelector((state) => state.setting.loading)
  const serverInfo = settings?.payload?.serverInfo
  const processInfo = settings?.payload?.processInfo
  const dependencies = settings?.payload?.dependencies
  const devDependencies = settings?.payload?.devDependencies

  const dispatch = useDispatch()
  useEffect(() => {
    document.title = 'Thông tin hệ thống'
    dispatch(getSetting('system_information'))
  }, [dispatch])

  const handleUpdate = async () => {
    try {
      await dispatch(syncSystemSetting()).unwrap()
    } catch (error) {
      console.log('Submit error:', error)
    }
  }

  const navigate = useNavigate()

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Thông tin hệ thống
          </h2>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="my-3 grid gap-4 rounded-lg border p-4 md:grid-cols-2">
            <div className="rounded-md p-4 shadow-sm dark:bg-primary-foreground">
              <h3 className="mb-3 font-semibold">Thông tin máy chủ</h3>
              {loading
                ? Array.from({ length: 1 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-[20px] w-full rounded-md" />
                    </div>
                  ))
                : serverInfo && (
                    <ol className="list-decimal pl-4">
                      <li>Hệ điều hành: {serverInfo.platform}</li>
                      <li>Kiến trúc: {serverInfo.architecture}</li>
                      <li>Số CPU: {serverInfo.cpuCount}</li>
                      <li>Bộ nhớ: {serverInfo.totalMemory}</li>
                      <li>Bộ nhớ trống: {serverInfo.freeMemory}</li>
                      <li>Uptime: {serverInfo.uptime}</li>
                      <li>Hostname: {serverInfo.hostname}</li>
                    </ol>
                  )}
            </div>

            <div className="rounded-md p-4 shadow-sm dark:bg-primary-foreground">
              <h3 className="mb-3 font-semibold">Thông tin tiến trình</h3>
              {loading
                ? Array.from({ length: 1 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Skeleton className="h-[20px] w-full rounded-md" />
                    </div>
                  ))
                : processInfo && (
                    <ol className="list-decimal pl-4">
                      <li>Node Version: {processInfo.nodeVersion}</li>
                      <li>Thư mục: {processInfo.cwd}</li>
                      <li>Sử dụng bộ nhớ: {processInfo.memoryUsage}</li>
                      <li>Uptime: {processInfo.uptime}</li>
                      <li>Môi trường: {processInfo.environment}</li>
                    </ol>
                  )}
            </div>

            <div className="rounded-md p-4 shadow-sm dark:bg-primary-foreground">
              <h3 className="mb-3 font-semibold">Dependencies</h3>
              {loading ? (
                Array.from({ length: 1 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  </div>
                ))
              ) : (
                <ul className="list-disc pl-4">
                  {dependencies &&
                    Object.entries(dependencies).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="rounded-md p-4 shadow-sm dark:bg-primary-foreground">
              <h3 className="mb-3 font-semibold">Dev Dependencies</h3>
              {loading ? (
                Array.from({ length: 1 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  </div>
                ))
              ) : (
                <ul className="list-disc pl-4">
                  {devDependencies &&
                    Object.entries(devDependencies).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end md:col-span-full">
              <Button
                type="button"
                variant="outline"
                className="mr-2 w-32"
                onClick={() => navigate(-1)}
              >
                <IconArrowLeft className="h-4 w-4" /> Quay lại
              </Button>

              <Button
                type="submit"
                onClick={() => handleUpdate()}
                className="w-32"
                loading={loading}
              >
                {!loading && <IconRefresh className="mr-2 h-4 w-4" />} Cập nhật
              </Button>
            </div>
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default SystemInformationPage
