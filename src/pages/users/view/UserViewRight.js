// src/views/apps/user/view/UserViewRight.jsx

// ** React Imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// ** MUI Imports
import Box from '@mui/material/Box'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import MuiTab from '@mui/material/Tab'
import MuiTabList from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Tab Components
import UserViewAccount      from './UserViewAccount'
import UserViewSecurity     from './UserViewSecurity'
import UserViewBilling      from './UserViewBilling'
import UserViewNotification from './UserViewNotification'
import UserViewConnection   from './UserViewConnection'
import UserProgressionTimeline from './Userprogressiontimeline'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

// ─────────────────────────────────────────────────────────────────────────────
// Styled — unchanged from original
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
// UserViewRight
// ─────────────────────────────────────────────────────────────────────────────
const UserViewRight = ({ tab, employee ,isPermitted}) => {
  const [activeTab, setActiveTab] = useState(tab || 'account')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()


    const roleSlug    = useSelector(selectRoleSlug)   // e.g. "TENANT_ADMIN"


  const handleChange = (_, value) => {
    setIsLoading(true)
    setActiveTab(value)
    router
      .push({ pathname: `/users/${employee._id}/details/${value.toLowerCase()}` })
      .then(() => setIsLoading(false))
  }

  useEffect(() => {
    if (tab && tab !== activeTab) setActiveTab(tab)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  useEffect(() => {
    if (employee) setIsLoading(false)
  }, [employee])

  return (
    <TabContext value={activeTab}>
      <TabList
        variant='scrollable'
        scrollButtons='auto'
        onChange={handleChange}
        aria-label='employee detail tabs'
        sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Tab value='account'      label='Account'        icon={<Icon fontSize='1.125rem' icon='tabler:user-check' />} />
        <Tab value='security'     label='Security'       icon={<Icon fontSize='1.125rem' icon='tabler:lock' />} />
        <Tab value='billing-plan' label='Billing & Plan' icon={<Icon fontSize='1.125rem' icon='tabler:currency-dollar' />} />
        <Tab value='notification' label='Notification'   icon={<Icon fontSize='1.125rem' icon='tabler:bell' />} />
        <Tab value='connection'   label='Connection'     icon={<Icon fontSize='1.125rem' icon='tabler:link' />} />
      </TabList>

      <Box sx={{ mt: 4 }}>
        {isLoading ? (
          <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            <CircularProgress sx={{ mb: 4 }} />
            <Typography>Loading…</Typography>
          </Box>
        ) : (
          <>
            <TabPanel sx={{ p: 0 }} value='account'>
              {roleSlug ==="tenent_admin"  ? 
               <UserProgressionTimeline userId={employee.userId} /> 
               : 
               <UserViewAccount employee={employee} isPermitted={isPermitted} />}
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='security'>
              <UserViewSecurity employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='billing-plan'>
              <UserViewBilling employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='notification'>
              <UserViewNotification employee={employee} />
            </TabPanel>
            <TabPanel sx={{ p: 0 }} value='connection'>
              <UserViewConnection employee={employee} />
            </TabPanel>
          </>
        )}
      </Box>
    </TabContext>
  )
}

export default UserViewRight