import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  IconPlayerPlay,
  IconCircleCheck,
  IconCircleX,
  IconCash,
  IconEye,
} from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import StartDeliveryDialog from './StartDeliveryDialog'
import CompleteDeliveryDialog from './CompleteDeliveryDialog'
import FailDeliveryDialog from './FailDeliveryDialog'
import SettleCODDialog from './SettleCODDialog'
import { getDeliveries } from '@/stores/DeliverySlice'

export const DataTableRowActions = ({ row }) => {
  const delivery = row.original
  const dispatch = useDispatch()
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showFailDialog, setShowFailDialog] = useState(false)
  const [showSettleDialog, setShowSettleDialog] = useState(false)

  const refreshData = () => {
    dispatch(getDeliveries())
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuItem onClick={() => { }}>
            Xem chi tiết
            <DropdownMenuShortcut><IconEye size={16} /></DropdownMenuShortcut>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {delivery.deliveryStatus === 'pending' && (
            <Can permission="START_DELIVERY">
              <DropdownMenuItem onClick={() => setShowStartDialog(true)} className="text-blue-600">
                Bắt đầu giao
                <DropdownMenuShortcut><IconPlayerPlay size={16} /></DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {delivery.deliveryStatus === 'in_transit' && (
            <>
              <Can permission="COMPLETE_DELIVERY">
                <DropdownMenuItem onClick={() => setShowCompleteDialog(true)} className="text-green-600">
                  Giao thành công
                  <DropdownMenuShortcut><IconCircleCheck size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>
              <Can permission="FAIL_DELIVERY">
                <DropdownMenuItem onClick={() => setShowFailDialog(true)} className="text-red-600">
                  Giao thất bại
                  <DropdownMenuShortcut><IconCircleX size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>
              </Can>
            </>
          )}

          {delivery.deliveryStatus === 'delivered' && delivery.settlementStatus === 'pending' && (
            <Can permission="SETTLE_COD">
              <DropdownMenuItem onClick={() => setShowSettleDialog(true)} className="text-amber-600">
                Đối soát COD
                <DropdownMenuShortcut><IconCash size={16} /></DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showStartDialog && (
        <StartDeliveryDialog
          open={showStartDialog}
          onOpenChange={setShowStartDialog}
          delivery={delivery}
          onSuccess={refreshData}
        />
      )}

      {showCompleteDialog && (
        <CompleteDeliveryDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          delivery={delivery}
          onSuccess={refreshData}
        />
      )}

      {showFailDialog && (
        <FailDeliveryDialog
          open={showFailDialog}
          onOpenChange={setShowFailDialog}
          delivery={delivery}
          onSuccess={refreshData}
        />
      )}

      {showSettleDialog && (
        <SettleCODDialog
          open={showSettleDialog}
          onOpenChange={setShowSettleDialog}
          delivery={delivery}
          onSuccess={refreshData}
        />
      )}
    </>
  )
}
