import React from 'react'
import ReactDOM from 'react-dom/client'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import ExportReceipt from '../components/ExportReceipt'

export async function exportReceiptPdf(
  data,
  filename = 'receipt.pdf',
  scale = 2,
) {
  const container = document.createElement('div')
  Object.assign(container.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: '850px',
    background: '#fff',
    opacity: '1',
    pointerEvents: 'none',
    zIndex: '-1',
  })
  document.body.appendChild(container)

  const root = ReactDOM.createRoot(container)
  root.render(<ExportReceipt data={data} />)

  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r)),
  )

  const canvas = await html2canvas(container, {
    scale,
    useCORS: true,
    backgroundColor: '#ffffff',
  })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageW = pdf.internal.pageSize.getWidth()
  // const pageH = pdf.internal.pageSize.getHeight()
  const margin = 8
  const printableW = pageW - margin * 2

  const imgProps = pdf.getImageProperties(imgData)
  const imgW = printableW
  const imgH = (imgProps.height * imgW) / imgProps.width
  const startY = margin
  // const startY = Math.max((pageH - imgH) / 2, margin)

  pdf.addImage(imgData, 'PNG', margin, startY, imgW, imgH, undefined, 'FAST')
  pdf.save(filename)

  root.unmount()
  document.body.removeChild(container)
}
