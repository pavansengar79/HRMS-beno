import React, { useState } from 'react'
import { Grid } from '@mui/material'
import { Button } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { MenuItem } from '@mui/material'
import { uploadFilesToAws } from 'src/utils/helper'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'

import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Typography } from '@mui/material'

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
  const handleChange = e => onChange({ name: e.target.name, value: e.target.value }, index)

  const [value, setValue] = useState('')
  const handleValue = e => setValue(e.target.value)
  const [fileuploaded, setfileuploaded] = useState('')

  return (
    <div>
      <Grid item xs={12} sm={12}>
        <CustomTextField
          fullWidth
          name='title'
          sx={{ mb: 4 }}
          label='Title'
          placeholder='Title'
          value={questionList.title}
          id='form-layouts-separator-select'
          onChange={handleChange}
        ></CustomTextField>
        <CustomTextField
          fullWidth
          name='description'
          sx={{ mb: 4 }}
          label='Description'
          placeholder='Description'
          value={questionList.description}
          id='form-layouts-separator-select'
          onChange={handleChange}
        ></CustomTextField>
        {/* <CustomTextField
          sx={{ mb: 4 }}
          select
          name='questionType'
          label='Question Type'
          SelectProps={{ value: questionList.questionType, onChange: e => handleChange(e) }}
        >
          <MenuItem value='Select'>Select Question Type</MenuItem>
          <MenuItem value='Text'>Text</MenuItem>
          <MenuItem value='Radio'>Radio</MenuItem>
          <MenuItem value='Checkbox'>Checkbox</MenuItem>
          <MenuItem value='Boolean'>Boolean</MenuItem>
        </CustomTextField> */}
        {/* <CustomTextField
          sx={{ mb: 4 }}
          name='mandatory'
          select
          label='Mandaotory'
          SelectProps={{ value: questionList.mandatory, onChange: e => handleChange(e) }}
        >
          <MenuItem value='true'>Yes</MenuItem>
          <MenuItem value='false'>No</MenuItem>
        </CustomTextField> */}
        {questionList.icon && <img alt='Product Image' width='50px' height='50px' src={questionList.icon}></img>}

        <>
          <Box sx={{ mb: 0.5 }}>
            <Typography> Image</Typography>
          </Box>
          <Button
            sx={{ width: '100%', mb: 4 }}
            component='label'
            role={undefined}
            variant='contained'
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            {fileuploaded == '' ? 'Upload File' : fileuploaded}
            <VisuallyHiddenInput
              type='file'
              onChange={async e => {
                e.target.files[0].name.length > 16
                  ? setfileuploaded(e.target.files[0].name.slice(0, 16) + '...')
                  : setfileuploaded(e.target.files[0].name)
                const bucket = await uploadFilesToAws(e.target.files)
                onChange({ name: e.target.name, value: bucket[0] }, index)
              }}
              InputProps={{
                inputProps: {
                  accept: 'image/*'
                }
              }}
              id='form-layouts-separator-select'
            />
          </Button>
        </>
        {/* <CustomTextField
          name='icon'
          type='file'
          InputProps={{
            inputProps: {
              accept: 'image/*'
            }
          }}
          fullWidth
          sx={{ mb: 4 }}
          label='Image'
          placeholder='Select a file'
          id='form-layouts-separator-select'
          onChange={async e => {
            const bucket = await uploadFilesToAws(e.target.files)
            onChange({ name: e.target.name, value: bucket[0] }, index)
          }}
        ></CustomTextField> */}
        <Button onClick={() => handleRemove(index)} sx={{ mr: 2, mb: 4 }} variant='contained'>
          Remove
        </Button>
      </Grid>
    </div>
  )
}

export default QuestionFields
