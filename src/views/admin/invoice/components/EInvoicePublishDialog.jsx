import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/custom/Button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

export default function EInvoicePublishDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}) {
  const [form, setForm] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!initialData) return

    const { generalInvoiceInfo, buyerInfo, payments } = initialData

    setForm({
      buyerLegalName: safe(buyerInfo?.buyerLegalName),
      buyerTaxCode: safe(buyerInfo?.buyerTaxCode),
      buyerAddressLine: safe(buyerInfo?.buyerAddressLine),
      buyerPhoneNumber: safe(buyerInfo?.buyerPhoneNumber),
      buyerEmail: safe(buyerInfo?.buyerEmail),

      paymentMethodName: safe(
        payments?.[0]?.paymentMethodName || 'Chuyển khoản',
      ),

      cusGetInvoiceRight: !!generalInvoiceInfo?.cusGetInvoiceRight,
      paymentStatus: !!generalInvoiceInfo?.paymentStatus,

      note: '',
    })
  }, [initialData])

  if (!form) return null

  const { generalInvoiceInfo, sellerInfo, summarizeInfo } = initialData

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)

      const overridePayload = {
        generalInvoiceInfo: {
          ...initialData.generalInvoiceInfo,
          cusGetInvoiceRight: form.cusGetInvoiceRight,
          paymentStatus: form.paymentStatus,
        },
        buyerInfo: {
          ...initialData.buyerInfo,
          buyerLegalName: form.buyerLegalName,
          buyerTaxCode: form.buyerTaxCode,
          buyerAddressLine: form.buyerAddressLine,
          buyerPhoneNumber: form.buyerPhoneNumber,
          buyerEmail: form.buyerEmail,
        },
        payments: [
          {
            ...(initialData.payments?.[0] || {}),
            paymentMethodName: form.paymentMethodName,
          },
        ],
        note: form.note,
      }

      await onConfirm(overridePayload)
    } finally {
      setSubmitting(false)
    }
  }

  const formatMoney = (value) =>
    new Intl.NumberFormat('vi-VN').format(Number(value || 0))

  const formatDate = (ms) => {
    if (!ms) return ''
    const d = new Date(ms)
    return d.toLocaleDateString('vi-VN')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Phát hành hóa đơn điện tử</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-auto">
          {/* Thông tin hóa đơn gốc (read-only) */}
          <section className="rounded-md border p-3 text-sm">
            <h3 className="mb-2 font-semibold">Thông tin hóa đơn</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium">Mẫu/Ký hiệu: </span>
                <span>
                  {generalInvoiceInfo?.templateCode} /{' '}
                  {generalInvoiceInfo?.invoiceSeries}
                </span>
              </div>
              <div>
                <span className="font-medium">Ngày hóa đơn: </span>
                <span>{formatDate(generalInvoiceInfo?.invoiceIssuedDate)}</span>
              </div>
              <div>
                <span className="font-medium">Tiền trước thuế: </span>
                <span>
                  {formatMoney(summarizeInfo?.totalAmountWithoutTax)} đ
                </span>
              </div>
              <div>
                <span className="font-medium">Thuế: </span>
                <span>{formatMoney(summarizeInfo?.totalTaxAmount)} đ</span>
              </div>
              <div>
                <span className="font-medium">Tổng thanh toán: </span>
                <span>{formatMoney(summarizeInfo?.totalAmountWithTax)} đ</span>
              </div>
              <div>
                <span className="font-medium">Đơn vị bán: </span>
                <span>{sellerInfo?.sellerLegalName}</span>
              </div>
            </div>
          </section>

          {/* Thông tin người mua */}
          <section className="space-y-2 rounded-md border p-3 text-sm">
            <h3 className="mb-2 font-semibold">Thông tin người mua</h3>
            <Input
              placeholder="Tên đơn vị / người mua"
              value={form.buyerLegalName}
              onChange={(e) => handleChange('buyerLegalName', e.target.value)}
              className="h-8"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Mã số thuế"
                value={form.buyerTaxCode}
                onChange={(e) => handleChange('buyerTaxCode', e.target.value)}
                className="h-8"
              />
              <Input
                placeholder="Số điện thoại"
                value={form.buyerPhoneNumber}
                onChange={(e) =>
                  handleChange('buyerPhoneNumber', e.target.value)
                }
                className="h-8"
              />
            </div>
            <Input
              placeholder="Địa chỉ"
              value={form.buyerAddressLine}
              onChange={(e) => handleChange('buyerAddressLine', e.target.value)}
              className="h-8"
            />
            <Input
              placeholder="Email nhận hóa đơn"
              value={form.buyerEmail}
              onChange={(e) => handleChange('buyerEmail', e.target.value)}
              className="h-8"
            />
          </section>

          {/* Hình thức thanh toán + quyền lấy HĐ */}
          <section className="space-y-3 rounded-md border p-3 text-sm">
            <h3 className="mb-2 font-semibold">
              Hình thức thanh toán và tùy chọn
            </h3>

            <Input
              placeholder="Hình thức thanh toán (vd: Chuyển khoản, Tiền mặt)"
              value={form.paymentMethodName}
              onChange={(e) =>
                handleChange('paymentMethodName', e.target.value)
              }
              className="h-8"
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cusGetInvoiceRight"
                checked={form.cusGetInvoiceRight}
                onCheckedChange={(checked) =>
                  handleChange('cusGetInvoiceRight', !!checked)
                }
              />
              <Label htmlFor="cusGetInvoiceRight">
                Khách hàng có lấy hóa đơn
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentStatus"
                checked={form.paymentStatus}
                onCheckedChange={(checked) =>
                  handleChange('paymentStatus', !!checked)
                }
              />
              <Label htmlFor="paymentStatus">Đã thanh toán</Label>
            </div>

            <Textarea
              placeholder="Ghi chú thêm (nếu có)"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
              className="min-h-[60px]"
            />
          </section>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            Xác nhận phát hành
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
