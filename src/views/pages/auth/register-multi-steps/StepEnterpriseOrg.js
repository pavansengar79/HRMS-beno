// ** React Imports
import { useState } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ─── Helper: ID generator ─────────────────────
let _id = 1
const nextId = () => ++_id

// ─── Sub-components ───────────────────────────

const LOBRow = ({ lob, onUpdate, onRemove, canRemove }) => {
  const [open, setOpen] = useState(true)
  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2, overflow: 'hidden' }}
    >
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon='tabler:sitemap' fontSize='0.875rem' style={{ color: 'var(--mui-palette-primary-main)' }} />
          </Box>
          <Typography variant='body2' fontWeight={600}>{lob.name || 'New LOB'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {canRemove && (
            <IconButton size='small' color='error' onClick={e => { e.stopPropagation(); onRemove(lob.id) }}>
              <Icon icon='tabler:trash' fontSize='0.875rem' />
            </IconButton>
          )}
          <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize='1rem' />
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='LOB Name *'
                value={lob.name}
                placeholder='e.g. Retail Division'
                onChange={e => onUpdate(lob.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Head of LOB'
                value={lob.head}
                placeholder='Responsible person'
                onChange={e => onUpdate(lob.id, 'head', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Description'
                value={lob.desc}
                placeholder='Brief description'
                onChange={e => onUpdate(lob.id, 'desc', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  )
}

const UnitRow = ({ unit, lobs, onUpdate, onRemove, canRemove }) => {
  const [open, setOpen] = useState(true)
  const isReady = unit.name && unit.adminEmail
  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2, overflow: 'hidden' }}
    >
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2.5, py: 1.5, cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: 'info.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon icon='tabler:building-store' fontSize='0.875rem' style={{ color: 'var(--mui-palette-info-main)' }} />
          </Box>
          <Box>
            <Typography variant='body2' fontWeight={600}>{unit.name || 'New Unit'}</Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {lobs.find(l => l.id === unit.lobId)?.name || 'No LOB'} · {unit.location || 'No location'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          {isReady && (
            <Chip label='Ready' size='small' color='success' variant='tonal' sx={{ fontSize: 10, fontWeight: 600, height: 20 }} />
          )}
          {canRemove && (
            <IconButton size='small' color='error' onClick={e => { e.stopPropagation(); onRemove(unit.id) }}>
              <Icon icon='tabler:trash' fontSize='0.875rem' />
            </IconButton>
          )}
          <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize='1rem' />
        </Box>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 2.5, pb: 2.5, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Unit Name *'
                value={unit.name}
                placeholder='e.g. North Zone Sales'
                onChange={e => onUpdate(unit.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                select
                fullWidth
                label='Parent LOB'
                value={String(unit.lobId)}
                onChange={e => onUpdate(unit.id, 'lobId', Number(e.target.value))}
              >
                {lobs.map(l => (
                  <MenuItem key={l.id} value={String(l.id)}>{l.name || `LOB ${l.id}`}</MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                label='Location / City'
                value={unit.location}
                placeholder='e.g. Delhi'
                onChange={e => onUpdate(unit.id, 'location', e.target.value)}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Icon icon='tabler:key' fontSize='1rem' style={{ color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2' fontWeight={700}>Unit Admin</Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>— manages this site&apos;s HR settings</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Admin Full Name *'
                value={unit.adminName}
                placeholder='Amit Kumar'
                onChange={e => onUpdate(unit.id, 'adminName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Admin Email *'
                value={unit.adminEmail}
                placeholder='amit@company.in'
                onChange={e => onUpdate(unit.id, 'adminEmail', e.target.value)}
              />
            </Grid>
          </Grid>
          <Alert
            severity='warning'
            sx={{ mt: 2, borderRadius: 2, py: 0.75, '& .MuiAlert-message': { fontSize: 12 } }}
          >
            Login credentials will be emailed to this address. Unit Admin configures leave policies, payroll and working days for this unit independently.
          </Alert>
        </Box>
      </Collapse>
    </Paper>
  )
}

// ─── Company Block ────────────────────────────
const CompanyBlock = ({ company, companyIndex, onUpdateCompany, onRemoveCompany, canRemoveCompany }) => {
  const [open, setOpen] = useState(true)

  const updateLob = (lobId, field, value) =>
    onUpdateCompany(company.id, 'lobs', company.lobs.map(l => l.id === lobId ? { ...l, [field]: value } : l))

  const removeLob = lobId =>
    onUpdateCompany(company.id, 'lobs', company.lobs.filter(l => l.id !== lobId))

  const addLob = () =>
    onUpdateCompany(company.id, 'lobs', [...company.lobs, { id: nextId(), name: '', head: '', desc: '' }])

  const updateUnit = (unitId, field, value) =>
    onUpdateCompany(company.id, 'units', company.units.map(u => u.id === unitId ? { ...u, [field]: value } : u))

  const removeUnit = unitId =>
    onUpdateCompany(company.id, 'units', company.units.filter(u => u.id !== unitId))

  const addUnit = () =>
    onUpdateCompany(company.id, 'units', [
      ...company.units,
      { id: nextId(), name: '', lobId: company.lobs[0]?.id || 1, location: '', adminName: '', adminEmail: '' }
    ])

  return (
    <Paper
      elevation={0}
      sx={{ border: '2px solid', borderColor: 'primary.lighter', borderRadius: 3, mb: 3, overflow: 'hidden' }}
    >
      {/* Company header */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2,
          bgcolor: 'primary.lighter',
          cursor: 'pointer'
        }}
        onClick={() => setOpen(o => !o)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant='body2' sx={{ color: '#fff', fontWeight: 700 }}>C{companyIndex + 1}</Typography>
          </Box>
          <Box>
            <Typography variant='body1' fontWeight={700}>{company.name || `Company ${companyIndex + 1}`}</Typography>
            <Typography variant='caption' sx={{ color: 'text.secondary' }}>
              {company.lobs.length} LOB{company.lobs.length !== 1 ? 's' : ''} · {company.units.length} Unit{company.units.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {canRemoveCompany && (
            <Tooltip title='Remove company'>
              <IconButton size='small' color='error' onClick={e => { e.stopPropagation(); onRemoveCompany(company.id) }}>
                <Icon icon='tabler:trash' />
              </IconButton>
            </Tooltip>
          )}
          <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} />
        </Box>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: 3 }}>
          {/* Company name + details */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Company Name *'
                value={company.name}
                placeholder='e.g. Acme Manufacturing Ltd'
                onChange={e => onUpdateCompany(company.id, 'name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Company Legal Name'
                value={company.legalName}
                placeholder='Registered legal name'
                onChange={e => onUpdateCompany(company.id, 'legalName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='Company Email'
                value={company.email}
                placeholder='contact@acme.com'
                onChange={e => onUpdateCompany(company.id, 'email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='HQ Location'
                value={company.location}
                placeholder='e.g. Mumbai'
                onChange={e => onUpdateCompany(company.id, 'location', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3, borderStyle: 'dashed' }} />

          {/* LOBs */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon='tabler:sitemap' fontSize='1.125rem' />
              <Typography variant='body1' fontWeight={700}>Lines of Business</Typography>
            </Box>
            <Button
              size='small'
              variant='tonal'
              startIcon={<Icon icon='tabler:plus' fontSize='0.875rem' />}
              onClick={addLob}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Add LOB
            </Button>
          </Box>

          {company.lobs.map(lob => (
            <LOBRow
              key={lob.id}
              lob={lob}
              onUpdate={updateLob}
              onRemove={removeLob}
              canRemove={company.lobs.length > 1}
            />
          ))}

          <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

          {/* Units */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon icon='tabler:building-store' fontSize='1.125rem' />
              <Typography variant='body1' fontWeight={700}>Units</Typography>
            </Box>
            <Button
              size='small'
              variant='tonal'
              color='info'
              startIcon={<Icon icon='tabler:plus' fontSize='0.875rem' />}
              onClick={addUnit}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Add Unit
            </Button>
          </Box>

          {company.units.map(unit => (
            <UnitRow
              key={unit.id}
              unit={unit}
              lobs={company.lobs}
              onUpdate={updateUnit}
              onRemove={removeUnit}
              canRemove={company.units.length > 1}
            />
          ))}
        </Box>
      </Collapse>
    </Paper>
  )
}

// ─── Main Component ───────────────────────────
const StepEnterpriseOrg = ({ handleNext, handlePrev }) => {
  // Organisation-level state
  const [orgName, setOrgName] = useState('')
  const [orgErrors, setOrgErrors] = useState({})

  // Companies
  const [companies, setCompanies] = useState([
    {
      id: nextId(),
      name: '',
      legalName: '',
      email: '',
      location: '',
      lobs: [{ id: nextId(), name: '', head: '', desc: '' }],
      units: [{ id: nextId(), name: '', lobId: null, location: '', adminName: '', adminEmail: '' }]
    }
  ])

  const addCompany = () =>
    setCompanies(cs => [
      ...cs,
      {
        id: nextId(),
        name: '',
        legalName: '',
        email: '',
        location: '',
        lobs: [{ id: nextId(), name: '', head: '', desc: '' }],
        units: [{ id: nextId(), name: '', lobId: null, location: '', adminName: '', adminEmail: '' }]
      }
    ])

  const removeCompany = id => setCompanies(cs => cs.filter(c => c.id !== id))

  const updateCompany = (id, field, value) =>
    setCompanies(cs => cs.map(c => c.id === id ? { ...c, [field]: value } : c))

  const validate = () => {
    const errs = {}
    if (!orgName.trim()) errs.orgName = 'Organisation name is required'
    setOrgErrors(errs)
    if (Object.keys(errs).length > 0) return false
    // Basic: every company needs a name and at least one LOB with a name and one unit with name+adminEmail
    const allValid = companies.every(c =>
      c.name.trim() &&
      c.lobs.every(l => l.name.trim()) &&
      c.units.every(u => u.name.trim() && u.adminEmail.trim())
    )
    if (!allValid) {
      alert('Please fill in all required fields (Company name, LOB names, Unit names and Unit admin emails)')
      return false
    }
    return true
  }

  const onNext = () => {
    if (validate()) handleNext({ orgName, companies })
  }

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Organisation Setup
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Set up your organisation structure with companies, lines of business, and units
        </Typography>
      </Box>

      <Alert
        severity='warning'
        icon={<Icon icon='tabler:building-skyscraper' />}
        sx={{ mb: 5, borderRadius: 2 }}
      >
        <strong>Enterprise structure:</strong> Create your organisation, add companies under it, define Lines of Business within each company, and set up Units with dedicated Unit Admins.
      </Alert>

      <Grid container spacing={5}>

        {/* Organisation name */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Icon icon='tabler:building-skyscraper' fontSize='1.25rem' />
            <Typography variant='h5'>Organisation Details</Typography>
          </Box>
          <CustomTextField
            fullWidth
            label='Organisation Name *'
            value={orgName}
            placeholder='e.g. Acme Group Holdings'
            onChange={e => { setOrgName(e.target.value); setOrgErrors({}) }}
            error={!!orgErrors.orgName}
            helperText={orgErrors.orgName || 'The top-level entity under which all companies sit'}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Companies */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Icon icon='tabler:buildings' fontSize='1.25rem' />
              <Typography variant='h5'>Companies</Typography>
              <Chip label={`${companies.length} company`} size='small' variant='tonal' color='primary' sx={{ fontWeight: 600 }} />
            </Box>
            <Button
              variant='tonal'
              color='primary'
              startIcon={<Icon icon='tabler:plus' />}
              onClick={addCompany}
              sx={{ textTransform: 'none' }}
            >
              Add Company
            </Button>
          </Box>

          {companies.map((company, idx) => (
            <CompanyBlock
              key={company.id}
              company={company}
              companyIndex={idx}
              onUpdateCompany={updateCompany}
              onRemoveCompany={removeCompany}
              canRemoveCompany={companies.length > 1}
            />
          ))}
        </Grid>

        {/* Navigation */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button variant='contained' onClick={onNext} sx={{ '& svg': { ml: 2 } }}>
              Review & Complete
              <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
            </Button>
          </Box>
        </Grid>

      </Grid>
    </>
  )
}

export default StepEnterpriseOrg
