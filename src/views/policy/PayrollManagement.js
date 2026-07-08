// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Tab from '@mui/material/Tab'
import IconButton from '@mui/material/IconButton'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Components
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import MuiTabList from '@mui/lab/TabList'
import { styled } from '@mui/material/styles'

// ** Page Imports
import TabPayrollPolicy from './TabPayrollPolicy'
import InvestmentDeclaration from './InvestmentDeclaration'
import PayrollRun from './PayrollRun'

// ─── Styled Components ────────────────────────────────────────────────────────

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

// ─── Enterprise Feature Badge ─────────────────────────────────────────────────

const EnterpriseBadge = () => (
  <Chip
    label='ENTERPRISE'
    color='success'
    size='small'
    sx={{
      fontSize: '0.65rem',
      height: 20,
      fontWeight: 600,
      ml: 1
    }}
  />
)

// ─── Main Component ────────────────────────────────────────────────────────────

const PayrollManagement = () => {
  const [activeTab, setActiveTab] = useState('policies')

  const handleChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon icon='tabler:cash' fontSize='1.5rem' />
                  <Typography variant='h5'>Enterprise Payroll Management</Typography>
                  <EnterpriseBadge />
                </Box>
              </Box>
            }
            subheader='Complete payroll solution with PT, TDS, Investment Declarations, and YTD tracking'
          />
          <Divider />
          <CardContent>
            <TabContext value={activeTab}>
              <Box sx={{ mb: 3 }}>
                <TabList onChange={handleChange} aria-label='payroll management tabs'>
                  <Tab
                    value='policies'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon icon='tabler:file-text' fontSize='1.1rem' />
                        Payroll Policies
                      </Box>
                    }
                  />
                  <Tab
                    value='run'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon icon='tabler:player-play' fontSize='1.1rem' />
                        Run Payroll
                        <Chip label='NEW' color='primary' size='small' sx={{ fontSize: '0.6rem', height: 16 }} />
                      </Box>
                    }
                  />
                  <Tab
                    value='investments'
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon icon='tabler:pig-money' fontSize='1.1rem' />
                        Tax Declarations
                        <Chip label='80C/80D' color='success' size='small' sx={{ fontSize: '0.6rem', height: 16 }} />
                      </Box>
                    }
                  />
                </TabList>
              </Box>

              {/* Tab Panels */}
              <TabPanel value='policies' sx={{ px: 0, pt: 0 }}>
                <TabPayrollPolicy />
              </TabPanel>

              <TabPanel value='run' sx={{ px: 0, pt: 0 }}>
                <PayrollRun />
              </TabPanel>

              <TabPanel value='investments' sx={{ px: 0, pt: 0 }}>
                <InvestmentDeclaration />
              </TabPanel>
            </TabContext>
          </CardContent>
        </Card>
      </Grid>

      {/* Enterprise Features Info Card */}
      <Grid item xs={12}>
        <Card sx={{ bgcolor: 'background.default' }}>
          <CardContent>
            <Typography variant='subtitle2' color='text.primary' sx={{ mb: 2, fontWeight: 600 }}>
              Enterprise Features Implemented
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:map-pin' fontSize='1.25rem' color='success.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>State-wise PT</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      28+ Indian states with dynamic slabs
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:receipt-tax' fontSize='1.25rem' color='info.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>TDS Calculation</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Old & New regime with age-based slabs
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:chart-timeline' fontSize='1.25rem' color='warning.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>YTD Tracking</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Cumulative earnings & deductions
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:file-invoice' fontSize='1.25rem' color='secondary.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>Tax Breakdown</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Detailed payslip with tax calculations
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:moneybag' fontSize='1.25rem' color='error.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>80C Investments</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      PF, ELSS, Insurance, PPF, NSC, etc.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:heart-pulse' fontSize='1.25rem' color='success.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>80D Health</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Health insurance for self & parents
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:home' fontSize='1.25rem' color='info.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>HRA Exemption</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Rent-based tax exemptions
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Box sx={{ mt: 0.5 }}>
                    <Icon icon='tabler:recharging' fontSize='1.25rem' color='warning.main' />
                  </Box>
                  <Box>
                    <Typography variant='body2' fontWeight={500}>EV Loan (80EEB)</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Electric vehicle loan interest
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default PayrollManagement
