// src/pages/payroll/PayrollTabs.js
// Route-based tab bar for the Payroll module — same pattern as
// src/views/apps/user/view/UserViewRight.jsx: each tab is a REAL Next.js
// route (router.push), not client-side-only state. Wrap every payroll
// page's content with this component and pass the matching `activeTab`.
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
// Styled — same look & feel as UserViewRight's tab bar
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
// Tab → route map (covers every backend module in the Payroll Postman
// collection: My Payslips, All Payslips, Run Payroll, History, Investment
// Declarations. Payroll Policy already has its own page at /policy — we just
// deep-link to it rather than duplicating that UI here.)
// ─────────────────────────────────────────────────────────────────────────────
const TAB_ROUTES = {
  'my-payslips':   '/payroll/my',
  'salary-register': '/payroll',
  'run-payroll':   '/payroll/run',
  'history':       '/payroll/history',
  'lock':          '/payroll/lock',
  'investment':    '/payroll/investment-declarations'
}

const PayrollTabs = ({ activeTab, children }) => {
  const router = useRouter()
  const roleSlug = useSelector(selectRoleSlug)

  // Same convention already used across the payroll pages (my/index.js,
  // slips/index.js, index.js): plain 'employee' role = self-service only.
  const isEmployeeOnly = roleSlug === 'employee'

  const handleChange = (_, value) => {
    const target = TAB_ROUTES[value]
    if (target) router.push(target)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h5' sx={{ fontWeight: 800 }}>Payroll Management</Typography>
        <Typography variant='body2' color='text.secondary'>
          Payslips, payroll runs, history, investment declarations and policy — all in one place
        </Typography>
      </Box>

      <TabContext value={activeTab}>
        <Box sx={{ mb: 4 }}>
          <TabList
            variant='scrollable'
            scrollButtons='auto'
            onChange={handleChange}
            aria-label='payroll tabs'
            sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}
          >
            <Tab
              value='my-payslips'
              label='My Payslips'
              icon={<Icon fontSize='1.125rem' icon='tabler:file-invoice' />}
            />
            {!isEmployeeOnly && (
              <Tab
                value='salary-register'
                label='Salary Register'
                icon={<Icon fontSize='1.125rem' icon='tabler:files' />}
              />
            )}
            {!isEmployeeOnly && (
              <Tab
                value='run-payroll'
                label='Run Payroll'
                icon={<Icon fontSize='1.125rem' icon='tabler:player-play' />}
              />
            )}
            {!isEmployeeOnly && (
              <Tab
                value='history'
                label='History'
                icon={<Icon fontSize='1.125rem' icon='tabler:history' />}
              />
            )}
            {/* <Tab
              value='investment'
              label='Investment Declarations'
              icon={<Icon fontSize='1.125rem' icon='tabler:ReceiptTax' />}
            /> */}
            {!isEmployeeOnly && (
              <Tab
                value='lock'
                label='Payroll Lock'
                icon={<Icon fontSize='1.125rem' icon='tabler:lock' />}
              />
            )}
            <Tab
              value='investment'
              label='Investment Declarations'
              icon={<Icon fontSize='1.125rem' icon='tabler:receipt-tax' />}
            />
          </TabList>
        </Box>
      </TabContext>

      <Box>{children}</Box>
    </Box>
  )
}

export default PayrollTabs
