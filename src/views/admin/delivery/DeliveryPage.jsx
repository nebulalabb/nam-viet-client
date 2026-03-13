import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getDeliveries } from '@/stores/DeliverySlice'
import { columns } from './components/Column'
import { DeliveryDataTable } from './components/DeliveryDataTable'
import { IconTruck } from '@tabler/icons-react'

export default function DeliveryPage() {
  const dispatch = useDispatch()
  const { deliveries, loading, meta } = useSelector((state) => state.delivery)

  useEffect(() => {
    dispatch(getDeliveries())
  }, [dispatch])

  return (
    <div className='flex-col md:flex h-full'>
      <div className='flex-1 space-y-4 p-8 pt-6'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-3xl font-bold tracking-tight flex items-center gap-2'>
            <IconTruck size={32} className="text-blue-600" />
            Quản lý giao hàng
          </h2>
        </div>
        
        <DeliveryDataTable 
          columns={columns} 
          data={deliveries} 
          loading={loading} 
        />
      </div>
    </div>
  )
}
