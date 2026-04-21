// ** React Imports
import { useState, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
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

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Tab Content Imports
import TabLeaveRequests from './leaveRequesttab'
import TabLeaveApproval from './leaveApproval'
import TabLeaveTypes from './leaveTypes'
import TabLeaveCategory from './leaveCategory'
import TabLeaveBalance from './leaveBalance'
import TabApplyLeave from './leaveApply'
import ApplyLeaveDrawer from './applyleaveDrawer'
import CreateDealWizard from '../pages/wizard-examples/create-deal'
import LeavePolicyConfigWizard from './policyWizard'


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
  { value: 'policy', label: 'Leave Policy', icon: 'tabler:clipboard-list' },
  { value: 'requests', label: 'Leave Requests', icon: 'tabler:clipboard-list' },
  { value: 'approval', label: 'Approval', icon: 'tabler:checks' },
  { value: 'types', label: 'Leave Types', icon: 'tabler:category' },
  { value: 'category', label: 'Category', icon: 'tabler:tag' },
  { value: 'balance', label: 'Balance', icon: 'tabler:scale' },
  { value: 'apply', label: 'Apply Leave', icon: 'tabler:calendar-plus' },
]

const LeaveManagement = ({ tab }) => {
  const [activeTab, setActiveTab] = useState(tab)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const hideText = useMediaQuery(theme => theme.breakpoints.down('md'))

  useEffect(() => {
    if (tab && tab !== activeTab) setActiveTab(tab)
  }, [tab])

  const handleChange = (event, value) => {
    setIsLoading(true)
    router.push(`/leaves/${value}`).then(() => setIsLoading(false))
  }

  const tabContentList = {
    policy: <LeavePolicyConfigWizard />,
    requests: <TabLeaveRequests />,
    approval: <TabLeaveApproval />,
    types: <TabLeaveTypes />,
    category: <TabLeaveCategory />,
    balance: <TabLeaveBalance />,
    apply: <ApplyLeaveDrawer />,
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
                {TABS.map(t => (
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