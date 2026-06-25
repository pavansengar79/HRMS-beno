// src/pages/organisation/index.js
// Organisation list + Plans Tab (subscription from authSlice)
import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectSubscription } from 'src/store/auth/authSlice'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { DataGrid } from '@mui/x-data-grid'
import { alpha } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import CustomTextField from 'src/@core/components/mui/text-field'
import axiosRequest from 'src/utils/AxiosInterceptor'

const fmtDate = s =>
  s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

// ─── Organisations Tab ────────────────────────────────────────────────────────
const columns = [
  { flex: 0.25, minWidth: 220, field: 'name', headerName: 'Organisation',
    renderCell: ({ row }) => (
      <Box>
        <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>{row.name}</Typography>
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>{row.contact_email}</Typography>
      </Box>
    ) },
  { flex: 0.15, minWidth: 140, field: 'contact_name', headerName: 'Contact',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.contact_name || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'industry', headerName: 'Industry',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.industry || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'country', headerName: 'Country',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{row.country || '—'}</Typography> },
  { flex: 0.12, minWidth: 110, field: 'createdAt', headerName: 'Registered',
    renderCell: ({ row }) => <Typography sx={{ color: 'text.secondary' }}>{fmtDate(row.createdAt)}</Typography> },
]

// ─── Plans Tab ────────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  Trial:     '#f59e0b',
  Active:    '#10b981',
  PastDue:   '#ef4444',
  Expired:   '#94a3b8',
  Cancelled: '#94a3b8',
}

const PlansTab = ({ subscription }) => {
  if (!subscription) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Icon icon='tabler:credit-card-off' fontSize={40} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 12px' }} />
        <Typography variant='body2' color='text.secondary'>No active subscription found</Typography>
      </Box>
    )
  }

  const sc = STATUS_COLOR[subscription.status] || '#94a3b8'
  const daysLeft = subscription.days_left ?? 0
  const endDate  = subscription.ends_at

  return (
    <Box sx={{ p: 4 }}>
      <Grid container spacing={4}>
        {/* Plan Card */}
        <Grid item xs={12} md={6}>
          <Card variant='outlined' sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>{subscription.plan_name || 'Plan'}</Typography>
              <Chip label={subscription.status} size='small'
                sx={{ fontWeight: 700, bgcolor: alpha(sc, 0.1), color: sc }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {[
                { label: 'Plan Name',       value: subscription.plan_name || '—' },
                { label: 'Status',          value: subscription.status || '—' },
                { label: 'Start Date',      value: fmtDate(subscription.starts_at) },
                { label: 'Expiry Date',     value: fmtDate(endDate) },
                { label: 'Remaining Days',  value: `${daysLeft} days`, highlight: daysLeft < 7 },
                { label: 'Trial',           value: subscription.is_trial ? 'Yes' : 'No' },
                { label: 'Structure Level', value: subscription.structure_level || '—' },
                { label: 'Billing Cycle',   value: subscription.billing_cycle || '—' },
              ].map(r => (
                <Box key={r.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 500 }}>{r.label}</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600, color: r.highlight ? '#ef4444' : 'text.primary' }}>
                    {r.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Modules / Features */}
        <Grid item xs={12} md={6}>
          <Card variant='outlined' sx={{ p: 4, height: '100%' }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 3 }}>Active Modules</Typography>
            {(subscription.modules || []).length === 0 ? (
              <Typography variant='body2' color='text.secondary'>No modules listed</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {subscription.modules.map(m => (
                  <Chip key={m} label={m} size='small'
                    icon={<Icon icon='tabler:check' fontSize={12} />}
                    sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981', fontWeight: 600, fontSize: 11 }} />
                ))}
              </Box>
            )}

            {subscription.seat_limit && (
              <Box sx={{ mt: 4 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1.5 }}>Usage Limits</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='caption' color='text.secondary'>Seat Limit</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{subscription.seat_limit}</Typography>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const OrganisationPage = () => {
  const subscription   = useSelector(selectSubscription)
  const [orgs, setOrgs]     = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState('')
  const [activeTab, setActiveTab] = useState('orgs')
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 })

  useEffect(() => {
    setLoading(true)
    axiosRequest.get('/api/v1/tenant')
      .then(res => setOrgs(res?.data || res?.tenants || res || []))
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredRows = orgs.filter(row =>
    !search ||
    row.name?.toLowerCase().includes(search.toLowerCase()) ||
    row.contact_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Grid container spacing={6.5}>
      <Grid item xs={12}>
        <Card>
          <TabContext value={activeTab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
              <TabList onChange={(_, v) => setActiveTab(v)}>
                <Tab label='Organisations' value='orgs' icon={<Icon icon='tabler:building-skyscraper' />} iconPosition='start' />
                <Tab label='Plan & Subscription' value='plan' icon={<Icon icon='tabler:credit-card' />} iconPosition='start' />
              </TabList>
            </Box>

            <TabPanel value='orgs' sx={{ p: 0 }}>
              <Box sx={{ p: 5, display: 'flex', gap: 4, alignItems: 'center' }}>
                <CustomTextField value={search} placeholder='Search organisations...' sx={{ minWidth: 250 }}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <Icon icon='tabler:search' style={{ marginRight: 8, opacity: 0.5 }} /> }} />
              </Box>
              <Divider sx={{ m: '0 !important' }} />
              {loading && <LinearProgress />}
              <DataGrid
                autoHeight rowHeight={62} loading={loading}
                rows={filteredRows} columns={columns}
                getRowId={row => row._id || row.id}
                disableRowSelectionOnClick
                pageSizeOptions={[10, 25, 50]}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                rowCount={filteredRows.length}
              />
            </TabPanel>

            <TabPanel value='plan' sx={{ p: 0 }}>
              <PlansTab subscription={subscription} />
            </TabPanel>
          </TabContext>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OrganisationPage
