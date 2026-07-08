// src/components/bulk/BulkExportButton.js
import { useState } from 'react'
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, CircularProgress } from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

// ─── CSV Generator ─────────────────────────────────────────────────────────────
const generateCsv = (data, columns) => {
  if (!data || data.length === 0) return ''
  
  const headers = columns.map(col => col.label || col.field)
  const rows = data.map(row => 
    columns.map(col => {
      let value = row[col.field]
      if (col.valueGetter) {
        value = col.valueGetter(value, row)
      }
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        value = `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}

// ─── Main Component ────────────────────────────────────────────────────────────
const BulkExportButton = ({ 
  data = [], 
  columns = [], 
  entityName = 'data',
  onExport,
  loading: externalLoading 
}) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [exporting, setExporting] = useState(false)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleExport = async (format) => {
    handleClose()
    
    if (onExport) {
      // Custom export handler
      setExporting(true)
      try {
        await onExport(format)
        toast.success(`Export completed`)
      } catch (err) {
        toast.error(err.message || 'Export failed')
      } finally {
        setExporting(false)
      }
      return
    }

    // Default CSV export
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }

    setExporting(true)
    try {
      const csvContent = generateCsv(data, columns)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${entityName}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported ${data.length} records`)
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const isLoading = externalLoading || exporting

  return (
    <>
      <Button
        variant="outlined"
        startIcon={isLoading ? <CircularProgress size={16} /> : <Icon icon="tabler:download" />}
        onClick={handleClick}
        disabled={isLoading}
      >
        Export
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon>
            <Icon icon="tabler:file-type-csv" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('excel')}>
          <ListItemIcon>
            <Icon icon="tabler:file-spreadsheet" />
          </ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}

export default BulkExportButton

// ─── Employee Columns Config ───────────────────────────────────────────────────
export const EMPLOYEE_EXPORT_COLUMNS = [
  { field: 'employeeId', label: 'Employee ID' },
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'phone', label: 'Phone' },
  { field: 'departmentId', label: 'Department', valueGetter: (v, row) => row.departmentId?.name || v },
  { field: 'designationId', label: 'Designation', valueGetter: (v, row) => row.designationId?.name || v },
  { field: 'status', label: 'Status' },
  { field: 'employmentType', label: 'Employment Type' },
  { field: 'joiningDate', label: 'Joining Date', valueGetter: (v) => v ? new Date(v).toLocaleDateString() : '' },
  { field: 'salary.grossSalary', label: 'Gross Salary', valueGetter: (v, row) => row.salary?.grossSalary || '' }
]

// ─── Payroll Columns Config ────────────────────────────────────────────────────
export const PAYROLL_EXPORT_COLUMNS = [
  { field: 'employeeId', label: 'Employee ID', valueGetter: (v, row) => row.employee_id?.employeeId || row.employeeId },
  { field: 'employeeName', label: 'Employee Name', valueGetter: (v, row) => row.employee_id?.name || row.employee_name },
  { field: 'month', label: 'Month' },
  { field: 'year', label: 'Year' },
  { field: 'grossSalary', label: 'Gross Salary' },
  { field: 'netSalary', label: 'Net Salary' },
  { field: 'lopDays', label: 'LOP Days' },
  { field: 'status', label: 'Status' }
]

// ─── Attendance Columns Config ──────────────────────────────────────────────────
export const ATTENDANCE_EXPORT_COLUMNS = [
  { field: 'employeeId', label: 'Employee ID', valueGetter: (v, row) => row.employeeId?.employeeId },
  { field: 'employeeName', label: 'Employee Name', valueGetter: (v, row) => row.employeeId?.name },
  { field: 'date', label: 'Date', valueGetter: (v) => new Date(v).toLocaleDateString() },
  { field: 'checkIn', label: 'Check In', valueGetter: (v) => v ? new Date(v).toLocaleTimeString() : '' },
  { field: 'checkOut', label: 'Check Out', valueGetter: (v) => v ? new Date(v).toLocaleTimeString() : '' },
  { field: 'workingHours', label: 'Working Hours' },
  { field: 'status', label: 'Status' },
  { field: 'isLate', label: 'Late', valueGetter: (v) => v ? 'Yes' : 'No' }
]
