// src/pages/attendance/AttendanceTabs.js
// Route-based tab bar for the Attendance module
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import MuiTab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'

import Icon from 'src/@core/components/icon'
import { selectRoleSlug } from 'src/store/auth/authSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Styled — same look & feel as PayrollTabs
// ─────────────────────────────────────────────────────────────────────────────
const Tab = styled(MuiTab)(({ theme }) => ({
  flexDirection: 'row',
  '& svg': { marginBottom: '0 !important', marginRight: theme.spacing(1.5) }
}))

const TabList = styled(MuiTabList)(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': { display: 'none' },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': { color: theme.palette.primary.main }
  }
}))

// ─────────────────────────────────────────────────────────────────────────────
// Tab → route map
// ─────────────────────────────────────────────────────────────────────────────
const TAB_ROUTES = {
  'my-attendance': '/attendance/my',
  'team-attendance': '/attendance/team'
}

const AttendanceTabs = ({ activeTab, children }) => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)

  // Show team tab for manager, hr_manager, tenant_admin, unit_admin
  const canViewTeam = ['manager', 'hr_manager', 'tenant_admin', 'unit_admin'].includes(roleSlug)

  const handleChange = (_, value) => {
    const target = TAB_ROUTES[value]
    if (target) router.push(target)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 800 }}>Attendance Management</Typography>
        <Typography variant='body2' color='text.secondary'>
          Track attendance, view team attendance, and manage regularizations
        </Typography>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ mb: 4 }}>
          <TabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={handleChange}
            aria-label='attendance tabs'
            sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Tab
              value='my-attendance'
              label='My Attendance'
              icon={<Icon fontSize='1.125rem' icon='tabler:user-check' />}
            />
            {canViewTeam && (
              <Tab
                value='team-attendance'
                label='Team Attendance'
                icon={<Icon fontSize='1.125rem' icon='tabler:users' />}
              />
            )}
          </TabList>
        </Box>
      </TabContext>

      <Box>{children}</Box>
    </Box>
  )
}

export default AttendanceTabs
