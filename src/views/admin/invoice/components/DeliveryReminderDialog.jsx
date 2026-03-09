import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { moneyFormat } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'
import api from '@/utils/axios'
import { toast } from 'sonner'
import RichTextEditor from '@/components/custom/RichTextEditor'
import { Checkbox } from '@/components/ui/checkbox'

const DeliveryReminderDialog = ({ open, onOpenChange, selectedInvoices = [] }) => {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(false)

  // Filter only undelivered invoices
  const undeliveredInvoices = useMemo(
    () => selectedInvoices.filter((inv) => inv.status !== 'delivered' && inv.status !== 'paid'),
    [selectedInvoices],
  )

  // Initialize selected IDs
  useEffect(() => {
    if (!open) return
    setSelectedIds(undeliveredInvoices.map((inv) => inv.id))
  }, [open, undeliveredInvoices])

  // Generate default message
  useEffect(() => {
    if (!open || selectedIds.length === 0) return

    const firstInvoice = undeliveredInvoices.find((inv) => selectedIds.includes(inv.id))
    if (!firstInvoice) return

    const customerName = firstInvoice.customer?.name || 'Quý khách'
    const invoiceCode = firstInvoice.code || ''
    const deliveryDate = firstInvoice.salesContract?.deliveryDate
      ? dateFormat(firstInvoice.salesContract.deliveryDate)
      : 'sớm nhất'

    setSubject(`Thông báo giao hàng - ${invoiceCode}`)
    setContent(`
      <p>Kính gửi <b>${customerName}</b>,</p>
      <p>Chúng tôi xin thông báo về đơn hàng của Quý khách:</p>
      <ul>
        <li><b>Mã đơn hàng:</b> ${invoiceCode}</li>
        <li><b>Ngày dự kiến giao:</b> ${deliveryDate}</li>
      </ul>
      <p>Vui lòng chuẩn bị nhận hàng và mang theo CMND/CCCD.</p>
      <p>Nếu có thay đổi, xin vui lòng liên hệ với chúng tôi.</p>
      <p>Trân trọng.</p>
    `)
  }, [open, selectedIds, undeliveredInvoices])

  // Reset on close
  useEffect(() => {
    if (open) return
    setSubject('')
    setContent('')
    setSelectedIds([])
    setLoading(false)
  }, [open])

  const handleToggleInvoice = (invoiceId) => {
    setSelectedIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    )
  }

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một đơn hàng')
      return
    }

    setLoading(true)
    try {
      await api.post('/invoice/send-delivery-reminder', {
        invoiceIds: selectedIds,
        subject,
        content,
      })
      toast.success(`Đã gửi nhắc giao hàng cho ${selectedIds.length} đơn hàng`)
      onOpenChange(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Gửi nhắc hạn thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gửi nhắc giao hàng</DialogTitle>
        </DialogHeader>

        {undeliveredInvoices.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Không có đơn hàng chưa giao để nhắc hạn
          </div>
        ) : (
          <div className="space-y-4">
            {/* Invoice Selection */}
            <div className="space-y-2">
              <div className="text-sm font-medium">
                Chọn đơn hàng ({selectedIds.length}/{undeliveredInvoices.length})
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto rounded border p-3">
                {undeliveredInvoices.map((invoice) => {
                  const isSelected = selectedIds.includes(invoice.id)
                  const deliveryDate = invoice.salesContract?.deliveryDate
                  const isOverdue =
                    deliveryDate && new Date(deliveryDate) < new Date()

                  return (
                    <div
                      key={invoice.id}
                      className={`flex items-start gap-3 rounded border p-2 ${isSelected ? 'border-primary bg-primary/5' : ''
                        }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleInvoice(invoice.id)}
                      />

                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">
                            {invoice.code} - {invoice.customer?.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {moneyFormat(invoice.amount)}
                          </div>
                        </div>

                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>SĐT: {invoice.customer?.phone}</span>
                          <span>•</span>
                          <span
                            className={
                              isOverdue ? 'font-bold text-red-500' : ''
                            }
                          >
                            Giao:{' '}
                            {deliveryDate ? dateFormat(deliveryDate) : 'Chưa có hợp đồng'}
                          </span>
                          {isOverdue && (
                            <>
                              <span>•</span>
                              <span className="font-bold text-red-500">
                                Quá hạn
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email/SMS"
              />
            </div>

            {/* Content */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Nội dung</label>
              <RichTextEditor
                value={content}
                onChange={(html) => setContent(html)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            loading={loading}
            onClick={handleSend}
            disabled={selectedIds.length === 0 || loading}
          >
            Gửi nhắc hạn ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeliveryReminderDialog
