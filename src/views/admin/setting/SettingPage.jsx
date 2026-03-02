import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { settings } from './data'
import { Button } from '@/components/ui/button'

const SettingPage = () => {
  useEffect(() => {
    document.title = 'Cài đặt hệ thống'
  }, [])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-2 flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Cài đặt hệ thống
            </h2>
          </div>
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <ul className="faded-bottom no-scrollbar grid gap-4 overflow-auto pb-16 pt-4 md:grid-cols-2 lg:grid-cols-3">
            {settings?.map((setting, index) => (
              <li key={index} className="rounded-lg border p-4">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted p-2">
                    {setting.icon}
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={setting.link}>{setting.action}</Link>
                  </Button>
                </div>
                <div>
                  <h2 className="mb-1 font-medium text-primary">
                    {setting.name}
                  </h2>
                  <p
                    className="line-clamp-2 text-xs"
                    title={setting.description}
                  >
                    {setting.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default SettingPage
