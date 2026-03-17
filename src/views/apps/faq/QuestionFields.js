import React, { useMemo, useState } from 'react'
import { Grid, Typography, Button } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { uploadFilesToAws } from 'src/utils/helper'
import { Box } from '@mui/system'
import { styled } from '@mui/material/styles'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

const QuestionFields = ({ questionList, onChange, handleRemove, index }) => {
  const safeQuestion = useMemo(
    () => ({
      title: questionList?.title ?? '',
      description: questionList?.description ?? '',
      asset: questionList?.asset ?? null,
      assetType: questionList?.assetType ?? null
    }),
    [questionList]
  )

  const handleChange = e => onChange?.({ name: e.target.name, value: e.target.value }, index)

  const [image, setImage] = useState(safeQuestion.asset)
  const [fileUploaded, setFileUploaded] = useState('')

  return (
    <div>
      <Grid item xs={12} sm={12}>
        <CustomTextField
          fullWidth
          name='title'
          sx={{ mb: 4 }}
          label='Question'
          placeholder='Title'
          value={safeQuestion.title}
          id='faq-question-title'
          onChange={handleChange}
        />
        <CustomTextField
          fullWidth
          name='description'
          sx={{ mb: 4 }}
          label='Answer'
          placeholder='Description'
          value={safeQuestion.description}
          id='faq-question-description'
          onChange={handleChange}
        />

        <Box sx={{ mb: 0.5 }}>
          <Typography>File</Typography>
        </Box>
        <Button
          sx={{ width: '100%', mb: 4 }}
          component='label'
          role={undefined}
          variant='contained'
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          {fileUploaded === '' ? 'Upload File' : fileUploaded}
          <VisuallyHiddenInput
            name='asset'
            type='file'
            onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return

              file.name.length > 16 ? setFileUploaded(file.name.slice(0, 16) + '...') : setFileUploaded(file.name)

              const bucket = await uploadFilesToAws(e.target.files)
              const uploaded = bucket?.[0] ?? null

              setImage(uploaded)
              onChange?.({ name: 'asset', value: uploaded }, index)
              onChange?.({ name: 'assetType', value: file.type }, index)
            }}
            id='faq-question-asset'
          />
        </Button>

        {image && <img src={image} alt='Uploaded asset preview' width='200' />}

        <Button
          onClick={() => handleRemove?.(index)}
          sx={{ mr: 2, mb: 4, display: 'block' }}
          variant='contained'
        >
          Remove
        </Button>
      </Grid>
    </div>
  )
}

export default QuestionFields

