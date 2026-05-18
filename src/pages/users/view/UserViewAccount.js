// src/views/apps/user/view/UserViewAccount.jsx
// Employee right-tab sections — all independently editable via PUT /api/v1/employees/:id

import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Redux
import { useSelector } from 'react-redux'
import { selectPermissions, selectRoleSlug } from 'src/store/auth/authSlice'

// ** Axios + Toast
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

// ** Sub-components
import UserProgressionTimeline from './Userprogressiontimeline'
import DocumentsSection from './usersDocuments'

// ─── API helper ───────────────────────────────────────────────────────────────
const callUpdate = async (employeeId, payload) => {
  const res = await axiosRequest.put(`/api/v1/employees/${employeeId}`, payload)
  return res.data  // updated employee object
}

const val = v => v || '—'

// ─── Section card wrapper ─────────────────────────────────────────────────────
const Section = ({ title, editing, onEdit, onSave, onCancel, saving, canEdit, children }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', pb: '16px !important' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 600, fontSize: '0.925rem' }}>
          {title}
        </Typography>
        {canEdit && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {editing ? (
              <>
                <IconButton size='small' color='primary' onClick={onSave} disabled={saving}>
                  {saving ? <CircularProgress size={14} /> : <Icon icon='tabler:check' fontSize={16} />}
                </IconButton>
                <IconButton size='small' onClick={onCancel} disabled={saving}>
                  <Icon icon='tabler:x' fontSize={16} />
                </IconButton>
              </>
            ) : (
              <IconButton size='small' onClick={onEdit}>
                <Icon icon='tabler:edit' fontSize={16} />
              </IconButton>
            )}
          </Box>
        )}
      </Box>

      {/* Scrollable body */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </Box>
    </CardContent>
  </Card>
)

// ─── View-mode field ──────────────────────────────────────────────────────────
const Field = ({ label, value }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block', mb: 0.25 }}>
      {label}
    </Typography>
    <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
      {val(value)}
    </Typography>
  </Box>
)

// ─── About ────────────────────────────────────────────────────────────────────
const AboutSection = ({ employee, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [about, setAbout] = useState('')

  const startEdit = () => { setAbout(employee.about || ''); setEditing(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { about })
      onUpdated(updated)
      setEditing(false)
      toast.success('About updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <Section title='About Employee' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <CustomTextField
          fullWidth multiline rows={4} size='small'
          value={about} onChange={e => setAbout(e.target.value)}
        />
      ) : (
        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
          {employee.about || <Box component='span' sx={{ color: 'text.disabled' }}>Not added yet.</Box>}
        </Typography>
      )}
    </Section>
  )
}

// ─── Bank Details ─────────────────────────────────────────────────────────────
// Schema field: bankDetails (not bankInfo)
const BankSection = ({ employee, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  const startEdit = () => {
    const b = employee.bankDetails || {}
    setForm({
      bankName: b.bankName || '',
      accountNumber: b.accountNumber || '',
      ifscCode: b.ifscCode || '',
      branchName: b.branchName || '',
      accountType: b.accountType || 'SAVINGS',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { bankDetails: form })
      onUpdated(updated)
      setEditing(false)
      toast.success('Bank details updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const b = employee.bankDetails || {}

  return (
    <Section title='Bank Details' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <CustomTextField fullWidth size='small' label='Bank Name' name='bankName' value={form.bankName} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Account Number' name='accountNumber' value={form.accountNumber} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='IFSC Code' name='ifscCode' value={form.ifscCode} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Branch' name='branchName' value={form.branchName} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField select fullWidth size='small' label='Account Type' name='accountType' value={form.accountType} onChange={onChange}>
              <MenuItem value='SAVINGS'>Savings</MenuItem>
              <MenuItem value='CURRENT'>Current</MenuItem>
            </CustomTextField>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={0}>
          <Grid item xs={6}><Field label='Bank Name' value={b.bankName} /></Grid>
          <Grid item xs={6}><Field label='Account Number' value={b.accountNumber} /></Grid>
          <Grid item xs={6}><Field label='IFSC Code' value={b.ifscCode} /></Grid>
          <Grid item xs={6}><Field label='Branch' value={b.branchName} /></Grid>
          <Grid item xs={6}><Field label='Account Type' value={b.accountType} /></Grid>
        </Grid>
      )}
    </Section>
  )
}

// ─── Family Information ───────────────────────────────────────────────────────
// Schema field: familyInfo { name, relation, dateOfBirth, phone }
const FamilySection = ({ employee, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})

  const startEdit = () => {
    const f = employee.familyInfo || {}
    setForm({
      name: f.name || '',
      relation: f.relation || '',
      dateOfBirth: f.dateOfBirth || '',
      phone: f.phone || '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { familyDetails: [form] })
      onUpdated(updated)
      setEditing(false)
      toast.success('Family info updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const f = employee.familyDetails || {}

  return (
    <Section
      title='Family Information'
      editing={editing}
      canEdit={canEdit}
      onEdit={startEdit}
      onSave={handleSave}
      onCancel={() => setEditing(false)}
      saving={saving}
    >
      {editing ? (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              size='small'
              label='Name'
              name='name'
              value={form.name || ""}
              onChange={onChange}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              size='small'
              label='Relation'
              name='relation'
              value={form.relation || ""}
              onChange={onChange}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              size='small'
              label='Date of Birth'
              name='dateOfBirth'
              type='date'
              InputLabelProps={{ shrink: true }}
              value={form.dateOfBirth?.slice(0, 10) || ""}
              onChange={onChange}
            />
          </Grid>

          <Grid item xs={6}>
            <CustomTextField
              fullWidth
              size='small'
              label='Phone'
              name='phone'
              value={form.phone || ""}
              onChange={onChange}
            />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {employee.familyDetails?.length > 0 ? (
            employee.familyDetails.map((member, index) => (
              <Grid
                container
                spacing={2}
                key={index}
                style={{
                  borderBottom: "1px solid #eee",
                  // marginBottom: "10px",
                  // paddingBottom: "10px"
                }}
              >
                <Grid item xs={6}>
                  <Field label='Name' value={member.name || "-"} />
                </Grid>

                <Grid item xs={6}>
                  <Field label='Relation' value={member.relation || "-"} />
                </Grid>

                <Grid item xs={6}>
                  <Field
                    label='Date of Birth'
                    value={
                      member.dateOfBirth
                        ? new Date(member.dateOfBirth).toLocaleDateString()
                        : "-"
                    }
                  />
                </Grid>

                <Grid item xs={6}>
                  <Field label='Phone' value={member.phone || "-"} />
                </Grid>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <div style={{ color: "#888" }}>No family details available</div>
            </Grid>
          )}
        </Grid>
      )}
    </Section>
  )
}

// ─── Education Details ────────────────────────────────────────────────────────
// Schema field: education [ { institution, degree, from, to } ]
const EducationSection = ({ employee, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState([])

  const education = employee.education || []

  const startEdit = () => { setEntries(education.map(e => ({ ...e }))); setEditing(true) }

  const handleChange = (idx, field, value) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))

  const addEntry = () => setEntries(prev => [...prev, { institution: '', degree: '', from: '', to: '' }])
  const removeEntry = idx => setEntries(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { education: entries })
      onUpdated(updated)
      setEditing(false)
      toast.success('Education updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <Section title='Education Details' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <Box>
          {entries.map((entry, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 1.5, border: '0.5px solid', borderColor: 'divider', borderRadius: 1.5, position: 'relative' }}>
              <IconButton size='small' sx={{ position: 'absolute', top: 6, right: 6, color: 'error.main' }}
                onClick={() => removeEntry(idx)}>
                <Icon icon='tabler:trash' fontSize={14} />
              </IconButton>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <CustomTextField fullWidth size='small' label='Institution'
                    value={entry.institution} onChange={e => handleChange(idx, 'institution', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField fullWidth size='small' label='Degree / Course'
                    value={entry.degree} onChange={e => handleChange(idx, 'degree', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField fullWidth size='small' label='From' type='date'
                    InputLabelProps={{ shrink: true }}
                    value={entry.from} onChange={e => handleChange(idx, 'from', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField fullWidth size='small' label='To' type='date'
                    InputLabelProps={{ shrink: true }}
                    value={entry.to} onChange={e => handleChange(idx, 'to', e.target.value)} />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button size='small' startIcon={<Icon icon='tabler:plus' />} onClick={addEntry} variant='tonal' color='primary'>
            Add Education
          </Button>
        </Box>
      ) : education.length === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>No education details added.</Typography>
      ) : (
        education.map((entry, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, alignItems: 'flex-start' }}>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>{val(entry.institution)}</Typography>
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>{val(entry.degree)}</Typography>
            </Box>
            <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, ml: 2, textAlign: 'right' }}>
              {entry.from?.slice(0, 4) || '?'} – {entry.to?.slice(0, 4) || 'Present'}
            </Typography>
          </Box>
        ))
      )}
    </Section>
  )
}

// ─── Experience ───────────────────────────────────────────────────────────────
// Schema field: experience [ { company, role, from, to, current } ]
const ExperienceSection = ({ employee, canEdit, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [entries, setEntries] = useState([])

  const experience = employee.experience || []

  const startEdit = () => { setEntries(experience.map(e => ({ ...e }))); setEditing(true) }

  const handleChange = (idx, field, value) =>
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))

  const addEntry = () => setEntries(prev => [...prev, { company: '', role: '', from: '', to: '' }])
  const removeEntry = idx => setEntries(prev => prev.filter((_, i) => i !== idx))

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { experience: entries })
      onUpdated(updated)
      setEditing(false)
      toast.success('Experience updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally { setSaving(false) }
  }

  return (
    <Section title='Experience' editing={editing} canEdit={canEdit}
      onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} saving={saving}>
      {editing ? (
        <Box>
          {entries.map((entry, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 1.5, border: '0.5px solid', borderColor: 'divider', borderRadius: 1.5, position: 'relative' }}>
              <IconButton size='small' sx={{ position: 'absolute', top: 6, right: 6, color: 'error.main' }}
                onClick={() => removeEntry(idx)}>
                <Icon icon='tabler:trash' fontSize={14} />
              </IconButton>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <CustomTextField fullWidth size='small' label='Company'
                    value={entry.company} onChange={e => handleChange(idx, 'company', e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField fullWidth size='small' label='Role / Designation'
                    value={entry.role} onChange={e => handleChange(idx, 'role', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField fullWidth size='small' label='From' type='date'
                    InputLabelProps={{ shrink: true }}
                    value={entry.from} onChange={e => handleChange(idx, 'from', e.target.value)} />
                </Grid>
                <Grid item xs={6}>
                  <CustomTextField fullWidth size='small' label='To'
                    type='date' InputLabelProps={{ shrink: true }}
                    value={entry.to} onChange={e => handleChange(idx, 'to', e.target.value)}
                    helperText='Leave blank if current' />
                </Grid>
              </Grid>
            </Box>
          ))}
          <Button size='small' startIcon={<Icon icon='tabler:plus' />} onClick={addEntry} variant='tonal' color='primary'>
            Add Experience
          </Button>
        </Box>
      ) : experience.length === 0 ? (
        <Typography variant='body2' sx={{ color: 'text.disabled' }}>No experience added.</Typography>
      ) : (
        experience.map((entry, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5, alignItems: 'flex-start' }}>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>{val(entry.company)}</Typography>
              <Chip
                label={val(entry.role)} size='small' variant='tonal' color='primary'
                sx={{ mt: 0.5, height: 20, fontSize: '0.7rem', '& .MuiChip-label': { px: 0.75 } }}
              />
            </Box>
            <Typography variant='caption' sx={{ color: 'text.disabled', flexShrink: 0, ml: 2, textAlign: 'right' }}>
              {entry.from?.slice(0, 7) || '?'}<br />
              {entry.current ? 'Present' : (entry.to?.slice(0, 7) || 'Present')}
            </Typography>
          </Box>
        ))
      )}
    </Section>
  )
}

// ─── Main UserViewAccount ─────────────────────────────────────────────────────
const UserViewAccount = ({ employee: initialEmployee, isPermitted }) => {
  const permissions = useSelector(selectPermissions)
  const roleSlug = useSelector(selectRoleSlug)

  const canEdit = isPermitted
  const isTenantAdmin = roleSlug === 'tenent_admin'

  // ── Local employee state — each section updates this after save ────────────
  const [employee, setEmployee] = useState(initialEmployee)
  const onUpdated = updated => setEmployee(updated)

  if (!employee) return null

  const sharedProps = { employee, canEdit, onUpdated }

  return (
    <Grid container spacing={3} alignItems='stretch'>

      {/* ── Left column ─────────────────────────────────────────── */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <AboutSection      {...sharedProps} />
        <EducationSection  {...sharedProps} />
        <ExperienceSection {...sharedProps} />
      </Grid>

      {/* ── Right column ────────────────────────────────────────── */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <BankSection   {...sharedProps} />
        <FamilySection {...sharedProps} />
      </Grid>

      {/* ── Documents — full width ───────────────────────────────── */}
      <Grid item xs={12}>
        <DocumentsSection employee={employee} canEdit={canEdit} />
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