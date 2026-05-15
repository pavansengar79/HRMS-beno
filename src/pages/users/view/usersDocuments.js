// src/views/apps/user/view/DocumentsSection.jsx
// Documents section — category tabs, uploaded doc cards, upload slot for missing types

import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// ** Custom Components
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios + Toast
import axiosRequest from 'src/utils/AxiosInterceptor'
import toast from 'react-hot-toast'

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'IDENTITY',             label: 'Identity'             },
  { value: 'PREVIOUS_EMPLOYMENT',  label: 'Previous Employment'  },
  { value: 'CURRENT_EMPLOYMENT',   label: 'Current Employment'   },
  { value: 'EDUCATION',            label: 'Education'            },
  { value: 'OTHER',                label: 'Other'                },
]

// Map each document type to its category
const DOC_TYPE_META = {
  // Identity
  AADHAR:                     { label: 'Aadhar Card',              category: 'IDENTITY',            icon: 'tabler:id' },
  PAN:                        { label: 'PAN Card',                 category: 'IDENTITY',            icon: 'tabler:credit-card' },
  PASSPORT:                   { label: 'Passport',                 category: 'IDENTITY',            icon: 'tabler:world' },
  DRIVING_LICENSE:            { label: 'Driving License',          category: 'IDENTITY',            icon: 'tabler:car' },

  // Previous Employment
  EXPERIENCE_LETTER:          { label: 'Experience Letter',        category: 'PREVIOUS_EMPLOYMENT', icon: 'tabler:file-certificate' },
  RELIEVING_LETTER:           { label: 'Relieving Letter',         category: 'PREVIOUS_EMPLOYMENT', icon: 'tabler:file-check' },
  SALARY_SLIP:                { label: 'Salary Slip',              category: 'PREVIOUS_EMPLOYMENT', icon: 'tabler:file-invoice' },
  PREVIOUS_APPOINTMENT_LETTER:{ label: 'Previous Appointment',     category: 'PREVIOUS_EMPLOYMENT', icon: 'tabler:file-text' },

  // Current Employment
  OFFER_LETTER:               { label: 'Offer Letter',             category: 'CURRENT_EMPLOYMENT',  icon: 'tabler:file-plus' },
  APPOINTMENT_LETTER:         { label: 'Appointment Letter',       category: 'CURRENT_EMPLOYMENT',  icon: 'tabler:file-description' },
  INCREMENT_LETTER:           { label: 'Increment Letter',         category: 'CURRENT_EMPLOYMENT',  icon: 'tabler:trending-up' },
  PROMOTION_LETTER:           { label: 'Promotion Letter',         category: 'CURRENT_EMPLOYMENT',  icon: 'tabler:award' },

  // Education
  EDUCATION_CERTIFICATE:      { label: 'Education Certificate',    category: 'EDUCATION',           icon: 'tabler:school' },
  MARKSHEET:                  { label: 'Marksheet',                category: 'EDUCATION',           icon: 'tabler:file-analytics' },
  DEGREE_CERTIFICATE:         { label: 'Degree Certificate',        category: 'EDUCATION',           icon: 'tabler:certificate' },

  // Other
  OTHER:                      { label: 'Other',                    category: 'OTHER',               icon: 'tabler:paperclip' },
}

// Types grouped by category — for upload dropdown filtering
const TYPES_BY_CATEGORY = Object.entries(DOC_TYPE_META).reduce((acc, [type, meta]) => {
  if (!acc[meta.category]) acc[meta.category] = []
  acc[meta.category].push(type)
  return acc
}, {})

// ─── Document Preview Modal ───────────────────────────────────────────────────
const DocumentPreviewModal = ({ open, doc, onClose }) => {
  if (!doc) return null
  console.log("Previewing doc", doc)

  const isPdf = doc.url?.toLowerCase().endsWith('.pdf')
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.url)
  const meta = DOC_TYPE_META[doc.documentType] || DOC_TYPE_META.OTHER

  // console.log("isImage",isImage)

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon icon={meta.icon} fontSize={20} />
        {meta.label}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', minHeight: 400 }}>
        {isPdf ? (
          <object data={doc.url} type='application/pdf' width='100%' height='600' style={{ borderRadius: '4px' }}>
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color='error' gutterBottom>Unable to display PDF in browser</Typography>
              <Button variant='contained' href={doc.url} target='_blank' startIcon={<Icon icon='tabler:download' fontSize={16} />}>Download PDF</Button>
            </Box>
          </object>
        ) : isImage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={doc.url} alt={doc.fileName || meta.label} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '4px' }} />
          </Box>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center', width: '100%' }}>
            <Icon icon='tabler:file-alert' fontSize={48} sx={{ color: 'text.disabled', mb: 2 }} />
            <Typography color='text.disabled' gutterBottom>Preview not available for this file type</Typography>
            <Button variant='contained' href={doc.url} target='_blank' startIcon={<Icon icon='tabler:download' fontSize={16} />} sx={{ mt: 2 }}>Download File</Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant='tonal' color='secondary' onClick={onClose}>Close</Button>
        <Button variant='contained' href={doc.url} target='_blank' startIcon={<Icon icon='tabler:download' fontSize={16} />}>Download</Button>
      </DialogActions>
    </Dialog>
  )
}

// ─── Uploaded document card ───────────────────────────────────────────────────
const DocCard = ({ doc, onDelete, canEdit, onPreview }) => {
  const meta      = DOC_TYPE_META[doc.documentType] || DOC_TYPE_META.OTHER
  const isPdf     = doc.url?.toLowerCase().endsWith('.pdf')
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await axiosRequest.delete(`/api/v1/employees/${doc.employeeId}/documents/${doc._id}`)
      toast.success(`${meta.label} removed`)
      onDelete(doc._id)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box sx={{
      border: '0.5px solid', borderColor: 'divider',
      borderRadius: 2, p: 2, height: '100%',
      display: 'flex', flexDirection: 'column', gap: 1.5,
      bgcolor: 'background.paper',
      position: 'relative',
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: 'primary.main' },
    }}>
      {/* Icon + type */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 1.5,
          bgcolor: 'primary.lighter', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'primary.main', flexShrink: 0,
        }}>
          <Icon icon={meta.icon} fontSize={22} />
        </Box>

        {canEdit && (
          <Tooltip title='Remove document'>
            <IconButton size='small' onClick={handleDelete} disabled={deleting}
              sx={{ color: 'error.main', p: 0.5 }}>
              {deleting
                ? <CircularProgress size={14} color='error' />
                : <Icon icon='tabler:trash' fontSize={15} />}
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Label */}
      <Box sx={{ flex: 1 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.3, mb: 0.5 }}>
          {meta.label}
        </Typography>
        {doc.fileName && (
          <Typography variant='caption' sx={{ color: 'text.disabled', display: 'block' }} noWrap>
            {doc.fileName}
          </Typography>
        )}
        {doc.uploadedAt && (
          <Typography variant='caption' sx={{ color: 'text.disabled' }}>
            {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        )}
      </Box>

      {/* View button */}
      <Button
        size='small' variant='tonal' color='primary' fullWidth
        startIcon={<Icon icon='tabler:eye' fontSize={15} />}
        onClick={() => onPreview(doc)}
        sx={{ mt: 'auto' }}
      >
        View
      </Button>
    </Box>
  )
}

// ─── Upload slot (shown for types not yet uploaded) ───────────────────────────
const UploadSlot = ({ docType, onUploaded, employeeId }) => {
  const meta        = DOC_TYPE_META[docType] || DOC_TYPE_META.OTHER
  const [file, setFile]         = useState(null)
  const [open, setOpen]         = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', docType)
    formData.append('category', meta.category)

    setUploading(true)
    try {
      const res = await axiosRequest.post(
        `/api/v1/employees/${employeeId}/documents`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      toast.success(`${meta.label} uploaded`)
      onUploaded(res.data)
      setFile(null)
      setOpen(false)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box sx={{
      border: '1.5px dashed', borderColor: open ? 'primary.main' : 'divider',
      borderRadius: 2, p: 2, height: '100%',
      display: 'flex', flexDirection: 'column', gap: 1.5,
      bgcolor: open ? 'action.hover' : 'transparent',
      transition: 'all 0.15s',
      minHeight: 160,
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 1.5,
          bgcolor: 'action.hover', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'text.disabled', flexShrink: 0,
        }}>
          <Icon icon={meta.icon} fontSize={22} />
        </Box>
        <IconButton size='small' onClick={() => setOpen(o => !o)} sx={{ color: 'text.secondary' }}>
          <Icon icon={open ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize={16} />
        </IconButton>
      </Box>

      <Typography variant='body2' sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {meta.label}
      </Typography>

      {!open ? (
        <Typography variant='caption' sx={{ color: 'text.disabled', mt: 'auto' }}>
          Not uploaded ·{' '}
          <Box component='span' sx={{ color: 'primary.main', cursor: 'pointer' }}
            onClick={() => setOpen(true)}>
            Upload
          </Box>
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <CustomTextField
            fullWidth size='small' type='file'
            InputLabelProps={{ shrink: true }} label='Choose file'
            inputProps={{ accept: '.pdf,.jpg,.jpeg,.png' }}
            onChange={e => setFile(e.target.files[0])}
          />
          {file && (
            <Typography variant='caption' sx={{ color: 'text.secondary' }} noWrap>
              {file.name}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size='small' variant='contained' onClick={handleUpload}
              disabled={!file || uploading} fullWidth
              startIcon={uploading ? <CircularProgress size={14} color='inherit' /> : <Icon icon='tabler:upload' fontSize={15} />}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
            <Button size='small' variant='tonal' color='secondary'
              onClick={() => { setOpen(false); setFile(null) }} disabled={uploading}>
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ─── Upload via dropdown (for OTHER / catch-all) ──────────────────────────────
const QuickUpload = ({ employeeId, uploadedTypes, activeCategory, onUploaded }) => {
  const [docType,   setDocType]   = useState('')
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)

  // Available types for this category that haven't been uploaded yet
  const availableTypes = (TYPES_BY_CATEGORY[activeCategory] || [])
    .filter(t => !uploadedTypes.has(t))

  if (availableTypes.length === 0) return null

  const handleUpload = async () => {
    if (!file || !docType) return toast.error('Select document type and file')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', docType)
    formData.append('category', activeCategory)

    setUploading(true)
    try {
      const res = await axiosRequest.post(
        `/api/v1/employees/${employeeId}/documents`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      toast.success('Document uploaded')
      onUploaded(res.data)
      setDocType('')
      setFile(null)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Box sx={{
      mt: 3, p: 2.5,
      border: '0.5px solid', borderColor: 'divider', borderRadius: 2,
      bgcolor: 'action.hover',
    }}>
      <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Icon icon='tabler:cloud-upload' fontSize={17} />
        Upload another document
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <CustomTextField
          select size='small' label='Document type'
          value={docType} onChange={e => setDocType(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value=''><em>Select type</em></MenuItem>
          {availableTypes.map(t => (
            <MenuItem key={t} value={t}>
              {DOC_TYPE_META[t]?.label || t.replaceAll('_', ' ')}
            </MenuItem>
          ))}
        </CustomTextField>

        <CustomTextField
          size='small' type='file' label='File'
          InputLabelProps={{ shrink: true }}
          inputProps={{ accept: '.pdf,.jpg,.jpeg,.png' }}
          onChange={e => setFile(e.target.files[0])}
          sx={{ minWidth: 220 }}
        />

        <Button
          variant='contained' size='small'
          onClick={handleUpload}
          disabled={!docType || !file || uploading}
          startIcon={uploading ? <CircularProgress size={14} color='inherit' /> : <Icon icon='tabler:upload' fontSize={15} />}
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </Box>
    </Box>
  )
}

// ─── Main DocumentsSection ────────────────────────────────────────────────────
const DocumentsSection = ({ employee, canEdit }) => {
  const [activeCategory,    setActiveCategory]    = useState('IDENTITY')
  const [documents,         setDocuments]         = useState([])
  const [loading,           setLoading]           = useState(true)
  const [previewDoc,        setPreviewDoc]        = useState(null)
  const [previewOpen,       setPreviewOpen]       = useState(false)

  // ── Fetch all documents ────────────────────────────────────────────────────
  const fetchDocuments = useCallback(async () => {
    if (!employee?._id) return
    setLoading(true)
    try {
      const res = await axiosRequest.get(`/api/v1/employees/${employee._id}/documents`)
      setDocuments(res.data ?? [])
    } catch (e) {
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [employee?._id])

  useEffect(() => { fetchDocuments() }, [fetchDocuments])

  // ── Optimistic update helpers ──────────────────────────────────────────────
  const handleUploaded = newDoc => {
    setDocuments(prev => [...prev, newDoc])
  }

  const handleDeleted = deletedId => {
    setDocuments(prev => prev.filter(d => d._id !== deletedId))
  }

  const handlePreview = doc => {
    setPreviewDoc(doc)
    setPreviewOpen(true)
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
    setPreviewDoc(null)
  }

  // ── Docs for active category ───────────────────────────────────────────────
  const docsForCategory = documents.filter(d => {
    const meta = DOC_TYPE_META[d.documentType]
    return meta?.category === activeCategory
  })

  // Set of already-uploaded types in this category
  const uploadedTypesInCategory = new Set(docsForCategory.map(d => d.documentType))

  // All types for this category — split into uploaded vs pending
  const allTypesForCategory  = TYPES_BY_CATEGORY[activeCategory] || []
  const pendingTypes          = allTypesForCategory.filter(t => !uploadedTypesInCategory.has(t))

  // Count badge per category tab
  const countByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = documents.filter(d => DOC_TYPE_META[d.documentType]?.category === cat.value).length
    return acc
  }, {})

  return (
    <Card  sx={{ mb: 3, boxShadow: 'none' }}>
      <CardContent sx={{ pb: '16px !important' }}>

        {/* ── Section title ──────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant='subtitle1' sx={{ fontWeight: 600, fontSize: '0.925rem', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon='tabler:files' fontSize={18} />
            Documents
          </Typography>
          <Tooltip title='Refresh'>
            <IconButton size='small' onClick={fetchDocuments} disabled={loading}>
              <Icon icon='tabler:refresh' fontSize={16} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ── Category tabs ──────────────────────────────────────── */}
        <Tabs
          value={activeCategory}
          onChange={(_, v) => setActiveCategory(v)}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            mb: 3,
            minHeight: 36,
            borderBottom: '1px solid', borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 36, py: 0.75,
              fontSize: '0.8rem', fontWeight: 500,
              textTransform: 'none',
            },
          }}
        >
          {CATEGORIES.map(cat => (
            <Tab
              key={cat.value}
              value={cat.value}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {cat.label}
                  {countByCategory[cat.value] > 0 && (
                    <Chip
                      label={countByCategory[cat.value]}
                      size='small'
                      color='primary'
                      sx={{
                        height: 17, fontSize: '0.65rem',
                        '& .MuiChip-label': { px: 0.6 },
                      }}
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* ── Loading ────────────────────────────────────────────── */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {/* ── Uploaded + pending grid ──────────────────────────── */}
            {allTypesForCategory.length === 0 ? (
              <Alert severity='info'>No document types defined for this category.</Alert>
            ) : (
              <Grid container spacing={2}>

                {/* Uploaded documents first */}
                {docsForCategory.map(doc => (
                  <Grid item xs={12} sm={6} md={3} key={doc._id}>
                    <DocCard
                      doc={{ ...doc, employeeId: employee._id }}
                      onDelete={handleDeleted}
                      canEdit={canEdit}
                      onPreview={handlePreview}
                    />
                  </Grid>
                ))}

                {/* Pending upload slots — only if canEdit */}
                {canEdit && pendingTypes.map(docType => (
                  <Grid item xs={12} sm={6} md={3} key={docType}>
                    <UploadSlot
                      docType={docType}
                      employeeId={employee._id}
                      onUploaded={handleUploaded}
                    />
                  </Grid>
                ))}

                {/* Empty state */}
                {docsForCategory.length === 0 && (!canEdit || pendingTypes.length === 0) && (
                  <Grid item xs={12}>
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Icon icon='tabler:folder-open' fontSize={36} />
                      <Typography variant='body2' sx={{ color: 'text.disabled', mt: 1 }}>
                        No documents uploaded in this category.
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            )}

            {/* ── Quick upload bar (dropdown) — for uploading any remaining type */}
            {/* {canEdit && (
              <QuickUpload
                employeeId={employee._id}
                uploadedTypes={uploadedTypesInCategory}
                activeCategory={activeCategory}
                onUploaded={handleUploaded}
              />
            )} */}
          </>
        )}

        {/* ── Document Preview Modal ──────────────────────────────── */}
        <DocumentPreviewModal
          open={previewOpen}
          doc={previewDoc}
          onClose={handleClosePreview}
        />

      </CardContent>
    </Card>
  )
}

export default DocumentsSection