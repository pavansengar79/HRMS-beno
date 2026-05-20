// src/views/leavemanagement/leaveManagement.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import MuiTabList from '@mui/lab/TabList'
import CircularProgress from '@mui/material/CircularProgress'

import Icon from 'src/@core/components/icon'

import TabLeaveRequests from './leaveRequesttab'
import TabLeaveApproval from './leaveApproval'
import TabLeaveTypes from './leaveTypes'
import TabLeaveBalance from './leaveBalance'
import TabLeaveInitialize from './leaveInitialize'
import { useSelector } from 'react-redux'
import { selectRoleSlug } from 'src/store/auth/authSlice'

const TabList = styled(MuiTabList)(({ theme }) => ({
  border: '0 !important',
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
    minWidth: 65,
    minHeight: 38,
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.up('md')]: { minWidth: 130 },
    '&:hover': { color: theme.palette.primary.main }
  }
}))

const TABS = [
 
  { value: 'types',     label: 'Leave Types',     icon: 'tabler:category'       },
  { value: 'initialize', label: 'Initialize',       icon: 'tabler:refresh'        },
    { value: 'balance',   label: 'Balance',          icon: 'tabler:scale'          },
     { value: 'requests',  label: 'Leave Requests', icon: 'tabler:clipboard-list' },
  // { value: 'approval',  label: 'Approval',        icon: 'tabler:checks'         },


]

const LeaveManagement = ({ tab }) => {
  const [activeTab, setActiveTab] = useState(tab || 'requests')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const hideText = useMediaQuery(theme => theme.breakpoints.down('md'))
  const roleSlug = useSelector(selectRoleSlug) || ''

  useEffect(() => {
    if (tab && tab !== activeTab) setActiveTab(tab)
  }, [tab])

  const handleChange = (event, value) => {
    setIsLoading(true)
    router.push(`/leaves/${value}`).then(() => setIsLoading(false))
  }

  // Only show initialize tab to users with role 'hr'
  const visibleTabs = TABS.filter(t => {
    if (t.value === 'initialize') return roleSlug === 'hr_manager'
    return true
  })

  // If the current active tab is not allowed for this role, redirect to 'requests'
  useEffect(() => {
    if (activeTab === 'initialize' && roleSlug !== 'hr_manager') setActiveTab('requests')
  }, [roleSlug, activeTab])

  const tabContentList = {
    requests: <TabLeaveRequests />,
    approval: <TabLeaveApproval />,
    types:    <TabLeaveTypes />,
    balance:  <TabLeaveBalance />,
    initialize: <TabLeaveInitialize />
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <TabContext value={activeTab}>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <TabList
                variant='scrollable'
                scrollButtons='auto'
                onChange={handleChange}
                aria-label='leave management tabs'
              >
                {visibleTabs.map(t => (
                  <Tab
                    key={t.value}
                    value={t.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', ...(!hideText && { '& svg': { mr: 2 } }) }}>
                        <Icon fontSize='1.25rem' icon={t.icon} />
                        {!hideText && t.label}
                      </Box>
                    }
                  />
                ))}
              </TabList>
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                  <CircularProgress sx={{ mb: 4 }} />
                  <Typography>Loading...</Typography>
                </Box>
              ) : (
                <TabPanel sx={{ p: 0 }} value={activeTab}>
                  {tabContentList[activeTab]}
                </TabPanel>
              )}
            </Grid>
          </Grid>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default LeaveManagement