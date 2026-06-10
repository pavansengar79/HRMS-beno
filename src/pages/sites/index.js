// src/pages/sites/index.js
// Sites & Locations — O-03
// Lists all physical sites across the org/company/unit depending on JWT scope.

import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Divider from '@mui/material/Divider'
import InputAdornment from '@mui/material/InputAdornment'
import Icon from 'src/@core/components/icon'
import CustomChip from 'src/@core/components/mui/chip'

// ─── Dummy data ───────────────────────────────────────────────────────────────

const DUMMY_SITES = [
  {
    _id: 's1',
    name: 'Bengaluru HQ',
    code: 'BLR-01',
    unit: 'Engineering',
    city: 'Bengaluru',
    state: 'Karnataka',
    ptState: 'Karnataka',
    address: '14th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru – 560103',
    employees: 38,
    status: 'Active',
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    _id: 's2',
    name: 'Mumbai Office',
    code: 'MUM-01',
    unit: 'Corporate',
    city: 'Mumbai',
    state: 'Maharashtra',
    ptState: 'Maharashtra',
    address: '404, Business Bay, BKC, Mumbai – 400051',
    employees: 24,
    status: 'Active',
    lat: 19.0600,
    lng: 72.8656,
  },
  {
    _id: 's3',
    name: 'Delhi NCR',
    code: 'DEL-01',
    unit: 'Sales',
    city: 'Gurugram',
    state: 'Haryana',
    ptState: 'Haryana',
    address: 'Tower B, Cyber City, DLF Phase II, Gurugram – 122002',
    employees: 42,
    status: 'Active',
    lat: 28.4941,
    lng: 77.0886,
  },
  {
    _id: 's4',
    name: 'Pune Dev Centre',
    code: 'PNQ-01',
    unit: 'Engineering',
    city: 'Pune',
    state: 'Maharashtra',
    ptState: 'Maharashtra',
    address: 'ICC Tech Park, Senapati Bapat Road, Pune – 411053',
    employees: 24,
    status: 'Active',
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    _id: 's5',
    name: 'Hyderabad Remote',
    code: 'HYD-01',
    unit: 'Operations',
    city: 'Hyderabad',
    state: 'Telangana',
    ptState: 'Telangana',
    address: 'Raheja Mindspace, Madhapur, Hyderabad – 500081',
    employees: 14,
    status: 'Planned',
    lat: 17.4474,
    lng: 78.3762,
  },
]

const PT_STATES = ['Karnataka', 'Maharashtra', 'Haryana', 'Telangana', 'Tamil Nadu', 'Delhi', 'Andhra Pradesh', 'West Bengal']
const UNITS     = ['Engineering', 'Sales', 'Operations', 'Corporate', 'HR']

const EMPTY_FORM = { name: '', code: '', unit: '', city: '', state: '', ptState: '', address: '' }

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusChip = ({ status }) => {
  const map = { Active: 'success', Planned: 'warning', Inactive: 'error' }
  return <CustomChip rounded skin='light' size='small' color={map[status] || 'default'} label={status} />
}

const StatCard = ({ icon, value, label, color = 'primary' }) => (
  <Card sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
    <Box sx={{
      width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center',
      justifyContent: 'center', bgcolor: `${color}.light`,
    }}>
      <Icon icon={icon} fontSize={22} color={`${color}.main`} />
    </Box>
    <Box>
      <Typography variant='h5' sx={{ fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
      <Typography variant='caption' color='text.secondary'>{label}</Typography>
    </Box>
  </Card>
)

// ─── Main Page ─────────────────────────────────────────────────────────────────

const SitesPage = () => {
  const [sites, setSites]     = useState(DUMMY_SITES)
  const [search, setSearch]   = useState('')
  const [filterUnit, setFilterUnit] = useState('')
  const [filterState, setFilterState] = useState('')
  const [open, setOpen]       = useState(false)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [editId, setEditId]   = useState(null)
  const [detailSite, setDetailSite] = useState(null)

  const filtered = sites.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    const matchUnit  = !filterUnit  || s.unit  === filterUnit
    const matchState = !filterState || s.state === filterState
    return matchQ && matchUnit && matchState
  })

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setOpen(true) }
  const openEdit   = site => {
    setForm({ name: site.name, code: site.code, unit: site.unit, city: site.city, state: site.state, ptState: site.ptState, address: site.address })
    setEditId(site._id)
    setOpen(true)
  }
  const handleSave = () => {
    if (!form.name || !form.code) return
    if (editId) {
      setSites(prev => prev.map(s => s._id === editId ? { ...s, ...form } : s))
    } else {
      setSites(prev => [...prev, { _id: `s${Date.now()}`, ...form, employees: 0, status: 'Active', lat: null, lng: null }])
    }
    setOpen(false)
  }
  const handleDelete = id => setSites(prev => prev.filter(s => s._id !== id))

  const totalEmp   = sites.reduce((a, s) => a + s.employees, 0)
  const activeSites = sites.filter(s => s.status === 'Active').length
  const statesCount = new Set(sites.map(s => s.state)).size

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 800 }}>Sites &amp; Locations</Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
            O-03 · Physical offices &amp; work locations across all Business Units
          </Typography>
        </Box>
        <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={openCreate}>
          Add Site
        </Button>
      </Box>

      {/* ── Stats ── */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}><StatCard icon='tabler:map-pin' value={sites.length} label='Total Sites' color='primary' /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon='tabler:check' value={activeSites} label='Active' color='success' /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon='tabler:users' value={totalEmp} label='Employees across sites' color='warning' /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon='tabler:map' value={statesCount} label='States covered' color='info' /></Grid>
      </Grid>

      {/* ── Filters ── */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size='small' placeholder='Search site, code, city…' value={search}
            onChange={e => setSearch(e.target.value)} sx={{ width: 240 }}
            InputProps={{ startAdornment: <InputAdornment position='start'><Icon icon='tabler:search' fontSize={16} /></InputAdornment> }}
          />
          <TextField
            size='small' select label='Business Unit' value={filterUnit}
            onChange={e => setFilterUnit(e.target.value)} sx={{ width: 180 }}
          >
            <MenuItem value=''>All Units</MenuItem>
            {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
          </TextField>
          <TextField
            size='small' select label='State' value={filterState}
            onChange={e => setFilterState(e.target.value)} sx={{ width: 180 }}
          >
            <MenuItem value=''>All States</MenuItem>
            {PT_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
          {(search || filterUnit || filterState) && (
            <Button size='small' variant='outlined' color='secondary'
              onClick={() => { setSearch(''); setFilterUnit(''); setFilterState('') }}>
              Clear Filters
            </Button>
          )}
          <Typography variant='caption' color='text.secondary' sx={{ ml: 'auto' }}>
            {filtered.length} of {sites.length} sites
          </Typography>
        </Box>

        {/* ── Table ── */}
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>Site</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>Business Unit</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>City / State</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>PT State</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>Employees</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '.5px', textTransform: 'uppercase' }}>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(site => (
                <TableRow
                  key={site._id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setDetailSite(site)}
                >
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{site.name}</Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {site.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontFamily: 'monospace', fontSize: 12 }}>{site.code}</Typography>
                  </TableCell>
                  <TableCell>
                    <CustomChip rounded skin='light' size='small' color='primary' label={site.unit} />
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{site.city}</Typography>
                    <Typography variant='caption' color='text.secondary'>{site.state}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{site.ptState}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600 }}>{site.employees}</Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={site.status} />
                  </TableCell>
                  <TableCell align='right' onClick={e => e.stopPropagation()}>
                    <Tooltip title='Edit'>
                      <IconButton size='small' onClick={() => openEdit(site)}>
                        <Icon icon='tabler:edit' fontSize={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <IconButton size='small' color='error' onClick={() => handleDelete(site._id)}>
                        <Icon icon='tabler:trash' fontSize={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 6, color: 'text.secondary' }}>
                    No sites match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ── Create / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editId ? 'Edit Site' : 'Add New Site'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={8}>
              <TextField fullWidth label='Site Name *' size='small'
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label='Site Code *' size='small'
                value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                inputProps={{ style: { fontFamily: 'monospace' } }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label='Business Unit' size='small'
                value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label='City' size='small'
                value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label='State' size='small'
                value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value, ptState: e.target.value }))}>
                {PT_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label='PT State (Professional Tax)' size='small'
                value={form.ptState} onChange={e => setForm(p => ({ ...p, ptState: e.target.value }))}
                helperText='Determines which PT slab applies'>
                {PT_STATES.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label='Full Address' size='small' multiline rows={2}
                value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant='outlined' color='secondary' onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleSave} disabled={!form.name || !form.code}>
            {editId ? 'Save Changes' : 'Add Site'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Site Detail Dialog ── */}
      <Dialog open={!!detailSite} onClose={() => setDetailSite(null)} maxWidth='sm' fullWidth>
        {detailSite && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                {detailSite.name}
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.25 }}>
                  {detailSite.code} · {detailSite.unit}
                </Typography>
              </Box>
              <StatusChip status={detailSite.status} />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                {[
                  { label: 'Full Address',      value: detailSite.address },
                  { label: 'City',              value: detailSite.city },
                  { label: 'State',             value: detailSite.state },
                  { label: 'PT State',          value: detailSite.ptState },
                  { label: 'Business Unit',     value: detailSite.unit },
                  { label: 'Employees',         value: detailSite.employees },
                ].map(({ label, value }) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      {label}
                    </Typography>
                    <Typography variant='body2' sx={{ fontWeight: 500, mt: 0.25 }}>{value}</Typography>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <Chip
                    icon={<Icon icon='tabler:map-pin' fontSize={14} />}
                    label='Geo-fencing — available in BIO-01 post-launch'
                    size='small'
                    variant='outlined'
                    color='default'
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button variant='outlined' color='secondary' onClick={() => setDetailSite(null)}>Close</Button>
              <Button variant='contained' onClick={() => { setDetailSite(null); openEdit(detailSite) }}>Edit Site</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

SitesPage.acl = { action: 'read', subject: 'sites' }

export default SitesPage
