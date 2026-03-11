import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TrashIcon } from '@radix-ui/react-icons'

const PriceLogDialog = ({ product, showTrigger = true, ...props }) => {
  const { priceHistories } = product

  return (
    <Dialog {...props}>
      {showTrigger ? (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lịch sử giá: {product.productName || product.name}</DialogTitle>
          <DialogDescription>
            Dưới đây là lịch sử thay đổi giá của sản phẩm:{' '}
            <strong>{product.productName || product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          {priceHistories && priceHistories.length > 0 ? (
            <Accordion type="single" collapsible>
              {[...priceHistories]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((history, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{`${moneyFormat(history.newPrice)} - Ngày cập nhật: ${dateFormat(history.createdAt)}`}</AccordionTrigger>
                    <AccordionContent>
                      <div>
                        <span className="font-bold">Giá cũ: </span>
                        {moneyFormat(history.oldPrice)}
                      </div>
                      <div>
                        <span className="font-bold">Giá mới: </span>
                        {moneyFormat(history.newPrice)}
                      </div>
                      {history?.updater?.fullName && (
                        <div>
                          <span className="font-bold">Người cập nhật: </span>
                          {history.updater.fullName}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <div className="text-center text-sm text-gray-500 py-4">Chưa có lịch sử thay đổi giá nào.</div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button>Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PriceLogDialog
