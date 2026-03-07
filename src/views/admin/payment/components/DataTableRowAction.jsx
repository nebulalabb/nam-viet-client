import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useState } from 'react'
import { DeletePaymentDialog } from './DeletePaymentDialog'
import PaymentFormDialog from './PaymentDialog'
import { Pencil } from 'lucide-react'
import Can from '@/utils/can'

const DataTableRowActions = ({ row }) => {
  const [showDeletePaymentDialog, setShowDeletePaymentDialog] = useState(false)
  const [showUpdatePaymentDialog, setShowUpdatePaymentDialog] = useState(false)

  return (
    <>
      {showDeletePaymentDialog && (
        <DeletePaymentDialog
          open={showDeletePaymentDialog}
          onOpenChange={setShowDeletePaymentDialog}
          payment={row.original}
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
          {/* Placeholder View/Edit actions can remain if needed, or remove if unused effectively */}

          {row.original.status === 'draft' && (
            <Can permission="PAYMENT_UPDATE">
              <DropdownMenuItem
                onSelect={() => setShowUpdatePaymentDialog(true)}
                className="text-amber-500 focus:text-amber-600 hover:text-amber-600 focus:bg-amber-50"
              >
                Sửa
                <DropdownMenuShortcut>
                  <IconEdit className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}

          {(row.original.status === 'draft' || row.original.status === 'cancelled') && (
            <Can permission="PAYMENT_DELETE">
              <DropdownMenuItem
                onSelect={() => setShowDeletePaymentDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                Xóa
                <DropdownMenuShortcut>
                  <IconTrash className="h-4 w-4" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </Can>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export { DataTableRowActions }
