import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { Printer, Trash2, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'

const MobileReceiptActions = ({
  receipt,
  isMobile,
  handlePrintReceipt,
  setShowDeleteDialog,
  handleGenerateQR,
}) => {
  const [open, setOpen] = useState(false)

  if (!isMobile || !receipt) return null

  const handleAction = (action) => {
    setOpen(false)
    action()
  }

  // Check if receipt can be deleted
  const canDelete =
    receipt.status === 'draft' ||
    receipt.status === 'cancelled' ||
    receipt.status === 'canceled'

  return (
    <>
      <Button
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg !z-[100020]"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="h-6 w-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="!z-[100020] px-4 pb-6 pt-4 rounded-t-xl max-h-[80vh] overflow-y-auto"
          overlayClassName="!z-[100019]"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Thao tác phiếu thu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">

            {/* Print Actions */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="justify-start bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleAction(handlePrintReceipt)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In Phiếu Thu
                </Button>

                {receipt.status === 'draft' && handleGenerateQR && (
                  <Button
                    variant="outline"
                    className="justify-start text-primary border-primary hover:bg-primary/10"
                    onClick={() => handleAction(() => handleGenerateQR(receipt))}
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    Tạo mã QR
                  </Button>
                )}
              </div>
            </div>

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

export default MobileReceiptActions
