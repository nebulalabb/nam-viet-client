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
import { paymentStatus } from '../data'
const REMIND_ABLE_STATUS = 'pending'

const PaymentReminderDialog = ({ open, onOpenChange, receipt }) => {
  const payments = useMemo(
    () => (receipt?.payments || []).filter((p) => p?.status !== 'paid'),
    [receipt],
  )

  const paymentStatusMap = useMemo(() => {
    const map = Object.create(null)
    for (const s of paymentStatus || []) map[s.value] = s
    return map
  }, [])

  const getStatusMeta = (status) =>
    paymentStatusMap[status] || {
      label: String(status || ''),
      color: 'text-muted-foreground',
      value: status,
    }

  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [loading, setLoading] = useState(false)

  const pendingPayments = useMemo(
    () => payments.filter((p) => p?.status === REMIND_ABLE_STATUS),
    [payments],
  )

  const selectedPayment = useMemo(
    () => payments.find((p) => p?.id === selectedPaymentId),
    [payments, selectedPaymentId],
  )

  const canRemind = useMemo(() => {
    return !!selectedPayment && selectedPayment.status === REMIND_ABLE_STATUS
  }, [selectedPayment])

  useEffect(() => {
    if (!open) return
    if (selectedPaymentId) return
    if (pendingPayments.length > 0) setSelectedPaymentId(pendingPayments[0].id)
  }, [open, selectedPaymentId, pendingPayments])

  useEffect(() => {
    if (!open) return
    if (!selectedPayment) return
    if (!canRemind) return
    if (isDirty) return

    const customerName = receipt?.customer?.name || 'Quý khách'
    const amount = moneyFormat(selectedPayment.paymentAmount)
    const dueDate = selectedPayment.dueDate
      ? dateFormat(selectedPayment.dueDate)
      : 'Không có'
    const receiptCode = receipt?.code || ''

    setSubject(`Nhắc hạn thanh toán ${receiptCode}`)
    setContent(`
      <p>Kính gửi <b>${customerName}</b>,</p>
      <p>Chúng tôi xin nhắc anh/chị về khoản thanh toán đến hạn:</p>
      <ul>
        <li><b>Phiếu thu:</b> ${receiptCode}</li>
        <li><b>Số tiền:</b> ${amount}</li>
        <li><b>Hạn thanh toán:</b> ${dueDate}</li>
      </ul>
      <p>Vui lòng sắp xếp thanh toán đúng hạn.</p>
      <p>Nếu đã thanh toán, xin bỏ qua email này.</p>
      <p>Trân trọng.</p>
    `)
  }, [open, selectedPayment, canRemind, isDirty, receipt])

  useEffect(() => {
    if (!open) return
    if (!selectedPayment) return
    if (!canRemind) return
    setIsDirty(false)

    const customerName = receipt?.customer?.name || 'Quý khách'
    const amount = moneyFormat(selectedPayment.paymentAmount)
    const dueDate = selectedPayment.dueDate
      ? dateFormat(selectedPayment.dueDate)
      : 'Không có'
    const receiptCode = receipt?.code || ''

    setSubject(`Nhắc hạn thanh toán ${receiptCode}`)
    setContent(`
    <p>Kính gửi <b>${customerName}</b>,</p>
    <p>Chúng tôi xin nhắc anh/chị về khoản thanh toán đến hạn:</p>
    <ul>
      <li><b>Phiếu thu:</b> ${receiptCode}</li>
      <li><b>Số tiền:</b> ${amount}</li>
      <li><b>Hạn thanh toán:</b> ${dueDate}</li>
    </ul>
    <p>Vui lòng sắp xếp thanh toán đúng hạn.</p>
    <p>Nếu đã thanh toán, xin bỏ qua email này.</p>
    <p>Trân trọng.</p>
  `)
  }, [open, selectedPayment, canRemind, receipt])

  useEffect(() => {
    if (open) return
    setSelectedPaymentId(null)
    setSubject('')
    setContent('')
    setIsDirty(false)
    setLoading(false)
  }, [open])

  const handleSelectPayment = (id) => {
    const p = payments.find((x) => x?.id === id)
    if (!p) return
    if (p.status !== REMIND_ABLE_STATUS) return
    setSelectedPaymentId(id)
    setIsDirty(false)
  }

  const handleSend = async () => {
    if (!selectedPaymentId) return
    if (!canRemind) {
      toast.error('Chỉ có thể nhắc hạn với khoản thanh toán đang chờ (pending)')
      return
    }

    setLoading(true)
    try {
      await api.post(`/payment/${selectedPaymentId}/reminder`, {
        subject,
        content,
      })
      toast.success('Đã gửi nhắc hạn thanh toán')
      onOpenChange(false)
    } catch {
      toast.error('Gửi nhắc hạn thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nhắc hạn thanh toán</DialogTitle>
        </DialogHeader>

        {pendingPayments.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Không có khoản thanh toán đang chờ để nhắc hạn
          </div>
        ) : (
          <div className="space-y-4">
            {payments.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Chọn khoản thanh toán</div>

                <div className="space-y-2">
                  {payments.map((p) => {
                    const meta = getStatusMeta(p.status)
                    const disabled = p.status !== REMIND_ABLE_STATUS
                    const selected = selectedPaymentId === p.id

                    return (
                      <div
                        key={p.id}
                        onClick={() => !disabled && handleSelectPayment(p.id)}
                        className={[
                          'flex gap-3 rounded border p-2',
                          disabled
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer',
                          selected ? 'border-primary bg-primary/5' : '',
                        ].join(' ')}
                        aria-disabled={disabled}
                      >
                        <input
                          type="radio"
                          checked={selected}
                          disabled={disabled}
                          readOnly
                        />

                        <div className="flex-1 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              {p.code} – {moneyFormat(p.paymentAmount)}
                            </div>

                            <div
                              className={`text-xs font-medium ${meta.color}`}
                            >
                              {meta.label}
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Hạn:{' '}
                            {p.dueDate ? dateFormat(p.dueDate) : 'Không có'}
                            {disabled ? ' • Không thể nhắc' : ''}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium">Tiêu đề</label>
              <Input
                value={subject}
                disabled={!canRemind}
                onChange={(e) => {
                  setSubject(e.target.value)
                  setIsDirty(true)
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Nội dung</label>

              <div
                className={!canRemind ? 'pointer-events-none opacity-60' : ''}
              >
                <RichTextEditor
                  value={content}
                  onChange={(html) => {
                    setContent(html)
                    setIsDirty(true)
                  }}
                />
              </div>

              {!canRemind && (
                <div className="text-xs text-muted-foreground">
                  Chỉ có thể soạn nội dung khi khoản thanh toán ở trạng thái
                  “Đang chờ”.
                </div>
              )}
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
            disabled={!canRemind || loading}
          >
            Gửi nhắc hạn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PaymentReminderDialog
