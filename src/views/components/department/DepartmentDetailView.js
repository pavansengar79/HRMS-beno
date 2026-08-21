// Department Detail View - Card-based UI with tabs
// Shows: Overview (employees) | Sub Departments | History (Audit Logs)

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
import AvatarGroup from '@mui/material/AvatarGroup'
import Skeleton from '@mui/material/Skeleton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Utils
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'
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
      <Typography variant='body2'>{employee.designationId?.name || '—'}</Typography>
    </TableCell>
    <TableCell>
      <Typography variant='body2'>{employee.email}</Typography>
    </TableCell>
    <TableCell>
      <Chip
        size='small'
        label={employee.status || 'Active'}
        color={employee.status === 'active' ? 'success' : 'error'}
        variant='tonal'
      />
    </TableCell>
    <TableCell align='right'>
      <Tooltip title='View Profile'>
        <IconButton size='small'>
          <Icon icon='tabler:eye' fontSize={18} />
        </IconButton>
      </Tooltip>
    </TableCell>
  </TableRow>
)

// ─── Audit Log Row ────────────────────────────────────────────────────────────
const AuditLogRow = ({ log }) => {
  const getActionColor = (action) => {
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

// ─── Department Card ──────────────────────────────────────────────────────────
const DepartmentCard = ({ dept, onClick, isSelected }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      mb: 2,
      border: isSelected ? '2px solid' : '1px solid',
      borderColor: isSelected ? 'primary.main' : 'divider',
      transition: 'all 0.2s',
      '&:hover': { borderColor: 'primary.main', boxShadow: 3 }
    }}
  >
    <CardContent sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 12, height: 12, borderRadius: '50%',
            bgcolor: dept.color || '#028090'
          }} />
          <Box>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              {dept.name}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              {dept.description || 'No description'}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Department Head */}
          {dept.departmentHeadId && (
            <Box sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 32, height: 32, mx: 'auto', mb: 0.5, fontSize: '0.75rem' }}>
                {dept.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
              </Avatar>
              <Typography variant='caption' sx={{ display: 'block', fontWeight: 600, lineHeight: 1 }}>
                {dept.departmentHeadId.name}
              </Typography>
              <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                Head
              </Typography>
            </Box>
          )}
          
          {/* Stats */}
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {dept.employeeCount || 0}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>Employees</Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              {(dept.children || []).length}
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>Sub Depts</Typography>
          </Box>
          
          <Chip
            size='small'
            label={dept.status}
            color={dept.status === 'active' ? 'success' : 'error'}
            variant='tonal'
          />
          
          <Icon icon='tabler:chevron-right' fontSize={20} />
        </Box>
      </Box>
    </CardContent>
  </Card>
)

// ─── Main Component ────────────────────────────────────────────────────────────
const DepartmentDetailView = ({ departments, onEdit, onAddSub, onDelete }) => {
  const [selectedDept, setSelectedDept] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  const [employees, setEmployees] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchEmployee, setSearchEmployee] = useState('')

  // Debug: Log departments prop
  useEffect(() => {
    console.log('=== DepartmentDetailView Props ===')
    console.log('Departments prop:', departments)
    console.log('Is array:', Array.isArray(departments))
    console.log('Length:', departments?.length)
    if (departments && departments.length > 0) {
      console.log('First department:', departments[0])
      console.log('First department children:', departments[0].children)
    }
  }, [departments])

  // Load department details when selected
  useEffect(() => {
    if (selectedDept) {
      console.log('=== Selected department changed ===')
      console.log('Selected dept:', selectedDept)
      console.log('Children:', selectedDept.children)
      fetchDepartmentDetails(selectedDept.id || selectedDept._id)
    }
  }, [selectedDept])

  const fetchDepartmentDetails = async (deptId) => {
    setLoading(true)
    console.log('=== Fetching department details for:', deptId)
    try {
      // Fetch employees in this department
      const empRes = await axiosRequest.get('/api/v1/employees', {
        params: { departmentId: deptId, limit: 100 }
      })
      console.log('Employee response:', empRes)
      console.log('Employee response data:', empRes.data)
      
      // Handle different response structures
      // Backend returns: { success: true, data: [...employees], pagination: {...} }
      let empData = []
      
      if (empRes.data?.data) {
        // Standard: res.data.data is the employees array
        if (Array.isArray(empRes.data.data)) {
          empData = empRes.data.data
        } 
        // Alternative: res.data.data.employees
        else if (empRes.data.data.employees && Array.isArray(empRes.data.data.employees)) {
          empData = empRes.data.data.employees
        }
      } else if (empRes.data?.employees && Array.isArray(empRes.data.employees)) {
        // Fallback: res.data.employees
        empData = empRes.data.employees
      } else if (Array.isArray(empRes.data)) {
        // Direct array: res.data
        empData = empRes.data
      }
      
      console.log('Employee data extracted:', empData.length)
      if (empData.length > 0) {
        console.log('First employee:', empData[0])
      } else {
        console.warn('⚠️ No employees found in this department')
      }
      setEmployees(Array.isArray(empData) ? empData : [])

      // Fetch audit logs for this department
      const auditRes = await axiosRequest.get(`/api/v1/departments/${deptId}/audit-logs`, {
        params: { page: 1, limit: 50 }
      })
      console.log('Audit logs response:', auditRes)
      console.log('Audit logs data:', auditRes.data)
      // Handle nested audit log response
      const auditData = auditRes.data?.data?.data || auditRes.data?.data || []
      console.log('Audit logs count:', Array.isArray(auditData) ? auditData.length : 0)
      setAuditLogs(Array.isArray(auditData) ? auditData : [])
    } catch (err) {
      console.error('Failed to load details:', err)
      setEmployees([])
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.employeeId?.toLowerCase().includes(searchEmployee.toLowerCase())
  )

  return (
    <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 180px)' }}>
      {/* Left Panel - Department List */}
      <Box sx={{ width: '35%', overflow: 'auto' }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant='h5' sx={{ fontWeight: 600 }}>
            Departments
          </Typography>
          <Button
            variant='contained'
            size='small'
            startIcon={<Icon icon='tabler:plus' />}
            onClick={() => onAddSub && onAddSub()}
          >
            Add
          </Button>
        </Box>

        {departments.length === 0 && !loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Icon icon='tabler:building-off' fontSize={60} style={{ opacity: 0.3 }} />
            <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled' }}>
              No departments found
            </Typography>
            <Typography variant='caption' sx={{ color: 'text.disabled' }}>
              Create your first department to get started
            </Typography>
          </Box>
        ) : (
          departments.map((dept, index) => (
            <DepartmentCard
              key={dept.id || dept._id}
              dept={dept}
              isSelected={selectedDept?.id === dept.id || selectedDept?._id === dept._id}
              onClick={() => setSelectedDept(dept)}
            />
          ))
        )}
      </Box>

      {/* Right Panel - Department Details */}
      <Box sx={{ flex: 1 }}>
        {selectedDept ? (
          <Card sx={{ height: '100%' }}>
            {/* Header */}
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 16, height: 16, borderRadius: '50%',
                    bgcolor: selectedDept.color || '#028090'
                  }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='h5' sx={{ fontWeight: 600 }}>
                      {selectedDept.name}
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                      {selectedDept.departmentCode && `Code: ${selectedDept.departmentCode} • `}
                      {selectedDept.description || 'No description'}
                    </Typography>
                  </Box>
                </Box>
              }
              subheader={
                selectedDept.departmentHeadId && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                      {selectedDept.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant='caption' sx={{ fontWeight: 600, display: 'block' }}>
                        {selectedDept.departmentHeadId.name}
                      </Typography>
                      <Typography variant='caption' sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
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
                    onClick={() => onAddSub && onAddSub(selectedDept.id)}
                  >
                    Add Sub
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<Icon icon='tabler:edit' />}
                    onClick={() => onEdit && onEdit(selectedDept.id)}
                  >
                    Edit
                  </Button>
                </Box>
              }
            />
            <Divider />

            {/* Tabs */}
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label={`Overview (${filteredEmployees.length})`} />
                <Tab label={`Sub Departments (${(selectedDept.children || []).length})`} />
                <Tab label={`History (${auditLogs.length})`} />
              </Tabs>
              
              {/* Debug: Log children data */}
              {tabValue === 1 && (
                <Box sx={{ px: 4, pt: 2 }}>
                  <Typography variant='caption' sx={{ color: 'text.disabled' }}>
                    Debug: Children count = {(selectedDept.children || []).length}, 
                    IDs = {(selectedDept.children || []).map(c => c.id || c._id).join(', ')}
                  </Typography>
                </Box>
              )}
            </Box>

            <CardContent sx={{ height: 'calc(100% - 200px)', overflow: 'auto' }}>
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
                    {/* Department Head Card */}
                    {selectedDept.departmentHeadId && (
                      <Card sx={{ mb: 3, border: '1px solid', borderColor: 'primary.light' }}>
                        <CardContent sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar 
                              src={selectedDept.departmentHeadId.profilePhoto}
                              sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
                            >
                              {selectedDept.departmentHeadId.name?.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant='subtitle2' sx={{ color: 'primary.main', fontWeight: 600 }}>
                                Department Head
                              </Typography>
                              <Typography variant='h6' sx={{ fontWeight: 600 }}>
                                {selectedDept.departmentHeadId.name}
                              </Typography>
                              <Typography variant='body2' sx={{ color: 'text.disabled' }}>
                                {selectedDept.departmentHeadId.employeeId} 
                                {selectedDept.departmentHeadId.designation?.name && ` • ${selectedDept.departmentHeadId.designation.name}`}
                              </Typography>
                            </Box>
                            {selectedDept.departmentHeadId.email && (
                              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                                {selectedDept.departmentHeadId.email}
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        size='small'
                        placeholder='Search employees...'
                        value={searchEmployee}
                        onChange={e => setSearchEmployee(e.target.value)}
                        sx={{ width: 300 }}
                        InputProps={{
                          startAdornment: (
                            <Icon icon='tabler:search' style={{ marginRight: 8 }} />
                          )
                        }}
                      />
                    </Box>

                    {filteredEmployees.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Icon icon='tabler:users-off' fontSize={60} style={{ opacity: 0.3 }} />
                        <Typography variant='body2' sx={{ mt: 2, color: 'text.disabled' }}>
                          No employees found in this department
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer component={Paper} variant='outlined'>
                        <Table size='small'>
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'action.hover' }}>
                              <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell align='right' sx={{ fontWeight: 600 }}>Actions</TableCell>
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
                          onClick={() => onAddSub && onAddSub(selectedDept.id)}
                        >
                          Add Sub Department
                        </Button>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {selectedDept.children.map(child => (
                          <Grid item xs={12} key={child.id || child._id}>
                            <DepartmentCard
                              dept={child}
                              onClick={() => setSelectedDept(child)}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </TabPanel>

                  {/* History Tab - Audit Logs */}
                  <TabPanel value={tabValue} index={2}>
                    <TableContainer component={Paper} variant='outlined'>
                      <Table size='small'>
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
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
          </Card>
        ) : (
          <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Icon icon='tabler:building-community' fontSize={80} style={{ opacity: 0.2 }} />
              <Typography variant='h6' sx={{ mt: 3, color: 'text.disabled' }}>
                Select a department to view details
              </Typography>
              <Typography variant='body2' sx={{ mt: 1, color: 'text.disabled' }}>
                Click on any department card to see employees, sub-departments, and history
              </Typography>
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  )
}

export default DepartmentDetailView
