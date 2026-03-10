import * as XLSX from 'xlsx'

const s2ab = s => {
  const buf = new ArrayBuffer(s.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xff
  }

  return buf
}

export const exportExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] }

  const wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'binary'
  })
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = fileName + '.xlsx'
  link.click()
}

export default exportExcel
