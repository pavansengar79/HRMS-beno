import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Buffer } from 'buffer'
// import './textLayerStyles.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { width } from '@mui/system'
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PdfViewer = ({ pdfBytes }) => {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pages, setPages] = useState(0)
  const s2ab = s => {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < s.length; i++) {
      view[i] = s.charCodeAt(i) & 0xff
    }
    return buf
  }
  const handlePDFLoadSuccess = ({ numPages }) => {
    setPages(numPages)
  }
  const renderPdfPages = pages => {
    let allPages = []
    console.log({ pages })
    for (let pgno = 1; pgno <= pages; pgno++) {
      allPages.push(
        <Page key={`page-${pgno}`} pageNumber={pgno} renderAnnotationLayer={false} renderTextLayer={false} />
      )
    }

    return allPages
  }

  return (
    <div sx={{ width: '100%' }}>
      {pdfBytes && (
        <Document file={pdfBytes} onLoadSuccess={handlePDFLoadSuccess}>
          {renderPdfPages(pages)}
        </Document>
      )}
    </div>
  )
}

export default PdfViewer
