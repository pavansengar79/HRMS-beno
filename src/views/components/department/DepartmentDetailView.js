// Department Detail View - Enhanced with Org Hierarchy Tree View & Designation Filter
// Elite UI for Billion-Dollar Organization Management

import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Tooltip from '@mui/material/Tooltip'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { useTheme, alpha } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Org tree — theme-aware with zoom/pan
import OrgHierarchyTree from './OrgHierarchyTree'

// ** Utils
import axiosRequest from 'src/utils/AxiosInterceptor'
import { format } from 'date-fns'

// ─── Tab Panel Component ──────────────────────────────────────────────────────
const TabPanel = ({ value, index, children }) => (
  <div hidden={value !== index} style={{ marginTop: 16 }}>
    {value === index && children}
  </div>
)

// ─── Employee Row ──────────────────────────────────────────────────────────────
const EmployeeRow = ({ employee }) => (
  <TableRow hover>
    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar src={employee.profilePhoto} sx={{ width: 40, height: 40 }}>
          {employee.name?.split(' ').map(n => n[0]).join('')}
        </Avatar>
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600 }}>
            {employee.name}
          </Typography>
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
            {employee.employeeId}
          </Typography>
        </Box>
      </Box>
    </TableCell>
    <TableCell>
      <Typography variant='body2'>{employee.designationId?.name || employee.designation?.name || '—'}</Typography>
    </TableCell>
    <TableCell>
      <Typography variant='body2'>{employee.email}</Typography>
    </TableCell>
    <TableCell>
      <Chip
        size='small'
        label={employee.status || 'Active'}
        color={employee.status === 'active' || employee.status === 'ACTIVE' ? 'success' : 'error'}
        variant='tonal'
      />
    </TableCell>
    <TableCell align='right'>
      <Tooltip title='View Profile'>
        <IconButton size='small' href={`/users/${employee._id || employee.id}`}>
          <Icon icon='tabler:eye' fontSize={18} />
        </IconButton>
      </Tooltip>
    </TableCell>
  </TableRow>
)

// ─── Audit Log Row ────────────────────────────────────────────────────────────
const AuditLogRow = ({ log }) => {
  const getActionColor = action => {
    if (action?.includes('CREATED')) return 'success'
    if (action?.includes('UPDATED')) return 'info'
    if (action?.includes('DELETED')) return 'error'
    if (action?.includes('ASSIGNED')) return 'primary'
    return 'default'
  }

  return (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
            {log.actor?.name?.split(' ').map(n => n[0]).join('') || 'S'}
          </Avatar>
          <Box>
            <Typography variant='body2'>{log.actor?.name || 'System'}</Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              {log.actor?.role || ''}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          size='small'
          label={log.action?.replace('DEPARTMENT_', '').replace('_', ' ') || 'UPDATE'}
          color={getActionColor(log.action)}
          variant='tonal'
        />
      </TableCell>
      <TableCell>
        <Typography variant='body2' sx={{ maxWidth: 300 }}>
          {log.description}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>
          {log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy HH:mm') : '—'}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

// ─── Helper — wrap a flat/nested departments array into the org tree shape ────
// Replace this with a real API call to your org hierarchy endpoint once it
// exists (see fetchOrgTree below) — this is the fallback used until then.
// ─── Main Component ────────────────────────────────────────────────────────────
const DepartmentDetailView = ({ departments, onEdit, onAddSub, onDelete }) => {
  const [viewMode, setViewMode] = useState('card') // 'card' | 'tree'
  const [selectedDept, setSelectedDept] = useState(null)
  const [navigationStack, setNavigationStack] = useState([]) // Breadcrumb stack [root, parent, current]
  const [tabValue, setTabValue] = useState(0)
  const [employees, setEmployees] = useState([])
  const [designations, setDesignations] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchEmployee, setSearchEmployee] = useState('')
  const [designationFilter, setDesignationFilter] = useState('')

  const theme = useTheme()

  // Load designations for filter
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await axiosRequest.get('/api/v1/designations', { params: { limit: 100 } })
        if (res?.success) {
          setDesignations(res.data?.data || res.data || [])
        }
      } catch (err) {
        console.error('Failed to load designations:', err)
      }
    }
    fetchDesignations()
  }, [])

  // Handle department selection with breadcrumb tracking
  const handleDepartmentSelect = dept => {
    const newStack = [...navigationStack]
    const isRootDepartment = departments.some(d => d.id === dept.id || d._id === dept._id)

    if (isRootDepartment) {
      setNavigationStack([dept])
    } else {
      newStack.push(dept)
      setNavigationStack(newStack)
    }

    setSelectedDept(dept)
    setTabValue(0)
  }

  // Navigate back in hierarchy
  const handleBack = () => {
    const newStack = [...navigationStack]
    newStack.pop()

    if (newStack.length === 0) {
      setSelectedDept(null)
      setNavigationStack([])
    } else {
      const previousDept = newStack[newStack.length - 1]
      setSelectedDept(previousDept)
      setNavigationStack(newStack)
    }
  }

  // Load department details when selected
  useEffect(() => {
    if (selectedDept) {
      fetchDepartmentDetails(selectedDept.id || selectedDept._id)
    }
  }, [selectedDept])

  const fetchDepartmentDetails = async deptId => {
    setLoading(true)
    try {
      const empRes = await axiosRequest.get('/api/v1/employees', {
        params: { departmentId: deptId, limit: 100 }
      })

      let empData = []
      if (empRes.data?.data) {
        if (Array.isArray(empRes.data.data)) {
          empData = empRes.data.data
        } else if (empRes.data.data.employees) {
          empData = empRes.data.data.employees
        }
      } else if (Array.isArray(empRes.data)) {
        empData = empRes.data
      }

      setEmployees(Array.isArray(empData) ? empData : [])

      const auditRes = await axiosRequest.get(`/api/v1/departments/${deptId}/audit-logs`, {
        params: { page: 1, limit: 50 }
      })
      const auditData = auditRes.data?.data?.data || auditRes.data?.data || []
      setAuditLogs(Array.isArray(auditData) ? auditData : [])
    } catch (err) {
      console.error('Failed to load details:', err)
      setEmployees([])
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      !searchEmployee ||
      emp.name?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      emp.employeeId?.toLowerCase().includes(searchEmployee.toLowerCase())

    const matchesDesignation =
      !designationFilter || emp.designationId?._id === designationFilter || emp.designation?._id === designationFilter

    return matchesSearch && matchesDesignation
  })

  return (
    <Box sx={{ height: 'calc(100vh - 180px)' }}>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant='h4' sx={{ fontWeight: 700 }}>
                Departments
              </Typography>
              <Button
                variant='contained'
                size='small'
                startIcon={<Icon icon='tabler:plus' />}
                onClick={() => onAddSub && onAddSub()}
              >
                Add Department
              </Button>
            </Box>

            {/* View Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size='small'
            >
              <ToggleButton value='card'>
                <Icon icon='tabler:layout-grid' fontSize={18} />
                <Typography variant='caption' sx={{ ml: 1 }}>
                  Cards
                </Typography>
              </ToggleButton>
              <ToggleButton value='tree'>
                <Icon icon='tabler:sitemap' fontSize={18} />
                <Typography variant='caption' sx={{ ml: 1 }}>
                  Org tree
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </CardContent>
      </Card>

      {viewMode === 'tree' ? (
        /* ─── Compact skeleton tree view ────── */
        <Card sx={{ p: 2, overflow: 'auto' }}>
          <OrgHierarchyTree />
        </Card>
      ) : (
        /* ─── Card view — department list + detail panel ──────────────────── */
        <Box sx={{ display: 'flex', gap: 3, height: 'calc(100% - 80px)' }}>
          {/* Left Panel - Departments List */}
          <Card sx={{ width: '35%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {departments.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Icon icon='tabler:building-off' fontSize={60} style={{ opacity: 0.3 }} />
                  <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled' }}>
                    No departments found
                  </Typography>
                </Box>
              ) : (
                departments.map(dept => (
                  <Fade in key={dept.id || dept._id}>
                    <Card
                      onClick={() => handleDepartmentSelect(dept)}
                      sx={{
                        mb: 2,
                        cursor: 'pointer',
                        borderTop: theme => `3px solid ${dept.color || theme.palette.warning.main}`,
                        border:
                          selectedDept?.id === dept.id || selectedDept?._id === dept._id ? '2px solid' : '1px solid',
                        borderColor:
                          selectedDept?.id === dept.id || selectedDept?._id === dept._id ? 'primary.main' : 'divider',
                        transition: 'all 0.2s',
                        bgcolor:
                          selectedDept?.id === dept.id || selectedDept?._id === dept._id
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'background.paper',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                          transform: 'translateY(-3px)'
                        }
                      }}
                    >
                      <CardContent sx={{ py: 2.5, px: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: dept.color || theme.palette.primary.main,
                                boxShadow: `0 0 0 3px ${alpha(dept.color || theme.palette.primary.main, 0.2)}`
                              }}
                            />
                            <Box>
                              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                                {dept.name}
                              </Typography>
                              {dept.description && (
                                <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                  {dept.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {dept.departmentHeadId && (
                              <Tooltip title={`Head: ${dept.departmentHeadId.name}`}>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {dept.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                              </Tooltip>
                            )}

                            <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                {dept.employeeCount || 0}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                                Employees
                              </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                                {(dept.children || []).length}
                              </Typography>
                              <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                                Sub Depts
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                ))
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Department Details */}
          <Card sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedDept ? (
              <>
                <CardHeader
                  title={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: selectedDept.color || theme.palette.primary.main,
                            boxShadow: `0 0 0 3px ${alpha(selectedDept.color || theme.palette.primary.main, 0.2)}`
                          }}
                        />
                        <Typography variant='h5' sx={{ fontWeight: 700 }}>
                          {selectedDept.name}
                        </Typography>
                        <Chip
                          size='small'
                          label={selectedDept.status || 'active'}
                          color={selectedDept.status === 'active' ? 'success' : 'error'}
                          variant='tonal'
                        />
                      </Box>
                      {selectedDept.description && (
                        <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                          {selectedDept.description}
                        </Typography>
                      )}
                    </Box>
                  }
                  subheader={
                    selectedDept.departmentHeadId && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {selectedDept.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant='subtitle2' sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {selectedDept.departmentHeadId.name}
                          </Typography>
                          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                            Department Head • {selectedDept.departmentHeadId.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    )
                  }
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size='small'
                        variant='outlined'
                        startIcon={<Icon icon='tabler:plus' />}
                        onClick={() => onAddSub && onAddSub(selectedDept.id || selectedDept._id)}
                      >
                        Add Sub
                      </Button>
                      <Button
                        size='small'
                        variant='contained'
                        startIcon={<Icon icon='tabler:pencil' />}
                        onClick={() => onEdit && onEdit(selectedDept.id || selectedDept._id)}
                      >
                        Edit
                      </Button>
                    </Box>
                  }
                />
                <Divider />

                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 3 }}>
                  <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab label={`Overview (${filteredEmployees.length})`} />
                    <Tab label={`Sub Departments (${(selectedDept.children || []).length})`} />
                    <Tab label={`History (${auditLogs.length})`} />
                  </Tabs>
                </Box>

                <CardContent sx={{ flex: 1, overflow: 'auto' }}>
                  {loading ? (
                    <Box sx={{ p: 4 }}>
                      <LinearProgress />
                      <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled', textAlign: 'center' }}>
                        Loading department details...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Overview Tab - Employees */}
                      <TabPanel value={tabValue} index={0}>
                        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                          <TextField
                            size='small'
                            placeholder='Search employees...'
                            value={searchEmployee}
                            onChange={e => setSearchEmployee(e.target.value)}
                            sx={{ flex: 1 }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position='start'>
                                  <Icon icon='tabler:search' />
                                </InputAdornment>
                              )
                            }}
                          />
                          <TextField
                            select
                            size='small'
                            label='Job Role'
                            value={designationFilter}
                            onChange={e => setDesignationFilter(e.target.value)}
                            sx={{ minWidth: 200 }}
                          >
                            <MenuItem value=''>All</MenuItem>
                            {designations.map(des => (
                              <MenuItem key={des._id} value={des._id}>
                                {des.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>

                        {filteredEmployees.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Icon icon='tabler:users-off' fontSize={60} style={{ opacity: 0.3 }} />
                            <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled' }}>
                              No employees found
                            </Typography>
                          </Box>
                        ) : (
                          <TableContainer component={Paper} variant='outlined'>
                            <Table size='small'>
                              <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Job Role</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                  <TableCell align='right' sx={{ fontWeight: 600 }}>
                                    Actions
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {filteredEmployees.map(emp => (
                                  <EmployeeRow key={emp._id || emp.id} employee={emp} />
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </TabPanel>

                      {/* Sub Departments Tab */}
                      <TabPanel value={tabValue} index={1}>
                        {(selectedDept.children || []).length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Icon icon='tabler:building-off' fontSize={60} style={{ opacity: 0.3 }} />
                            <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled' }}>
                              No sub-departments found
                            </Typography>
                            <Button
                              variant='contained'
                              size='small'
                              sx={{ mt: 3 }}
                              startIcon={<Icon icon='tabler:plus' />}
                              onClick={() => onAddSub && onAddSub(selectedDept.id || selectedDept._id)}
                            >
                              Add Sub Department
                            </Button>
                          </Box>
                        ) : (
                          <Grid container spacing={2}>
                            {selectedDept.children.map(child => (
                              <Grid item xs={12} key={child.id || child._id}>
                                <Card
                                  variant='outlined'
                                  sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.main', boxShadow: 2 }
                                  }}
                                  onClick={() => handleDepartmentSelect(child)}
                                >
                                  <CardContent sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            bgcolor: child.color || theme.palette.warning.main
                                          }}
                                        />
                                        <Box>
                                          <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                                            {child.name}
                                          </Typography>
                                          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                                            {child.employeeCount || 0} employees
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Icon icon='tabler:chevron-right' />
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        )}
                      </TabPanel>

                      {/* History Tab */}
                      <TabPanel value={tabValue} index={2}>
                        <TableContainer component={Paper} variant='outlined'>
                          <Table size='small'>
                            <TableHead>
                              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {auditLogs.map(log => (
                                <AuditLogRow key={log._id} log={log} />
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </TabPanel>
                    </>
                  )}
                </CardContent>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Icon icon='tabler:building-community' fontSize={80} style={{ opacity: 0.15 }} />
                  <Typography variant='h6' sx={{ mt: 3, color: 'text.disabled', fontWeight: 600 }}>
                    Select a department
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1, color: 'text.disabled' }}>
                    Click on any department to view employees, sub-departments, and history
                  </Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default DepartmentDetailView