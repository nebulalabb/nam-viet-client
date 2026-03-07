import React from 'react'

export default function ExportSaleAgreement({ data = {} }) {
  const LOGO_PATH = '/logo/logo-kim-dang.png'

  const vnd = (n) => {
    if (typeof n === 'number') {
      return n.toLocaleString('vi-VN')
    }
    return n || ''
  }

  const safe = (v, fallback = '…') => (v === 0 || v ? String(v) : fallback)

  const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return null
    return d
  }

  const formatDate = (value) => {
    const d = parseDate(value)
    if (!d) {
      return { day: '...', month: '...', year: '...' }
    }
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      year: String(d.getFullYear()),
    }
  }

  // ================== DEFAULT DATA ==================
  const defaultCompany = {
    address: '47 NGÔ VĂN SỞ, NINH KIỀU, CẦN THƠ',
    phone: '0984490249',
    logo: LOGO_PATH,
  }

  const defaultAgreement = {
    title: 'THỎA THUẬN MUA BÁN',
    code: 'MST: 1801755621',
    date: new Date().toISOString(),
  }

  const defaultCustomer = {
    name: '',
    phone: '',
  }

  const defaultItems = []

  const defaultTotal = {
    amount: 0,
  }

  const defaultNotes = [
    'Chúng tôi giao sản phẩm cho quý khách kèm đầy đủ giấy tờ bao gồm:',
    '+ Giấy giám định (đối với sản phẩm có kiểm định)',
    '+ Giấy đảm bảo (đối với tất cả sản phẩm)',
    'Quý khách vui lòng kiểm tra kỹ sản phẩm và các giấy tờ thỏa thuận trước khi rời khỏi cửa hàng.',
    'Chúng tôi sẽ không giải quyết bất kì trường hợp ngoại lệ nào xảy ra không được nêu trong điều kiện đảm bảo.',
    'Trang sức chúng tôi đã cân trọng lượng trước khi giao, chúng tôi không chịu trách nhiệm thu lại nếu quý khách chỉnh sửa nỉ chỗ khác.',
  ]

  // ================== MERGE PROP DATA ==================
  const company = { ...defaultCompany, ...(data?.company || {}) }
  const agreement = { ...defaultAgreement, ...(data?.agreement || {}) }
  const agreementDate = formatDate(agreement.date)
  const customer = { ...defaultCustomer, ...(data?.customer || {}) }
  const items = data?.items ?? defaultItems
  const total = { ...defaultTotal, ...(data?.total || {}) }
  const notes = data?.notes ?? defaultNotes
  const noteContent = data?.note || `Ngày ${agreementDate.day}/${agreementDate.month}/${agreementDate.year} .......... thỏ thanh trái ........... ............................... Hẹn ${agreementDate.day}/${agreementDate.month}/80 ng.ay`

  return (
    <div style={{
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '16px',
    }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'white',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          width: '210mm',
          height: '148mm',
          fontFamily: 'Times New Roman, Times, serif',
          overflow: 'hidden',
        }}
      >
        {/* HEADER - Nền đen */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#2C2E33',
          padding: '8px 24px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {company.logo ? (
              <img
                src={company.logo}
                alt="Logo"
                style={{
                  height: '40px',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div style={{
                display: 'flex',
                height: '64px',
                width: '64px',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg viewBox="0 0 50 50" style={{
                  height: '48px',
                  width: '48px',
                  fill: 'white'
                }}>
                  <polygon points="25,2 30,12 42,12 33,19 37,30 25,23 13,30 17,19 8,12 20,12" />
                </svg>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}>
              {safe(agreement.title)}
            </div>
          </div>

          <div style={{
            textAlign: 'right',
            fontSize: '14px'
          }}>
            {safe(agreement.code)}
          </div>
        </div>

        {/* BODY - Nền be nhạt - flex-1 để chiếm hết không gian còn lại */}
        <div style={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          backgroundColor: '#f3ecec',
          padding: '0px 24px 12px 24px'
        }}>
          <div className='paper'>
            {/* Tên khách hàng */}
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontWeight: '600' }}>Tên khách hàng:</span>{' '}
              <span style={{
                fontFamily: 'Times New Roman, Times, serif',
                fontSize: '18px',
                color: '#1d4ed8'
              }}>
                {safe(customer.name)}
              </span>
              {customer.phone && (
                <>
                  {' - '}
                  <span style={{
                    fontFamily: 'Times New Roman, Times, serif',
                    fontSize: '18px',
                    color: '#1d4ed8'
                  }}>
                    {safe(customer.phone)}
                  </span>
                </>
              )}
            </div>

            {/* BẢNG SẢN PHẨM - Chiều cao cố định cao hơn */}
            <div style={{
              marginBottom: '4px',
              height: '180px'
            }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid black',
                  fontSize: '14px',
                  height: '100%'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: 'white' }}>
                    <th style={{
                      border: '1px solid black',
                      padding: '6px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      MÓN HÀNG
                    </th>
                    <th style={{
                      border: '1px solid black',
                      padding: '6px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      CÂN NẶNG
                    </th>
                    <th style={{
                      border: '1px solid black',
                      padding: '6px 8px',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      THÀNH TIỀN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} style={{ backgroundColor: 'white' }}>
                      <td style={{
                        border: '1px solid black',
                        padding: '8px'
                      }}>
                        <div style={{
                          fontFamily: 'Times New Roman, Times, serif',
                          color: '#1d4ed8'
                        }}>
                          {safe(item.name)}
                        </div>
                        {item.purity && (
                          <div style={{
                            fontFamily: 'Times New Roman, Times, serif',
                            color: '#1d4ed8'
                          }}>
                            {item.purity}
                            {item.weight && <> - {item.weight}</>}
                          </div>
                        )}
                        {item.description && (
                          <div style={{
                            fontFamily: 'Times New Roman, Times, serif',
                            color: '#1d4ed8'
                          }}>
                            {safe(item.description)}
                          </div>
                        )}
                      </td>
                      <td style={{
                        fontFamily: 'Times New Roman, Times, serif',
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'center',
                        color: '#1d4ed8'
                      }}>
                        {safe(item.weightDetail)}
                      </td>
                      <td style={{
                        fontFamily: 'Times New Roman, Times, serif',
                        border: '1px solid black',
                        padding: '8px',
                        textAlign: 'right',
                        color: '#1d4ed8'
                      }}>
                        {vnd(item.total || 0)}
                      </td>
                    </tr>
                  ))}

                  {/* Total row */}
                  <tr style={{ backgroundColor: 'white' }}>
                    <td colSpan={2} style={{
                      border: '1px solid black',
                      padding: '8px',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }}>
                      TỔNG CỘNG:
                    </td>
                    <td style={{
                      fontFamily: 'Times New Roman, Times, serif',
                      border: '1px solid black',
                      padding: '8px',
                      textAlign: 'right',
                      fontWeight: 'bold',
                      color: '#1d4ed8'
                    }}>
                      {vnd(items.reduce((sum, item) => sum + (item.total || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* CHỮ KÝ */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginTop: '12px',
            }}>
              <div style={{ width: '50%' }}>
                <div style={{
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  GHI CHÚ
                </div>
                {noteContent.split('\n').map((line, idx) => (
                  <div key={idx} style={{
                    fontFamily: 'Times New Roman, Times, serif',
                    borderBottom: '1px dotted #9ca3af',
                    paddingBottom: '4px',
                    fontSize: '14px',
                    color: '#1d4ed8',
                    minHeight: '20px'
                  }}>
                    {safe(line)}
                  </div>
                ))}
              </div>

              <div style={{
                width: '50%',
                textAlign: 'center'
              }}>
                <div style={{
                  marginBottom: '4px',
                  fontWeight: 'bold'
                }}>
                  KHÁCH HÀNG
                </div>
                <div style={{
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}>
                  Ký xác nhận
                </div>

                {/* Khoảng trống cho chữ ký */}
                <div style={{ marginTop: '40px' }}></div>

                {/* Tên khách hàng */}
                <div style={{
                  fontFamily: 'Times New Roman, Times, serif',
                  color: '#1d4ed8',
                }}>
                  {safe(customer.name)}
                </div>
              </div>
            </div>

            {/* GHI CHÚ CUỐI */}
            <div style={{
              marginTop: '12px',
              fontSize: '10px',
              lineHeight: '1.625'
            }}>
              {notes.map((note, index) => (
                <div key={index} style={index === 0 ? { fontWeight: '600' } : {}}>
                  {note}
                </div>
              ))}
            </div>
            <div style={{
              width: '60px',
              height: '60px',
              position: 'absolute',
              left: '-30px',
              bottom: '-30px',
              transform: 'rotate(45deg)',
              backgroundColor: '#f3ecec',
              borderTop: '1px solid black',
            }}></div>

            <div style={{
              width: '60px',
              height: '60px',
              position: 'absolute',
              right: '-30px',
              bottom: '-30px',
              transform: 'rotate(-45deg)',
              backgroundColor: '#f3ecec',
              borderTop: '1px solid black',
            }}></div>
          </div>

          {/* FOOTER - Cùng màu với body (amber-50) - Sát dưới */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#f3ecec',
            padding: '4px 24px',
            fontSize: '12px',
            color: '#1f2937',
            marginTop: '12px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                style={{
                  height: '14px',
                  width: '14px',
                  display: 'block',
                }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span style={{ lineHeight: '14px', display: 'block' }}>{safe(company.address)}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg
                style={{
                  height: '14px',
                  width: '14px',
                  display: 'block',
                }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span style={{ lineHeight: '14px', display: 'block' }}>{safe(company.phone)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @page {
          size: A5 landscape;
          margin: 0;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .paper {
          position: relative;
          padding: 12px 35px 5px 35px;
          border: 1px solid black;
          border-top: none;
        }
      `}</style>
    </div >
  )
}