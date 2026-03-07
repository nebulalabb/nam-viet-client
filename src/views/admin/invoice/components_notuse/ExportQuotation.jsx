import { moneyFormat } from '@/utils/money-format'
import React from 'react'

export default function ExportQuotation({ data = {} }) {
  const warrantyHtml = data?.warranty?.html || ''
  const LOGO_PATH = '/logo/logo_main_rmbg.png'
  const logoUrl = LOGO_PATH

  const vnd = (n) => (typeof n === 'number' ? moneyFormat(n) : n || '')

  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  const formatQuotationDate = (value) => {
    const d = parseDate(value)
    if (!d) {
      return { day: '...', month: '...', year: '...' }
    }

    return {
      day: String(d.getDate()),
      month: String(d.getMonth() + 1),
      year: String(d.getFullYear()),
    }
  }

  // ================== DEFAULT DATA ==================
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

  const defaultSmallLogos = {
    logo1: '/logo/logo_sumitomo.jpeg',
    logo2: '/logo/logo_hawker.png',
    logo3: '/logo/logo_gs_battery.png',
    logo4: '/logo/logo_forklfts.jpeg',
  }

  const defaultQuotation = {
    no: 'Q-2025-TNF',
    date: new Date().toISOString(),
    subtitle: 'Bảo dưỡng xe nâng/Sửa chữa xe nâng/Phụ tùng xe nâng',
  }

  const defaultCustomer = {
    name: 'Ban Giám đốc',
    unit: 'Công ty ABC',
    address: '...........',
    tel: '...........................',
  }

  const defaultTotals = {
    subtotal: 0,
    vatRate: 8,
    vatAmount: 0,
    grandTotal: 0,
  }

  // **DỮ LIỆU ĐỘNG CHO CÁC ĐOẠN MÀU ĐỎ**
  const defaultTermsData = {
    vatIncludedText: 'Giá trên đã bao gồm VAT',
    deliveryTimeText: '1-2 ngày',
    validityDaysText: '07 ngày',
    paymentMethodText: 'Hình thức thanh toán: Chuyển khoản',
    paymentDeadlineText:
      'Thanh toán 100% trong vòng 03 ngày sau khi xác nhận bàn giao & hóa đơn VAT',
    bank: [
      '*** Tên tài khoản: TNF VIỆT NAM TECH & TRADING CO.,LTD',
      '*** STK: 338888848888',
      '*** Ngân hàng Thương mại Cổ phần Đại Chúng Việt Nam (PVcomBank) – Chi Nhánh Cần Thơ.',
    ],
  }

  const defaultWarranty = {
    time: '...',
    conditions: [
      '*** Sản phẩm được bảo hành nếu còn trong thời hạn và có hóa đơn chứng từ hợp lệ. Bảo hành chỉ áp dụng cho lỗi kỹ thuật của nhà sản xuất. Không áp dụng bảo hành với hao mòn tự nhiên, hư hỏng do sử dụng sai cách.',
    ],
    contact: [
      '*** Nhà xưởng Cần Thơ: Cạnh 079,KV Yên Thạnh, P.Cái Răng, TP. Cần Thơ',
      '*** Hotline: 0796.99.65.65',
    ],
  }

  // ================== MERGE PROP DATA ==================
  const company = { ...defaultCompany, ...(data?.company || {}) }
  const smallLogos = { ...defaultSmallLogos, ...(data?.smallLogos || {}) }
  const quotation = { ...defaultQuotation, ...(data?.quotation || {}) }
  const quotationDate = formatQuotationDate(quotation.date)
  const customer = { ...defaultCustomer, ...(data?.customer || {}) }
  const items = data?.items ?? []
  const totals = { ...defaultTotals, ...(data?.totals || {}) }
  const amountText = data?.amountText ?? '...'

  const termsData = { ...defaultTermsData, ...(data?.terms || {}) }
  const warranty = { ...defaultWarranty, ...(data?.warranty || {}) }

  // ================== BUILD TERMS (JSX, CÓ MÀU ĐỎ) ==================
  const terms = {
    note: [
      // *** Giá trên đã bao gồm VAT (MÀU ĐỎ, ĐỘNG)
      <span key="note1">
        {'*** '}
        <span className="text-red-500">{safe(termsData.vatIncludedText)}</span>
      </span>,
      // *** Thời gian giao hàng/thực hiện: Từ 1-2 ngày (MÀU ĐỎ, ĐỘNG)
      <span key="note2">
        {'*** Thời gian giao hàng/thực hiện: Từ '}
        <span className="text-red-500">{safe(termsData.deliveryTimeText)}</span>
        {' kể từ ngày xác nhận báo giá'}
      </span>,
      // *** Báo giá có hiệu lực 07 ngày (MÀU ĐỎ, ĐỘNG)
      <span key="note3">
        {'*** Báo giá có hiệu lực '}
        <span className="text-red-500">{safe(termsData.validityDaysText)}</span>
        {' kể từ ngày báo giá'}
      </span>,
    ],
    payment: [
      // Hình thức thanh toán (text thường, nhưng động)
      `*** ${safe(termsData.paymentMethodText)}`,
      // Thanh toán 100% trong vòng ... (MÀU ĐỎ, ĐỘNG)
      <span key="pay2">
        {'*** '}
        <span className="text-red-500">
          {safe(termsData.paymentDeadlineText)}
        </span>
      </span>,
    ],
    bank: termsData.bank?.length ? termsData.bank : defaultTermsData.bank,
  }

  return (
    <div className="w-full">
      <div
        className="bg-white p-1 text-[11pt] shadow print:shadow-none"
        style={{
          width: 934,
          fontFamily: '"Times New Roman", Times, serif',
        }}
      >
        {/* HEADER CÔNG TY */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="mt-10 h-40 w-72 object-contain"
              />
            ) : (
              <div className="mt-10 h-40 w-64 rounded bg-gray-100" />
            )}
            <div className="leading-snug">
              <div className="relative -left-[50px] min-w-[610px] text-[13pt] font-semibold uppercase text-orange-400">
                {safe(company.name1, 'Tên công ty')}
              </div>
              <div className="relative -left-[50px] mt-[2pt] flex items-baseline justify-between gap-6 text-orange-400">
                <div className="text-[13pt] font-semibold uppercase">
                  {safe(company.name2, 'Tên tiếng Anh')}
                </div>
                <div className="text-[13pt] font-semibold uppercase">
                  {safe(company.branch, 'Chi nhánh')}
                </div>
              </div>
              <div className="mt-1 text-[13pt]">
                {safe(company.line1, '\u00A0')}
              </div>
              <div className="text-[13pt]">{safe(company.line2, '\u00A0')}</div>
              <div className="mt-1 text-[13pt]">
                Addr: {safe(company.addr, '\u00A0')}
              </div>
              <div className="flex justify-start space-x-24 text-[13pt]">
                <div>Web: {safe(company.web, '\u00A0')}</div>
                <div>Email: {safe(company.email, '\u00A0')}</div>
              </div>
              <div className="flex justify-start space-x-36 text-[13pt]">
                <div>Tel: {safe(company.tel, '\u00A0')}</div>
                <div className="ml-5">
                  Hotline: {safe(company.hotline, '\u00A0')}
                </div>
              </div>
            </div>
          </div>
          <div className="w-24" />
        </div>

        {/* LOGO NHỎ */}
        <div className="mt-3 flex items-center justify-around px-1">
          <img
            src={smallLogos.logo1}
            alt="Logo 1"
            className="max-h-10 object-contain"
          />
          <img
            src={smallLogos.logo2}
            alt="Logo 2"
            className="max-h-10 object-contain"
          />
          <img
            src={smallLogos.logo3}
            alt="Logo 3"
            className="max-h-16 object-contain"
          />
          <img
            src={smallLogos.logo4}
            alt="Logo 4"
            className="max-h-10 object-contain"
          />
        </div>

        {/* TITLE */}
        <div className="mt-0 text-center">
          <div className="text-[30pt] font-extrabold uppercase tracking-wide">
            Bảng báo giá
          </div>
          <div className="text-[15pt] font-semibold italic text-red-500">
            {safe(quotation.subtitle)}
          </div>
        </div>

        {/* THÔNG TIN KHÁCH HÀNG */}
        <div className="mx-8 mt-2 space-y-1 text-[15pt]">
          <p>
            &nbsp; &nbsp; <b>Số:</b> {safe(quotation.no)}
          </p>
          <p>
            &nbsp; &nbsp; <b>Kính gửi:</b> {safe(customer.name)}
          </p>
          <p>
            &nbsp; &nbsp; <b>Đơn vị:</b> {safe(customer.unit)}
          </p>
          <p>
            &nbsp; &nbsp; <b>Địa chỉ:</b> {safe(customer.address)}
          </p>
          <p>
            &nbsp; &nbsp; <b>Số điện thoại liên hệ:</b> {safe(customer.tel)}
          </p>
        </div>

        {/* GIỚI THIỆU */}
        <div className="mx-8 mt-3">
          <p className="text-[15pt]">
            <b>
              &nbsp; &nbsp; CÔNG TY TNHH THƯƠNG MẠI VÀ PHÁT TRIỂN CÔNG NGHỆ TNF
              VIỆT NAM
            </b>
          </p>
          <p className="text-[15pt]">
            <b>(TNF VIỆT NAM TECH & TRADING CO.,LTD)</b> là đơn vị chuyên cung
            cấp các sản phẩm XE NÂNG & PHỤ TÙNG chính hãng. Ngoài ra, Công ty
            chúng tôi còn là đơn vị nhận tư vấn KHO/ KỆ/ NHÀ MÁY & các sản phẩm
            THIẾT BỊ CÔNG NGHIỆP để tối ưu hóa chi phí đầu tư cho khách hàng.
          </p>
          <p className="text-[14pt]">
            &nbsp; &nbsp; Chân thành cảm ơn Quý khách đã quan tâm sản phẩm và
            dịch vụ của Công ty. Qua khảo sát tư vấn nhu cầu thực tế, chúng tôi
            xin gửi bảng giá đến Quý khách như sau:
          </p>
        </div>

        {/* BẢNG CHI TIẾT HÀNG HÓA */}
        <div className="mx-8 mt-4">
          <table className="w-full border-collapse border border-black text-[15pt]">
            <thead>
              <tr className="bg-blue-200 text-center font-bold">
                <td className="border border-black px-2 pb-3 text-center">
                  STT
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  Thông tin hóa đơn
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  Thông tin chi tiết
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  ĐVT
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  SL
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  Đơn giá
                </td>
                <td className="border border-black px-2 pb-3 text-center align-middle">
                  Thành tiền
                </td>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-black px-2 pb-3 text-center align-middle">
                    {safe(item.stt, index + 1)}
                  </td>
                  <td className="border border-black px-2 pb-3 align-middle">
                    {safe(item.description)}
                  </td>
                  <td className="whitespace-pre-wrap break-words border border-black px-2 pb-3 align-top">
                    {safe(item.details)}
                  </td>
                  <td className="border border-black px-2 pb-3 text-center align-middle">
                    {safe(item.unit)}
                  </td>
                  <td className="border border-black px-2 pb-3 text-center align-middle">
                    {safe(item.qty)}
                  </td>
                  <td className="border border-black px-2 pb-3 text-right align-middle">
                    {vnd(item.price)}
                  </td>
                  <td className="border border-black px-2 pb-3 text-right align-middle">
                    {vnd(item.total)}
                  </td>
                </tr>
              ))}

              {/* DÒNG TRỐNG */}
              {Array.from({ length: Math.max(0, 2 - items.length) }).map(
                (_, i) => (
                  <tr key={`empty-${i}`}>
                    <td className="border border-black px-2 pb-3 align-middle">
                      &nbsp;
                    </td>
                    <td className="border border-black px-2 pb-3 align-middle" />
                    <td className="border border-black px-2 pb-3 align-middle" />
                    <td className="border border-black px-2 pb-3 align-middle" />
                    <td className="border border-black px-2 pb-3 align-middle" />
                    <td className="border border-black px-2 pb-3 align-middle" />
                    <td className="border border-black px-2 pb-3 align-middle" />
                  </tr>
                ),
              )}
            </tbody>

            {/* TỔNG TIỀN */}
            <tfoot>
              <tr>
                <td
                  colSpan={5}
                  className="border border-black px-2 pb-3 text-right align-middle font-bold"
                >
                  Tổng cộng
                </td>
                <td
                  colSpan={2}
                  className="border border-black px-2 pb-3 text-right align-middle"
                >
                  {vnd(totals.subtotal)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={5}
                  className="border border-black px-2 pb-3 text-right align-middle font-bold"
                >
                  Thuế GTGT ({totals.vatRate}% VAT)
                </td>
                <td
                  colSpan={2}
                  className="border border-black px-2 pb-3 text-right align-middle"
                >
                  {vnd(totals.vatAmount)}
                </td>
              </tr>
              <tr>
                <td
                  colSpan={5}
                  className="border border-black px-2 pb-3 text-right align-middle font-bold"
                >
                  Tổng thanh toán
                </td>
                <td
                  colSpan={2}
                  className="border border-black px-2 pb-3 text-right align-middle font-bold"
                >
                  {vnd(totals.grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-2 text-center text-[15pt] italic text-red-500">
            (Bằng chữ: {safe(amountText, '...')})
          </div>
        </div>

        {/* ĐIỀU KHOẢN */}
        <div className="mx-8 mt-4 text-[13pt]">
          <TermsTable title="Ghi Chú" items={terms.note} />
          <TermsTable
            title="Hình thức và thời hạn thanh toán"
            items={terms.payment}
          />
          <TermsTable title="Thông tin thanh toán" items={terms.bank} />
          <TermsTable
            title="Thông tin Bảo hành và CSKH"
            items={[
              <div
                className="tiptap-preview mt-2 text-sm"
                dangerouslySetInnerHTML={{ __html: warrantyHtml }}
              />,
            ]}
          />
        </div>

        {/* CHỮ KÝ */}
        <div className="mx-8 mt-4 text-[15pt]">
          <p>
            &nbsp; &nbsp; Công ty rất hân hạnh được phục vụ và hợp tác với Quý
            khách.
          </p>
          <p>&nbsp; &nbsp; Trân trọng!</p>
        </div>
        <div className="mx-8 mt-4 text-right text-[15pt]">
          <p className="italic text-red-500">
            Cần Thơ, ngày {quotationDate.day} tháng {quotationDate.month} năm{' '}
            {quotationDate.year}
          </p>
          <div className="mr-8 mt-4 inline-block text-center">
            <p className="font-bold">Người báo giá</p>
            <p className="italic">(Ký, ghi rõ họ tên)</p>
            <div className="h-24" />
          </div>
        </div>
      </div>

      <style>{`
        @page { size: A4; margin: 12mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  )
}

// ============ TERMS TABLE COMPONENT ============
function TermsTable({ title, items, titleBg = 'bg-white' }) {
  return (
    <table className="avoid-split-table mb-[-1px] w-full border-collapse border border-black">
      <tbody>
        <tr className="border-bottom border border-black">
          <td className={`w-1/4 border border-black p-2 font-bold ${titleBg}`}>
            {title}
          </td>
          <td className="border border-black p-2">
            <ul className="pl-5">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

;<style>{`
  @page { size: A4; margin: 12mm; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .warranty-html p { margin: 0 0 6px 0; }
  .warranty-html ul, .warranty-html ol { margin: 0; padding-left: 18px; }
`}</style>
