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
import ExportQuotation from './ExportQuotation'
import WarrantyRichTextEditor from '../components/WarrantyRichTextEditor'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

const defaultTerms = {
  vatIncludedText: 'Giá trên đã bao gồm VAT',
  deliveryTimeText: '1-2 ngày',
  validityDaysText: '07 ngày',
  paymentMethodText: 'Hình thức thanh toán: Chuyển khoản',
  paymentDeadlineText:
    'Thanh toán 100% trong vòng 03 ngày sau khi xác nhận bàn giao & hóa đơn VAT',
}

const defaultWarranty = {
  html: `<p><strong><span style="color:#ef4444">*** Thời gian Bảo hành: ...</span></strong></p>
<p><strong>*** Điều kiện Bảo hành:</strong></p>
<p>*** Sản phẩm được bảo hành nếu còn trong thời hạn và có hóa đơn chứng từ hợp lệ. Bảo hành chỉ áp dụng cho lỗi kỹ thuật của nhà sản xuất. Không áp dụng bảo hành với hao mòn tự nhiên, hư hỏng do sử dụng sai cách.</p>
<p>*** Nhà xưởng Cần Thơ: Cạnh 079, KV Yên Thạnh, P.Cái Răng, TP. Cần Thơ</p>
<p><strong>*** Hotline: 0796.99.65.65</strong></p>`,
}

export default function QuotationPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
}) {
  const [formData, setFormData] = useState(initialData || {})

  useEffect(() => {
    if (!initialData) {
      setFormData({})
      return
    }

    const merged = {
      ...initialData,
      terms: {
        ...defaultTerms,
        ...(initialData.terms || {}),
      },
      warranty: {
        ...defaultWarranty,
        ...(initialData.warranty || {}),
      },
    }

    setFormData(merged)
  }, [initialData])

  if (!formData) return null

  const handleChange = (path, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev ?? {})
      let cur = clone
      const keys = path.split('.')
      keys.forEach((k, idx) => {
        if (idx === keys.length - 1) {
          cur[k] = value
        } else {
          cur[k] = cur[k] || {}
          cur = cur[k]
        }
      })
      return clone
    })
  }

  const handleItemChange = (index, key, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev ?? {})
      const items = Array.isArray(clone.items) ? clone.items : []
      if (!items[index]) return clone
      items[index] = { ...items[index], [key]: value }
      clone.items = items
      return clone
    })
  }

  const terms = formData.terms ?? {}
  const warranty = formData.warranty ?? {}
  const quotation = formData.quotation ?? {}
  const customer = formData.customer ?? {}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[80vw] gap-4">
        <DialogHeader>
          <DialogTitle>Xem trước & chỉnh sửa báo giá</DialogTitle>
        </DialogHeader>

        <div className="flex h-[80vh] gap-4 overflow-hidden">
          <div className="w-[30%] overflow-y-auto pr-2">
            <h3 className="mb-2 text-sm font-semibold">Thông tin chung</h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium">
                Tiêu đề phụ
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(quotation.subtitle)}
                  onChange={(e) =>
                    handleChange('quotation.subtitle', e.target.value)
                  }
                />
              </label>

              <label className="block text-xs font-medium">
                Số báo giá
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(quotation.no)}
                  onChange={(e) => handleChange('quotation.no', e.target.value)}
                />
              </label>
            </div>

            <h3 className="mb-2 mt-4 text-sm font-semibold">
              Thông tin khách hàng
            </h3>
            <div className="space-y-2">
              <label className="block text-xs font-medium">
                Kính gửi
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(customer.name)}
                  onChange={(e) =>
                    handleChange('customer.name', e.target.value)
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Đơn vị
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(customer.unit)}
                  onChange={(e) =>
                    handleChange('customer.unit', e.target.value)
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                Địa chỉ
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(customer.address)}
                  onChange={(e) =>
                    handleChange('customer.address', e.target.value)
                  }
                />
              </label>
              <label className="block text-xs font-medium">
                SĐT liên hệ
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(customer.tel)}
                  onChange={(e) => handleChange('customer.tel', e.target.value)}
                />
              </label>
            </div>

            <h3 className="mb-2 mt-4 text-sm font-semibold">
              Chi tiết từng dòng hàng hóa
            </h3>

            <div className="space-y-3">
              {(formData.items ?? []).map((it, idx) => (
                <div key={idx} className="rounded border bg-white p-2">
                  <div className="text-xs font-semibold">
                    {idx + 1}. {safe(it.description, '(Chưa có tên hàng)')}
                  </div>

                  <div className="mt-2">
                    <label className="block text-xs font-medium">
                      Thông tin chi tiết
                      <Textarea
                        className="mt-1 h-10 text-xs"
                        value={safe(it.details, '')}
                        onChange={(e) =>
                          handleItemChange(idx, 'details', e.target.value)
                        }
                        placeholder="Nhập thông tin chi tiết cho dòng này..."
                      />
                    </label>
                  </div>
                </div>
              ))}

              {!Array.isArray(formData.items) || formData.items.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  Không có dòng hàng hóa để chỉnh.
                </div>
              ) : null}
            </div>

            <h3 className="mb-2 mt-4 text-sm font-semibold">
              Điều khoản & ghi chú
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-blue-600">
                  Giá đã bao gồm VAT (màu đỏ)
                </label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(terms.vatIncludedText)}
                  onChange={(e) =>
                    handleChange('terms.vatIncludedText', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600">
                  Thời gian giao hàng/thực hiện (màu đỏ)
                </label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(terms.deliveryTimeText)}
                  onChange={(e) =>
                    handleChange('terms.deliveryTimeText', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600">
                  Hiệu lực báo giá (ví dụ: 07 ngày) (màu đỏ)
                </label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(terms.validityDaysText)}
                  onChange={(e) =>
                    handleChange('terms.validityDaysText', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600">
                  Hình thức thanh toán
                </label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={safe(terms.paymentMethodText)}
                  onChange={(e) =>
                    handleChange('terms.paymentMethodText', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-600">
                  Hạn thanh toán (màu đỏ)
                </label>
                <Textarea
                  className="mt-1 h-16 text-xs"
                  value={safe(terms.paymentDeadlineText)}
                  onChange={(e) =>
                    handleChange('terms.paymentDeadlineText', e.target.value)
                  }
                />
              </div>
            </div>

            <h3 className="mb-2 mt-4 text-sm font-semibold">
              Thông tin Bảo hành và CSKH
            </h3>

            <div className="space-y-2">
              <div>
                <div className="mt-1">
                  <WarrantyRichTextEditor
                    value={safe(warranty.html)}
                    onChange={(html) => handleChange('warranty.html', html)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
            <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
              <span>Xem trước</span>
              <span>(Nội dung như khi in/export PDF)</span>
            </div>
            <div className="overflow-auto border bg-white">
              <ExportQuotation data={formData} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm?.(formData)
            }}
          >
            Xác nhận & Xuất PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
