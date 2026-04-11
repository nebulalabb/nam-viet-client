import { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/utils/number-format'
import { dateFormat } from '@/utils/date-format'
import { deliveryStatuses, settlementStatuses } from '../data'
import Can from '@/utils/can'
import { Button } from '@/components/custom/Button'
import {
  IconPlayerPlay,
  IconCircleCheck,
  IconCircleX,
  IconCash,
} from '@tabler/icons-react'

import StartDeliveryDialog from './StartDeliveryDialog'
import CompleteDeliveryDialog from './CompleteDeliveryDialog'
import FailDeliveryDialog from './FailDeliveryDialog'
import SettleCODDialog from './SettleCODDialog'
import ViewInvoiceDialog from '../../invoice/components/ViewInvoiceDialog'
import { getDeliveries } from '@/stores/DeliverySlice'

export default function ViewDeliveryDialog({ open, onOpenChange, delivery }) {
  const dispatch = useDispatch()
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showFailDialog, setShowFailDialog] = useState(false)
  const [showSettleDialog, setShowSettleDialog] = useState(false)
  const [openOrderDialog, setOpenOrderDialog] = useState(false)

  if (!delivery) return null

  const refreshData = () => {
    dispatch(getDeliveries())
    onOpenChange(false)
  }

  const dStatus = deliveryStatuses.find((s) => s.value === delivery.deliveryStatus)
  const sStatus = settlementStatuses.find((s) => s.value === delivery.settlementStatus)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader className="border-b pb-3 mb-3">
            <div className="flex items-center justify-between mt-2">
              <DialogTitle className="text-xl">Chi tiết giao hàng: <span className="text-blue-600">{delivery.deliveryCode}</span></DialogTitle>
              <Badge variant="outline" className={`${dStatus?.color || ''} border-none`}>
                {dStatus?.label || delivery.deliveryStatus}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 text-sm mt-2">
            {/* THÔNG TIN CHUNG */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              <div>
                <p className="text-gray-500 mb-1">Mã đơn hàng</p>
                {delivery.order ? (
                  <>
                    <p 
                      className="cursor-pointer inline-block font-semibold text-indigo-600 hover:underline"
                      onClick={() => setOpenOrderDialog(true)}
                    >
                      {delivery.order.orderCode}
                    </p>
                    {openOrderDialog && (
                      <ViewInvoiceDialog
                        open={openOrderDialog}
                        onOpenChange={setOpenOrderDialog}
                        invoiceId={delivery.order.id}
                        showTrigger={false}
                      />
                    )}
                  </>
                ) : (
                  <p className="font-semibold text-gray-800">—</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Nhân viên giao</p>
                <p className="font-semibold text-gray-800">{delivery.deliveryStaff?.fullName || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Ngày giao</p>
                <p className="font-medium text-gray-800">{dateFormat(delivery.deliveryDate)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Tình trạng đối soát</p>
                <div className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium ${sStatus?.color || ''}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${sStatus?.dotColor || ''}`} />
                  {sStatus?.label || delivery.settlementStatus}
                </div>
              </div>
            </div>

            {/* TIỀN BẠC */}
            <div className="bg-gray-50 p-4 rounded-md grid grid-cols-2 gap-4 border">
               <div>
                 <p className="text-gray-500 mb-1">Tiền COD phải thu</p>
                 <p className="font-bold text-[16px] text-gray-800">{formatCurrency(delivery.codAmount)}</p>
               </div>
               <div>
                 <p className="text-gray-500 mb-1">Đã thu thực tế</p>
                 <p className="font-bold text-[16px] text-green-600">{formatCurrency(delivery.collectedAmount)}</p>
               </div>
            </div>

            {/* Ghi chú & Lý do */}
            {(delivery.notes || delivery.failureReason) && (
              <div className="space-y-2 border-t pt-4">
                {delivery.notes && (
                  <div>
                    <span className="text-gray-500">Ghi chú: </span>
                    <span className="font-medium">{delivery.notes}</span>
                  </div>
                )}
                {delivery.failureReason && (
                  <div>
                    <span className="text-gray-500">Lý do thất bại: </span>
                    <span className="text-red-600 font-medium">{delivery.failureReason}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
            
            {delivery.deliveryStatus === 'pending' && (
              <Can permission="START_DELIVERY">
                <Button onClick={() => setShowStartDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <IconPlayerPlay size={16} className="mr-2" /> Bắt đầu giao
                </Button>
              </Can>
            )}

            {delivery.deliveryStatus === 'in_transit' && (
              <>
                <Can permission="FAIL_DELIVERY">
                  <Button variant="destructive" onClick={() => setShowFailDialog(true)}>
                    <IconCircleX size={16} className="mr-2" /> Giao thất bại
                  </Button>
                </Can>
                <Can permission="COMPLETE_DELIVERY">
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowCompleteDialog(true)}>
                    <IconCircleCheck size={16} className="mr-2" /> Thành công
                  </Button>
                </Can>
              </>
            )}

            {delivery.deliveryStatus === 'delivered' && delivery.settlementStatus === 'pending' && (
              <Can permission="SETTLE_COD">
                <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setShowSettleDialog(true)}>
                  <IconCash size={16} className="mr-2" /> Đối soát COD
                </Button>
              </Can>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {showStartDialog && (
        <StartDeliveryDialog open={showStartDialog} onOpenChange={setShowStartDialog} delivery={delivery} onSuccess={refreshData} />
      )}
      {showCompleteDialog && (
        <CompleteDeliveryDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog} delivery={delivery} onSuccess={refreshData} />
      )}
      {showFailDialog && (
        <FailDeliveryDialog open={showFailDialog} onOpenChange={setShowFailDialog} delivery={delivery} onSuccess={refreshData} />
      )}
      {showSettleDialog && (
        <SettleCODDialog open={showSettleDialog} onOpenChange={setShowSettleDialog} delivery={delivery} onSuccess={refreshData} />
      )}
    </>
  )
}
