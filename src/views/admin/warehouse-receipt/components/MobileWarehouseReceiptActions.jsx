import React, { useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { PlusIcon } from '@radix-ui/react-icons'
import { Trash, Printer, FileSpreadsheet, X, Save, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import ConfirmActionButton from '@/components/custom/ConfirmActionButton'
import { Separator } from '@/components/ui/separator'

const MobileWarehouseReceiptActions = ({
  receipt,
  isDesktop,
  canDelete,
  onEdit,
  handlePrintWarehouseReceipt,
  handleExportToExcel,
  handleUpdateStatus,
  handleDeleteReceipt,
  onCloseParent,
  onSave,
}) => {
  const [open, setOpen] = useState(false)

  if (isDesktop || !receipt) return null

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
          className="!z-[100050] px-4 pb-6 pt-4 rounded-t-xl max-h-[80vh] overflow-y-auto"
          overlayClassName="!z-[100049]"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Thao tác phiếu kho</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3">
            {/* Save & Edit Actions */}
            <div className={receipt.status === 'draft' ? (onSave ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3") : "hidden"}>
              {receipt.status === 'draft' && onSave && (
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 h-auto py-3 gap-1 flex"
                  onClick={() => handleAction(onSave)}
                >
                  <Save className="h-5 w-5" />
                  <span className="text-xs">Lưu</span>
                </Button>
              )}
              {receipt.status === 'draft' && (
                <Button
                  className="bg-orange-600 text-white hover:bg-orange-700 h-auto py-3 gap-1 flex"
                  onClick={() => handleAction(onEdit)}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="text-xs">Sửa</span>
                </Button>
              )}
            </div>
            {receipt.status === 'draft' && <Separator />}

            {/* Print & Export Actions */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">In ấn & Xuất</div>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  variant="outline"
                  className="justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => handleAction(handlePrintWarehouseReceipt)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  In Phiếu
                </Button>
                <Button
                  variant="outline"
                  className="justify-start text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => handleAction(handleExportToExcel)}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Xuất Excel
                </Button>
              </div>
            </div>

            <Separator />

            {/* Delete & Close Actions */}
            <div className={['draft', 'cancelled'].includes(receipt?.status) ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
              {['draft', 'cancelled'].includes(receipt?.status) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    // Show confirmation
                    setOpen(false)
                    setTimeout(() => {
                      if (confirm('Bạn có chắc chắn muốn xóa phiếu kho này?')) {
                        handleDeleteReceipt()
                      }
                    }, 100)
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  onCloseParent?.()
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Đóng
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default MobileWarehouseReceiptActions
