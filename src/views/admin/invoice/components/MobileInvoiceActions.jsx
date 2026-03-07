import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { IconPlus, IconFileTypePdf } from '@tabler/icons-react'
import { Pencil, Trash2, Printer, X } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import { Separator } from '@/components/ui/separator'

const MobileInvoiceActions = ({
  invoice,
  isDesktop,
  canDelete,
  onEdit,
  handleCreateReceipt,
  handleCreateWarehouseReceipt,
  handlePrintInvoice,
  handlePrintAgreement,
  handleDeleteInvoice,
  onCloseDialog,
}) => {
  const [open, setOpen] = useState(false)

  if (isDesktop || !invoice) return null

  const handleAction = (action) => {
    setOpen(false)
    action()
  }

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
            <SheetTitle>Thao tác đơn hàng</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            {/* Receipt & Warehouse Actions */}
            {(!['pending', 'draft', 'cancelled', 'delivered', 'rejected'].includes(invoice?.status) && invoice?.paymentStatus !== 'paid') && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 h-auto py-3 flex-col gap-1"
                  onClick={() => handleAction(handleCreateReceipt)}
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="text-xs">Tạo Phiếu Thu</span>
                </Button>
                {invoice?.status === 'accepted' && (
                  <Button
                    className="bg-orange-600 text-white hover:bg-orange-700 h-auto py-3 flex-col gap-1"
                    onClick={() => handleAction(handleCreateWarehouseReceipt)}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span className="text-xs">Tạo Phiếu Xuất Kho</span>
                  </Button>
                )}
              </div>
            )}

            <Separator />

            {/* Print Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">In ấn</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintInvoice)}
                >
                  <Printer className="h-4 w-4" />
                  In Hóa Đơn
                </Button>
                <Button
                  variant="outline"
                  className="justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintAgreement)}
                >
                  <IconFileTypePdf className="h-4 w-4" />
                  In Thỏa Thuận
                </Button>

              </div>
            </div>

            <Separator />

            {/* Edit/Delete Actions */}
            <div className="grid grid-cols-2 gap-3">
              {invoice.status === 'pending' && (
                <Button
                  className="bg-orange-600 text-white hover:bg-orange-700 w-full"
                  onClick={() => handleAction(onEdit)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
              )}

              {(canDelete && ['pending', 'rejected', 'cancelled'].includes(invoice.status)) && (
                <ConfirmActionButton
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa đơn bán này?"
                  confirmText="Xóa"
                  onConfirm={() => handleAction(handleDeleteInvoice)}
                  contentClassName="z-[100020]"
                  overlayClassName="z-[100019]"
                  confirmBtnVariant="destructive"
                >
                  <Button variant="destructive" className={invoice.status === 'pending' ? "w-full" : "w-full col-span-2"}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </ConfirmActionButton>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full justify-center gap-2 mt-2"
              onClick={() => {
                setOpen(false)
                onCloseDialog?.()
              }}
            >
              <X className="h-4 w-4" />
              Đóng
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobileInvoiceActions
