import React, { useMemo } from 'react'

export default function ExportReceipt({ data = {} }) {
  const LOGO_PATH = '/logo/logo_main_rmbg.png'
  const logoUrl = LOGO_PATH

  const vnd = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
      : n || ''

  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const defaultCompany = {
    name1: 'CÔNG TY TNHH THƯƠNG MẠI VÀ PHÁT TRIỂN CÔNG NGHỆ VIỆT NAM',
    name2: 'TNF VIỆT NAM TECH & TRADING CO.,LTD',
    branch: 'XE NÂNG MIỀN TÂY',
    line1: 'Đại lý phân phối xe nâng hàng NHẬT BẢN tại Việt Nam',
    line2: 'Đại lý bình điện "CHÍNH HÃNG" tại Việt Nam',
    addr: 'Cạnh 079, Khu vực Yên Thạnh, Phường Cái Răng, Thành phố Cần Thơ',
    web: 'xenangmientay.vn',
    email: 'info@xenangmientay.vn',
    tel: '0788 888 407',
    hotline: '0788 83 65 65 - 0932 999 299',
  }
  const defaultReceipt = {
    prefix: 'TNF/PT',
    no: '0001',
    date: new Date().toISOString(),
  }
  const defaultPayer = {
    name: 'Nguyễn Văn A',
    address: '123 Đường ABC, Quận 1, TP.HCM',
  }

  const company = { ...defaultCompany, ...(data?.company || {}) }
  const receipt = { ...defaultReceipt, ...(data?.receipt || {}) }
  const payer = { ...defaultPayer, ...(data?.payer || {}) }
  const reason = data?.reason ?? 'Thanh toán đơn hàng #INV-2025-001'
  const amount = data?.amount ?? 1000000
  const amountText = data?.amountText ?? 'Một triệu đồng chẵn'
  const attachedDocs = data?.attachedDocs ?? '01 Hóa đơn GTGT'

  const dateParts = useMemo(() => {
    const d = new Date(receipt?.date || Date.now())
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return { dd, mm, yyyy }
  }, [receipt?.date])

  return (
    <div className="w-full">
      {/* A4 page */}
      <div
        className="bg-white p-1 text-[11pt] shadow print:shadow-none"
        style={{
          width: 934,
          fontFamily: '"Times New Roman", Times, serif',
        }}
      >
        {/* Header (logo + thông tin công ty) */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="mt-10 h-40 w-64 object-contain"
              />
            ) : (
              <div className="mt-10 h-40 w-64 rounded bg-gray-100" />
            )}

            {/* ===== Khối tiêu đề công ty: dịch trái bằng position:relative ===== */}
            <div className="leading-snug">
              <div className="relative -left-[50px] min-w-[560px] text-[12pt] font-semibold uppercase">
                {safe(company.name1, 'Tên công ty')}
              </div>

              <div className="relative -left-[50px] mt-[2pt] flex  items-baseline justify-between gap-6">
                <div className="text-[12pt] font-semibold uppercase">
                  {safe(company.name2, 'Tên tiếng Anh')}
                </div>
                <div className="text-[12pt] font-semibold uppercase">
                  {safe(company.branch, 'Chi nhánh')}
                </div>
              </div>

              {/* Các dòng mô tả giữ nguyên, không dịch trái */}
              <div className="mt-1 text-[12pt]">
                {safe(company.line1, '\u00A0')}
              </div>
              <div className="text-[12pt]">{safe(company.line2, '\u00A0')}</div>
              <div className="mt-1 text-[12pt]">
                Addr: {safe(company.addr, '\u00A0')}
              </div>

              <div className="flex justify-start space-x-24 text-[12pt]">
                <div>Web: {safe(company.web, '\u00A0')}</div>
                <div>Email: {safe(company.email, '\u00A0')}</div>
              </div>

              <div className="flex justify-start space-x-36 text-[12pt]">
                <div>Tel: {safe(company.tel, '\u00A0')}</div>
                <div className="ml-5">
                  Hotline: {safe(company.hotline, '\u00A0')}
                </div>
              </div>
            </div>
            {/* ===== end khối tiêu đề công ty ===== */}
          </div>

          <div className="w-24" />
        </div>

        {/* Tiêu đề trung tâm (tách riêng) */}
        <div className="mt-3 text-center">
          <div className="text-[16pt] font-extrabold uppercase tracking-wide">
            Phiếu thu
          </div>
          <div className="mt-1 text-[13pt] font-extrabold italic">
            Số: {safe(receipt.no)}/TNF/{safe(receipt.prefix, 'PT')} – Ngày{' '}
            {dateParts.dd} tháng
            {dateParts.mm} năm {dateParts.yyyy}
          </div>
        </div>

        {/* Body (13pt) */}
        <div className="ml-28 mt-6 space-y-3 text-[13pt]">
          <Row label="Họ và tên:" value={safe(payer.name)} />
          <Row label="Địa chỉ:" value={safe(payer.address)} />
          <Row label="Lý do nộp:" value={safe(reason)} />
          <Row label="Số tiền:" value={vnd(amount)} />
          <Row label="Bằng chữ:" value={safe(amountText)} />
          <Row
            label="Chứng từ số:"
            value={safe(receipt.no)}
            tail={
              <span className="ml-12">
                <b>Kèm theo:</b> {safe(attachedDocs)}
              </span>
            }
          />
        </div>

        {/* Footer signatures */}
        <div className="ml-12 mt-12 grid max-w-3xl grid-cols-3 gap-0 text-center text-[13pt]">
          <Sig title="GIÁM ĐỐC" />
          <Sig title="KẾ TOÁN" />
          <Sig title="NGƯỜI NỘP TIỀN" />
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

function Row({ label, value, tail }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="min-w-[90px] font-semibold">{label}</div>
      <div className="relative -mt-[2px] flex-1">
        {/* Dotted leader */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dotted" />
        {/* Text overlay */}
        <span className="relative z-10 bg-white px-1">{value}</span>
        {tail ? (
          <span className="relative z-10 bg-white px-1">{tail}</span>
        ) : null}
      </div>
    </div>
  )
}

function Sig({ title }) {
  return (
    <div>
      <div className="font-semibold uppercase">{title}</div>
      <div className="mt-1 text-[12pt] italic">(Ký, ghi rõ họ tên)</div>
      <div className="h-24" />
    </div>
  )
}
