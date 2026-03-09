import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { IconPlus } from '@tabler/icons-react'
import { Pencil, Trash2, Printer, CreditCard, PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

const MobilePurchaseOrderActions = ({
  purchaseOrder,
  isDesktop,
  canDelete,
  onEdit,
  handleCreatePayment,
  handleCreateImport,
  handlePrintOrder,
  handleDeletePurchaseOrder,
}) => {
  const [open, setOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (isDesktop || !purchaseOrder) return null

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
            <SheetTitle>Thao tác đơn mua hàng</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            {/* Receipt & Warehouse Actions */}
            <div className="grid grid-cols-2 gap-3">
              {(!['draft', 'cancelled'].includes(purchaseOrder.status) && purchaseOrder.paymentStatus !== 'paid') && (
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 h-auto py-3 flex-col gap-1"
                  onClick={() => handleAction(handleCreatePayment)}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="text-xs">Tạo Phiếu Chi</span>
                </Button>
              )}

              {['ordered', 'partial'].includes(purchaseOrder.status) && (
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700 h-auto py-3 flex-col gap-1"
                  onClick={() => handleAction(handleCreateImport)}
                >
                  <PackagePlus className="h-5 w-5" />
                  <span className="text-xs">Tạo Phiếu Nhập Kho</span>
                </Button>
              )}
            </div>

            <Separator />

            {/* Print Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">In ấn</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start text-blue-600 border-blue-600 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintOrder)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In Đơn Hàng
                </Button>
              </div>
            </div>

            <Separator />

            {/* Edit/Delete Actions */}
            <div className="grid grid-cols-2 gap-3">
              {purchaseOrder.status === 'draft' && (
                <Button
                  className="bg-orange-600 text-white hover:bg-orange-700"
                  onClick={() => handleAction(onEdit)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
              )}

              {['draft', 'cancelled'].includes(purchaseOrder.status) && (
                <Button
                  variant="destructive"
                  className={purchaseOrder.status === 'draft' ? "w-full" : "w-full col-span-2"}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showDeleteConfirm && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="z-[100030]" overlayClassName="z-[100029]">
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>Bạn có chắc chắn muốn xóa đơn mua hàng này?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction(handleDeletePurchaseOrder)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default MobilePurchaseOrderActions
