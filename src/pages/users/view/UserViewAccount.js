// src/views/apps/user/view/UserViewAccount.jsx
//
// Employee profile tab — view + inline edit sections
// Sections: About | Bank Info | Family Info | Education | Experience | Documents & Assets
// Shows UserProgressionTimeline only for TENANT_ADMIN role

import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Redux
import { useSelector, useDispatch } from 'react-redux'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'
import { updateEmployee } from 'src/store/employee/employeeSlice'

// ** Progression Timeline (shown only for TENANT_ADMIN)
import UserProgressionTimeline from './Userprogressiontimeline'
import Select from 'src/@core/theme/overrides/select'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const val = v => v || '—'

// ─── Section wrapper — header with edit/save/cancel icons ─────────────────────
const Section = ({ title, editing, onEdit, onSave, onCancel, saving, canEdit, children }) => (
  <Card variant='outlined' sx={{ mb: 3, border: '0.5px solid', borderColor: 'divider', boxShadow: 'none' }}>
    <CardContent sx={{ pb: '16px !important' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 600, fontSize: '0.925rem' }}>
          {title}
        </Typography>
        {canEdit && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editing ? (
              <>
                <Tooltip title='Save'>
                  <IconButton size='small' color='primary' onClick={onSave} disabled={saving}>
                    {saving
                      ? <CircularProgress size={14} />
                      : <Icon icon='tabler:check' fontSize={16} />}
                  </IconButton>
                </Tooltip>
                <Tooltip title='Cancel'>
                  <IconButton size='small' onClick={onCancel} disabled={saving}>
                    <Icon icon='tabler:x' fontSize={16} />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title='Edit'>
                <IconButton size='small' onClick={onEdit}>
                  <Icon icon='tabler:edit' fontSize={16} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
      {children}
    </CardContent>
  </Card>
)

// ─── View/Edit field pair ──────────────────────────────────────────────────────
const Field = ({ label, value, editing, name, form, onChange, multiline, rows, type = 'text' }) => (
  <Box sx={{ mb: editing ? 0 : 2.5 }}>
    {editing ? (
      <TextField
        fullWidth size='small' label={label}
        name={name} value={form[name] ?? ''}
        onChange={onChange}
        multiline={multiline} rows={rows}
        type={type}
        sx={{ mb: 0 }}
      />
    ) : (
      <>
        <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
          {val(value)}
        </Typography>
      </>
    )}
  </Box>
)

// ─── About Employee ───────────────────────────────────────────────────────────
const AboutSection = ({ employee, canEdit, onSaved }) => {
  const dispatch   = useDispatch()
  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [form,    setForm]      = useState({})

  const startEdit = () => {
    setForm({ about: employee.about || '' })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(updateEmployee({ id: employee._id, payload: { about: form.about } }))
    setSaving(false)
    if (updateEmployee.fulfilled.match(result)) { setEditing(false); onSaved?.() }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <Section title='About Employee' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <TextField
          fullWidth multiline rows={4} size='small'
          name='about' label='About'
          value={form.about} onChange={onChange}
        />
      ) : (
        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
          {val(employee.about)}
        </Typography>
      )}
    </Section>
  )
}

// ─── Bank Information ─────────────────────────────────────────────────────────
const BankSection = ({ employee, canEdit, onSaved }) => {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    const b = employee.bankInfo || {}
    setForm({
      bankName:      b.bankName      || '',
      accountNumber: b.accountNumber || '',
      ifscCode:      b.ifscCode      || '',
      branch:        b.branch        || '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(updateEmployee({ id: employee._id, payload: { bankInfo: form } }))
    setSaving(false)
    if (updateEmployee.fulfilled.match(result)) { setEditing(false); onSaved?.() }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const b = employee.bankInfo || {}

  return (
    <Section title='Bank Information' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      <Grid container spacing={editing ? 3 : 0}>
        <Grid item xs={6}>
          <Field label='Bank name'       value={b.bankName}      editing={editing} name='bankName'      form={form} onChange={onChange} />
        </Grid>
        <Grid item xs={6}>
          <Field label='Bank account no' value={b.accountNumber} editing={editing} name='accountNumber' form={form} onChange={onChange} />
        </Grid>
        <Grid item xs={6}>
          <Field label='IFSC Code'       value={b.ifscCode}      editing={editing} name='ifscCode'      form={form} onChange={onChange} />
        </Grid>
        <Grid item xs={6}>
          <Field label='Branch'          value={b.branch}        editing={editing} name='branch'        form={form} onChange={onChange} />
        </Grid>
      </Grid>
    </Section>
  )
}

// ─── Family Information ───────────────────────────────────────────────────────
const FamilySection = ({ employee, canEdit, onSaved }) => {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    const f = employee.familyInfo || {}
    setForm({
      name:         f.name         || '',
      relationship: f.relationship || '',
      dateOfBirth:  f.dateOfBirth  || '',
      phone:        f.phone        || '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(updateEmployee({ id: employee._id, payload: { familyInfo: form } }))
    setSaving(false)
    if (updateEmployee.fulfilled.match(result)) { setEditing(false); onSaved?.() }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const f = employee.familyInfo || {}

  return (
    <Section title='Family Information' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      <Grid container spacing={editing ? 3 : 0}>
        <Grid item xs={6}>
          <Field label='Name'         value={f.name}         editing={editing} name='name'         form={form} onChange={onChange} />
        </Grid>
        <Grid item xs={6}>
          <Field label='Relationship' value={f.relationship} editing={editing} name='relationship' form={form} onChange={onChange} />
        </Grid>
        <Grid item xs={6}>
          <Field label='Date of birth' value={f.dateOfBirth} editing={editing} name='dateOfBirth'  form={form} onChange={onChange} type='date' />
        </Grid>
        <Grid item xs={6}>
          <Field label='Phone'        value={f.phone}        editing={editing} name='phone'        form={form} onChange={onChange} />
        </Grid>
      </Grid>
    </Section>
  )
}

// ─── Education Details ────────────────────────────────────────────────────────
const EducationSection = ({ employee, canEdit, onSaved }) => {
  const dispatch = useDispatch()
  const [editing, setEditing]   = useState(false)
  const [saving,  setSaving]    = useState(false)
  const [entries, setEntries]   = useState([])

  const education = employee.education || []

  const startEdit = () => {
    setEntries(education.map(e => ({ ...e })))
    setEditing(true)
  }

  const handleChange = (idx, field, value) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))

  const addEntry = () =>
    setEntries(prev => [...prev, { institution: '', degree: '', from: '', to: '' }])

  const removeEntry = idx =>
    setEntries(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(updateEmployee({ id: employee._id, payload: { education: entries } }))
    setSaving(false)
    if (updateEmployee.fulfilled.match(result)) { setEditing(false); onSaved?.() }
  }

  return (
    <Section title='Education Details' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <Box>
          {entries.map((entry, idx) => (
            <Box key={idx} sx={{ mb: 2.5, p: 2, border: '0.5px solid', borderColor: 'divider', borderRadius: 1.5, position: 'relative' }}>
              <IconButton size='small' sx={{ position: 'absolute', top: 6, right: 6, color: 'error.main' }}
                onClick={() => removeEntry(idx)}>
                <Icon icon='tabler:trash' fontSize={14} />
              </IconButton>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth size='small' label='Institution'
                    value={entry.institution} onChange={e => handleChange(idx, 'institution', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size='small' label='Degree / Course'
                    value={entry.degree} onChange={e => handleChange(idx, 'degree', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size='small' label='From' type='date'
                    value={entry.from} onChange={e => handleChange(idx, 'from', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size='small' label='To' type='date'
                    value={entry.to} onChange={e => handleChange(idx, 'to', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button size='small' startIcon={<Icon icon='tabler:plus' />} onClick={addEntry} variant='tonal' color='primary'>
            Add Education
          </Button>
        </Box>
      ) : (
        education.length === 0
          ? <Typography variant='body2' sx={{ color: 'text.disabled' }}>No education details added.</Typography>
          : education.map((entry, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{val(entry.institution)}</Typography>
                  <Typography variant='caption' sx={{ color: 'text.secondary' }}>{val(entry.degree)}</Typography>
                </Box>
                <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, ml: 2 }}>
                  {entry.from ? entry.from.slice(0, 4) : '?'} – {entry.to ? entry.to.slice(0, 4) : 'Present'}
                </Typography>
              </Box>
            ))
      )}
    </Section>
  )
}

// ─── Experience ───────────────────────────────────────────────────────────────
const ExperienceSection = ({ employee, canEdit, onSaved }) => {
  const dispatch = useDispatch()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [entries, setEntries] = useState([])

  const experience = employee.experience || []

  const startEdit = () => {
    setEntries(experience.map(e => ({ ...e })))
    setEditing(true)
  }

  const handleChange = (idx, field, value) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))

  const addEntry = () =>
    setEntries(prev => [...prev, { company: '', role: '', from: '', to: '', current: false }])

  const removeEntry = idx => setEntries(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(updateEmployee({ id: employee._id, payload: { experience: entries } }))
    setSaving(false)
    if (updateEmployee.fulfilled.match(result)) { setEditing(false); onSaved?.() }
  }

  return (
    <Section title='Experience' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <Box>
          {entries.map((entry, idx) => (
            <Box key={idx} sx={{ mb: 2.5, p: 2, border: '0.5px solid', borderColor: 'divider', borderRadius: 1.5, position: 'relative' }}>
              <IconButton size='small' sx={{ position: 'absolute', top: 6, right: 6, color: 'error.main' }}
                onClick={() => removeEntry(idx)}>
                <Icon icon='tabler:trash' fontSize={14} />
              </IconButton>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField fullWidth size='small' label='Company'
                    value={entry.company} onChange={e => handleChange(idx, 'company', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size='small' label='Role / Designation'
                    value={entry.role} onChange={e => handleChange(idx, 'role', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size='small' label='From' type='date'
                    value={entry.from} onChange={e => handleChange(idx, 'from', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth size='small' label='To (leave blank if current)'
                    type='date' value={entry.to}
                    onChange={e => handleChange(idx, 'to', e.target.value)}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button size='small' startIcon={<Icon icon='tabler:plus' />} onClick={addEntry} variant='tonal' color='primary'>
            Add Experience
          </Button>
        </Box>
      ) : (
        experience.length === 0
          ? <Typography variant='body2' sx={{ color: 'text.disabled' }}>No experience added.</Typography>
          : experience.map((entry, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{val(entry.company)}</Typography>
                  <Chip
                    label={val(entry.role)} size='small' variant='tonal' color='primary'
                    sx={{ mt: 0.5, height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
                  />
                </Box>
                <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, ml: 2, textAlign: 'right' }}>
                  {entry.from ? entry.from.slice(0, 7) : '?'}<br />
                  {entry.to ? entry.to.slice(0, 7) : 'Present'}
                </Typography>
              </Box>
            ))
      )}
    </Section>
  )
}

// ─── Documents & Assets (view only — file upload is a separate feature) ───────
const DocumentsSection = ({ employee }) => {
  const [activeCategory, setActiveCategory] = useState('IDENTITY')
  const [selectedDocType, setSelectedDocType] = useState('')
  const [file, setFile] = useState(null)

  // ✅ Categories (tabs)
  const CATEGORIES = [
    'IDENTITY',
    'PREVIOUS_EMPLOYMENT',
    'CURRENT_EMPLOYMENT',
    'EDUCATION',
    'OTHER'
  ]

  // ✅ Document Types (dropdown)
  const DOCUMENT_TYPES = [
    "AADHAR", "PAN", "PASSPORT", "DRIVING_LICENSE",
    "EXPERIENCE_LETTER", "RELIEVING_LETTER", "SALARY_SLIP", "PREVIOUS_APPOINTMENT_LETTER",
    "OFFER_LETTER", "APPOINTMENT_LETTER", "INCREMENT_LETTER", "PROMOTION_LETTER",
    "EDUCATION_CERTIFICATE", "MARKSHEET", "DEGREE_CERTIFICATE",
    "OTHER"
  ]

  const handleUpload = async () => {
    if (!file || !selectedDocType) return alert("Select file & document type")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", selectedDocType)
    formData.append("category", activeCategory)

    try {
      await axios.post(
        `/api/v1/employees/${employee._id}/documents`,
        formData,
        {
          headers: {
            Authorization: `Bearer YOUR_TOKEN`,
            "Content-Type": "multipart/form-data"
          }
        }
      )

      alert("Uploaded successfully")
    } catch (err) {
      console.error(err)
      alert("Upload failed")
    }
  }

  return (
    <Card variant='outlined' sx={{ mb: 3 }}>
      <CardContent>

        {/* 🔹 Category Tabs */}
        <Tabs
          value={activeCategory}
          onChange={(_, v) => setActiveCategory(v)}
          sx={{ mb: 3 }}
        >
          {CATEGORIES.map(cat => (
            <Tab key={cat} value={cat} label={cat.replaceAll('_', ' ')} />
          ))}
        </Tabs>

        {/* 🔹 Upload Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>

          {/* Document Type Dropdown */}
          <Select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
          >
            <Option value="">Select Document Type</Option>
            {DOCUMENT_TYPES.map(type => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>

          {/* File Input */}
         
          <TextField fullWidth size='small' label='From' type='file'
                    
                    onChange={(e) => setFile(e.target.files[0])}
                    InputLabelProps={{ shrink: true }} />

          {/* Upload Button */}
          <Button variant="contained" onClick={handleUpload}>
            Upload Document
          </Button>
        </Box>

      </CardContent>
    </Card>
  )
}

// ─── Main UserViewAccount ─────────────────────────────────────────────────────
const UserViewAccount = ({ employee }) => {
  const permissions = useSelector(selectPermissions)
  const roleSlug    = useSelector(selectRoleSlug)   // e.g. "TENANT_ADMIN"

  const canEdit        = permissions.includes('employee.update')
  const isTenantAdmin  = roleSlug === 'TENANT_ADMIN'

  if (!employee) return null

  const onSaved = () => {
    // Optionally dispatch a re-fetch of employee here if needed
    // dispatch(fetchEmployeeById(employee._id))
  }

  const sharedProps = { employee, canEdit, onSaved }

  return (
    <Grid container spacing={4}>

      {/* ── Left column ─────────────────────────────────────────── */}
      <Grid item xs={12} md={6}>
        <AboutSection    {...sharedProps} />
        <BankSection     {...sharedProps} />
        <FamilySection   {...sharedProps} />
      </Grid>

      {/* ── Right column ────────────────────────────────────────── */}
      <Grid item xs={12} md={6}>
        <EducationSection  {...sharedProps} />
        <ExperienceSection {...sharedProps} />
      </Grid>

      {/* ── Documents & Assets — full width ─────────────────────── */}
      <Grid item xs={12}>
        <DocumentsSection employee={employee} />
      </Grid>

      {/* ── Career Progression — TENANT_ADMIN only ───────────────── */}
      {isTenantAdmin && (
        <Grid item xs={12}>
          <UserProgressionTimeline userId={employee._id || employee.userId} />
        </Grid>
      )}

    </Grid>
  )
}

export default UserViewAccount