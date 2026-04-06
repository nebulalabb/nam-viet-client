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
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { DeletePaymentDialog } from './DeletePaymentDialog'
import PaymentFormDialog from './PaymentDialog'
import { Pencil, Eye, Printer, Trash2 } from 'lucide-react'
import Can from '@/utils/can'
import ViewPaymentDialog from './ViewPaymentDialog'
import PrintPaymentView from './PrintPaymentView'
import { useSelector } from 'react-redux'

const DataTableRowActions = ({ row }) => {
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false)
  const [showUpdatePaymentDialog, setShowUpdatePaymentDialog] = useState(false)
  const [showViewPaymentDialog, setShowViewPaymentDialog] = useState(false)
  const [printData, setPrintData] = useState(null)

  const payment = row.original
  const setting = useSelector((state) => state.setting.setting)

  const handlePrintPayment = () => {
    setPrintData(payment)
  }

  return (
    <>
      {showViewPaymentDialog && (
        <ViewPaymentDialog
          open={showViewPaymentDialog}
          onOpenChange={setShowViewPaymentDialog}
          paymentId={payment.id}
          showTrigger={false}
        />
      )}

      {printData && (
        <PrintPaymentView
          payment={printData}
          setting={setting}
          onAfterPrint={() => setPrintData(null)}
        />
      )}

      {showDeletePaymentDialog && (
        <DeletePaymentDialog
          open={showDeletePaymentDialog}
          onOpenChange={setShowDeletePaymentDialog}
          payment={payment}
          showTrigger={false}
        />
      )}

      {showUpdatePaymentDialog && (
        <PaymentFormDialog
          open={showUpdatePaymentDialog}
          onOpenChange={setShowUpdatePaymentDialog}
          paymentId={row.original.id}
          contentClassName="z-[100060]"
          overlayClassName="z-[100059]"
        />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open menu"
            variant="ghost"
            className="flex size-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => setShowViewPaymentDialog(true)}
            className="text-blue-600 focus:text-blue-600"
          >
            <Eye className="mr-2 h-4 w-4" />
            Xem
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handlePrintPayment}
            className="text-orange-600 focus:text-orange-600"
          >
            <Printer className="mr-2 h-4 w-4" />
            In phiếu
          </DropdownMenuItem>

          {(payment.status === 'draft') && (
            <Can permission="PAYMENT_UPDATE">
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setShowUpdatePaymentDialog(true)}
                className="text-amber-500 focus:text-amber-600 hover:text-amber-600 focus:bg-amber-50"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Sửa
              </DropdownMenuItem>
            </Can>
          )}

          {(payment.status === 'draft' || payment.status === 'cancelled') && (
            <Can permission="PAYMENT_DELETE">
              <DropdownMenuItem
                onSelect={() => setShowDeletePaymentDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
