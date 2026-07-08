// src/components/bulk/BulkImportDialog.js
import { useState, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Link
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'

// ─── CSV Template Generator ────────────────────────────────────────────────────
const generateCsvTemplate = () => {
  const headers = [
    'name',
    'email',
    'phone',
    'departmentId',
    'designationId',
    'unit_id',
    'reportingManagerId',
    'joiningDate',
    'employmentType',
    'salary.basic',
    'salary.hra',
    'salary.travelAllowance',
    'salary.medicalAllowance',
    'salary.specialAllowance',
    'gender',
    'dateOfBirth'
  ]
  
  const sampleData = [
    'John Doe',
    'john.doe@example.com',
    '+91-9876543210',
    'DEPT001',
    'DES001',
    'UNIT001',
    '',
    '2026-01-15',
    'FULL_TIME',
    '30000',
    '10000',
    '5000',
    '3000',
    '2000',
    'Male',
    '1990-05-20'
  ]
  
  const csvContent = `${headers.join(',')}\n${sampleData.join(',')}`
  return csvContent
}

// ─── CSV Parser ────────────────────────────────────────────────────────────────
const parseCsv = (text) => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = []
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] || ''
    })
    rows.push(row)
  }
  
  return { headers, rows }
}

// ─── Validation ────────────────────────────────────────────────────────────────
const validateRow = (row, index) => {
  const errors = []
  
  if (!row.name || row.name.length < 2) {
    errors.push('Name is required (min 2 characters)')
  }
  
  if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push('Valid email is required')
  }
  
  if (!row.employmentType) {
    errors.push('Employment type is required')
  }
  
  if (!row['salary.basic'] || isNaN(Number(row['salary.basic']))) {
    errors.push('Valid basic salary is required')
  }
  
  return {
    rowNum: index + 1,
    data: row,
    errors,
    valid: errors.length === 0
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
const BulkImportDialog = ({ open, onClose, onImport, entityType = 'employees' }) => {
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target.result
      const { headers, rows } = parseCsv(text)
      const validatedRows = rows.map((row, idx) => validateRow(row, idx))
      setParsedData(validatedRows)
      setResults([])
    }
    reader.readAsText(selectedFile)
  }

  const handleDownloadTemplate = () => {
    const csvContent = generateCsvTemplate()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${entityType}_import_template.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const handleUpload = async () => {
    const validRows = parsedData.filter(r => r.valid)
    if (validRows.length === 0) {
      toast.error('No valid rows to import')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setResults([])

    const importResults = []
    
    for (let i = 0; i < validRows.length; i++) {
      try {
        await onImport(validRows[i].data)
        importResults.push({ rowNum: validRows[i].rowNum, success: true, name: validRows[i].data.name })
      } catch (err) {
        importResults.push({ 
          rowNum: validRows[i].rowNum, 
          success: false, 
          name: validRows[i].data.name,
          error: err.message || 'Import failed'
        })
      }
      setUploadProgress(Math.round(((i + 1) / validRows.length) * 100))
    }

    setResults(importResults)
    setUploading(false)
    
    const successCount = importResults.filter(r => r.success).length
    if (successCount === validRows.length) {
      toast.success(`Successfully imported ${successCount} records`)
    } else {
      toast(`Imported ${successCount}/${validRows.length} records`, { icon: '⚠️' })
    }
  }

  const handleClose = () => {
    setFile(null)
    setParsedData([])
    setResults([])
    setUploadProgress(0)
    onClose()
  }

  const validCount = parsedData.filter(r => r.valid).length
  const invalidCount = parsedData.length - validCount

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Bulk Import {entityType}</Typography>
          <Button
            size="small"
            startIcon={<Icon icon="tabler:download" />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {/* File Upload */}
        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'divider',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: file ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <Icon icon="tabler:upload" fontSize={48} color={file ? 'primary' : 'action.active'} />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {file ? file.name : 'Click to upload CSV file'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Maximum 1000 records per upload
            </Typography>
          </Box>
        </Box>

        {/* Preview */}
        {parsedData.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                label={`${validCount} Valid`}
                color="success"
                size="small"
              />
              {invalidCount > 0 && (
                <Chip
                  label={`${invalidCount} Invalid`}
                  color="error"
                  size="small"
                />
              )}
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 50).map((row) => (
                    <TableRow key={row.rowNum}>
                      <TableCell>{row.rowNum}</TableCell>
                      <TableCell>{row.data.name}</TableCell>
                      <TableCell>{row.data.email}</TableCell>
                      <TableCell>
                        {row.valid ? (
                          <Chip label="Valid" color="success" size="small" />
                        ) : (
                          <Chip
                            label={row.errors[0] || 'Invalid'}
                            color="error"
                            size="small"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {parsedData.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="caption" color="text.secondary">
                          ...and {parsedData.length - 50} more rows
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Importing... {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Import Results
            </Typography>
            <Alert
              severity={results.every(r => r.success) ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              {results.filter(r => r.success).length} of {results.length} records imported successfully
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          {results.length > 0 ? 'Close' : 'Cancel'}
        </Button>
        {parsedData.length > 0 && results.length === 0 && (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || validCount === 0}
            startIcon={uploading ? undefined : <Icon icon="tabler:upload" />}
          >
            {uploading ? 'Importing...' : `Import ${validCount} Records`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BulkImportDialog
