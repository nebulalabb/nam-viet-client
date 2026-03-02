import { Button } from '@/components/custom/Button'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { getAccessLogs, revokeTokens } from '@/stores/AuthSlice'
import { diffForHumans } from '@/utils/date-format'
import {
  IconDeviceDesktop,
  IconLogout,
  IconRosetteDiscountCheck,
  IconRosetteDiscountCheckOff,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const AccessLogPage = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.auth.loading)
  const accessLogs = useSelector((state) => state.auth.accessLogs)

  useEffect(() => {
    document.title = 'Lịch sử truy cập - Quản lý thiết bị đăng nhập'
    dispatch(getAccessLogs())
  }, [dispatch])

  const [selectedTokens, setSelectedTokens] = useState([])

  const handleCheckboxChange = (logId) => {
    setSelectedTokens((prev) =>
      prev.includes(logId)
        ? prev.filter((id) => id !== logId)
        : [...prev, logId],
    )
  }

  const handleRevokeTokens = async () => {
    try {
      await dispatch(revokeTokens({ logs: selectedTokens })).unwrap()
      setSelectedTokens([])
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            Lịch sử truy cập - Quản lý thiết bị đăng nhập
          </h2>
        </div>

        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <div className="my-3 grid gap-4 rounded-lg border p-4">
            <div className="col-span-full flex items-end justify-end">
              <Button
                variant="destructive"
                onClick={handleRevokeTokens}
                disabled={selectedTokens.length === 0}
                loading={loading}
              >
                {!loading && <IconLogout className="mr-2 h-4 w-4" />} Đăng xuất
              </Button>
            </div>

            {loading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Skeleton className="h-[20px] w-full rounded-md" />
                  </div>
                ))
              : accessLogs.map((log) => (
                  <Alert
                    key={log.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="mr-4 h-6 w-6">
                        <IconDeviceDesktop />
                      </div>
                      <div>
                        <AlertTitle>{log.userAgent}</AlertTitle>
                        <AlertDescription>
                          <div className="flex items-center">
                            <span className="mr-2">
                              {diffForHumans(log.createdAt, false)} -
                            </span>
                            {log.logoutAt ? (
                              <span className="flex items-center text-muted-foreground">
                                Đã đăng xuất
                                <IconRosetteDiscountCheckOff className="ml-2 h-4 w-4" />
                              </span>
                            ) : (
                              <span className="flex items-center text-green-500">
                                Đang hoạt động{' '}
                                <IconRosetteDiscountCheck className="ml-2 h-4 w-4" />
                              </span>
                            )}
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                    {log.logoutAt === null && (
                      <Checkbox
                        id={`checkbox-${log.id}`}
                        checked={selectedTokens.includes(log.id)}
                        onCheckedChange={() => handleCheckboxChange(log.id)}
                      />
                    )}
                  </Alert>
                ))}
          </div>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default AccessLogPage
