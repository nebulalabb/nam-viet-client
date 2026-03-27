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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { cn } from '@/lib/utils'
import ExportAgreement from './ExportAgreement'

const safe = (v, fallback = '') => (v === 0 || v ? String(v) : fallback)

const defaultNotes = [
  'Chúng tôi giao sản phẩm cho quý khách kèm đầy đủ giấy tờ bao gồm:',
  '+ Giấy giám định (đối với sản phẩm có kiểm định)',
  '+ Giấy đảm bảo (đối với tất cả sản phẩm)',
  'Quý khách vui lòng kiểm tra kỹ sản phẩm và các giấy tờ thỏa thuận trước khi rời khỏi cửa hàng.',
  'Chúng tôi sẽ không giải quyết bất kì trường hợp ngoại lệ nào xảy ra không được nêu trong điều kiện đảm bảo.',
  'Trang sức chúng tôi đã cân trọng lượng trước khi giao, chúng tôi không chịu trách nhiệm thu lại nếu quý khách chỉnh sửa nỉ chỗ khác.',
]

export default function AgreementPreviewDialog({
  open,
  onOpenChange,
  initialData,
  onConfirm,
  contentClassName,
  overlayClassName,
  ...props
}) {
  const [formData, setFormData] = useState(initialData || {})
  const [isExporting, setIsExporting] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleExportImage = async (format = 'png') => {
    setIsExporting(true)
    try {
      const filename = `thoa_thuan_${Date.now()}.${format}`
      const options = format === 'jpeg'
        ? { format: 'jpeg', quality: 0.9, scale: 2 }
        : { format: 'png', scale: 3 }

      const element = document.getElementById(isMobile ? 'agreement-preview-node-mobile' : 'agreement-preview-node')
      if (!element) throw new Error('Không tìm thấy nội dung để xuất')

      // await exportDomToImage(element, filename, options)
    } catch (error) {
      console.error(error)
      alert('Xuất thất bại: ' + error.message)
    } finally {
      setIsExporting(false)
    }
  }



  useEffect(() => {
    if (!initialData) {
      setFormData({})
      return
    }

    const merged = {
      ...initialData,
      agreement: {
        ...initialData.agreement,
        code: initialData.agreement?.code || '1801755621',
      },
      notes: initialData.notes || defaultNotes,
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

  const handleNoteChange = (index, value) => {
    setFormData((prev) => {
      const clone = structuredClone(prev ?? {})
      const notes = Array.isArray(clone.notes) ? clone.notes : []
      notes[index] = value
      clone.notes = notes
      return clone
    })
  }

  const agreement = formData.agreement ?? {}
  const customer = formData.customer ?? {}
  const items = formData.items ?? []
  const notes = formData.notes ?? []

  // Form fields JSX (not a function component to avoid re-creation on render)
  const formFieldsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-semibold">Thông tin thỏa thuận</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Tiêu đề
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(agreement.title)}
              onChange={(e) =>
                handleChange('agreement.title', e.target.value)
              }
            />
          </label>

          <label className="block text-xs font-medium">
            Mã số (MST)
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(agreement.code)}
              onChange={(e) => handleChange('agreement.code', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Thông tin khách hàng
        </h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Tên khách hàng
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.name)}
              onChange={(e) =>
                handleChange('customer.name', e.target.value)
              }
            />
          </label>
          <label className="block text-xs font-medium">
            Số điện thoại
            <Input
              className="mt-1 h-8 text-xs"
              value={safe(customer.phone)}
              onChange={(e) =>
                handleChange('customer.phone', e.target.value)
              }
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">
          Chi tiết sản phẩm
        </h3>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="rounded border bg-white p-2">
              <div className="text-xs font-semibold mb-2">
                Sản phẩm {idx + 1}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-medium">
                  Tên món hàng
                  <Input
                    className="mt-1 h-8 text-xs"
                    value={safe(item.name, '')}
                    onChange={(e) =>
                      handleItemChange(idx, 'name', e.target.value)
                    }
                  />
                </label>

                <label className="block text-xs font-medium">
                  Cân nặng (hiển thị trong bảng)
                  <Input
                    className="mt-1 h-8 text-xs"
                    value={safe(item.weightDetail, '')}
                    onChange={(e) =>
                      handleItemChange(idx, 'weightDetail', e.target.value)
                    }
                    placeholder="Ví dụ: 1 Lượng (Cây) x 76,000,000"
                  />
                </label>

                <label className="block text-xs font-medium">
                  Thành tiền
                  <Input
                    className="mt-1 h-8 text-xs"
                    type="number"
                    value={safe(item.total, '')}
                    onChange={(e) =>
                      handleItemChange(idx, 'total', Number(e.target.value))
                    }
                    placeholder="Ví dụ: 76000000"
                  />
                </label>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-xs text-muted-foreground">
              Không có sản phẩm
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Ghi chú (Phần chữ ký)</h3>
        <div className="space-y-2">
          <label className="block text-xs font-medium">
            Nội dung ghi chú
            <Textarea
              className="mt-1 h-20 text-xs"
              value={safe(formData.note, '')}
              onChange={(e) =>
                handleChange('note', e.target.value)
              }
              placeholder="Ngày 24/01/2026 .......... thỏ thanh trái ...&#10;............................... Hẹn 24/01/80 ng.ay"
            />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold">Ghi chú (Điều khoản cuối)</h3>
        <div className="space-y-2">
          {notes.map((note, idx) => (
            <label key={idx} className="block text-xs font-medium">
              Dòng {idx + 1}
              <Textarea
                className="mt-1 h-12 text-xs"
                value={safe(note, '')}
                onChange={(e) =>
                  handleNoteChange(idx, e.target.value)
                }
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // Preview content JSX (not a function component to avoid re-creation on render)
  const previewContent = (
    <div className="flex-1 overflow-auto rounded border bg-muted/40 p-2">
      <div className="flex items-center justify-between pb-2 text-xs text-muted-foreground">
        <span>Xem trước</span>
        <span className="hidden md:inline">(Nội dung như khi in/export PDF)</span>
      </div>
      <div className={isMobile
        ? "overflow-x-auto overflow-y-auto border bg-white max-w-full"
        : "overflow-auto border bg-white"
      }>
        <div id="agreement-preview-node" style={isMobile ? {
          transform: 'scale(0.45)',
          transformOrigin: 'top left',
          minWidth: '210mm',
        } : {}}>
          <ExportAgreement data={formData} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className={cn(
          isMobile
            ? "max-w-full w-full h-[100dvh] inset-0 p-0 gap-0 flex flex-col top-0 left-0 right-0 m-0 rounded-none translate-x-0 translate-y-0 z-[10000]"
            : "max-w-[80vw] gap-4",
          contentClassName
        )}
        overlayClassName={overlayClassName}
        {...props}
      >
        {/* Mobile: Complete custom layout */}
        {isMobile ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b">
              <DialogTitle className="text-base">
                Xem trước & chỉnh sửa thỏa thuận mua bán
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="preview" className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-2 shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Chỉnh sửa</TabsTrigger>
                  <TabsTrigger value="preview">Xem trước</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="edit" className="flex-1 overflow-y-auto px-4 mt-0 data-[state=inactive]:hidden">
                {formFieldsContent}
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden">
                <div className="h-full overflow-auto">
                  <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
                    <span>Xem trước</span>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto border-t bg-white">
                    <div id="agreement-preview-node-mobile" style={{
                      transform: 'scale(0.45)',
                      transformOrigin: 'top left',
                      minWidth: '210mm',
                    }}>
                      <ExportAgreement data={formData} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="px-4 py-3 pb-12 shrink-0 flex flex-col gap-2 border-t bg-background">
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isExporting}
                >
                  Hủy
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onConfirm?.(formData)
                  }}
                  className="flex-1"
                  disabled={isExporting}
                >
                  Xuất PDF
                </Button>
              </div>
            </DialogFooter>
          </>
        ) : (
          /* Desktop: Side-by-side layout */
          <>
            <DialogHeader>
              <DialogTitle>
                Xem trước & chỉnh sửa thỏa thuận mua bán
              </DialogTitle>
            </DialogHeader>

            <div className="flex h-[80vh] gap-4 overflow-hidden">
              <div className="w-[30%] overflow-y-auto pr-2">
                {formFieldsContent}
              </div>
              {previewContent}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isExporting}
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onConfirm?.(formData)
                }}
                disabled={isExporting}
              >
                Xuất PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
