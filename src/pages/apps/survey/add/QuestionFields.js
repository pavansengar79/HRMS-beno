import React, { useState } from 'react'
import { Grid } from '@mui/material'
import { Button } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { MenuItem } from '@mui/material'

const QuestionFields = ({ questionList, onChange, handleRemove, index }) => {
  const handleChange = e => onChange({ name: e.target.name, value: e.target.value }, index)

  const [value, setValue] = useState('')
  const handleValue = e => setValue(e.target.value)

  return (
    <div>
      <Grid item xs={12} sm={12}>
        <CustomTextField
          fullWidth
          name='question'
          sx={{ mb: 4 }}
          label='Question'
          placeholder='Question'
          value={questionList.quesText}
          id='form-layouts-separator-select'
          onChange={handleChange}
        ></CustomTextField>
        <CustomTextField
          sx={{ mb: 4, mr: 3 }}
          select
          name='questionType'
          label='Question Type'
          onChange={handleChange}
          SelectProps={{ value: questionList.questionType, onChange: e => handleChange(e) }}
        >
          <MenuItem value='Text'>Text</MenuItem>
          <MenuItem value='Radio'>Radio</MenuItem>
          <MenuItem value='Checkbox'>Checkbox</MenuItem>
          <MenuItem value='Boolean'>Boolean</MenuItem>
        </CustomTextField>
        <CustomTextField
          sx={{ mb: 4 }}
          name='mandatory'
          select
          label='Mandaotory'
          SelectProps={{ value: questionList.mandatory, onChange: e => handleChange(e) }}
        >
          <MenuItem value='true'>Yes</MenuItem>
          <MenuItem value='false'>No</MenuItem>
        </CustomTextField>

        <CustomTextField
          disabled={questionList.questionType === 'Text' ? true : false}
          name='options'
          fullWidth
          sx={{ mb: 4 }}
          value={questionList.options}
          label='options comma seperated'
          placeholder='options comma seperated'
          id='form-layouts-separator-select'
          onChange={handleChange}
        ></CustomTextField>
        <Button onClick={() => handleRemove(index)} sx={{ mr: 2, mb: 4 }} variant='contained'>
          Remove
        </Button>
      </Grid>
    </div>
  )
}

export default QuestionFields
