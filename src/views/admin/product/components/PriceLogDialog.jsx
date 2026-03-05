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
  const { prices } = product

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
          <DialogTitle>Lịch sử giá: {product.name}</DialogTitle>
          <DialogDescription>
            Dưới đây là lịch sử thay đổi giá của sản phẩm:{' '}
            <strong>{product.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <Accordion type="single" collapsible>
            {(prices || [])
              .slice()
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((price, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{`${moneyFormat(price.price)} - Ngày ${dateFormat(price.createdAt)}`}</AccordionTrigger>
                  <AccordionContent>
                    {price.supplier && (
                      <div>
                        <span className="font-bold">Nhà cung cấp:</span>{' '}
                        {price?.supplier?.name}
                        {price?.supplier?.phone
                          ? ` - SĐT: ${price?.supplier?.phone}`
                          : ''}
                      </div>
                    )}
                    {price.unit && (
                      <div>
                        <span className="font-bold">Đơn vị tính: </span>
                        {price?.unit?.name}
                      </div>
                    )}
                    {price.taxes.length > 0 && (
                      <>
                        <p className="font-bold">
                          Danh sách các loại thuế áp dụng:
                        </p>
                        <ol className="list-decimal pl-5">
                          {price.taxes.map((tax) => (
                            <li key={tax.id}>
                              {tax.title}: {tax.percentage}%
                            </li>
                          ))}
                        </ol>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
          </Accordion>
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
