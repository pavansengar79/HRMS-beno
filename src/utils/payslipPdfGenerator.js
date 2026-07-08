// src/utils/payslipPdfGenerator.js
// Professional Payslip PDF Generator using jsPDF
import jsPDF from 'jspdf'

// ─── Colors ────────────────────────────────────────────────────────────────────
const COLORS = {
  primary: '#6366f1',
  secondary: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: '#94a3b8',
  border: '#e2e8f0',
  bgLight: '#f8fafc'
}

// ─── Format Helpers ────────────────────────────────────────────────────────────
const fmt = n => n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// ─── Main Generator ────────────────────────────────────────────────────────────
export function generatePayslipPdf(payslip, company = {}) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let y = 15

  // ── Header ────────────────────────────────────────────────────────────────────
  // Company Name
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text(company.brand_name || company.company_name || 'Company Name', margin, y)
  y += 8

  // Company Address (if available)
  if (company.company_email || company.company_phone) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.secondary)
    if (company.company_email) {
      doc.text(company.company_email, margin, y)
      y += 4
    }
    if (company.company_phone) {
      doc.text(company.company_phone, margin, y)
      y += 6
    }
  } else {
    y += 2
  }

  // Payslip Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.secondary)
  doc.text('PAYSLIP', pageWidth - margin, 15, { align: 'right' })
  
  // Month & Year
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const monthName = MONTHS[(payslip.month || 1) - 1]
  doc.text(`${monthName} ${payslip.year}`, pageWidth - margin, 22, { align: 'right' })

  // Divider
  y += 4
  doc.setDrawColor(COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ── Employee Info ────────────────────────────────────────────────────────────
  const employee = payslip.employee_id || payslip.employeeId || payslip
  doc.setFontSize(10)
  doc.setTextColor(COLORS.secondary)

  const leftInfo = [
    ['Employee ID:', employee.employeeId || payslip.employee_code || '—'],
    ['Employee Name:', employee.name || payslip.employee_name || '—'],
    ['Department:', payslip.department || employee.departmentId?.name || '—']
  ]

  const rightInfo = [
    ['Designation:', payslip.designation || employee.designationId?.name || '—'],
    ['Pay Period:', `${monthName} ${payslip.year}`],
    ['Payment Date:', fmtDate(payslip.approvedAt || payslip.paidAt || new Date())]
  ]

  // Left column
  let tempY = y
  leftInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, tempY)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 35, tempY)
    tempY += 5
  })

  // Right column
  tempY = y
  rightInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, pageWidth - margin - 60, tempY)
    doc.setFont('helvetica', 'normal')
    doc.text(value, pageWidth - margin, tempY, { align: 'right' })
    tempY += 5
  })

  y = Math.max(y + 18, tempY + 3)

  // ── Earnings & Deductions Table ──────────────────────────────────────────────
  const boxWidth = (pageWidth - margin * 2 - 5) / 2
  const boxHeight = 65
  
  // Earnings Box
  doc.setFillColor(COLORS.bgLight)
  doc.roundedRect(margin, y, boxWidth, boxHeight, 3, 3, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('EARNINGS', margin + 5, y + 7)

  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary)
  let earningsY = y + 14
  const earnings = payslip.earnings || {}
  Object.entries(earnings).forEach(([key, value]) => {
    if (key === 'totalEarnings' || !value) return
    const label = key.replace(/([A-Z])/g, ' $1').trim()
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + 5, earningsY)
    doc.setFont('helvetica', 'bold')
    doc.text(fmt(value), margin + boxWidth - 5, earningsY, { align: 'right' })
    earningsY += 5
  })

  // Total Earnings
  earningsY += 3
  doc.setDrawColor(COLORS.border)
  doc.line(margin + 5, earningsY - 3, margin + boxWidth - 5, earningsY - 3)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Earnings', margin + 5, earningsY)
  doc.setTextColor(COLORS.success)
  doc.text(fmt(earnings.totalEarnings || payslip.grossSalary || 0), margin + boxWidth - 5, earningsY, { align: 'right' })

  // Deductions Box
  doc.setFillColor(COLORS.bgLight)
  doc.roundedRect(margin + boxWidth + 5, y, boxWidth, boxHeight, 3, 3, 'F')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text('DEDUCTIONS', margin + boxWidth + 10, y + 7)

  doc.setFontSize(9)
  doc.setTextColor(COLORS.secondary)
  let dedY = y + 14
  const deductions = payslip.deductions || {}
  Object.entries(deductions).forEach(([key, value]) => {
    if (key === 'totalDeductions' || !value) return
    const label = key.replace(/([A-Z])/g, ' $1').trim()
    doc.setFont('helvetica', 'normal')
    doc.text(label, margin + boxWidth + 10, dedY)
    doc.setFont('helvetica', 'bold')
    doc.text(fmt(value), margin + boxWidth * 2 + 5, dedY, { align: 'right' })
    dedY += 5
  })

  // Total Deductions
  dedY += 3
  doc.setDrawColor(COLORS.border)
  doc.line(margin + boxWidth + 10, dedY - 3, margin + boxWidth * 2 + 5, dedY - 3)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Deductions', margin + boxWidth + 10, dedY)
  doc.setTextColor(COLORS.error)
  doc.text(fmt(deductions.totalDeductions || 0), margin + boxWidth * 2 + 5, dedY, { align: 'right' })

  y += boxHeight + 10

  // ── Working Days Summary ──────────────────────────────────────────────────────
  doc.setFontSize(10)
  doc.setTextColor(COLORS.secondary)
  
  const summaryItems = [
    ['Total Working Days:', String(payslip.totalWorkingDays || 26)],
    ['Days Present:', String(payslip.daysPresent || 26)],
    ['LOP Days:', String(payslip.lopDays || 0)],
    ['Overtime Hours:', String(payslip.overtimeHours || 0) + 'h']
  ]

  let summaryX = margin
  summaryItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, summaryX, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, summaryX + 30, y)
    summaryX += 45
  })
  y += 10

  // ── Tax Breakdown (if available) ──────────────────────────────────────────────
  if (payslip.taxBreakdown) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.primary)
    doc.text('TAX BREAKDOWN', margin, y)
    y += 7

    doc.setFontSize(9)
    doc.setTextColor(COLORS.secondary)
    
    const taxItems = [
      ['Tax Regime:', (payslip.taxRegime || 'new').toUpperCase()],
      ['Taxable Income:', fmt(payslip.taxBreakdown.taxableIncome)],
      ['Gross Tax:', fmt(payslip.taxBreakdown.grossTax)],
      ['Cess (4%):', fmt(payslip.taxBreakdown.cess)]
    ]

    taxItems.forEach(([label, value]) => {
      doc.setFont('helvetica', 'normal')
      doc.text(label, margin, y)
      doc.setFont('helvetica', 'bold')
      doc.text(value, margin + 45, y)
      y += 5
    })

    if (payslip.taxBreakdown.rebate87A > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(COLORS.success)
      doc.text('Rebate 87A:', margin, y)
      doc.text('-' + fmt(payslip.taxBreakdown.rebate87A), margin + 45, y)
      y += 5
    }

    y += 5
  }

  // ── Net Salary Box ────────────────────────────────────────────────────────────
  doc.setFillColor(COLORS.primary)
  doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 3, 3, 'F')
  
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor('#ffffff')
  doc.text('NET SALARY', margin + 8, y + 7)
  
  doc.setFontSize(16)
  doc.text(fmt(payslip.netSalary || 0), pageWidth - margin - 8, y + 11, { align: 'right' })

  y += 25

  // ── Footer ────────────────────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.muted)
  doc.text('This is a computer-generated payslip and does not require a signature.', margin, y)
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, pageWidth - margin, y - 5, { align: 'right' })

  // ── Save ───────────────────────────────────────────────────────────────────────
  const fileName = `Payslip_${employee.name || employee.employeeId || 'Employee'}_${monthName}_${payslip.year}.pdf`
  doc.save(fileName)
  
  return fileName
}

// ─── Batch PDF Generator ──────────────────────────────────────────────────────
export async function generateBulkPayslips(payslips, company) {
  const results = []
  for (const payslip of payslips) {
    try {
      const fileName = generatePayslipPdf(payslip, company)
      results.push({ success: true, fileName, payslipId: payslip._id })
    } catch (err) {
      results.push({ success: false, error: err.message, payslipId: payslip._id })
    }
  }
  return results
}

export default generatePayslipPdf
