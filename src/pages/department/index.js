// ** React Imports
import { useState, useMemo } from 'react'

// ** MUI Imports
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Avatar from '@mui/material/Avatar'
import TabContext from '@mui/lab/TabContext'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@mui/material/styles'

// ** Custom Components Import
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Table Header (existing)
import TableHeader from 'src/views/apps/user/list/TableHeader'

// ** Drawer
import AddDepartmentDrawer from './departmentDrawer'

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

/**
 * Replace with: axios.get('/api/departments')
 */
const MOCK_DEPARTMENTS = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'HR'          },
  { id: 3, name: 'Sales'       },
  { id: 4, name: 'Design'      },
]

/**
 * Replace with: axios.get('/api/employees')
 */
const MOCK_EMPLOYEES = [
  { id: 1,  name: 'Rahul Sharma',  employeeId: 'EMP001', email: 'rahul@example.com',   role: 'Developer',       department: 'Engineering', joiningDate: '2024-03-10' },
  { id: 2,  name: 'Priya Mehta',   employeeId: 'EMP002', email: 'priya@example.com',   role: 'QA Engineer',     department: 'Engineering', joiningDate: '2024-05-20' },
  { id: 3,  name: 'Amit Verma',    employeeId: 'EMP003', email: 'amit@example.com',    role: 'Tech Lead',       department: 'Engineering', joiningDate: '2023-11-15' },
  { id: 4,  name: 'Sneha Kapoor',  employeeId: 'EMP004', email: 'sneha@example.com',   role: 'HR Manager',      department: 'HR',          joiningDate: '2023-07-01' },
  { id: 5,  name: 'Ravi Gupta',    employeeId: 'EMP005', email: 'ravi@example.com',    role: 'HR Executive',    department: 'HR',          joiningDate: '2024-01-15' },
  { id: 6,  name: 'Anjali Singh',  employeeId: 'EMP006', email: 'anjali@example.com',  role: 'Sales Manager',   department: 'Sales',       joiningDate: '2023-09-10' },
  { id: 7,  name: 'Karan Malhotra',employeeId: 'EMP007', email: 'karan@example.com',   role: 'Sales Executive', department: 'Sales',       joiningDate: '2024-02-28' },
  { id: 8,  name: 'Pooja Sharma',  employeeId: 'EMP008', email: 'pooja@example.com',   role: 'Sales Executive', department: 'Sales',       joiningDate: '2024-04-05' },
  { id: 9,  name: 'Vikram Nair',   employeeId: 'EMP009', email: 'vikram@example.com',  role: 'UI Designer',     department: 'Design',      joiningDate: '2024-06-01' },
  { id: 10, name: 'Deepa Iyer',    employeeId: 'EMP010', email: 'deepa@example.com',   role: 'UX Designer',     department: 'Design',      joiningDate: '2023-12-20' },
]

// ---------------------------------------------------------------------------
// DataGrid columns
// ---------------------------------------------------------------------------
const columns = [
  {
    flex: 0.2,
    minWidth: 200,
    field: 'name',
    headerName: 'Employee Name',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CustomAvatar skin='light' color='primary' sx={{ width: 34, height: 34, fontSize: '0.875rem' }}>
          {row.name.split(' ').map(n => n[0]).join('')}
        </CustomAvatar>
        <Typography noWrap sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {row.name}
        </Typography>
      </Box>
    )
  },
  {
    flex: 0.12,
    minWidth: 110,
    field: 'employeeId',
    headerName: 'Employee ID',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.employeeId}</Typography>
    )
  },
  {
    flex: 0.2,
    minWidth: 190,
    field: 'email',
    headerName: 'Email',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.email}</Typography>
    )
  },
  {
    flex: 0.15,
    minWidth: 140,
    field: 'role',
    headerName: 'Role',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.role}</Typography>
    )
  },
  {
    flex: 0.15,
    minWidth: 130,
    field: 'department',
    headerName: 'Department',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.department}</Typography>
    )
  },
  {
    flex: 0.13,
    minWidth: 120,
    field: 'joiningDate',
    headerName: 'Joining Date',
    renderCell: ({ row }) => (
      <Typography noWrap sx={{ color: 'text.secondary' }}>{row.joiningDate}</Typography>
    )
  }
]

// ---------------------------------------------------------------------------
// Department Tab label
// ---------------------------------------------------------------------------
const DeptTab = ({ dept, count, isActive, theme }) => {
  const RenderAvatar = isActive ? CustomAvatar : Avatar

  return (
    <Box
      sx={{
        px: 4,
        height: 94,
        minWidth: 130,
        borderWidth: 1,
        display: 'flex',
        alignItems: 'center',
        borderRadius: '10px',
        flexDirection: 'column',
        justifyContent: 'center',
        borderStyle: isActive ? 'solid' : 'dashed',
        borderColor: isActive ? theme.palette.primary.main : theme.palette.divider
      }}
    >
      <RenderAvatar
        variant='rounded'
        {...(isActive && { skin: 'light' })}
        sx={{ mb: 1, width: 34, height: 34, ...(!isActive && { backgroundColor: 'action.selected' }) }}
      >
        <Icon icon='tabler:building' />
      </RenderAvatar>
      <Typography sx={{ fontWeight: 500, color: 'text.secondary', textTransform: 'capitalize', fontSize: '0.8rem' }}>
        {dept.name}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <Icon icon='tabler:users' fontSize={12} />
        <Typography variant='caption' sx={{ color: 'text.disabled' }}>{count}</Typography>
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Employee table per department tab
// ---------------------------------------------------------------------------
const DepartmentEmployeeTable = ({ employees }) => {
  const [filterQ, setFilterQ]               = useState('')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })
  const [drawerOpen, setDrawerOpen]           = useState(false)   // unused here, kept for TableHeader toggle

  const filtered = useMemo(() => {
    if (!filterQ) return employees
    return employees.filter(e =>
      e.name.toLowerCase().includes(filterQ.toLowerCase()) ||
      e.email.toLowerCase().includes(filterQ.toLowerCase()) ||
      e.role.toLowerCase().includes(filterQ.toLowerCase())
    )
  }, [filterQ, employees])

  return (
    <>
      {/* <TableHeader value={filterQ} handleFilter={val => setFilterQ(val)} toggle={() => {}} /> */}
      <DataGrid
        autoHeight
        rowHeight={62}
        rows={filtered}
        columns={columns}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
      />
    </>
  )
}

// ---------------------------------------------------------------------------
// Department Page
// ---------------------------------------------------------------------------
const DepartmentPage = () => {
  const theme = useTheme()

  const [departments, setDepartments]       = useState(MOCK_DEPARTMENTS)
  const [employees]                         = useState(MOCK_EMPLOYEES)
  const [activeTab, setActiveTab]           = useState(String(MOCK_DEPARTMENTS[0].id))
  const [drawerOpen, setDrawerOpen]         = useState(false)

  // Employee count per department — computed once
  const countMap = useMemo(() => {
    const map = {}
    departments.forEach(d => {
      map[d.id] = employees.filter(e => e.department === d.name).length
    })
    return map
  }, [departments, employees])

  // Employees for the active tab
  const activeDept       = departments.find(d => String(d.id) === activeTab)
  const activeEmployees  = activeDept
    ? employees.filter(e => e.department === activeDept.name)
    : []

  const handleTabChange = (_, newVal) => setActiveTab(newVal)
  const toggleDrawer    = () => setDrawerOpen(prev => !prev)

  // Called after a new department is added from the drawer
  const handleDepartmentAdded = newDept => {
    setDepartments(prev => [...prev, { id: Date.now(), name: newDept.name }])
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Departments'
          subheader='Employee listing by department'
          
        />
        <CardContent sx={{ '& .MuiTabPanel-root': { p: 0 , my:6} }}>
          <TabContext value={activeTab}>
            {/* Department Tabs */}
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleTabChange}
              aria-label='department tabs'
              sx={{
                border: '0 !important',
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': { p: 0, minWidth: 0, borderRadius: '10px', '&:not(:last-child)': { mr: 4 } }
              }}
            >
              {departments.map(dept => (
                <Tab
                  key={dept.id}
                  value={String(dept.id)}
                  label={
                    <DeptTab
                      dept={dept}
                      count={countMap[dept.id] ?? 0}
                      isActive={activeTab === String(dept.id)}
                      theme={theme}
                    />
                  }
                />
              ))}

              {/* Static "Add" tab — disabled, opens drawer */}
              <Tab
                // disabled
                value='add'
                onClick={toggleDrawer}
                label={
                  <Box
                    sx={{
                      width: 110,
                      height: 94,
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '10px',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      border: `1px dashed ${theme.palette.divider}`
                    }}
                  >
                    <Avatar variant='rounded' sx={{ width: 34, height: 34, backgroundColor: 'action.selected' }}>
                      <Icon icon='tabler:plus' />
                    </Avatar>
                  </Box>
                }
              />
            </TabList>

            {/* Tab Panels — employee table per department */}
            {departments.map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept.name)

              return (
                <TabPanel key={dept.id} value={String(dept.id)}>
                  <DepartmentEmployeeTable employees={deptEmployees} />
                </TabPanel>
              )
            })}
          </TabContext>
        </CardContent>
      </Card>

      <AddDepartmentDrawer
        open={drawerOpen}
        toggle={toggleDrawer}
        onSuccess={handleDepartmentAdded}
      />
    </>
  )
}

export default DepartmentPage