// src/pages/users/bulk-import.js
import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import {
  Box,
  Card,
  Button,
  Typography,
  Container,
  Grid,
  Alert,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Checkbox,
  Select,
  MenuItem,
  TextField,
  FormControl,
  Tooltip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import toast from 'react-hot-toast'
import axiosRequest from 'src/utils/AxiosInterceptor'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'

// ─── Redux: role + scoped unit context ──────────────────────────────────────────
import { selectRoleSlug } from 'src/store/auth/authSlice'
import { fetchUnits, selectAllUnits, selectUnitLoading } from 'src/store/unit/unitSlice'
import useUnitContext from 'src/hooks/useUnitContext'

// ─── CSV Parser ────────────────────────────────────────────────────────────────
const parseCsv = (text) => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]
      })
      rows.push(row)
    }
  }

  return { headers, rows }
}

// ─── Normalize dropdown items ───────────────────────────────────────────────────
// Backend may return plain name strings OR objects ({ _id, name } / { id, name }).
// Employee bulk-import resolves department/designation by NAME on the backend,
// so we always flatten down to a plain name string for those two.
const normalizeNameList = (arr) =>
  (Array.isArray(arr) ? arr : [])
    .map(item => (typeof item === 'string' ? item : item?.name))
    .filter(Boolean)

// Department API returns a tree (id, name, children, status) — flatten it.
const flattenDepartments = (nodes) => {
  const flat = []
  const walk = (list) => {
    (list || []).forEach(n => {
      if (!n) return
      const status = (n.status || '').toString().toLowerCase()
      if (!status || status === 'active') flat.push(n)
      walk(n.children)
    })
  }
  walk(nodes)
  return flat
}

// ─── Row Validator ──────────────────────────────────────────────────────────────
// `requireUnit` is true only when the logged-in role can't be auto-scoped to a
// single unit (i.e. not unit_admin / hr_manager) — in that case the row must
// carry an explicit unitId picked from the Unit dropdown.
const validateRow = (row, index, requireUnit = false) => {
  const errors = []

  if (!row.name || row.name.trim().length < 2) {
    errors.push('Name required')
  }

  if (!row.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push('Valid email required')
  }

  if (!row.phone || row.phone.trim().length < 10) {
    errors.push('Valid phone required')
  }

  if (!row.department || row.department.trim().length < 2) {
    errors.push('Department required')
  }

  if (requireUnit && !row.unitId) {
    errors.push('Unit required')
  }

  if (!row.joiningDate || isNaN(Date.parse(row.joiningDate))) {
    errors.push('Valid joining date (YYYY-MM-DD)')
  }

  return {
    rowNum: index + 1,
    data: row,
    errors,
    valid: errors.length === 0
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
const EmployeeImport = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  // ── Role + unit scoping ──────────────────────────────────────────────────────
  // roleSlug: 'unit_admin' | 'hr_manager' | 'tenent_admin' | 'org_admin' | 'super_admin' ...
  const roleSlug = useSelector(selectRoleSlug)

  // useUnitContext resolves unitId automatically for unit_admin/hr_manager from
  // their JWT-scoped profile (and from the hierarchy selection for other roles
  // if one has already been picked elsewhere in the app).
  const { unitId: contextUnitId } = useUnitContext()
  const autoUnitId = contextUnitId || null

  // Only show a Unit picker when we could NOT resolve a unit automatically.
  // For unit_admin (and hr_manager), this is always false — their current
  // unit is sent automatically with every row.
  const showUnitColumn = !autoUnitId

  const reduxUnits = useSelector(selectAllUnits)
  const unitsLoading = useSelector(selectUnitLoading)

  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [results, setResults] = useState([])
  const fileInputRef = useRef(null)
  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  // Dropdown data from API (department/designation) — units come from Redux
  const [dropdownData, setDropdownData] = useState({
    departments: [],
    designations: [],
    employmentTypes: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
    genders: ['MALE', 'FEMALE', 'OTHER']
  })
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)

  // Fetch dropdown data + units on mount
  useEffect(() => {
    fetchDropdownData()

    // Only need the unit list when we actually have to show the picker
    if (!autoUnitId) {
      dispatch(fetchUnits())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDropdownData = async () => {
    try {
      setLoadingDropdowns(true)

      let departments = []
      let designations = []

      // 1) Try the dedicated bulk-import dropdown endpoint first.
      //    IMPORTANT: axiosRequest's response interceptor already returns
      //    response.data — so the resolved value here IS the body
      //    ({ success, data }), NOT the raw axios response. Reading
      //    `response.data.success` (double .data) is why this silently
      //    returned undefined before and the dropdowns never rendered.
      try {
        const body = await axiosRequest.get('/api/v1/employees/dropdown-data')
        if (body?.success && body?.data) {
          departments = normalizeNameList(body.data.departments)
          designations = normalizeNameList(body.data.designations)
        }
      } catch (e) {
        console.warn('dropdown-data endpoint unavailable, falling back to /departments + /designations', e)
      }

      // 2) Fallback to the same endpoints the Department / Designation pages
      //    already use successfully elsewhere in the app.
      if (departments.length === 0) {
        const deptBody = await axiosRequest.get('/api/v1/departments')
        const tree = deptBody?.data ?? deptBody ?? []
        departments = normalizeNameList(flattenDepartments(tree))
      }

      if (designations.length === 0) {
        const desigBody = await axiosRequest.get('/api/v1/designations')
        designations = normalizeNameList(desigBody?.data ?? desigBody ?? [])
      }

      setDropdownData(prev => ({ ...prev, departments, designations }))
      console.log('Dropdown data loaded:', { departments, designations })

      if (departments.length === 0) toast.error('No departments found — add one in Department Management first')
      if (designations.length === 0) toast.error('No designations found — add one in Designation Management first')
    } catch (err) {
      console.error('Failed to fetch dropdown data:', err)
      toast.error('Failed to load dropdown options')
    } finally {
      setLoadingDropdowns(false)
    }
  }

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    const isValidFile = selectedFile.name.endsWith('.csv') ||
                        selectedFile.name.endsWith('.xlsx') ||
                        selectedFile.name.endsWith('.xls')

    if (!isValidFile) {
      toast.error('Please upload a CSV or Excel file')
      return
    }

    setFile(selectedFile)
    setParsedData([])
    setResults([])
    setSelectedRows([])
    setSelectAll(false)

    // If Excel, upload to backend for parsing
    if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)

        toast.loading('Parsing Excel file...')

        const response = await axiosRequest.post('/api/v1/employees/bulk-import-excel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        toast.dismiss()

        if (response.data?.success) {
          // Parse the results and run them through the SAME validator used
          // for CSV rows, instead of blindly marking everything valid.
          const validatedRows = response.data.results.map((row, idx) => {
            const data = {
              name: row.name || '',
              email: row.email || '',
              phone: row.phone || '',
              department: row.department || '',
              joiningDate: row.joiningDate || '',
              basicSalary: row.basicSalary || '',
              designation: row.designation || '',
              employmentType: row.employmentType || 'FULL_TIME',
              gender: row.gender || '',
              dateOfBirth: row.dateOfBirth || '',
              unitId: row.unitId || autoUnitId || ''
            }
            return validateRow(data, idx, showUnitColumn)
          })

          setParsedData(validatedRows)
          toast.success(`Loaded ${validatedRows.length} records from Excel`)
        }
      } catch (err) {
        toast.dismiss()
        toast.error(err?.response?.data?.message || 'Failed to parse Excel file')
        console.error('Excel parse error:', err)
      }
    } else if (selectedFile.name.endsWith('.csv')) {
      // If CSV, parse locally
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target.result
        const { rows } = parseCsv(text)
        const validatedRows = rows.map((row, idx) => validateRow(
          { ...row, unitId: row.unitId || autoUnitId || '' },
          idx,
          showUnitColumn
        ))
        setParsedData(validatedRows)
      }
      reader.readAsText(selectedFile)
    }
  }

  // Handle any field change in edit mode (text, select, date — all go through here)
  const handleFieldChange = (rowIndex, field, value) => {
    const updatedData = [...parsedData]
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      data: { ...updatedData[rowIndex].data, [field]: value }
    }

    // Re-validate the row against the current unit requirement
    const revalidated = validateRow(updatedData[rowIndex].data, rowIndex, showUnitColumn)
    updatedData[rowIndex] = revalidated

    setParsedData(updatedData)
  }

  // Handle row checkbox toggle
  const handleRowSelect = (rowIndex) => {
    const newSelected = [...selectedRows]
    const index = newSelected.indexOf(rowIndex)

    if (index > -1) {
      newSelected.splice(index, 1)
    } else {
      newSelected.push(rowIndex)
    }

    setSelectedRows(newSelected)
    setSelectAll(newSelected.length === parsedData.filter(r => r.valid).length)
  }

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([])
      setSelectAll(false)
    } else {
      const validIndices = parsedData.map((r, idx) => r.valid ? idx : -1).filter(i => i !== -1)
      setSelectedRows(validIndices)
      setSelectAll(true)
    }
  }

  // Add new empty row
  const handleAddRow = () => {
    const newRowData = {
      name: '',
      email: '',
      phone: '',
      department: '',
      joiningDate: '',
      basicSalary: '',
      designation: '',
      employmentType: 'FULL_TIME',
      gender: '',
      dateOfBirth: '',
      unitId: autoUnitId || ''
    }

    const newRow = validateRow(newRowData, parsedData.length, showUnitColumn)
    setParsedData([...parsedData, newRow])
    toast.success('Row added! Fill the details.')
  }

  // Remove a row entirely (and keep row numbers / selection indices in sync)
  const handleRemoveRow = (rowIndex) => {
    const updated = parsedData
      .filter((_, i) => i !== rowIndex)
      .map((r, i) => ({ ...r, rowNum: i + 1 }))

    setParsedData(updated)
    setSelectedRows(prev =>
      prev.filter(i => i !== rowIndex).map(i => (i > rowIndex ? i - 1 : i))
    )
    toast.success('Row removed')
  }

  const handleDownloadTemplate = () => {
    // Simple CSV - NO unit column (auto from logged-in user)
    const csvContent = `name,email,phone,department,joiningDate,basicSalary,designation,employmentType,gender,dateOfBirth
John Doe,john@example.com,+919876543210,Engineering,2026-01-15,50000,Software Engineer,FULL_TIME,MALE,1990-05-20
Jane Smith,jane@example.com,+919876543211,HR,2026-02-01,45000,HR Manager,FULL_TIME,FEMALE,1988-07-15`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee_import_template.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Template downloaded!')
  }

  const handleUpload = async () => {
    // Only upload selected valid rows
    const rowsToUpload = selectedRows.length > 0
      ? selectedRows.map(idx => parsedData[idx]).filter(r => r.valid)
      : parsedData.filter(r => r.valid)

    if (rowsToUpload.length === 0) {
      toast.error('No valid rows selected for import')
      return
    }

    setUploading(true)
    setUploadProgress(0)
    setResults([])

    try {
      // For unit_admin / hr_manager (or any role auto-scoped to a unit),
      // always attach the current unitId — the dropdown is hidden for them
      // so this is the only place it gets sent.
      const employees = rowsToUpload.map(r => ({
        ...r.data,
        unitId: showUnitColumn ? r.data.unitId : autoUnitId
      }))

      const response = await axiosRequest.post('/api/v1/employees/bulk-import', { employees })

      setResults(response.data?.results || [])
      const successCount = response.data?.successCount || 0
      const failCount = response.data?.failCount || 0

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} employees. Login credentials sent via email!`)
      }
      if (failCount > 0) {
        toast.error(`Failed to import ${failCount} employees`)
      }

      setUploadProgress(100)
    } catch (err) {
      console.error('Bulk import error:', err)
      toast.error(err?.response?.data?.message || 'Failed to import employees')
    } finally {
      setUploading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedData([])
    setResults([])
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const validRows = parsedData.filter(r => r.valid)
  const invalidRows = parsedData.filter(r => !r.valid)
  const successResults = results.filter(r => r.success)
  const errorResults = results.filter(r => !r.success)

  // Hide instructions when data is loaded and not uploading
  const showEditTable = (parsedData.length > 0 || results.length > 0) && !uploading

  return (
    <Container maxWidth='lg'>
      <Head>
        <title>Bulk Import Employees | HRMS</title>
      </Head>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant='h4'>Bulk Import Employees</Typography>
          <Button
            variant='outlined'
            startIcon={<Icon icon='mdi:arrow-left' />}
            onClick={() => router.push('/users')}
          >
            Back to Employee List
          </Button>
        </Box>

        {/* Instructions Card - Hide when data is loaded */}
        {!showEditTable && (
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Bulk Import Instructions
          </Typography>
          <Box component='ul' sx={{ pl: 3 }}>
            <li><Typography><strong>Step 1:</strong> Download CSV template</Typography></li>
            <li><Typography><strong>Step 2:</strong> Fill required fields (5 mandatory fields):</Typography></li>
              <Box sx={{ pl: 4, mt: 1 }}>
                <Typography variant='body2' color='error'>• name, email, phone (Personal Info)</Typography>
                <Typography variant='body2' color='error'>• department, joiningDate (Format: YYYY-MM-DD)</Typography>
                <Typography variant='body2' color='text.secondary'>• basicSalary is OPTIONAL (defaults to 0 if not provided)</Typography>
                {!showUnitColumn && (
                  <Typography variant='body2' color='text.secondary'>• unit is AUTO-POPULATED from your logged-in unit</Typography>
                )}
                {showUnitColumn && (
                  <Typography variant='body2' color='error'>• unit must be selected per row from the Unit column</Typography>
                )}
              </Box>
            <li><Typography><strong>Step 3:</strong> Optional fields: designation, employmentType, gender, dateOfBirth</Typography></li>
            <li><Typography><strong>Step 4:</strong> Upload CSV and edit in preview table — add/remove rows as needed</Typography></li>
            <li><Typography><strong>Step 5:</strong> Select rows with checkboxes, then import</Typography></li>
          </Box>
          <Alert severity='success' sx={{ mt: 2 }}>
            <strong>✨ CSV Template:</strong> Simple format - just fill name, email, phone, department, and joining date.
            {!showUnitColumn && ' Unit auto-populated from your account!'}
          </Alert>
          <Alert severity='info' sx={{ mt: 1 }}>
            <strong>📧 Email Notifications:</strong> Each employee will receive an email with their login credentials (Email + Temporary Password). They must change password on first login.
          </Alert>
        </Card>
        )}

        {/* Action Buttons */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems='center'>
            <Grid item>
              <Button
                variant='outlined'
                startIcon={<Icon icon='mdi:download' />}
                onClick={handleDownloadTemplate}
              >
                Download CSV Template
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant='contained'
                component='label'
                startIcon={<Icon icon='mdi:upload' />}
              >
                Upload CSV File
                <input
                  type='file'
                  hidden
                  accept='.csv,.xlsx,.xls'
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
              </Button>
            </Grid>
            {file && (
              <Grid item>
                <Chip
                  label={file.name}
                  onDelete={handleReset}
                  color='primary'
                  variant='outlined'
                />
              </Grid>
            )}
          </Grid>
        </Card>

        {/* Upload Progress */}
        {uploading && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant='body2' sx={{ mb: 1 }}>
              Importing employees... {uploadProgress}%
            </Typography>
            <LinearProgress variant='determinate' value={uploadProgress} />
          </Card>
        )}

        {/* Preview Table */}
        {parsedData.length > 0 && !uploading && results.length === 0 && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant='h6'>
                Preview ({validRows.length} valid, {invalidRows.length} invalid)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant='outlined'
                  startIcon={<Icon icon='mdi:plus' />}
                  onClick={handleAddRow}
                  disabled={uploading}
                >
                  Add Row
                </Button>
                <Button
                  variant='outlined'
                  onClick={handleReset}
                  disabled={uploading}
                >
                  Reset
                </Button>
                <Button
                  variant='contained'
                  onClick={handleUpload}
                  disabled={(selectedRows.length === 0 && selectAll === false) || uploading}
                >
                  Import {selectedRows.length > 0 ? selectedRows.length : validRows.length} Employees
                </Button>
              </Box>
            </Box>

            {invalidRows.length > 0 && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                {invalidRows.length} rows have validation errors and will be skipped
              </Alert>
            )}

            {loadingDropdowns && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Loading department / designation options…
              </Alert>
            )}

            <TableContainer component={Paper}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell padding='checkbox'>
                      <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        indeterminate={selectedRows.length > 0 && selectedRows.length < parsedData.filter(r => r.valid).length}
                      />
                    </TableCell>
                    <TableCell>Name*</TableCell>
                    <TableCell>Email*</TableCell>
                    <TableCell>Phone*</TableCell>
                    <TableCell>Department*</TableCell>
                    {showUnitColumn && <TableCell>Unit*</TableCell>}
                    <TableCell>Joining Date*</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Emp. Type</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>DOB</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Errors</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell padding='checkbox'>
                        {row.valid && (
                          <Checkbox
                            checked={selectedRows.includes(idx)}
                            onChange={() => handleRowSelect(idx)}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.data.name || ''}
                          onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                          size='small'
                          error={row.errors.some(e => e.includes('Name'))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.data.email || ''}
                          onChange={(e) => handleFieldChange(idx, 'email', e.target.value)}
                          size='small'
                          type='email'
                          fullWidth
                          sx={{ minWidth: 220 }}
                          error={row.errors.some(e => e.includes('email'))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.data.phone || ''}
                          onChange={(e) => handleFieldChange(idx, 'phone', e.target.value)}
                          size='small'
                          error={row.errors.some(e => e.includes('Phone'))}
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size='small' sx={{ minWidth: 170 }}>
                          <Select
                            value={row.data.department || ''}
                            onChange={(e) => handleFieldChange(idx, 'department', e.target.value)}
                            displayEmpty
                            error={row.errors.some(e => e.includes('Department'))}
                            disabled={loadingDropdowns}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value='' disabled>
                              {loadingDropdowns ? 'Loading…' : 'Select Department'}
                            </MenuItem>
                            {dropdownData.departments.map(dept => (
                              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      {showUnitColumn && (
                        <TableCell>
                          <FormControl size='small' sx={{ minWidth: 170 }}>
                            <Select
                              value={row.data.unitId || ''}
                              onChange={(e) => handleFieldChange(idx, 'unitId', e.target.value)}
                              displayEmpty
                              error={row.errors.some(e => e.includes('Unit'))}
                              disabled={unitsLoading}
                              MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                            >
                              <MenuItem value='' disabled>
                                {unitsLoading ? 'Loading…' : 'Select Unit'}
                              </MenuItem>
                              {reduxUnits.map(u => (
                                <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                      )}
                      <TableCell>
                        <TextField
                          value={row.data.joiningDate || ''}
                          onChange={(e) => handleFieldChange(idx, 'joiningDate', e.target.value)}
                          size='small'
                          type='date'
                          InputLabelProps={{ shrink: true }}
                          error={row.errors.some(e => e.includes('joining date'))}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.data.basicSalary || ''}
                          onChange={(e) => handleFieldChange(idx, 'basicSalary', e.target.value)}
                          size='small'
                          type='number'
                          placeholder='Optional'
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl size='small' sx={{ minWidth: 170 }}>
                          <Select
                            value={row.data.designation || ''}
                            onChange={(e) => handleFieldChange(idx, 'designation', e.target.value)}
                            displayEmpty
                            disabled={loadingDropdowns}
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value='' disabled>
                              {loadingDropdowns ? 'Loading…' : 'Select Designation'}
                            </MenuItem>
                            {dropdownData.designations.map(desig => (
                              <MenuItem key={desig} value={desig}>{desig}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size='small' sx={{ minWidth: 140 }}>
                          <Select
                            value={row.data.employmentType || ''}
                            onChange={(e) => handleFieldChange(idx, 'employmentType', e.target.value)}
                            displayEmpty
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value='' disabled>Select Type</MenuItem>
                            {dropdownData.employmentTypes.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <FormControl size='small' sx={{ minWidth: 110 }}>
                          <Select
                            value={row.data.gender || ''}
                            onChange={(e) => handleFieldChange(idx, 'gender', e.target.value)}
                            displayEmpty
                            MenuProps={{ PaperProps: { style: { maxHeight: 300 } } }}
                          >
                            <MenuItem value='' disabled>Select</MenuItem>
                            {dropdownData.genders.map(g => (
                              <MenuItem key={g} value={g}>{g}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          value={row.data.dateOfBirth || ''}
                          onChange={(e) => handleFieldChange(idx, 'dateOfBirth', e.target.value)}
                          size='small'
                          type='date'
                          InputLabelProps={{ shrink: true }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.valid ? 'Valid' : 'Invalid'}
                          color={row.valid ? 'success' : 'error'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        {row.errors.length > 0 && (
                          <Typography variant='caption' color='error'>
                            {row.errors.join(', ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align='center'>
                        <Tooltip title='Remove row'>
                          <IconButton size='small' color='error' onClick={() => handleRemoveRow(idx)}>
                            <Icon icon='mdi:delete-outline' fontSize={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}

        {/* Results Table */}
        {results.length > 0 && (
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' sx={{ mb: 2 }}>
              Import Results ({successResults.length} successful, {errorResults.length} failed)
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Button
                variant='contained'
                onClick={() => router.push('/users')}
                disabled={uploading}
              >
                Go to Employee List
              </Button>
              <Button
                variant='outlined'
                onClick={handleReset}
              >
                Import More
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Row</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Email Sent</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{result.rowNum || idx + 1}</TableCell>
                      <TableCell>{result.name}</TableCell>
                      <TableCell>{result.email}</TableCell>
                      <TableCell>{result.employeeId || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.emailSent ? '✓ Sent' : '✗ Failed'}
                          color={result.emailSent ? 'success' : 'warning'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={result.success ? 'Success' : 'Failed'}
                          color={result.success ? 'success' : 'error'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='caption'>
                          {result.success && result.emailSent && (
                            <Box>
                              <Box sx={{ color: 'success.main' }}>✓ Imported successfully</Box>
                              <Box sx={{ color: 'info.main', fontSize: '0.7rem' }}>
                                Password: {result.tempPassword || 'Temp@123'}
                              </Box>
                            </Box>
                          )}
                          {!result.success && result.message}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>
    </Container>
  )
}

export default EmployeeImport