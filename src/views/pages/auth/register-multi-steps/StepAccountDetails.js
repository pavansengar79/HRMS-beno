// ** React Imports
import { useState, useCallback } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormHelperText from '@mui/material/FormHelperText'
import Chip from '@mui/material/Chip'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import { useDropzone } from 'react-dropzone'

// ─── Single File Dropzone ─────────────────────
// Same UI as the FileUploaderSingle you provided
const FileUploaderSingle = ({ value, onChange, accept, hint }) => {
  const acceptedTypes = accept || {
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg']
  }

  const onDrop = useCallback(
    acceptedFiles => {
      if (acceptedFiles.length > 0) {
        onChange(acceptedFiles[0])
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: acceptedTypes,
    onDrop
  })

  const handleRemove = e => {
    e.stopPropagation()
    onChange(null)
  }

  const isImage = value && value.type?.startsWith('image/')

  return (
    <Box
      {...getRootProps({ className: 'dropzone' })}
      sx={value ? { height: 'auto' } : {}}
    >
      <input {...getInputProps()} />
      {value ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 2 }}>
          {isImage ? (
            <Box
              component='img'
              src={URL.createObjectURL(value)}
              alt={value.name}
              className='single-file-image'
              sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1 }}
            />
          ) : (
            <Box
              sx={{
                width: 48,
                height: 48,
                display: 'flex',
                borderRadius: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme =>
                  `rgba(${theme.palette.customColors.main}, 0.08)`
              }}
            >
              <Icon icon='tabler:file-text' fontSize='1.75rem' />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {value.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {(value.size / 1024).toFixed(1)} KB
            </Typography>
          </Box>
          <Button
            size='small'
            color='error'
            variant='tonal'
            onClick={handleRemove}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Icon icon='tabler:x' fontSize='1rem' />
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Box
            sx={{
              mb: 8.75,
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme =>
                `rgba(${theme.palette.customColors.main}, 0.08)`
            }}
          >
            <Icon icon='tabler:upload' fontSize='1.75rem' />
          </Box>
          <Typography variant='p' sx={{ mb: 2.5 }}>
            Drop files here or click to upload.
          </Typography>
          {hint && (
            <Typography sx={{ color: 'text.secondary' }}>{hint}</Typography>
          )}
        </Box>
      )}
    </Box>
  )
}

// ─── Multi File Dropzone ──────────────────────
const FileUploaderMultiple = ({ value = [], onChange }) => {
  const onDrop = useCallback(
    acceptedFiles => {
      onChange([...value, ...acceptedFiles])
    },
    [value, onChange]
  )

  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const handleRemove = (e, index) => {
    e.stopPropagation()
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <>
      <Box {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <Box sx={{ display: 'flex', textAlign: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Box
            sx={{
              mb: 8.75,
              width: 48,
              height: 48,
              display: 'flex',
              borderRadius: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme =>
                `rgba(${theme.palette.customColors.main}, 0.08)`
            }}
          >
            <Icon icon='tabler:upload' fontSize='1.75rem' />
          </Box>
          <Typography variant='p' sx={{ mb: 2.5 }}>
            Drop files here or click to upload.
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Multiple files allowed (PDF, JPG, PNG)
          </Typography>
        </Box>
      </Box>
      {value.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {value.map((file, index) => (
            <Chip
              key={index}
              label={file.name}
              onDelete={e => handleRemove(e, index)}
              icon={<Icon icon='tabler:file' fontSize='1rem' />}
              variant='outlined'
              size='small'
            />
          ))}
        </Box>
      )}
    </>
  )
}

// ─── Component ───────────────────────────────
const StepDocuments = ({ handleNext, handlePrev }) => {
  const [files, setFiles] = useState({
    regCertificate: null,
    gstCertificate: null,
    panCard: null,
    addressProof: null,
    companyLogo: null,
    additionalDocs: []
  })

  const [errors, setErrors] = useState({})

  const requiredDocs = [
    {
      key: 'regCertificate',
      label: 'Company Registration Certificate',
      hint: 'PDF or image, max 5MB'
    },
    {
      key: 'gstCertificate',
      label: 'GST / Tax Certificate',
      hint: 'PDF or image, max 5MB'
    },
    {
      key: 'panCard',
      label: 'PAN Card / Business ID',
      hint: 'PDF or image, max 5MB'
    },
    {
      key: 'addressProof',
      label: 'Address Proof',
      hint: 'Utility bill, bank statement, etc.'
    }
  ]

  const handleFileChange = (key, file) => {
    setFiles(prev => ({ ...prev, [key]: file }))
    if (file) setErrors(prev => ({ ...prev, [key]: null }))
  }

  const validate = () => {
    const newErrors = {}
    requiredDocs.forEach(doc => {
      if (!files[doc.key]) newErrors[doc.key] = 'This document is required'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onNext = () => {
    if (validate()) handleNext()
  }

  return (
    <>
      <Box sx={{ mb: 6 }}>
        <Typography variant='h3' sx={{ mb: 1.5 }}>
          Company Documents
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>Upload your documents for verification</Typography>
      </Box>

      

      <Grid container spacing={5}>

        {/* Required Documents */}
        {requiredDocs.map(doc => (
          <Grid item xs={12} sm={6} key={doc.key}>
            <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
              {doc.label} *
            </Typography>
            <FileUploaderSingle
              value={files[doc.key]}
              hint={doc.hint}
              onChange={file => handleFileChange(doc.key, file)}
            />
            {errors[doc.key] && (
              <FormHelperText error sx={{ mt: 1 }}>
                {errors[doc.key]}
              </FormHelperText>
            )}
          </Grid>
        ))}

        {/* Company Logo */}
        <Grid item xs={12} sm={6}>
          <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
            Company Logo (Optional)
          </Typography>
          <FileUploaderSingle
            value={files.companyLogo}
            hint='PNG, JPG, SVG recommended'
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
            onChange={file => handleFileChange('companyLogo', file)}
          />
        </Grid>

        {/* Additional Documents */}
        <Grid item xs={12}>
          <Typography variant='body2' sx={{ mb: 1.5, fontWeight: 500 }}>
            Additional Documents (Optional)
          </Typography>
          <FileUploaderMultiple
            value={files.additionalDocs}
            onChange={updatedFiles =>
              setFiles(prev => ({ ...prev, additionalDocs: updatedFiles }))
            }
          />
        </Grid>

        {/* Navigation — same layout as original */}
        <Grid item xs={12} sx={{ pt: theme => `${theme.spacing(6)} !important` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button color='secondary' variant='tonal' onClick={handlePrev} sx={{ '& svg': { mr: 2 } }}>
              <Icon fontSize='1.125rem' icon='tabler:arrow-left' />
              Previous
            </Button>
            <Button variant='contained' onClick={onNext} sx={{ '& svg': { ml: 2 } }}>
              Next
              <Icon fontSize='1.125rem' icon='tabler:arrow-right' />
            </Button>
          </Box>

        </Grid>

      </Grid>
    </>
  )
}

export default StepDocuments