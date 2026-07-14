// src/views/apps/user/view/UserViewLeft.jsx
// Employee left panel — all sections independently editable
// PUT /api/v1/employees/:id  (axiosRequest, res.data directly)

import { useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Redux
import { useDispatch } from 'react-redux'
import { updateEmployee } from 'src/store/employee/employeeSlice'

// ** Axios + Toast
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'
import { Tooltip } from '@mui/material'

// ─── Constants ────────────────────────────────────────────────────────────────
const GENDERS        = ['MALE', 'FEMALE', 'OTHER']
const BLOOD_GROUPS   = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const MARITAL_STATUS = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']
const ACCOUNT_TYPES  = ['SAVINGS', 'CURRENT']

const fmt = iso => iso
  ? new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

const val = v => v || '—'

// ─── API call ─────────────────────────────────────────────────────────────────
const callUpdate = async (employeeId, payload) => {
  const res = await axiosRequest.put(`/api/v1/employees/${employeeId}`, payload)
  return res.data
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

// View-mode info row
const InfoRow = ({ icon, label, value, isLink, linkHref }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.75 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 150, color: 'text.secondary' }}>
      <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      <Typography variant='body2' color='text.secondary' sx={{ ml: 1 }}>
        {label}
      </Typography>
    </Box>
    {isLink ? (
      <Link href={linkHref} sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
        <Typography variant='body2'>{value}</Typography>
      </Link>
    ) : (
      <Typography variant='body2' sx={{ color: 'text.primary', fontWeight: 500 }}>
        {val(value)}
      </Typography>
    )}
  </Box>
)

// Section header with independent edit/save/cancel icons
const SectionHeader = ({ title, editing, saving, onEdit, onSave, onCancel, canEdit  }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>{title}</Typography>
    {canEdit && (
      <Box sx={{ display: 'flex', gap: 0.25 }}>
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
)

// ─── Section: Personal Info ───────────────────────────────────────────────────
const PersonalInfoSection = ({ employee, onUpdated, canEdit }) => {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    setForm({
      phone:         employee.phone         || '',
      alternatePhone:employee.alternatePhone|| '',
      dateOfBirth:   employee.dateOfBirth?.slice(0,10) || '',
      gender:        employee.gender        || '',
      bloodGroup:    employee.bloodGroup    || '',
      maritalStatus: employee.maritalStatus || '',
      nationality:   employee.nationality   || '',
      numberOfChildren: employee.numberOfChildren ?? '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, {
        phone:          form.phone,
        alternatePhone: form.alternatePhone || undefined,
        dateOfBirth:    form.dateOfBirth    || undefined,
        gender:         form.gender         || undefined,
        bloodGroup:     form.bloodGroup     || undefined,
        maritalStatus:  form.maritalStatus  || undefined,
        nationality:    form.nationality    || undefined,
        numberOfChildren: form.numberOfChildren !== '' ? Number(form.numberOfChildren) : undefined,
      })
      onUpdated(updated)
      setEditing(false)
      toast.success('Personal info updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const ic = { fontSize: 16, color: 'text.secondary' }

  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader title='Personal Information' editing={editing} saving={saving}
        onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)}  canEdit={canEdit} />

      {editing ? (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Phone *' name='phone' value={form.phone} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Alternate Phone' name='alternatePhone' value={form.alternatePhone} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Date of Birth' name='dateOfBirth' type='date'
              InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField select fullWidth size='small' label='Gender' name='gender' value={form.gender} onChange={onChange}>
              <MenuItem value=''><em>Select</em></MenuItem>
              {GENDERS.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </CustomTextField>
          </Grid>
          <Grid item xs={6}>
            <CustomTextField select fullWidth size='small' label='Blood Group' name='bloodGroup' value={form.bloodGroup} onChange={onChange}>
              <MenuItem value=''><em>Select</em></MenuItem>
              {BLOOD_GROUPS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </CustomTextField>
          </Grid>
          <Grid item xs={6}>
            <CustomTextField select fullWidth size='small' label='Marital Status' name='maritalStatus' value={form.maritalStatus} onChange={onChange}>
              <MenuItem value=''><em>Select</em></MenuItem>
              {MARITAL_STATUS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </CustomTextField>
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='Nationality' name='nationality' value={form.nationality} onChange={onChange} />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField fullWidth size='small' label='No. of Children' name='numberOfChildren'
              type='number' value={form.numberOfChildren} onChange={onChange} />
          </Grid>
        </Grid>
      ) : (
        <>
          <InfoRow icon={<Icon icon='tabler:phone' fontSize={ic.fontSize} />}         label='Phone'         value={employee.phone} />
          <InfoRow icon={<Icon icon='tabler:phone-plus' fontSize={ic.fontSize} />}    label='Alt. Phone'    value={employee.alternatePhone} />
          <InfoRow icon={<Icon icon='tabler:cake' fontSize={ic.fontSize} />}          label='Birthday'      value={fmt(employee.dateOfBirth)} />
          <InfoRow icon={<Icon icon='tabler:gender-bigender' fontSize={ic.fontSize}/>}label='Gender'        value={employee.gender} />
          <InfoRow icon={<Icon icon='tabler:heart-rate-monitor' fontSize={ic.fontSize}/>} label='Blood Group' value={employee.bloodGroup} />
          <InfoRow icon={<Icon icon='tabler:rings' fontSize={ic.fontSize} />}         label='Marital Status' value={employee.maritalStatus} />
          <InfoRow icon={<Icon icon='tabler:world' fontSize={ic.fontSize} />}         label='Nationality'   value={employee.nationality} />
          <InfoRow icon={<Icon icon='tabler:baby-carriage' fontSize={ic.fontSize} />} label='Children'      value={String(employee.numberOfChildren ?? '0')} />
        </>
      )}
    </Box>
  )
}

// ─── Section: Address ─────────────────────────────────────────────────────────
const AddressSection = ({ employee, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    const cur = employee.currentAddress   || {}
    const per = employee.permanentAddress || {}
    setForm({
      cur_street:  cur.street  || '', cur_city:    cur.city    || '',
      cur_state:   cur.state   || '', cur_country: cur.country || '', cur_pincode: cur.pincode || '',
      per_street:  per.street  || '', per_city:    per.city    || '',
      per_state:   per.state   || '', per_country: per.country || '', per_pincode: per.pincode || '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, {
        currentAddress:   { street: form.cur_street, city: form.cur_city, state: form.cur_state, country: form.cur_country, pincode: form.cur_pincode },
        permanentAddress: { street: form.per_street, city: form.per_city, state: form.per_state, country: form.per_country, pincode: form.per_pincode },
      })
      onUpdated(updated)
      setEditing(false)
      toast.success('Address updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const ic = { fontSize: 16 }
  const cur = employee.currentAddress   || {}
  const per = employee.permanentAddress || {}
  const fmtAddr = a => [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ') || '—'

  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader title='Address' editing={editing} saving={saving}
        onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} />

      {editing ? (
        <Box>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
            Current Address
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}><CustomTextField fullWidth size='small' label='Street' name='cur_street' value={form.cur_street} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='City' name='cur_city' value={form.cur_city} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='State' name='cur_state' value={form.cur_state} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='Country' name='cur_country' value={form.cur_country} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='Pincode' name='cur_pincode' value={form.cur_pincode} onChange={onChange} /></Grid>
          </Grid>
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}>
            Permanent Address
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}><CustomTextField fullWidth size='small' label='Street' name='per_street' value={form.per_street} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='City' name='per_city' value={form.per_city} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='State' name='per_state' value={form.per_state} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='Country' name='per_country' value={form.per_country} onChange={onChange} /></Grid>
            <Grid item xs={6}><CustomTextField fullWidth size='small' label='Pincode' name='per_pincode' value={form.per_pincode} onChange={onChange} /></Grid>
          </Grid>
        </Box>
      ) : (
        <>
          <InfoRow icon={<Icon icon='tabler:home' fontSize={ic.fontSize} />}      label='Current'   value={fmtAddr(cur)} />
          <InfoRow icon={<Icon icon='tabler:building' fontSize={ic.fontSize} />}  label='Permanent' value={fmtAddr(per)} />
        </>
      )}
    </Box>
  )
}

// ─── Section: Bank Details ────────────────────────────────────────────────────
const BankSection = ({ employee, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    const b = employee.bankDetails || {}
    setForm({
      bankName:      b.bankName      || '',
      accountNumber: b.accountNumber || '',
      ifscCode:      b.ifscCode      || '',
      branchName:    b.branchName    || '',
      accountType:   b.accountType   || 'SAVINGS',
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
    } finally {
      setSaving(false)
    }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const b  = employee.bankDetails || {}
  const ic = { fontSize: 16 }

  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader title='Bank Details' editing={editing} saving={saving}
        onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} />

      {editing ? (
        <Grid container spacing={2}>
          <Grid item xs={12}><CustomTextField fullWidth size='small' label='Bank Name' name='bankName' value={form.bankName} onChange={onChange} /></Grid>
          <Grid item xs={6}><CustomTextField fullWidth size='small' label='Account Number' name='accountNumber' value={form.accountNumber} onChange={onChange} /></Grid>
          <Grid item xs={6}><CustomTextField fullWidth size='small' label='IFSC Code' name='ifscCode' value={form.ifscCode} onChange={onChange} /></Grid>
          <Grid item xs={6}><CustomTextField fullWidth size='small' label='Branch' name='branchName' value={form.branchName} onChange={onChange} /></Grid>
          <Grid item xs={6}>
            <CustomTextField select fullWidth size='small' label='Account Type' name='accountType' value={form.accountType} onChange={onChange}>
              {ACCOUNT_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </CustomTextField>
          </Grid>
        </Grid>
      ) : (
        <>
          <InfoRow icon={<Icon icon='tabler:building-bank' fontSize={ic.fontSize} />} label='Bank'     value={b.bankName} />
          <InfoRow icon={<Icon icon='tabler:credit-card' fontSize={ic.fontSize} />}   label='Account'  value={b.accountNumber} />
          <InfoRow icon={<Icon icon='tabler:hash' fontSize={ic.fontSize} />}          label='IFSC'     value={b.ifscCode} />
          <InfoRow icon={<Icon icon='tabler:map-pin' fontSize={ic.fontSize} />}       label='Branch'   value={b.branchName} />
          <InfoRow icon={<Icon icon='tabler:wallet' fontSize={ic.fontSize} />}        label='Type'     value={b.accountType} />
        </>
      )}
    </Box>
  )
}

// ─── Section: Emergency Contact ───────────────────────────────────────────────
const EmergencySection = ({ employee, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({})

  const startEdit = () => {
    const e = employee.emergencyContact || {}
    setForm({ name: e.name || '', phone: e.phone || '', relation: e.relation || '' })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await callUpdate(employee._id, { emergencyContact: form })
      onUpdated(updated)
      setEditing(false)
      toast.success('Emergency contact updated')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  const ec = employee.emergencyContact || {}
  const ic = { fontSize: 16 }

  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader title='Emergency Contact' editing={editing} saving={saving}
        onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} />

      {editing ? (
        <Grid container spacing={2}>
          <Grid item xs={12}><CustomTextField fullWidth size='small' label='Name' name='name' value={form.name} onChange={onChange} /></Grid>
          <Grid item xs={6}><CustomTextField fullWidth size='small' label='Phone' name='phone' value={form.phone} onChange={onChange} /></Grid>
          <Grid item xs={6}><CustomTextField fullWidth size='small' label='Relation' name='relation' value={form.relation} onChange={onChange} /></Grid>
        </Grid>
      ) : (
        <>
          <InfoRow icon={<Icon icon='tabler:user' fontSize={ic.fontSize} />}        label='Name'     value={ec.name} />
          <InfoRow icon={<Icon icon='tabler:phone' fontSize={ic.fontSize} />}       label='Phone'    value={ec.phone} />
          <InfoRow icon={<Icon icon='tabler:users' fontSize={ic.fontSize} />}       label='Relation' value={ec.relation} />
        </>
      )}
    </Box>
  )
}

// ─── Section: About ───────────────────────────────────────────────────────────
const AboutSection = ({ employee, onUpdated }) => {
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [about,   setAbout]   = useState('')

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
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box sx={{ mb: 3 }}>
      <SectionHeader title='About' editing={editing} saving={saving}
        onEdit={startEdit} onSave={handleSave} onCancel={() => setEditing(false)} />

      {editing ? (
        <CustomTextField
          fullWidth multiline rows={3} size='small' label='About'
          value={about} onChange={e => setAbout(e.target.value)}
        />
      ) : (
        <Typography variant='body2' sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
          {employee.about || <span style={{ color: '#94a3b8' }}>Not added yet.</span>}
        </Typography>
      )}
    </Box>
  )
}

// ─── Main UserViewLeft ────────────────────────────────────────────────────────
const UserViewLeft = ({ employee: initialEmployee, canEdit = true ,role,isPermitted  }) => {
  const [employee, setEmployee]       = useState(initialEmployee)
  const [uploading, setUploading]     = useState(false)
  const fileInputRef                  = useRef(null)



  const onUpdated = updated => setEmployee(updated)

  if (!employee) return null

  const joiningFormatted = fmt(employee.joiningDate)
  const deptName     = employee.departmentId?.name  || '—'
  const desgName     = employee.designationId?.name || employee.employmentType || '—'
  const managerName  = employee.reportingManagerId?.name || '—'
  const ic           = { fontSize: 16 }

  // ── Upload profile photo ───────────────────────────────────────────────────
  const handlePhotoChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
console.log("employee",employee)
    // 1. Upload the file → get back the URL (profilePhoto)
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
console.log("Ewe",employee)
      const uploadRes = await axiosRequest.post(
        `/api/v1/employees/${employee?._id}/upload-profile`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      // Interceptor returns res.data directly
      // Expect: { profilePhoto: 'https://...' }  or  { data: { profilePhoto: '...' } }
      const profilePhoto =
        uploadRes?.profilePhoto ||
        uploadRes?.data?.profilePhoto ||
        uploadRes?.url ||
        uploadRes?.data?.url

      if (!profilePhoto) throw new Error('No URL returned from upload')

      // 2. Patch the employee record with the new profilePhoto URL
      const updated = await callUpdate(employee._id, { profilePhoto })
      onUpdated(updated)
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Failed to upload photo')
    } finally {
      setUploading(false)
      // reset so same file can be re-selected
      e.target.value = ''
    }
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent sx={{ p: 3 }}>

        {/* ── Avatar banner ─────────────────────────────────────── */}
        <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
          <Box sx={{ height: 100, bgcolor: 'primary.light' }} />

          <Box sx={{ display: 'flex',flexDirection: 'column', alignItems: 'center', mt: -7, px: 2, pb: 2 }}>

            {/* Avatar + upload overlay */}
            <Box sx={{ position: 'relative' }} style={{background: 'white', borderRadius: '50%'}}>
              <Avatar
                src={employee.profilePhoto}
                sx={{
                  width: 80, height: 80,
                  border: '4px solid', borderColor: 'background.paper',
                  fontSize: '1.6rem', fontWeight: 600,
                  opacity: uploading ? 0.5 : 1,
                  transition: 'opacity .2s'
                }}
              >
                {!employee.profilePhoto && (employee.name?.[0] || 'U')}
              </Avatar>

              {/* Spinner while uploading */}
              {uploading && (
                <Box sx={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CircularProgress size={24} thickness={4} />
                </Box>
              )}

              {/* Camera icon overlay — only if canEdit */}
              {canEdit && !uploading && (
                <Tooltip title='Change photo'>
                  <IconButton
                    size='small'
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      position: 'absolute',
                      bottom: 0, right: -4,
                      width: 26, height: 26,
                      bgcolor: 'background.paper',
                      border: t => `1px solid ${t.palette.divider}`,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Icon icon='tabler:camera' fontSize={14} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 600 }}>{employee.name}</Typography>
              {employee.email && <Icon icon='tabler:circle-check-filled' fontSize={18} color='#22c55e' />}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Chip label={desgName} size='small' sx={{ bgcolor: 'action.hover', fontSize: '0.75rem' }} />
              <Chip
                label={employee.status || 'ACTIVE'}
                size='small'
                color={employee.status === 'ACTIVE' ? 'success' : 'default'}
                variant='tonal'
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          </Box>
        </Box>

        {/* ── Quick info (read-only) ─────────────────────────────── */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1.5 }}>Quick Info</Typography>
          <InfoRow icon={<Icon icon='tabler:id-badge-2' fontSize={ic.fontSize} />}        label='Employee ID' value={employee.employeeId} />
          <InfoRow icon={<Icon icon='tabler:mail' fontSize={ic.fontSize} />}              label='Email'       value={employee.email} isLink linkHref={`mailto:${employee.email}`} />
          <InfoRow icon={<Icon icon='tabler:building-community' fontSize={ic.fontSize} />} label='Department' value={deptName} />
          <InfoRow icon={<Icon icon='tabler:calendar-event' fontSize={ic.fontSize} />}    label='Joined'      value={joiningFormatted} />
          {/* <InfoRow icon={<Icon icon='tabler:user-circle' fontSize={ic.fontSize} />}       label='Reports to'  value={managerName} /> */}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ── Personal info ─────────────────────────────────────── */}
        <PersonalInfoSection employee={employee} onUpdated={onUpdated} canEdit={isPermitted} />
        <Divider sx={{ my: 2 }} />

      </CardContent>
    </Card>
  )
}

export default UserViewLeft