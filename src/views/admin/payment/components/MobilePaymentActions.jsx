import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { Pencil, Printer, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const MobilePaymentActions = ({
  payment,
  isMobile,
  handlePrintPayment,
  setShowDeleteDialog,
  setShowUpdateDialog,
  className,
  overlayClassName
}) => {
  const [open, setOpen] = useState(false)

  if (!isMobile || !payment) return null

  const handleAction = (action) => {
    setOpen(false)
    action()
  }

  // Check if payment can be deleted
  const canDelete =
    payment.status === 'draft' ||
    payment.status === 'cancelled' ||
    payment.status === 'canceled'

  payment.status === 'cancelled' ||
    payment.status === 'canceled'

  const canEdit = payment.status === 'draft'

  return (
    <>
      <Button
        className={cn("fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-[100030]", className)}
        size="icon"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className={cn("z-[100030] px-4 pb-6 pt-4 rounded-t-xl max-h-[80vh] overflow-y-auto", className)}
          overlayClassName={cn("z-[100029]", overlayClassName)}
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Thao tác phiếu chi</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">

            {/* Print Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="justify-start bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleAction(handlePrintPayment)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In Phiếu Chi
                </Button>
              </div>
            </div>

            {canEdit && (
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="justify-start w-full"
                  onClick={() => handleAction(() => setShowUpdateDialog(true))}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Chỉnh Sửa
                </Button>
              </div>
            )}

            {canDelete && (
              <>
                <Separator />
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant="destructive"
                    className="justify-start w-full"
                    onClick={() => handleAction(() => setShowDeleteDialog(true))}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa Phiếu
                  </Button>
                </div>
              </>
            )}

          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobilePaymentActions
